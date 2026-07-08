import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Generate a unique 6-char uppercase code */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

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

export const getClassByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const cls = await ctx.db
      .query("classes")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();
    if (!cls) return null;
    const school = await ctx.db.get(cls.schoolId);
    return { ...cls, schoolName: school?.name };
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
      let code = generateCode();
      // Ensure uniqueness
      let existing = await ctx.db
        .query("classes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      while (existing) {
        code = generateCode();
        existing = await ctx.db
          .query("classes")
          .withIndex("by_code", (q) => q.eq("code", code))
          .first();
      }
      await ctx.db.insert("classes", {
        schoolId,
        name: cls.name,
        grade: cls.grade,
        code,
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
    let code = generateCode();
    let existing = await ctx.db
      .query("classes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    while (existing) {
      code = generateCode();
      existing = await ctx.db
        .query("classes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
    }
    return await ctx.db.insert("classes", { schoolId, name, grade, code });
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

export const regenerateCode = mutation({
  args: { classId: v.id("classes") },
  handler: async (ctx, { classId }) => {
    let code = generateCode();
    let existing = await ctx.db
      .query("classes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    while (existing) {
      code = generateCode();
      existing = await ctx.db
        .query("classes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
    }
    await ctx.db.patch(classId, { code });
    return { code };
  },
});

/** Student joins a class using a class code */
export const joinClassByCode = mutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
  },
  handler: async (ctx, { userId, code }) => {
    const cls = await ctx.db
      .query("classes")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();
    if (!cls) return { error: "Kode kelas tidak ditemukan" };

    const user = await ctx.db.get(userId);
    if (!user) return { error: "User tidak ditemukan" };

    await ctx.db.patch(userId, {
      classId: cls._id,
      schoolId: cls.schoolId,
      updatedAt: Date.now(),
    });

    return { classId: cls._id, className: cls.name };
  },
});

/** Parent links to child using child's NIS */
export const linkChildByNis = mutation({
  args: {
    parentId: v.id("users"),
    childNis: v.string(),
  },
  handler: async (ctx, { parentId, childNis }) => {
    const child = await ctx.db
      .query("users")
      .withIndex("by_nis", (q) => q.eq("nis", childNis))
      .first();
    if (!child) return { error: "NIS tidak ditemukan" };

    const parent = await ctx.db.get(parentId);
    if (!parent) return { error: "User tidak ditemukan" };

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

    return { childId: child._id, childName: child.name };
  },
});
