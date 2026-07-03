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

export const getChildren = query({
  args: { parentId: v.id("users") },
  handler: async (ctx, { parentId }) => {
    const parent = await ctx.db.get(parentId);
    if (!parent?.childIds?.length) return [];
    const children = await Promise.all(parent.childIds.map((id) => ctx.db.get(id)));
    return children.filter(Boolean);
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
    return { _id: child._id, name: child.name, avatar: child.avatar, level: child.level, xp: child.xp, coins: child.coins, badges: child.badges };
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

    const newXp = user.xp + xpGain;
    const coinsGain = Math.floor(xpGain / 10);

    // Level table: [fullPassMin, condMin, condMax]
    const TABLE: [number, number, number][] = [
      [50,  40,  49],   // Lv2
      [100, 85,  99],   // Lv3
      [160, 140, 159],  // Lv4
      [250, 220, 249],  // Lv5
    ];

    let newLevel = 1;
    let needsTutor = false;

    for (let i = TABLE.length - 1; i >= 0; i--) {
      const [full, condMin, condMax] = TABLE[i];
      if (newXp >= full) {
        newLevel = i + 2;
        needsTutor = false;
        break;
      }
      if (newXp >= condMin && newXp <= condMax) {
        newLevel = i + 2;
        needsTutor = true;
        break;
      }
    }

    // If already at higher level from conditional, keep level but mark tutor
    if (newLevel < user.level) {
      newLevel = user.level;
      // Re-evaluate tutor flag for current level
      const idx = user.level - 2;
      if (idx >= 0 && idx < TABLE.length) {
        const [full, condMin, condMax] = TABLE[idx];
        if (newXp >= full) needsTutor = false;
        else if (newXp >= condMin && newXp <= condMax) needsTutor = true;
        else needsTutor = false; // shouldn't happen if level was granted
      }
    }

    await ctx.db.patch(userId, {
      xp: newXp,
      coins: user.coins + coinsGain,
      level: newLevel,
      needsTutor,
      updatedAt: Date.now(),
    });

    return { newXp, newLevel, coinsGain, needsTutor };
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

export const getLevelStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const TABLE: [number, number, number][] = [
      [50,  40,  49],
      [100, 85,  99],
      [160, 140, 159],
      [250, 220, 249],
    ];

    const level = user.level;
    const xp = user.xp;

    if (level >= 5) {
      const [, , condMax] = TABLE[3];
      return {
        level: 5,
        xp,
        needsTutor: user.needsTutor ?? false,
        nextLevelXp: null,
        xpToFull: 0,
        xpToCond: 0,
        status: xp >= 250 ? "lulus_penuh" : "maksimal",
      };
    }

    const idx = level - 1; // 0-indexed into TABLE
    if (idx < 0 || idx >= TABLE.length) {
      return { level, xp, needsTutor: false, nextLevelXp: TABLE[0]?.[0] ?? 50, xpToFull: 50, xpToCond: 40, status: "active" };
    }

    const [fullMin, condMin, condMax] = TABLE[idx];
    const nextFull = TABLE[idx + 1]?.[0] ?? fullMin + 50;

    return {
      level,
      xp,
      needsTutor: user.needsTutor ?? false,
      nextLevelXp: level < 5 ? TABLE[level - 1]?.[0] ?? 50 : null,
      xpToFull: Math.max(0, fullMin - xp),
      xpToCond: Math.max(0, condMin - xp),
      status: user.needsTutor ? "butuh_dampingan" : "active",
    };
  },
});
