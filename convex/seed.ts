import { mutation } from "./_generated/server";

export const seedAll = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("schools").first();
    if (existing) return "Already seeded";

    // Create school
    const schoolId = await ctx.db.insert("schools", {
      name: "SD MOVEVERSE Academy",
      slug: "moveverse-academy",
      address: "Jl. Merdeka No. 1, Malang",
    });

    // Create classes
    const classData = [
      { name: "1A", grade: 1 }, { name: "1B", grade: 1 },
      { name: "2A", grade: 2 }, { name: "2B", grade: 2 },
      { name: "3A", grade: 3 }, { name: "3B", grade: 3 },
      { name: "4A", grade: 4 }, { name: "4B", grade: 4 },
      { name: "5A", grade: 5 }, { name: "5B", grade: 5 },
      { name: "6A", grade: 6 }, { name: "6B", grade: 6 },
    ];

    for (const cls of classData) {
      await ctx.db.insert("classes", { schoolId, name: cls.name, grade: cls.grade });
    }

    return `Seeded school + ${classData.length} classes`;
  },
});
