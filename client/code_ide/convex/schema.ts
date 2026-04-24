import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    avatar: v.optional(v.string()),
    firebaseUid: v.string(),
  }).index("by_firebaseUid", ["firebaseUid"]),

  projects: defineTable({
    title: v.string(),
    language: v.string(),
    userId: v.id("users"),
    isPublic: v.boolean(),
    isStarred: v.optional(v.boolean()),
    prompt: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    buildState: v.optional(
      v.union(
        v.literal("idle"),
        v.literal("generating"),
        v.literal("ready"),
        v.literal("error"),
        v.literal("running")
      )
    ),
  }).index("by_userId", ["userId"]),

  files: defineTable({
    name: v.string(),
    content: v.optional(v.string()),
    type: v.union(v.literal("file"), v.literal("folder")),
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    userId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    storageId:v.optional(v.id("_storage"))
  })
    .index("by_projectId", ["projectId"])
    .index("by_parentId", ["parentId"])
    .index("by_project_parentId", ["projectId", "parentId"]),

  liveFiles: defineTable({
    fileId: v.string(),
    sessionId: v.string(),
    content: v.string(),
    version: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  }).index("by_fileId_sessionId", ["fileId", "sessionId"]),

  aiStreams: defineTable({
    fileId: v.string(),
    sessionId: v.string(),
    chunk: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_fileId_sessionId", ["fileId", "sessionId"]),

  jobStatus: defineTable({
    fileId: v.string(),
    sessionId: v.string(),
    status: v.string(), // "idle" | "running" | "done" | "error" | "cancelled"
    requestId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_fileId_sessionId", ["fileId", "sessionId"]),

  diffs: defineTable({
    fileId: v.string(),
    sessionId: v.string(),
    diff: v.string(),
    status: v.string(), // "pending" | "accepted" | "rejected"
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  }).index("by_fileId_sessionId", ["fileId", "sessionId"]),
});
