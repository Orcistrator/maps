import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByGeneration = query({
  args: { generationId: v.id("generations") },
  handler: async (ctx, { generationId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const generation = await ctx.db.get(generationId);
    if (!generation) return [];
    const project = await ctx.db.get(generation.projectId);
    if (!project || project.userId !== userId) return [];
    return ctx.db
      .query("placements")
      .withIndex("by_generationId", (q) => q.eq("generationId", generationId))
      .collect();
  },
});

export const saveMany = mutation({
  args: {
    generationId: v.id("generations"),
    placements: v.array(
      v.object({
        regionId: v.optional(v.id("regions")),
        assetId: v.string(),
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        rotation: v.number(),
        zIndex: v.number(),
      }),
    ),
  },
  handler: async (ctx, { generationId, placements }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const generation = await ctx.db.get(generationId);
    if (!generation) throw new Error("Generation not found");
    const project = await ctx.db.get(generation.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");

    // Replace existing placements for this generation
    const existing = await ctx.db
      .query("placements")
      .withIndex("by_generationId", (q) => q.eq("generationId", generationId))
      .collect();
    for (const p of existing) await ctx.db.delete(p._id);

    return Promise.all(
      placements.map((p) =>
        ctx.db.insert("placements", { ...p, projectId: generation.projectId, generationId }),
      ),
    );
  },
});
