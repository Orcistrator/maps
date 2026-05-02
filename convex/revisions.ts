import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function assertProjectOwner(ctx: any, projectId: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const project = await ctx.db.get(projectId);
  if (!project || project.userId !== userId) throw new Error("Not found");
  return userId;
}

export const getLatest = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) return null;
    return ctx.db
      .query("revisions")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .first();
  },
});

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) return [];
    return ctx.db
      .query("revisions")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const save = mutation({
  args: {
    projectId: v.id("projects"),
    snapshot: v.string(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, snapshot, label }) => {
    await assertProjectOwner(ctx, projectId);
    return ctx.db.insert("revisions", { projectId, snapshot, label });
  },
});

// Restore creates a new revision from a prior snapshot, preserving history
export const restore = mutation({
  args: { revisionId: v.id("revisions") },
  handler: async (ctx, { revisionId }) => {
    const revision = await ctx.db.get(revisionId);
    if (!revision) throw new Error("Revision not found");
    await assertProjectOwner(ctx, revision.projectId);
    return ctx.db.insert("revisions", {
      projectId: revision.projectId,
      snapshot: revision.snapshot,
      label: `Restored`,
    });
  },
});
