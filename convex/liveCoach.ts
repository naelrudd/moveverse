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
    const { userId, activity, level, reps, avgScore, duration,  } = args;

    // 1. Insert movement record
    const movementId = await ctx.db.insert("movements", {
      userId,
      activityId: `${activity}_L${level}`,
      activity,
      level,
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
    const xpGain = Math.round(avgScore * 0.5 + reps * 2 + level * 3);
    const newBadges: string[] = [];
    const user = await ctx.db.get(userId);
    if (user) {
      const existing = new Set(user.badges ?? []);

      // Activity badge (badge_menekuk, badge_meliuk, etc.)
      const activityBadge = `badge_${activity}`;
      if (!existing.has(activityBadge)) { newBadges.push(activityBadge); existing.add(activityBadge); }
      // Badge: first session ever
      if (!existing.has('first_session')) { newBadges.push('first_session'); existing.add('first_session'); }
      // Badge: score >= 95
      if (avgScore >= 95 && !existing.has('perfect_score')) { newBadges.push('perfect_score'); existing.add('perfect_score'); }
      // Badge: score >= 85
      if (avgScore >= 85 && !existing.has('excellent_form')) { newBadges.push('excellent_form'); existing.add('excellent_form'); }
      // Badge: 10+ reps
      if (reps >= 10 && !existing.has('rep_master')) { newBadges.push('rep_master'); existing.add('rep_master'); }
      // Badge: level 5
      if (level >= 5 && !existing.has('max_level')) { newBadges.push('max_level'); existing.add('max_level'); }
      // Badge: all 4 activities done today
      const todayMovements = await ctx.db
        .query("movements")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .take(20);
      const todayActivities = new Set(
        todayMovements
          .filter((m) => m.timestamp > Date.now() - 86400000)
          .map((m) => m.activityId.split("_")[0])
      );
      todayActivities.add(activity);
      if (todayActivities.size >= 4 && !existing.has('all_rounder')) { newBadges.push('all_rounder'); existing.add('all_rounder'); }

      // Update activity level on dashboard
      const levels = { ...(user.activityLevels ?? {}) };
      levels[activity] = Math.max(levels[activity] ?? 0, level);

      await ctx.db.patch(userId, {
        xp: user.xp + xpGain,
        coins: user.coins + Math.floor(xpGain / 10),
        badges: Array.from(existing),
        activityLevels: levels,
        updatedAt: Date.now(),
      });
    }

    return {
      movementId,
      xpGain,
      physicalLiteracy: plData,
      newBadges,
    };

    // 4. Update daily quest progress (if quest exists for today)
    const today = new Date().toISOString().split("T")[0];
    const dailyQuest = await ctx.db
      .query("daily_quests")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    if (dailyQuest != null) {
      const dq = dailyQuest!;
      if (!dq.tasks) return { movementId, xpGain, physicalLiteracy: plData, dailyQuestUpdated: false };
      const activityId = `${activity}_L${level}`;
      const newTasks = dq.tasks.map((t) => {
        if (t.activityId !== activity && t.activityId !== activityId) return t;
        const newCompleted = Math.min(t.completed + reps, t.target);
        return { ...t, completed: newCompleted };
      });
      const newXp = newTasks.reduce((sum, t) => sum + (t.completed >= t.target ? t.xp : 0), 0);
      await ctx.db.patch(dq._id, { tasks: newTasks, totalXpEarned: newXp });
    }

    return {
      movementId,
      xpGain,
      physicalLiteracy: plData,
      dailyQuestUpdated: !!dailyQuest,
    };
  },
});

/** Get live movement stats for a user by Clerk ID */
export const getLiveStats = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .first();
    if (!user) return {};

    const movements = await ctx.db
      .query("movements")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
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

/** Get session history for a user by Clerk ID */
export const getSessionHistory = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit: lim }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .first();
    if (!user) return [];

    const movements = await ctx.db
      .query("movements")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(lim ?? 50);

    return movements.map((m) => ({
      _id: m._id,
      activity: m.activity ?? m.activityId.split("_")[0],
      level: m.level ?? parseInt(m.activityId.split("_")[1]?.replace("L", "") ?? "1"),
      score: m.score,
      duration: m.duration,
      timestamp: m.timestamp,
    }));
  },
});

/** Leaderboard: top students by best score per activity */
export const getLeaderboard = query({
  args: {
    activity: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { activity, limit: lim }) => {
    const movements = await ctx.db
      .query("movements")
      .order("desc")
      .take(500); // fetch recent, group in memory

    // Group by userId, keep best score per activity
    const bestByUser = new Map<string, { userId: string; score: number; level: number; timestamp: number; userName: string }>();

    for (const m of movements) {
      const act = m.activity ?? m.activityId.split("_")[0];
      if (act !== activity) continue;

      const existing = bestByUser.get(m.userId);
      if (!existing || m.score > existing.score) {
        const user = await ctx.db.get(m.userId);
        bestByUser.set(m.userId, {
          userId: m.userId,
          score: m.score,
          level: m.level ?? parseInt(m.activityId.split("_")[1]?.replace("L", "") ?? "1"),
          timestamp: m.timestamp,
          userName: user?.name ?? "Peserta Didik",
        });
      }
    }

    return Array.from(bestByUser.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, lim ?? 10);
  },
});
