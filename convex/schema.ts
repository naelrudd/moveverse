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
    badges: v.optional(v.array(v.string())),
    pets: v.optional(v.array(v.string())),
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
      v.literal("meliuk"),
      v.literal("menekuk"),
      v.literal("memutar"),
      v.literal("mengayun"),
      v.literal("membungkuk"),
      v.literal("mendorong")
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
    activityId: v.string(),
    score: v.number(),
    duration: v.number(),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_questId", ["questId"])
    .index("by_activityId", ["activityId"])
    .index("by_timestamp", ["timestamp"]),

  daily_quests: defineTable({
    userId: v.id("users"),
    date: v.string(),
    tasks: v.array(
      v.object({
        activityId: v.string(),
        label: v.string(),
        target: v.number(),
        completed: v.number(),
        xp: v.number(),
      })
    ),
    totalXpEarned: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"])
    .index("by_user_date", ["userId", "date"]),

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
