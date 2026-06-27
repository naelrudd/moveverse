import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const logMovement = mutation({
  args: {
    userId: v.id("users"),
    questId: v.id("quests"),
    landmarks: v.object({
      data: v.array(
        v.object({
          x: v.number(),
          y: v.number(),
          z: v.number(),
          visibility: v.number(),
          presence: v.number(),
        })
      ),
    }),
    fmsScore: v.object({
      squatDepth: v.number(),
      landingBalance: v.number(),
      jumpValid: v.boolean(),
    }),
  },
  handler: async (ctx, { userId, questId, landmarks, fmsScore }) => {
    return await ctx.db.insert("movements", {
      userId,
      questId,
      landmarks,
      fmsScore,
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
  args: { questId: v.id("quests") },
  handler: async (ctx, { questId }) => {
    const movements = await ctx.db
      .query("movements")
      .withIndex("by_questId", (q) => q.eq("questId", questId))
      .collect();

    if (movements.length === 0) {
      return {
        totalMovements: 0,
        avgSquatDepth: 0,
        avgLandingBalance: 0,
        validJumps: 0,
      };
    }

    const totalValid = movements.filter((m) => m.fmsScore.jumpValid).length;
    const avgDepth =
      movements.reduce((sum, m) => sum + m.fmsScore.squatDepth, 0) / movements.length;
    const avgBalance =
      movements.reduce((sum, m) => sum + m.fmsScore.landingBalance, 0) / movements.length;

    return {
      totalMovements: movements.length,
      avgSquatDepth: Math.round(avgDepth),
      avgLandingBalance: Math.round(avgBalance),
      validJumps: totalValid,
    };
  },
});
