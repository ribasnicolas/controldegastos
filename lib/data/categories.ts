import { prisma } from "@/lib/prisma";

export async function getActiveCategories() {
  return prisma.category.findMany({ where: { active: true, type: "EXPENSE" }, orderBy: { name: "asc" } });
}

export async function getActiveIncomeCategories() {
  return prisma.category.findMany({ where: { active: true, type: "INCOME" }, orderBy: { name: "asc" } });
}
