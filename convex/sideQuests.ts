import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByChild = query({
  args: { childId: v.id("users") },
  handler: async (ctx, { childId }) => {
    return await ctx.db
      .query("side_quests")
      .withIndex("by_childId", (q) => q.eq("childId", childId))
      .order("desc")
      .collect();
  },
});

export const getByChildActive = query({
  args: { childId: v.id("users") },
  handler: async (ctx, { childId }) => {
    return await ctx.db
      .query("side_quests")
      .withIndex("by_child_completed", (q) => q.eq("childId", childId).eq("completed", false))
      .order("desc")
      .collect();
  },
});

export const getByParent = query({
  args: { parentId: v.id("users") },
  handler: async (ctx, { parentId }) => {
    return await ctx.db
      .query("side_quests")
      .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
      .order("desc")
      .collect();
  },
});

export const getByParentAndChild = query({
  args: { parentId: v.id("users"), childId: v.id("users") },
  handler: async (ctx, { parentId, childId }) => {
    return await ctx.db
      .query("side_quests")
      .withIndex("by_childId", (q) => q.eq("childId", childId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    parentId: v.id("users"),
    childId: v.id("users"),
    title: v.string(),
    icon: v.string(),
    xpReward: v.number(),
  },
  handler: async (ctx, { parentId, childId, title, icon, xpReward }) => {
    const id = await ctx.db.insert("side_quests", {
      parentId,
      childId,
      title,
      icon,
      xpReward,
      completed: false,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const markComplete = mutation({
  args: { questId: v.id("side_quests"), childId: v.id("users") },
  handler: async (ctx, { questId, childId }) => {
    const quest = await ctx.db.get(questId);
    if (!quest || quest.childId !== childId) return null;

    await ctx.db.patch(questId, { completed: true });

    const child = await ctx.db.get(childId);
    if (child) {
      await ctx.db.patch(childId, {
        xp: child.xp + quest.xpReward,
        updatedAt: Date.now(),
      });
    }

    return quest._id;
  },
});

export const markCompleteByParent = mutation({
  args: { questId: v.id("side_quests"), parentId: v.id("users") },
  handler: async (ctx, { questId, parentId }) => {
    const quest = await ctx.db.get(questId);
    if (!quest || quest.parentId !== parentId) return null;

    await ctx.db.patch(questId, { completed: true });

    const child = await ctx.db.get(quest.childId);
    if (child) {
      await ctx.db.patch(quest.childId, {
        xp: child.xp + quest.xpReward,
        updatedAt: Date.now(),
      });
    }

    return quest._id;
  },
});

export const remove = mutation({
  args: { questId: v.id("side_quests"), parentId: v.id("users") },
  handler: async (ctx, { questId, parentId }) => {
    const quest = await ctx.db.get(questId);
    if (!quest || quest.parentId !== parentId) return null;

    await ctx.db.delete(questId);
    return questId;
  },
});
