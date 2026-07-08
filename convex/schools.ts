import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    return await ctx.db.get(schoolId);
  },
});

export const getSchoolBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("schools")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const lookupByNpsn = query({
  args: { npsn: v.string() },
  handler: async (ctx, { npsn }) => {
    return await ctx.db
      .query("schools")
      .withIndex("by_npsn", (q) => q.eq("npsn", npsn))
      .first();
  },
});

export const getAllSchools = query({
  handler: async (ctx) => {
    return await ctx.db.query("schools").collect();
  },
});

export const seedSchool = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    address: v.optional(v.string()),
  },
  handler: async (ctx, { name, slug, address }) => {
    const existing = await ctx.db
      .query("schools")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) return existing._id;
    return await ctx.db.insert("schools", { name, slug, address });
  },
});

/** Get aggregated school dashboard data */
export const getSchoolDashboard = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    const school = await ctx.db.get(schoolId);
    if (!school) return null;

    // Get all classes in this school
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();

    // Get all students in this school
    const students = await ctx.db
      .query("users")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();

    const studentOnly = students.filter((s) => s.role === "student");

    // Class stats
    const classStats = await Promise.all(
      classes.map(async (cls) => {
        const classStudents = studentOnly.filter(
          (s) => s.classId === cls._id,
        );
        const activeToday = classStudents.filter(
          (s) => Date.now() - s.updatedAt < 86400000,
        ).length;
        return {
          id: cls._id,
          name: cls.name,
          grade: cls.grade,
          code: cls.code,
          students: classStudents.length,
          active: activeToday,
          avgXp:
            classStudents.length > 0
              ? Math.round(
                  classStudents.reduce((a, s) => a + s.xp, 0) /
                    classStudents.length,
                )
              : 0,
        };
      }),
    );

    // PL aggregation
    const plData = await Promise.all(
      studentOnly.map(async (s) => {
        const pl = await ctx.db
          .query("physical_literacy")
          .withIndex("by_userId", (q) => q.eq("userId", s._id))
          .first();
        return pl;
      }),
    );

    const validPl = plData.filter((p): p is NonNullable<typeof p> => !!p);
    const avgPl =
      validPl.length > 0
        ? {
            balance: Math.round(
              validPl.reduce((a, p) => a + p.balance, 0) / validPl.length,
            ),
            coordination: Math.round(
              validPl.reduce((a, p) => a + p.coordination, 0) /
                validPl.length,
            ),
            agility: Math.round(
              validPl.reduce((a, p) => a + p.agility, 0) / validPl.length,
            ),
            flexibility: Math.round(
              validPl.reduce((a, p) => a + p.flexibility, 0) /
                validPl.length,
            ),
            strength: Math.round(
              validPl.reduce((a, p) => a + p.strength, 0) / validPl.length,
            ),
          }
        : null;

    // Overall stats
    const totalStudents = studentOnly.length;
    const activeToday = studentOnly.filter(
      (s) => Date.now() - s.updatedAt < 86400000,
    ).length;
    const avgXp =
      totalStudents > 0
        ? Math.round(
            studentOnly.reduce((a, s) => a + s.xp, 0) / totalStudents,
          )
        : 0;

    return {
      school: { _id: school._id, name: school.name, address: school.address },
      classes: classStats,
      totalStudents,
      activeToday,
      avgXp,
      avgPl,
    };
  },
});
