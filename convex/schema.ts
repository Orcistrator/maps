import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Top-level map projects owned by a user
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
  }).index("by_userId", ["userId"]),

  // tldraw snapshot revisions for a project (one per save/generation)
  revisions: defineTable({
    projectId: v.id("projects"),
    snapshot: v.string(), // serialized tldraw JSON
    label: v.optional(v.string()),
  }).index("by_projectId", ["projectId"]),

  // Regions parsed from a revision's sketch
  regions: defineTable({
    projectId: v.id("projects"),
    revisionId: v.id("revisions"),
    label: v.optional(v.string()),
    regionType: v.union(
      v.literal("room"),
      v.literal("corridor"),
      v.literal("outdoor"),
      v.literal("water"),
      v.literal("unknown"),
    ),
    confidence: v.number(),
    locked: v.boolean(),
    bounds: v.object({
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
    }),
    shapeIds: v.array(v.string()), // tldraw shape IDs that form this region
  })
    .index("by_projectId", ["projectId"])
    .index("by_revisionId", ["revisionId"]),

  // AI generation runs (one per user-triggered generate action)
  generations: defineTable({
    projectId: v.id("projects"),
    revisionId: v.id("revisions"),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    prompt: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_projectId", ["projectId"]),

  // Asset placements output by a generation run
  placements: defineTable({
    projectId: v.id("projects"),
    generationId: v.id("generations"),
    regionId: v.optional(v.id("regions")),
    assetId: v.string(), // key into the asset manifest
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    rotation: v.number(),
    zIndex: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_generationId", ["generationId"]),
});
