// @ts-ignore
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

type Ctx = any;
type Args = any;

export const addChunk = mutation({
  args: {
    fileId: v.string(),
    sessionId: v.string(),
    chunk: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx: Ctx, args: Args) => {
    const now = Date.now();
    await ctx.db.insert("aiStreams", {
      fileId: args.fileId,
      sessionId: args.sessionId,
      chunk: args.chunk,
      createdAt: now,
      updatedAt: now,
      expiresAt: args.expiresAt || now + (2 * 3600000), // 2h default
    });
  },
});

export const getChunks = query({
  args: { fileId: v.string(), sessionId: v.string() },
  handler: async (ctx: Ctx, args: Args) => {
    return await ctx.db
      .query("aiStreams")
      .withIndex("by_fileId_sessionId", (q: any) =>
        q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .order("asc")
      .collect();
  },
});

export const getHistory = query({
  args: { sessionId: v.string() },
  handler: async (ctx: Ctx, args: Args) => {
    return await ctx.db
      .query("aiStreams")
      .withIndex("by_sessionId", (q: any) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const deleteStream = mutation({
  args: { fileId: v.string(), sessionId: v.string() },
  handler: async (ctx: Ctx, args: Args) => {
    const records = await ctx.db
      .query("aiStreams")
      .withIndex("by_fileId_sessionId", (q: any) =>
        q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .collect();
    for (const record of records) {
      await ctx.db.delete(record._id);
    }
  },
});

export const upsertStream = mutation({
  args: { fileId: v.string(), sessionId: v.string(), chunk: v.string() },
  handler: async (ctx: Ctx, args: Args) => {
    const existing = await ctx.db
      .query("aiStreams")
      .withIndex("by_fileId_sessionId", (q: any) =>
        q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .first();
      
    if (existing) {
      await ctx.db.patch(existing._id, {
        chunk: args.chunk,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("aiStreams", {
        fileId: args.fileId,
        sessionId: args.sessionId,
        chunk: args.chunk,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
