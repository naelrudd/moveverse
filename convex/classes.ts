import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getClassesBySchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    return await ctx.db
      .query("classes")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .collect();
  },
});

export const getClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    return await ctx.db.get(classId);
  },
});

export const seedClasses = mutation({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, { schoolId }) => {
    const existing = await ctx.db
      .query("classes")
      .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
      .first();

    if (existing) return;

    const classes = [
      { name: "1A", grade: 1 },
      { name: "1B", grade: 1 },
      { name: "2A", grade: 2 },
      { name: "2B", grade: 2 },
      { name: "3A", grade: 3 },
      { name: "3B", grade: 3 },
    ];

    for (const cls of classes) {
      await ctx.db.insert("classes", {
        schoolId,
        name: cls.name,
        grade: cls.grade,
      });
    }

    return "Classes seeded";
  },
});

export const createClass = mutation({
  args: {
    schoolId: v.id("schools"),
    name: v.string(),
    grade: v.number(),
  },
  handler: async (ctx, { schoolId, name, grade }) => {
    return await ctx.db.insert("classes", { schoolId, name, grade });
  },
});

export const updateClass = mutation({
  args: {
    classId: v.id("classes"),
    name: v.string(),
    grade: v.number(),
  },
  handler: async (ctx, { classId, name, grade }) => {
    await ctx.db.patch(classId, { name, grade });
    return classId;
  },
});

export const deleteClass = mutation({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    await ctx.db.delete(classId);
    return classId;
  },
});
