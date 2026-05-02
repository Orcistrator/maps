import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const regionTypeValidator = v.union(
  v.literal("room"),
  v.literal("corridor"),
  v.literal("outdoor"),
  v.literal("water"),
  v.literal("unknown"),
);

export const listByRevision = query({
  args: { revisionId: v.id("revisions") },
  handler: async (ctx, { revisionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const revision = await ctx.db.get(revisionId);
    if (!revision) return [];
    const project = await ctx.db.get(revision.projectId);
    if (!project || project.userId !== userId) return [];
    return ctx.db
      .query("regions")
      .withIndex("by_revisionId", (q) => q.eq("revisionId", revisionId))
      .collect();
  },
});

export const saveMany = mutation({
  args: {
    revisionId: v.id("revisions"),
    regions: v.array(
      v.object({
        label: v.optional(v.string()),
        regionType: regionTypeValidator,
        confidence: v.number(),
        locked: v.boolean(),
        bounds: v.object({
          x: v.number(),
          y: v.number(),
          width: v.number(),
          height: v.number(),
        }),
        shapeIds: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, { revisionId, regions }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const revision = await ctx.db.get(revisionId);
    if (!revision) throw new Error("Revision not found");
    const project = await ctx.db.get(revision.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");

    // Replace existing regions for this revision
    const existing = await ctx.db
      .query("regions")
      .withIndex("by_revisionId", (q) => q.eq("revisionId", revisionId))
      .collect();
    for (const r of existing) await ctx.db.delete(r._id);

    return Promise.all(
      regions.map((r) =>
        ctx.db.insert("regions", { ...r, projectId: revision.projectId, revisionId }),
      ),
    );
  },
});

export const setLocked = mutation({
  args: { id: v.id("regions"), locked: v.boolean() },
  handler: async (ctx, { id, locked }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const region = await ctx.db.get(id);
    if (!region) throw new Error("Not found");
    const project = await ctx.db.get(region.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { locked });
  },
});
