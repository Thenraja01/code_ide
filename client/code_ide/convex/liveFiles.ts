// @ts-ignore
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

type Ctx = any;
type Args = any;

export const saveFile = mutation({
  args: {
    fileId: v.string(),
    sessionId: v.string(),
    content: v.string(),
    version: v.number(),
    ttl: v.optional(v.number()),
  },
  handler: async (ctx: Ctx, args: Args) => {
    const existing = await ctx.db
      .query("liveFiles")
      .withIndex("by_fileId_sessionId", (q: any) => 
         q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .unique();

    const now = Date.now();
    const expiresAt = args.ttl ? now + (args.ttl * 3600000) : undefined;

    if (existing) {
      if (args.version > existing.version) {
        await ctx.db.patch(existing._id, {
          content: args.content,
          version: args.version,
          updatedAt: now,
          expiresAt,
        });
      }
    } else {
      await ctx.db.insert("liveFiles", {
        fileId: args.fileId,
        sessionId: args.sessionId,
        content: args.content,
        version: args.version,
        createdAt: now,
        updatedAt: now,
        expiresAt,
      });
    }
  },
});

export const seedContent = mutation({
  args: {
    fileId: v.string(),
    sessionId: v.string(),
    content: v.string(),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx: Ctx, args: Args) => {
    const existing = await ctx.db
      .query("liveFiles")
      .withIndex("by_fileId_sessionId", (q: any) => 
        q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .unique();

    const now = Date.now();
    if (!existing || args.force) {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
      await ctx.db.insert("liveFiles", {
        fileId: args.fileId,
        sessionId: args.sessionId,
        content: args.content,
        version: now,
        createdAt: now,
        updatedAt: now,
        expiresAt: now + (4 * 3600000), 
      });
    }
  },
});

export const getFile = query({
  args: { fileId: v.string(), sessionId: v.string() },
  handler: async (ctx: Ctx, args: Args) => {
    return await ctx.db
      .query("liveFiles")
      .withIndex("by_fileId_sessionId", (q: any) => 
        q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .unique();
  },
});
