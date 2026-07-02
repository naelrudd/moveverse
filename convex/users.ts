import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const linkChild = mutation({
  args: {
    parentId: v.id("users"),
    childNis: v.string(),
  },
  handler: async (ctx, { parentId, childNis }) => {
    const child = await ctx.db
      .query("users")
      .withIndex("by_nis", (q) => q.eq("nis", childNis))
      .first();
    if (!child) return null;

    const parent = await ctx.db.get(parentId);
    if (!parent) return null;

    const currentChildren = parent.childIds ?? [];
    if (!currentChildren.includes(child._id)) {
      await ctx.db.patch(parentId, {
        childIds: [...currentChildren, child._id],
        updatedAt: Date.now(),
      });
      const currentParents = child.parentIds ?? [];
      if (!currentParents.includes(parentId)) {
        await ctx.db.patch(child._id, {
          parentIds: [...currentParents, parentId],
          updatedAt: Date.now(),
        });
      }
    }
    return child._id;
  },
});

export const getUsersByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_classId", (q) => q.eq("classId", classId))
      .collect();
  },
});

export const getLeaderboardByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    const students = await ctx.db
      .query("users")
      .withIndex("by_classId", (q) => q.eq("classId", classId))
      .collect();
    return students
      .filter((s) => s.role === "student")
      .sort((a, b) => b.xp - a.xp)
      .map((s, i) => ({
        rank: i + 1,
        _id: s._id,
        name: s.name,
        avatar: s.avatar,
        level: s.level,
        xp: s.xp,
        coins: s.coins,
        badges: s.badges,
      }));
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    nis: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.string(),
    role: v.union(v.literal("student"), v.literal("parent"), v.literal("teacher"), v.literal("admin")),
    schoolId: v.id("schools"),
    classId: v.optional(v.id("classes")),
    childIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, { clerkId, name, nis, phone, avatar, role, schoolId, classId, childIds }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId,
      name,
      nis,
      phone,
      avatar,
      role,
      schoolId,
      classId,
      childIds: childIds || [],
      xp: 0,
      coins: 0,
      level: 1,
      badges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateXP = mutation({
  args: { userId: v.id("users"), xpGain: v.number() },
  handler: async (ctx, { userId, xpGain }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const newXP = user.xp + xpGain;
    const newLevel = Math.min(Math.floor(newXP / 100) + 1, 10);
    const coinsGain = Math.floor(xpGain / 10);

    await ctx.db.patch(userId, {
      xp: newXP,
      coins: user.coins + coinsGain,
      level: newLevel,
      updatedAt: Date.now(),
    });

    return { newXP, newLevel, coinsGain };
  },
});

export const earnBadge = mutation({
  args: { userId: v.id("users"), badgeId: v.string() },
  handler: async (ctx, { userId, badgeId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const currentBadges = user.badges ?? [];
    if (!currentBadges.includes(badgeId)) {
      await ctx.db.patch(userId, {
        badges: [...currentBadges, badgeId],
        updatedAt: Date.now(),
      });
    }

    return currentBadges;
  },
});
