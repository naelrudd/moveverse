import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ── Role type for admin operations ──
const adminRoles = v.union(
  v.literal("student"),
  v.literal("parent"),
  v.literal("teacher"),
  v.literal("admin"),
  v.literal("school_admin"),
);

// ── Activity Logging ──

export const logActivity = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: args.action,
      details: args.details,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

export const getLogsByUser = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    return await ctx.db
      .query("activity_logs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 50);
  },
});

export const getLogsBySchool = query({
  args: { schoolId: v.id("schools"), limit: v.optional(v.number()) },
  handler: async (ctx, { schoolId, limit }) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();
    const userIds = users.map((u) => u._id);

    // Fetch logs for all users in this school, sorted by timestamp desc
    const allLogs = await Promise.all(
      userIds.map((uid) =>
        ctx.db
          .query("activity_logs")
          .withIndex("by_userId", (q) => q.eq("userId", uid))
          .order("desc")
          .take(limit ?? 20),
      ),
    );

    // Flatten + sort by timestamp desc, take top N
    return allLogs
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit ?? 100);
  },
});

// ── User Queries ──

/** Get all users in a school (for admin / school_admin) */
export const getUsersBySchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();
    const classMap = new Map(classes.map((c) => [c._id, c.name]));

    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      role: u.role,
      nis: u.nis,
      phone: u.phone,
      avatar: u.avatar,
      xp: u.xp,
      coins: u.coins,
      level: u.level,
      classId: u.classId,
      className: u.classId ? classMap.get(u.classId) ?? null : null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  },
});

/** Get all users across all schools (dev admin only) */
export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(500);
    const schools = await ctx.db.query("schools").collect();
    const schoolMap = new Map(schools.map((s) => [s._id, s.name]));

    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      role: u.role,
      schoolId: u.schoolId,
      schoolName: u.schoolId ? schoolMap.get(u.schoolId) ?? null : null,
      nis: u.nis,
      phone: u.phone,
      avatar: u.avatar,
      xp: u.xp,
      coins: u.coins,
      level: u.level,
      createdAt: u.createdAt,
    }));
  },
});

// ── Stats ──

/** Admin stats for a single school */
export const getAdminStats = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();

    const byRole = {
      student: users.filter((u) => u.role === "student").length,
      teacher: users.filter((u) => u.role === "teacher").length,
      parent: users.filter((u) => u.role === "parent").length,
      admin: users.filter((u) => u.role === "admin").length,
      school_admin: users.filter((u) => u.role === "school_admin").length,
    };

    const totalXp = users.reduce((a, u) => a + u.xp, 0);
    const avgXp = users.length > 0 ? Math.round(totalXp / users.length) : 0;

    const now = Date.now();
    const day = 86400000;
    const activeToday = users.filter((u) => now - u.updatedAt < day).length;
    const activeWeek = users.filter((u) => now - u.updatedAt < day * 7).length;

    return {
      totalUsers: users.length,
      byRole,
      totalClasses: classes.length,
      avgXp,
      activeToday,
      activeWeek,
    };
  },
});

/** Global stats across all schools (dev admin) */
export const getGlobalStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(500);
    const schools = await ctx.db.query("schools").collect();
    const classes = await ctx.db.query("classes").collect();

    const byRole = {
      student: users.filter((u) => u.role === "student").length,
      teacher: users.filter((u) => u.role === "teacher").length,
      parent: users.filter((u) => u.role === "parent").length,
      admin: users.filter((u) => u.role === "admin").length,
      school_admin: users.filter((u) => u.role === "school_admin").length,
    };

    const now = Date.now();
    const day = 86400000;

    return {
      totalSchools: schools.length,
      totalUsers: users.length,
      totalClasses: classes.length,
      byRole,
      activeToday: users.filter((u) => now - u.updatedAt < day).length,
      activeWeek: users.filter((u) => now - u.updatedAt < day * 7).length,
    };
  },
});

// ── School Management ──

export const createSchool = mutation({
  args: {
    name: v.string(),
    npsn: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = (args.npsn || args.name).toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (args.npsn) {
      const existing = await ctx.db
        .query("schools")
        .withIndex("by_npsn", (q) => q.eq("npsn", args.npsn!))
        .first();
      if (existing) return { error: "NPSN sudah terdaftar" };
    }

    const existingSlug = await ctx.db
      .query("schools")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existingSlug) return { error: "Slug sudah ada" };

    const schoolId = await ctx.db.insert("schools", {
      name: args.name,
      slug,
      npsn: args.npsn,
      address: args.address,
    });

    return { schoolId };
  },
});

export const updateSchool = mutation({
  args: {
    schoolId: v.id("schools"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    npsn: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.address !== undefined) patch.address = args.address;
    if (args.npsn !== undefined) patch.npsn = args.npsn;
    await ctx.db.patch(args.schoolId, patch);
    return { ok: true };
  },
});

export const deleteSchool = mutation({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    // Delete all classes in this school
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();
    for (const cls of classes) {
      await ctx.db.delete(cls._id);
    }

    // Remove schoolId from all users in this school
    const users = await ctx.db
      .query("users")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();
    for (const user of users) {
      await ctx.db.patch(user._id, { schoolId: undefined });
    }

    await ctx.db.delete(schoolId);
    return { ok: true };
  },
});

// ── User CRUD ──

export const createUser = mutation({
  args: {
    schoolId: v.optional(v.id("schools")),
    name: v.string(),
    role: adminRoles,
    nis: v.optional(v.string()),
    phone: v.optional(v.string()),
    classId: v.optional(v.id("classes")),
  },
  handler: async (ctx, args) => {
    if (args.nis && args.role === "student") {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_nis", (q) => q.eq("nis", args.nis!))
        .first();
      if (existing) return { error: "NIS sudah terdaftar" };
    }

    const userId = await ctx.db.insert("users", {
      clerkId: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: args.name,
      role: args.role,
      schoolId: args.schoolId,
      nis: args.nis,
      phone: args.phone,
      classId: args.classId,
      avatar: "default",
      xp: 0,
      coins: 0,
      level: 1,
      badges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId };
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    role: v.optional(adminRoles),
    classId: v.optional(v.union(v.id("classes"), v.null())),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(userId, patch);
    return { ok: true };
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.delete(userId);
    return { ok: true };
  },
});

// ── Create school admin account (dev admin only) ──

export const createSchoolAdmin = mutation({
  args: {
    schoolId: v.id("schools"),
    name: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get school to build clerkId from NPSN
    const school = await ctx.db.get(args.schoolId);
    if (!school) return { error: "Sekolah tidak ditemukan" };
    if (!school.npsn) return { error: "Sekolah belum punya NPSN" };

    const clerkId = `school_${school.npsn}_${Date.now()}`;

    const userId = await ctx.db.insert("users", {
      clerkId,
      name: args.name,
      role: "school_admin",
      schoolId: args.schoolId,
      phone: args.phone,
      avatar: "default",
      xp: 0,
      coins: 0,
      level: 1,
      badges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, clerkId };
  },
});

// ── Classes with counts ──

export const getClassesWithCounts = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();

    const students = await ctx.db
      .query("users")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();

    const studentOnly = students.filter((s) => s.role === "student");

    return classes.map((cls) => ({
      _id: cls._id,
      name: cls.name,
      grade: cls.grade,
      studentCount: studentOnly.filter((s) => s.classId === cls._id).length,
    }));
  },
});
