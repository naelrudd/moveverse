import { v } from "convex/values";
import { query } from "./_generated/server";

// Get linked children for a parent
export const getLinkedChildren = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user?.childIds?.length) return [];
    return Promise.all(user.childIds.map((id) => ctx.db.get(id)));
  },
});

// Get all movements for a child (for AI recording access)
export const getChildMovements = query({
  args: { childId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { childId, limit = 50 }) => {
    return await ctx.db
      .query("movements")
      .withIndex("by_userId", (q) => q.eq("userId", childId))
      .order("desc")
      .take(limit ?? 50);
  },
});

// Get physical literacy history for a child
export const getChildPLHistory = query({
  args: { childId: v.id("users") },
  handler: async (ctx, { childId }) => {
    return await ctx.db
      .query("physical_literacy")
      .withIndex("by_userId", (q) => q.eq("userId", childId))
      .order("desc")
      .take(12);
  },
});

// Get recent quests for a child
export const getChildQuests = query({
  args: { childId: v.id("users") },
  handler: async (ctx, { childId }) => {
    return await ctx.db
      .query("quests")
      .withIndex("by_userId", (q) => q.eq("userId", childId))
      .order("desc")
      .take(20);
  },
});

// Get school info for parent report
export const getParentSchool = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user?.schoolId) return null;
    return await ctx.db.get(user.schoolId);
  },
});

// Link a child to parent by child NIS
export const getChildByNis = query({
  args: { nis: v.string() },
  handler: async (ctx, { nis }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_nis", (q) => q.eq("nis", nis))
      .first();
  },
});