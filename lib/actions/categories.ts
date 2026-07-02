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
  type: z.enum(["EXPENSE", "INCOME"]),
});

const updateCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "El nombre es obligatorio").max(50),
  icon: z.string().max(10).optional(),
});

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon") || undefined,
    color: formData.get("color") || undefined,
    type: formData.get("type"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await prisma.category.create({ data: parsed.data });
  } catch {
    return { error: "Ya existe una categoría con ese nombre y tipo" };
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

export async function updateCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = updateCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    icon: formData.get("icon") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await prisma.category.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name, icon: parsed.data.icon ?? null },
    });
  } catch {
    return { error: "Ya existe una categoría con ese nombre y tipo" };
  }

  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function deleteCategory(
  id: string,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return {
      error: "No se puede eliminar: hay gastos, ingresos o presupuestos que usan esta categoría. Podés desactivarla en su lugar.",
    };
  }

  revalidatePath("/admin/categorias");
  return { success: true };
}
