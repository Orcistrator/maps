import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return ctx.db.insert("projects", { userId, name });
  },
});

export const rename = mutation({
  args: { id: v.id("projects"), name: v.string() },
  handler: async (ctx, { id, name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { name });
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");

    // Delete placements and generations
    const generations = await ctx.db
      .query("generations")
      .withIndex("by_projectId", (q) => q.eq("projectId", id))
      .collect();
    for (const gen of generations) {
      const placements = await ctx.db
        .query("placements")
        .withIndex("by_generationId", (q) => q.eq("generationId", gen._id))
        .collect();
      for (const p of placements) await ctx.db.delete(p._id);
      await ctx.db.delete(gen._id);
    }

    // Delete regions and revisions
    const revisions = await ctx.db
      .query("revisions")
      .withIndex("by_projectId", (q) => q.eq("projectId", id))
      .collect();
    for (const rev of revisions) {
      const regions = await ctx.db
        .query("regions")
        .withIndex("by_revisionId", (q) => q.eq("revisionId", rev._id))
        .collect();
      for (const r of regions) await ctx.db.delete(r._id);
      await ctx.db.delete(rev._id);
    }

    await ctx.db.delete(id);
  },
});
