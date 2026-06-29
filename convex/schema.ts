import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  schools: defineTable({
    name: v.string(),
    slug: v.string(),
    address: v.optional(v.string()),
  })
    .index("by_slug", ["slug"]),

  classes: defineTable({
    schoolId: v.id("schools"),
    name: v.string(),
    grade: v.number(),
  })
    .index("by_schoolId", ["schoolId"]),

  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    nis: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.string(),
    xp: v.number(),
    coins: v.number(),
    level: v.number(),
    pets: v.array(v.string()),
    role: v.optional(v.union(v.literal("student"), v.literal("parent"), v.literal("teacher"), v.literal("admin"))),
    schoolId: v.optional(v.id("schools")),
    classId: v.optional(v.id("classes")),
    childIds: v.optional(v.array(v.id("users"))),
    parentIds: v.optional(v.array(v.id("users"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_schoolId", ["schoolId"])
    .index("by_classId", ["classId"])
    .index("by_nis", ["nis"])
    .index("by_createdAt", ["createdAt"]),

  quests: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("jumping"),
      v.literal("running"),
      v.literal("balance")
    ),
    target: v.number(),
    completed: v.number(),
    status: v.union(v.literal("active"), v.literal("completed")),
    timestamp: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_timestamp", ["timestamp"]),

  movements: defineTable({
    userId: v.id("users"),
    questId: v.id("quests"),
    landmarks: v.object({
      data: v.array(
        v.object({
          x: v.number(),
          y: v.number(),
          z: v.number(),
          visibility: v.number(),
          presence: v.number(),
        })
      ),
    }),
    fmsScore: v.object({
      squatDepth: v.number(),
      landingBalance: v.number(),
      jumpValid: v.boolean(),
    }),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_questId", ["questId"])
    .index("by_timestamp", ["timestamp"]),

  physical_literacy: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    coordination: v.number(),
    agility: v.number(),
    flexibility: v.number(),
    strength: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),
});
