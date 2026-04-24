// @ts-ignore
import { mutation } from "./_generated/server";
import { v } from "convex/values";

type Ctx = any;
type Args = any;

export const sessionCleanup = mutation({
  args: {
    fileId: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx: Ctx, args: Args) => {
    const list = async (table: string) => {
      return await ctx.db
        .query(table)
        .withIndex("by_fileId_sessionId", (q: any) =>
          q.eq("fileId", args.fileId).eq("sessionId", args.sessionId)
        )
        .collect();
    };

    const tables = ["liveFiles", "aiStreams", "jobStatus", "diffs"];
    for (const table of tables) {
      const records = await list(table);
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }
  },
});
