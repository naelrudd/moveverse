import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const logMovement = mutation({
  args: {
    userId: v.id("users"),
    questId: v.id("quests"),
    activityId: v.string(),
    score: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, { userId, questId, activityId, score, duration }) => {
    return await ctx.db.insert("movements", {
      userId,
      questId,
      activityId,
      score,
      duration,
      timestamp: Date.now(),
    });
  },
});

export const getQuestMovements = query({
  args: { questId: v.id("quests") },
  handler: async (ctx, { questId }) => {
    return await ctx.db
      .query("movements")
      .withIndex("by_questId", (q) => q.eq("questId", questId))
      .collect();
  },
});

export const getUserMovements = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 100 }) => {
    return await ctx.db
      .query("movements")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

export const getMovementStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const movements = await ctx.db
      .query("movements")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (movements.length === 0) {
      return { totalMovements: 0, avgScore: 0, activities: {} as Record<string, number> };
    }

    const avgScore = Math.round(
      movements.reduce((sum, m) => sum + m.score, 0) / movements.length
    );

    const activities: Record<string, number> = {};
    for (const m of movements) {
      activities[m.activityId] = (activities[m.activityId] || 0) + 1;
    }

    return { totalMovements: movements.length, avgScore, activities };
  },
});
