import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getRadarData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("physical_literacy")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return {
        balance: existing.balance,
        coordination: existing.coordination,
        agility: existing.agility,
        flexibility: existing.flexibility,
        strength: existing.strength,
      };
    }

    return {
      balance: 0,
      coordination: 0,
      agility: 0,
      flexibility: 0,
      strength: 0,
    };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      balance: v.optional(v.number()),
      coordination: v.optional(v.number()),
      agility: v.optional(v.number()),
      flexibility: v.optional(v.number()),
      strength: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { userId, updates }) => {
    const existing = await ctx.db
      .query("physical_literacy")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const updateData = {
      updatedAt: Date.now(),
      balance: updates.balance ?? (existing?.balance ?? 0),
      coordination: updates.coordination ?? (existing?.coordination ?? 0),
      agility: updates.agility ?? (existing?.agility ?? 0),
      flexibility: updates.flexibility ?? (existing?.flexibility ?? 0),
      strength: updates.strength ?? (existing?.strength ?? 0),
    };

    if (existing) {
      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      return await ctx.db.insert("physical_literacy", {
        userId,
        ...updateData,
      });
    }
  },
});

export const incrementDomain = mutation({
  args: {
    userId: v.id("users"),
    domain: v.union(
      v.literal("balance"),
      v.literal("coordination"),
      v.literal("agility"),
      v.literal("flexibility"),
      v.literal("strength")
    ),
    delta: v.number(),
  },
  handler: async (ctx, { userId, domain, delta }) => {
    const existing = await ctx.db
      .query("physical_literacy")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const currentValue = existing?.[domain] ?? 0;
    const newValue = Math.min(100, Math.max(0, currentValue + delta));

    const updates = {
      updatedAt: Date.now(),
      [domain]: newValue,
    };

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("physical_literacy", {
        userId,
        balance: domain === "balance" ? newValue : 0,
        coordination: domain === "coordination" ? newValue : 0,
        agility: domain === "agility" ? newValue : 0,
        flexibility: domain === "flexibility" ? newValue : 0,
        strength: domain === "strength" ? newValue : 0,
        updatedAt: Date.now(),
      });
    }
  },
});
