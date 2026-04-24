// @ts-ignore
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

type Ctx = any;
type Args = any;

export const setDiff = mutation({
  args: {
    fileId: v.string(),
    sessionId: v.string(),
    diff: v.string(),
    status: v.string(),
  },
  handler: async (ctx: Ctx, args: Args) => {
    const existing = await ctx.db
      .query("diffs")
      .withIndex("by_fileId_sessionId", (q: any) =>
        q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        diff: args.diff,
        status: args.status,
        updatedAt: now,
        expiresAt: now + (4 * 3600000),
      });
    } else {
      await ctx.db.insert("diffs", {
        fileId: args.fileId,
        sessionId: args.sessionId,
        diff: args.diff,
        status: args.status,
        createdAt: now,
        updatedAt: now,
        expiresAt: now + (4 * 3600000),
      });
    }
  },
});

export const getDiff = query({
  args: { fileId: v.string(), sessionId: v.string() },
  handler: async (ctx: Ctx, args: Args) => {
    return await ctx.db
      .query("diffs")
      .withIndex("by_fileId_sessionId", (q: any) =>
        q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .unique();
  },
});
