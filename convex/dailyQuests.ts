import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getToday = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const today = new Date().toISOString().split("T")[0];
    return await ctx.db
      .query("daily_quests")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();
  },
});

export const getByDate = query({
  args: { userId: v.id("users"), date: v.string() },
  handler: async (ctx, { userId, date }) => {
    return await ctx.db
      .query("daily_quests")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
      .first();
  },
});

export const getWeek = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const results: { date: string; totalXpEarned: number; completed: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const quest = await ctx.db
        .query("daily_quests")
        .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", dateStr))
        .first();
      const completed = quest?.tasks.filter((t) => t.completed >= t.target).length ?? 0;
      const total = quest?.tasks.length ?? 0;
      results.push({
        date: dateStr,
        totalXpEarned: quest?.totalXpEarned ?? 0,
        completed,
        total,
      });
    }
    return results;
  },
});

export const createOrUpdate = mutation({
  args: {
    userId: v.id("users"),
    tasks: v.array(
      v.object({
        activityId: v.string(),
        label: v.string(),
        target: v.number(),
        completed: v.number(),
        xp: v.number(),
      })
    ),
  },
  handler: async (ctx, { userId, tasks }) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = await ctx.db
      .query("daily_quests")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    const totalXpEarned = tasks.reduce(
      (sum, t) => sum + (t.completed >= t.target ? t.xp : 0),
      0
    );

    if (existing) {
      await ctx.db.patch(existing._id, { tasks, totalXpEarned });
      return existing._id;
    }

    return await ctx.db.insert("daily_quests", {
      userId,
      date: today,
      tasks,
      totalXpEarned,
    });
  },
});

export const updateTaskProgress = mutation({
  args: {
    userId: v.id("users"),
    activityId: v.string(),
    delta: v.number(),
  },
  handler: async (ctx, { userId, activityId, delta }) => {
    const today = new Date().toISOString().split("T")[0];
    const quest = await ctx.db
      .query("daily_quests")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    if (!quest) throw new Error("No daily quest for today");

    const tasks = quest.tasks.map((t) => {
      if (t.activityId !== activityId) return t;
      const newCompleted = Math.min(t.completed + delta, t.target);
      return { ...t, completed: newCompleted };
    });

    const totalXpEarned = tasks.reduce(
      (sum, t) => sum + (t.completed >= t.target ? t.xp : 0),
      0
    );

    await ctx.db.patch(quest._id, { tasks, totalXpEarned });
    return tasks;
  },
});
