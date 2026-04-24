import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
    title: v.string(),
    language: v.string(),
    userId: v.id("users"),
    isPublic: v.boolean(),
    prompt: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      title: args.title,
      language: args.language,
      userId: args.userId,
      isPublic: args.isPublic,
      isStarred: false,
      prompt: args.prompt,
      buildState: "idle",
    });
  },
});

export const updateBuildState = mutation({
  args: {
    projectId: v.id("projects"),
    buildState: v.union(v.literal("idle"), v.literal("generating"), v.literal("ready"), v.literal("error"), v.literal("running"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, { buildState: args.buildState });
  }
});

async function resolveUser(ctx: any, userId: string) {
    const normalizedId = ctx.db.normalizeId("users", userId);
    if (normalizedId) return normalizedId;

    const user = await ctx.db
        .query("users")
        .withIndex("by_firebaseUid", (q: any) => q.eq("firebaseUid", userId))
        .first();
    return user ? user._id : null;
}

export const getProjectsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.userId);
    if (!userId) return [];

    return await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getProjectById = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.projectId);
    }
});

export const toggleStar = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return;
    await ctx.db.patch(args.projectId, { isStarred: !project.isStarred });
  }
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.projectId);
  }
});

export const getDashboardStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.userId);
    if (!userId) return { totalProjects: "0", starredProjects: "0", totalFiles: "0", totalAiPrompts: "0" };

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    let totalFiles = 0;
    for (const project of projects) {
        const projectFiles = await ctx.db
            .query("files")
            .withIndex("by_projectId", q => q.eq("projectId", project._id))
            .collect();
        totalFiles += projectFiles.length;
    }

    const aiInteractions = await ctx.db.query("jobStatus").collect();
    
    return {
      totalProjects: projects.length.toString(),
      starredProjects: projects.filter(p => p.isStarred).length.toString(),
      totalFiles: totalFiles.toString(),
      totalAiPrompts: aiInteractions.length.toString(), 
    };
  }
});

export const getRecentActivity = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const userId = await resolveUser(ctx, args.userId);
        if (!userId) return [];

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .take(5);

        return projects.map(p => ({
            id: p._id,
            type: "project_created",
            title: p.title,
            timestamp: p._creationTime,
        }));
    }
});
