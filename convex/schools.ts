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
