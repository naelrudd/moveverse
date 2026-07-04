import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Log a completed movement session from the AI Coach */
export const logMovementSession = mutation({
  args: {
    userId: v.id("users"),
    activity: v.union(
      v.literal("menekuk"),
      v.literal("meliuk"),
      v.literal("memutar"),
      v.literal("keseimbangan")
    ),
    level: v.number(),
    reps: v.number(),
    avgScore: v.number(),
    holdTime: v.number(),
    duration: v.number(),
    scoreHistory: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, activity, level, reps, avgScore, holdTime, duration, scoreHistory } = args;

    // 1. Insert movement record
    const movementId = await ctx.db.insert("movements", {
      userId,
      questId: "pending" as any, // movements without quest
      activityId: `${activity}_L${level}`,
      score: avgScore,
      duration,
      timestamp: Date.now(),
    });

    // 2. Update physical_literacy
    const plMapping: Record<string, { balance: number; coordination: number; agility: number; flexibility: number; strength: number }> = {
      menekuk:      { balance: 0, coordination: 3, agility: 2, flexibility: 0, strength: 3 },
      meliuk:       { balance: 0, coordination: 2, agility: 0, flexibility: 3, strength: 0 },
      memutar:      { balance: 2, coordination: 3, agility: 2, flexibility: 0, strength: 0 },
      keseimbangan: { balance: 3, coordination: 2, agility: 0, flexibility: 0, strength: 2 },
    };

    const deltas = plMapping[activity] ?? { balance: 0, coordination: 0, agility: 0, flexibility: 0, strength: 0 };
    const multiplier = Math.round(avgScore / 30); // 0-3 points per metric

    const existingPl = await ctx.db
      .query("physical_literacy")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const plData = {
      balance: (existingPl?.balance ?? 0) + deltas.balance * multiplier,
      coordination: (existingPl?.coordination ?? 0) + deltas.coordination * multiplier,
      agility: (existingPl?.agility ?? 0) + deltas.agility * multiplier,
      flexibility: (existingPl?.flexibility ?? 0) + deltas.flexibility * multiplier,
      strength: (existingPl?.strength ?? 0) + deltas.strength * multiplier,
      updatedAt: Date.now(),
    };

    // Cap at 100
    plData.balance = Math.min(100, plData.balance);
    plData.coordination = Math.min(100, plData.coordination);
    plData.agility = Math.min(100, plData.agility);
    plData.flexibility = Math.min(100, plData.flexibility);
    plData.strength = Math.min(100, plData.strength);

    if (existingPl) {
      await ctx.db.patch(existingPl._id, plData);
    } else {
      await ctx.db.insert("physical_literacy", { userId, ...plData });
    }

    // 3. XP reward based on score
    const xpGain = Math.round(avgScore * 0.5 + reps * 2 + level * 3); // e.g. avgScore=80 → 40 + reps*2 + level*3
    const user = await ctx.db.get(userId);
    if (user) {
      await ctx.db.patch(userId, {
        xp: user.xp + xpGain,
        coins: user.coins + Math.floor(xpGain / 10),
        updatedAt: Date.now(),
      });
    }

    return {
      movementId,
      xpGain,
      physicalLiteracy: plData,
    };
  },
});

/** Get live movement stats for a user */
export const getLiveStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const movements = await ctx.db
      .query("movements")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    const byActivity: Record<string, { count: number; avgScore: number; bestScore: number }> = {};
    for (const m of movements) {
      const key = m.activityId.split("_")[0]; // "menekuk_L2" → "menekuk"
      if (!byActivity[key]) byActivity[key] = { count: 0, avgScore: 0, bestScore: 0 };
      byActivity[key].count++;
      byActivity[key].avgScore += m.score;
      byActivity[key].bestScore = Math.max(byActivity[key].bestScore, m.score);
    }

    // Calculate averages
    for (const key of Object.keys(byActivity)) {
      byActivity[key].avgScore = Math.round(byActivity[key].avgScore / byActivity[key].count);
    }

    return byActivity;
  },
});
