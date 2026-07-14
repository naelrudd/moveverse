import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Generate a unique 8-char uppercase code for parent-child linking */
function generateChildCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const lookupByChildCode = query({
  args: { childCode: v.string() },
  handler: async (ctx, { childCode }) => {
    const student = await ctx.db
      .query("users")
      .withIndex("by_childCode", (q) => q.eq("childCode", childCode.toUpperCase()))
      .first();
    if (!student) return null;
    const school = student.schoolId ? await ctx.db.get(student.schoolId) : null;
    return {
      _id: student._id,
      name: student.name,
      avatar: student.avatar,
      schoolName: school?.name,
    };
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
    const LEVEL_TABLE = [100, 250, 450, 700];
    return children.filter(Boolean).map((c) => {
      const xp = c!.xp ?? 0;
      let level = 1;
      while (level < 5 && xp >= LEVEL_TABLE[level - 1]) level++;
      return { ...c!, level };
    });
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

export const unlinkChild = mutation({
  args: {
    parentId: v.id("users"),
    childId: v.id("users"),
  },
  handler: async (ctx, { parentId, childId }) => {
    const parent = await ctx.db.get(parentId);
    if (!parent) return null;
    const currentChildren = parent.childIds ?? [];
    if (!currentChildren.includes(childId)) return null;
    await ctx.db.patch(parentId, {
      childIds: currentChildren.filter((id) => id !== childId),
      updatedAt: Date.now(),
    });
    const child = await ctx.db.get(childId);
    if (child) {
      const currentParents = child.parentIds ?? [];
      await ctx.db.patch(childId, {
        parentIds: currentParents.filter((id) => id !== parentId),
        updatedAt: Date.now(),
      });
    }
    return { success: true };
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
    role: v.union(v.literal("student"), v.literal("parent"), v.literal("teacher"), v.literal("admin"), v.literal("school_admin")),
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

    // Generate unique childCode for students
    let childCode: string | undefined;
    if (role === "student") {
      childCode = generateChildCode();
      let existingCode = await ctx.db
        .query("users")
        .withIndex("by_childCode", (q) => q.eq("childCode", childCode!))
        .first();
      while (existingCode) {
        childCode = generateChildCode();
        existingCode = await ctx.db
          .query("users")
          .withIndex("by_childCode", (q) => q.eq("childCode", childCode!))
          .first();
      }
    }

    return await ctx.db.insert("users", {
      clerkId,
      name,
      nis,
      childCode,
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

/** Claim an existing account: student enters NIS, parent enters phone, teacher enters phone.
 *  Links the Clerk userId to the pre-created user record. */
export const claimAccount = mutation({
  args: {
    clerkId: v.string(),
    identifier: v.string(), // NIS for student, phone for parent/teacher
    role: v.union(
      v.literal("student"),
      v.literal("parent"),
      v.literal("teacher"),
      v.literal("admin"),
      v.literal("school_admin"),
    ),
  },
  handler: async (ctx, { clerkId, identifier, role }) => {
    // Find user by NIS (student) or phone (parent/teacher)
    let existing = null;
    if (role === "student") {
      existing = await ctx.db
        .query("users")
        .withIndex("by_nis", (q) => q.eq("nis", identifier))
        .first();
    } else {
      // parent/teacher: find by phone
      const allUsers = await ctx.db.query("users").take(500);
      existing = allUsers.find(
        (u) => u.phone === identifier && u.role === role,
      );
    }

    if (!existing) return { error: "Akun tidak ditemukan. Hubungi admin." };

    // Check if already claimed
    if (existing.clerkId && !existing.clerkId.startsWith("pending_")) {
      return { error: "Akun sudah terpakai." };
    }

    // Link Clerk account
    await ctx.db.patch(existing._id, {
      clerkId,
      updatedAt: Date.now(),
    });

    return { userId: existing._id, role: existing.role, schoolId: existing.schoolId };
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
      [100, 80,  99],   // Lv2
      [250, 200, 249],  // Lv3
      [450, 380, 449],  // Lv4
      [700, 600, 699],  // Lv5
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

export const updateAvatar = mutation({
  args: { userId: v.id("users"), avatar: v.string() },
  handler: async (ctx, { userId, avatar }) => {
    await ctx.db.patch(userId, { avatar, updatedAt: Date.now() });
    return { avatar };
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    nis: v.optional(v.string()),
    phone: v.optional(v.string()),
    schoolId: v.optional(v.id("schools")),
    classId: v.optional(v.id("classes")),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(userId, patch);
    return { ok: true };
  },
});

export const levelUpActivity = mutation({
  args: { userId: v.id("users"), activityId: v.string() },
  handler: async (ctx, { userId, activityId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const levels = { ...(user.activityLevels ?? {}) };
    const current = levels[activityId] ?? 0;
    const next = Math.min(current + 1, 5);
    levels[activityId] = next;

    // XP per level: L1=10, L2=20, L3=30, L4=40, L5=50
    const xpGain = next * 10;
    const newXp = (user.xp ?? 0) + xpGain;

    // Promote overall level based on XP thresholds
    const LEVEL_TABLE = [100, 250, 450, 700]; // min XP for Lv2, Lv3, Lv4, Lv5
    let newLevel = user.level ?? 1;
    while (newLevel < 5 && newXp >= LEVEL_TABLE[newLevel - 1]) {
      newLevel++;
    }

    await ctx.db.patch(userId, {
      activityLevels: levels,
      xp: newXp,
      level: newLevel,
      coins: user.coins + Math.floor(xpGain / 5),
      updatedAt: Date.now(),
    });

    return { activityId, level: next, xpGain };
  },
});

export const getLevelStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Level table: [fullPassMin, condMin, condMax]
    const TABLE: [number, number, number][] = [
      [100, 80,  99],   // Lv2
      [250, 200, 249],  // Lv3
      [450, 380, 449],  // Lv4
      [700, 600, 699],  // Lv5
    ];

    // Compute level from XP (source of truth)
    const xp = user.xp ?? 0;
    const LEVEL_TABLE = [100, 250, 450, 700]; // min XP for Lv2, Lv3, Lv4, Lv5
    let level = 1;
    while (level < 5 && xp >= LEVEL_TABLE[level - 1]) {
      level++;
    }
    const needsTutor = user.needsTutor === true;

    // Max level
    if (level >= 5) {
      return {
        level: 5,
        xp,
        needsTutor,
        nextLevelXp: null,
        xpToFull: Math.max(0, 250 - xp),
        xpToCond: 0,
        status: "maksimal",
      };
    }

    // idx into TABLE for the NEXT level's requirements
    const idx = level - 1;
    if (idx < 0 || idx >= TABLE.length) {
      return { level: 1, xp, needsTutor: false, nextLevelXp: 100, xpToFull: 100, xpToCond: 80, status: "active" };
    }

    const [fullMin, condMin] = TABLE[idx];

    return {
      level,
      xp,
      needsTutor,
      nextLevelXp: TABLE[idx][0],
      xpToFull: Math.max(0, fullMin - xp),
      xpToCond: Math.max(0, condMin - xp),
      status: needsTutor ? "butuh_dampingan" : "active",
    };
  },
});

/** Get coach thresholds for user */
export const getCoachThresholds = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user?.coachThresholds ?? {};
  },
});

/** Save coach thresholds (adjust by guru) */
export const saveCoachThresholds = mutation({
  args: {
    userId: v.id("users"),
    thresholds: v.record(v.string(), v.number()),
  },
  handler: async (ctx, { userId, thresholds }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    const merged = { ...(user.coachThresholds ?? {}), ...thresholds };
    await ctx.db.patch(userId, { coachThresholds: merged, updatedAt: Date.now() });
    return merged;
  },
});

/** Subscribe to live session data for monitoring (teacher/parent) */
export const getLiveSessionData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const movements = await ctx.db
      .query("movements")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    const pl = await ctx.db
      .query("physical_literacy")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return {
      name: user.name,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      recentMovements: movements.map((m) => ({
        activityId: m.activityId,
        score: m.score,
        duration: m.duration,
        timestamp: m.timestamp,
      })),
      physicalLiteracy: pl
        ? { balance: pl.balance, coordination: pl.coordination, agility: pl.agility, flexibility: pl.flexibility, strength: pl.strength }
        : null,
    };
  },
});
