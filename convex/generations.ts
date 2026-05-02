import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getLatest = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) return null;
    return ctx.db
      .query("generations")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .first();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    revisionId: v.id("revisions"),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, revisionId, prompt }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");
    return ctx.db.insert("generations", {
      projectId,
      revisionId,
      status: "pending",
      prompt,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("generations"),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, error }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const generation = await ctx.db.get(id);
    if (!generation) throw new Error("Not found");
    const project = await ctx.db.get(generation.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { status, ...(error !== undefined && { error }) });
  },
});
