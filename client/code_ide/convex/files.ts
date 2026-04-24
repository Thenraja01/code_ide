import type { Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";


// 🔐 Helper: Auth + Project Validation
async function resolveUser(ctx: any, userId: string) {
  const normalizedId = ctx.db.normalizeId("users", userId);
  if (normalizedId) return normalizedId;

  const user = await ctx.db
    .query("users")
    .withIndex("by_firebaseUid", (q: any) => q.eq("firebaseUid", userId))
    .first();
  return user ? user._id : null;
}

async function getUserAndProject(ctx: QueryCtx | MutationCtx, projectId: Id<"projects">, userId?: string) {
  const project = await ctx.db.get(projectId);
  if (!project) throw new Error("Project not found");

  if (userId) {
    const resolvedUserId = await resolveUser(ctx, userId);
    if (!resolvedUserId || project.userId !== resolvedUserId) {
      throw new Error("Not authorized");
    }
  }

  return { project };
}


// 📁 Get all files in project
export const getFilesByProject = query({
  args: { 
    projectId: v.id("projects"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getUserAndProject(ctx, args.projectId, args.userId);

    return await ctx.db
      .query("files")
      .withIndex("by_projectId", (q) =>
        q.eq("projectId", args.projectId)
      )
      .collect();
  },
});


// 📁 Get files inside a folder
export const getFolderFiles = query({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getUserAndProject(ctx, args.projectId, args.userId);

    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parentId", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId)
      )
      .collect();

    return files.sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });
  },
});


// 📄 Get single file
export const getFile = query({
  args: { 
    fileId: v.id("files"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    await getUserAndProject(ctx, file.projectId, args.userId);

    return file;
  },
});


// 📄 Get file content
export const getFileContent = query({
  args: { 
    fileId: v.id("files"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    await getUserAndProject(ctx, file.projectId, args.userId);

    return file.content;
  },
});


// ➕ Create File
export const createFile = mutation({
  args: {
    name: v.string(),
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    content: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getUserAndProject(ctx, args.projectId, args.userId);

    const existing = await ctx.db
      .query("files")
      .withIndex("by_project_parentId", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId)
      )
      .collect();

    if (existing.find((f) => f.name === args.name)) {
      throw new Error("File already exists");
    }

    await ctx.db.insert("files", {
      projectId: args.projectId,
      parentId: args.parentId,
      name: args.name,
      type: "file",
      content: args.content ?? "",
      updatedAt: Date.now(),
    });
  },
});


// 📂 Create Folder
export const createFolder = mutation({
  args: {
    name: v.string(),
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getUserAndProject(ctx, args.projectId, args.userId);

    const existing = await ctx.db
      .query("files")
      .withIndex("by_project_parentId", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId)
      )
      .collect();

    if (existing.find((f) => f.name === args.name)) {
      throw new Error("Folder already exists");
    }

    await ctx.db.insert("files", {
      projectId: args.projectId,
      parentId: args.parentId,
      name: args.name,
      type: "folder",
      updatedAt: Date.now(),
    });
  },
});


// ✏️ Update file content
export const updateFileContent = mutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    await getUserAndProject(ctx, file.projectId, args.userId);

    const now = Date.now();
    await ctx.db.patch(args.fileId, {
      content: args.content,
      updatedAt: now,
    });

    await ctx.db.patch(file.projectId, {
      updatedAt: now,
    });
  },
});


// 🔄 Move File
export const moveFile = mutation({
  args: {
    fileId: v.id("files"),
    newParentId: v.optional(v.id("files")),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    await getUserAndProject(ctx, file.projectId, args.userId);

    if (args.newParentId === args.fileId) {
      throw new Error("Cannot move into itself");
    }

    await ctx.db.patch(args.fileId, {
      parentId: args.newParentId,
      updatedAt: Date.now(),
    });
  },
});


// ✏️ Rename File / Folder
export const renameFile = mutation({
  args: {
    fileId: v.id("files"),
    newName: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    await getUserAndProject(ctx, file.projectId, args.userId);

    const siblings = await ctx.db
      .query("files")
      .withIndex("by_project_parentId", (q) =>
        q.eq("projectId", file.projectId).eq("parentId", file.parentId)
      )
      .collect();

    if (
      siblings.find(
        (f) => f.name === args.newName && f._id !== args.fileId
      )
    ) {
      throw new Error("Name already exists");
    }

    await ctx.db.patch(args.fileId, {
      name: args.newName,
      updatedAt: Date.now(),
    });
    await ctx.db.patch("projects",file.projectId,{
      updatedAt: Date.now(),
    })
  },
});


// 🗑️ Delete File (Recursive)
export const deleteFile = mutation({
  args: { 
    fileId: v.id("files"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    await getUserAndProject(ctx, file.projectId, args.userId);

    const deleteRecursive = async (fileId: Id<"files">) => {
      const item = await ctx.db.get(fileId);
      if (!item) return;

      const children = await ctx.db
        .query("files")
        .withIndex("by_project_parentId", (q) =>
          q.eq("projectId", item.projectId).eq("parentId", fileId)
        )
        .collect();

      for (const child of children) {
        await deleteRecursive(child._id);
      }

      if (item.storageId) {
        await ctx.storage.delete(item.storageId);
      }

      await ctx.db.delete(fileId);
    };

    await deleteRecursive(args.fileId);
  },
});