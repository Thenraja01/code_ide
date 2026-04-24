// @ts-ignore
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

type Ctx = any;
type Args = any;

export const updateStatus = mutation({
  args: {
    fileId: v.string(),
    sessionId: v.string(),
    status: v.string(),
    userId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx: Ctx, args: Args) => {
    const existing = await ctx.db
      .query("jobStatus")
      .withIndex("by_fileId_sessionId", (q: any) =>
        q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .unique();

    const now = Date.now();
    const expiresAt = args.expiresAt || now + (2 * 3600000);

    if (existing) {
      // Idempotency check: Don't overwrite 'done' status if the request is old or if it already finished
      if (existing.status === 'done' && args.status !== 'done') {
          console.log(`[Convex] Skipping status update: Job already done.`);
          return;
      }

      await ctx.db.patch(existing._id, {
        status: args.status,
        updatedAt: now,
        expiresAt,
        requestId: args.requestId || existing.requestId
      });
    } else {
      await ctx.db.insert("jobStatus", {
        fileId: args.fileId,
        sessionId: args.sessionId,
        status: args.status,
        createdAt: now,
        updatedAt: now,
        expiresAt,
        requestId: args.requestId
      });
    }
  },
});

export const getStatus = query({
  args: { fileId: v.string(), sessionId: v.string() },
  handler: async (ctx: Ctx, args: Args) => {
    return await ctx.db
      .query("jobStatus")
      .withIndex("by_fileId_sessionId", (q: any) =>
        q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
      )
      .unique();
  },
});
