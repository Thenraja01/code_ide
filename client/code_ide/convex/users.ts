import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Sync / Upsert user on login ────────────────────────────────────────────
export const syncUser = mutation({
  args: {
    email: v.string(),
    firebaseUid: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    provider: v.optional(v.string()),  // "password" | "github.com" | "google.com"
    githubId: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    googleId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();

    const providerKey = args.provider ?? "password";

    if (existing) {
      // Merge linked providers list
      const providers = Array.from(new Set([...(existing.linkedProviders ?? []), providerKey]));

      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        avatar: args.avatar ?? existing.avatar,
        linkedProviders: providers,
        githubId: args.githubId ?? existing.githubId,
        githubUsername: args.githubUsername ?? existing.githubUsername,
        googleId: args.googleId ?? existing.googleId,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      email: args.email,
      firebaseUid: args.firebaseUid,
      name: args.name,
      avatar: args.avatar,
      bio: undefined,
      emailVerified: false,
      linkedProviders: [providerKey],
      githubId: args.githubId,
      githubUsername: args.githubUsername,
      googleId: args.googleId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ─── Get full profile by firebaseUid ────────────────────────────────────────
export const getUserByUid = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();
  },
});

// ─── Update profile (name + bio + avatar) ───────────────────────────────────
export const updateProfile = mutation({
  args: {
    firebaseUid: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.bio !== undefined && { bio: args.bio }),
      ...(args.avatar !== undefined && { avatar: args.avatar }),
      updatedAt: Date.now(),
    });
    return user._id;
  },
});

// ─── Store OTP for email verification ───────────────────────────────────────
export const storeOtp = mutation({
  args: {
    firebaseUid: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      pendingOtp: args.otp,
      otpExpiresAt: args.expiresAt,
      updatedAt: Date.now(),
    });
  },
});

// ─── Verify OTP ─────────────────────────────────────────────────────────────
export const verifyOtp = mutation({
  args: {
    firebaseUid: v.string(),
    otp: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();
    if (!user) throw new Error("User not found");
    if (!user.pendingOtp) throw new Error("No OTP pending");
    if (Date.now() > (user.otpExpiresAt ?? 0)) throw new Error("OTP expired");
    if (user.pendingOtp !== args.otp) throw new Error("Invalid OTP");

    await ctx.db.patch(user._id, {
      emailVerified: true,
      pendingOtp: undefined,
      otpExpiresAt: undefined,
      updatedAt: Date.now(),
    });
    return true;
  },
});

// ─── Link GitHub account ─────────────────────────────────────────────────────
export const linkGithub = mutation({
  args: {
    firebaseUid: v.string(),
    githubId: v.string(),
    githubUsername: v.string(),
    githubAccessToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();
    if (!user) throw new Error("User not found");

    const providers = Array.from(new Set([...(user.linkedProviders ?? []), "github.com"]));

    await ctx.db.patch(user._id, {
      githubId: args.githubId,
      githubUsername: args.githubUsername,
      githubAccessToken: args.githubAccessToken,
      linkedProviders: providers,
      updatedAt: Date.now(),
    });
    return user._id;
  },
});

// ─── Link Google account ─────────────────────────────────────────────────────
export const linkGoogle = mutation({
  args: {
    firebaseUid: v.string(),
    googleId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();
    if (!user) throw new Error("User not found");

    const providers = Array.from(new Set([...(user.linkedProviders ?? []), "google.com"]));

    await ctx.db.patch(user._id, {
      googleId: args.googleId,
      linkedProviders: providers,
      updatedAt: Date.now(),
    });
    return user._id;
  },
});
