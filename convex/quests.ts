import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserQuests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("quests")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getActiveQuest = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("quests")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const createQuest = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("jumping"),
      v.literal("running"),
      v.literal("balance")
    ),
    target: v.number(),
  },
  handler: async (ctx, { userId, type, target }) => {
    return await ctx.db.insert("quests", {
      userId,
      type,
      target,
      completed: 0,
      status: "active",
      timestamp: Date.now(),
    });
  },
});

export const updateProgress = mutation({
  args: {
    questId: v.id("quests"),
    progressDelta: v.number(),
  },
  handler: async (ctx, { questId, progressDelta }) => {
    const quest = await ctx.db.get(questId);
    if (!quest) throw new Error("Quest not found");

    const newCompleted = Math.min(quest.completed + progressDelta, quest.target);
    const isCompleted = newCompleted >= quest.target;

    await ctx.db.patch(questId, {
      completed: newCompleted,
      status: isCompleted ? "completed" : "active",
      completedAt: isCompleted ? Date.now() : undefined,
    });

    return { newCompleted, isCompleted };
  },
});

export const completeQuest = mutation({
  args: { questId: v.id("quests") },
  handler: async (ctx, { questId }) => {
    const quest = await ctx.db.get(questId);
    if (!quest) throw new Error("Quest not found");

    await ctx.db.patch(questId, {
      status: "completed",
      completed: quest.target,
      completedAt: Date.now(),
    });

    return quest;
  },
});
