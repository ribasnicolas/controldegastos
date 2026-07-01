import { prisma } from "@/lib/prisma";

export async function getActiveCategories() {
  return prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}
