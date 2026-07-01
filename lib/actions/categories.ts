"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { ActionState } from "./types";

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(50),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
});

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await prisma.category.create({ data: parsed.data });
  } catch {
    return { error: "Ya existe una categoría con ese nombre" };
  }

  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function toggleCategoryActive(id: string) {
  await requireAdmin();
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  await prisma.category.update({ where: { id }, data: { active: !category.active } });
  revalidatePath("/admin/categorias");
}
