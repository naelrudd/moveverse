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

export const getUsersByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_classId", (q) => q.eq("classId", classId))
      .collect();
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    grade: v.union(v.literal("1"), v.literal("2")),
    avatar: v.string(),
    role: v.union(v.literal("student"), v.literal("parent"), v.literal("teacher"), v.literal("admin")),
    schoolId: v.id("schools"),
    classId: v.optional(v.id("classes")),
    childIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, { clerkId, name, grade, avatar, role, schoolId, classId, childIds }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId,
      name,
      grade,
      avatar,
      role,
      schoolId,
      classId,
      childIds: childIds || [],
      xp: 0,
      coins: 0,
      level: 1,
      pets: [],
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
    const newLevel = Math.floor(newXP / 100) + 1;
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

export const unlockPet = mutation({
  args: { userId: v.id("users"), petId: v.string() },
  handler: async (ctx, { userId, petId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (!user.pets.includes(petId)) {
      await ctx.db.patch(userId, {
        pets: [...user.pets, petId],
        updatedAt: Date.now(),
      });
    }

    return user.pets;
  },
});
