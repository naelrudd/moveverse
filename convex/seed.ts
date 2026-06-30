import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAll = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("schools").first();
    if (existing) return "Already seeded";

    const schoolIds: string[] = [];
    const schools = [
      { name: "SDN Sawojajar 1", slug: "sdn-sawojajar-1", address: "Malang" },
      { name: "SDN Lowokwaru 1", slug: "sdn-lowokwaru-1", address: "Malang" },
      { name: "SDN Blimbing 1", slug: "sdn-blimbing-1", address: "Malang" },
    ];

    const classData = [
      { name: "1A", grade: 1 }, { name: "1B", grade: 1 },
      { name: "2A", grade: 2 }, { name: "2B", grade: 2 },
      { name: "3A", grade: 3 }, { name: "3B", grade: 3 },
      { name: "4A", grade: 4 }, { name: "4B", grade: 4 },
      { name: "5A", grade: 5 }, { name: "5B", grade: 5 },
      { name: "6A", grade: 6 }, { name: "6B", grade: 6 },
    ];

    for (const school of schools) {
      const schoolId = await ctx.db.insert("schools", school);
      schoolIds.push(schoolId);
      for (const cls of classData) {
        await ctx.db.insert("classes", { schoolId, name: cls.name, grade: cls.grade });
      }
    }

    return `Seeded ${schools.length} schools x ${classData.length} classes`;
  },
});

export const seedDummyPL = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    if (users.length === 0) return "No users yet — run after onboarding";

    let count = 0;
    for (const u of users) {
      if (u.role !== "student") continue;
      const existing = await ctx.db
        .query("physical_literacy")
        .withIndex("by_userId", (q) => q.eq("userId", u._id))
        .first();
      if (existing) continue;

      await ctx.db.insert("physical_literacy", {
        userId: u._id,
        balance: 50 + Math.floor(Math.random() * 40),
        coordination: 45 + Math.floor(Math.random() * 45),
        agility: 55 + Math.floor(Math.random() * 35),
        flexibility: 40 + Math.floor(Math.random() * 40),
        strength: 50 + Math.floor(Math.random() * 30),
        updatedAt: Date.now(),
      });
      count++;
    }

    // Seed sample quests
    const questTypes = ["jumping", "running", "balance"] as const;
    for (const u of users) {
      if (u.role !== "student") continue;
      const existingQuests = await ctx.db
        .query("quests")
        .withIndex("by_userId", (q) => q.eq("userId", u._id))
        .first();
      if (existingQuests) continue;

      for (const t of questTypes) {
        await ctx.db.insert("quests", {
          userId: u._id,
          type: t,
          target: 10,
          completed: Math.floor(Math.random() * 10),
          status: Math.random() > 0.3 ? "active" : "completed",
          timestamp: Date.now() - Math.floor(Math.random() * 86400000 * 7),
          completedAt: Math.random() > 0.7 ? Date.now() - Math.floor(Math.random() * 86400000 * 3) : undefined,
        });
      }
    }

    return `Seeded PL for ${count} students + quests`;
  },
});

export const clearAll = mutation({
  handler: async (ctx) => {
    const tables = ["users", "classes", "schools", "physical_literacy", "quests", "movements"] as const;
    for (const t of tables) {
      const items = await ctx.db.query(t).collect();
      for (const i of items) await ctx.db.delete(i._id);
    }
    return "Cleared all data";
  },
});

export const clearUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const u of users) await ctx.db.delete(u._id);
    return `Deleted ${users.length} users`;
  },
});

export const seedMovementSamples = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const quests = await ctx.db
      .query("quests")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    if (quests.length === 0) return "No quests found";

    const existing = await ctx.db
      .query("movements")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) return "Already have movement data";

    let count = 0;
    for (const q of quests) {
      for (let i = 0; i < 3; i++) {
        await ctx.db.insert("movements", {
          userId,
          questId: q._id,
          landmarks: {
            data: Array.from({ length: 33 }, () => ({
              x: Math.random(),
              y: Math.random(),
              z: Math.random() * 2 - 1,
              visibility: 0.8 + Math.random() * 0.2,
              presence: 0.7 + Math.random() * 0.3,
            })),
          },
          fmsScore: {
            squatDepth: 30 + Math.floor(Math.random() * 60),
            landingBalance: 40 + Math.floor(Math.random() * 50),
            jumpValid: Math.random() > 0.3,
          },
          timestamp: Date.now() - i * 86400000,
        });
        count++;
      }
    }
    return `Seeded ${count} movements for user`;
  },
});
