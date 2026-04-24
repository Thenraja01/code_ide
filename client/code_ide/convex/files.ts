import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getFilesByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const createFile = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("file"), v.literal("folder")),
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    content: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      name: args.name,
      type: args.type,
      projectId: args.projectId,
      parentId: args.parentId,
      content: args.content,
    });
  },
});

export const updateFileContent = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
    userId: v.optional(v.string()), // For isolation
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      content: args.content,
      // We could verify ownership here using args.userId and the project's userId
    });
  },
});

export const getFile = query({
    args: { fileId: v.id("files") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.fileId);
    }
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    // Also delete child files if this is a folder
    const children = await ctx.db
      .query("files")
      .withIndex("by_parentId", (q) => q.eq("parentId", args.fileId))
      .collect();

    for (const child of children) {
      await ctx.db.delete(child._id);
    }

    await ctx.db.delete(args.fileId);
  },
});

export const moveFile = mutation({
  args: {
    fileId: v.id("files"),
    newParentId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      parentId: args.newParentId,
    });
  },
});
