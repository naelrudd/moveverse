import { mutation } from "./_generated/server";

export const seedAll = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("schools").first();
    if (existing) return "Already seeded";

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
      for (const cls of classData) {
        await ctx.db.insert("classes", { schoolId, name: cls.name, grade: cls.grade });
      }
    }

    return `Seeded ${schools.length} schools x ${classData.length} classes`;
  },
});

export const clearAll = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const u of users) await ctx.db.delete(u._id);

    const classes = await ctx.db.query("classes").collect();
    for (const c of classes) await ctx.db.delete(c._id);

    const schools = await ctx.db.query("schools").collect();
    for (const s of schools) await ctx.db.delete(s._id);

    return `Cleared all data`;
  },
});

export const clearUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) await ctx.db.delete(user._id);
    return `Deleted ${users.length} users`;
  },
});
