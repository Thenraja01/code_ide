import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
  args: {
    email: v.string(),
    firebaseUid: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name ?? existingUser.name,
        avatar: args.avatar ?? existingUser.avatar,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      email: args.email,
      firebaseUid: args.firebaseUid,
      name: args.name,
      avatar: args.avatar,
    });
  },
});

export const getUserByUid = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();
  },
});
