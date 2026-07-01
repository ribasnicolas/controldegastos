"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ActionState } from "./types";

const incomeSchema = z.object({
  categoryId: z.string().min(1, "Elegí una categoría"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().max(200).optional(),
  icon: z.string().max(10).optional(),
  date: z.string().optional(),
});

const updateIncomeSchema = incomeSchema.extend({
  id: z.string().min(1),
});

export async function createIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = incomeSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.income.create({
    data: {
      userId: user.id,
      categoryId: parsed.data.categoryId,
      amount: parsed.data.amount,
      description: parsed.data.description,
      icon: parsed.data.icon,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/ingresos");
  return { success: true };
}

export async function updateIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = updateIncomeSchema.safeParse({
    id: formData.get("id"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const result = await prisma.income.updateMany({
    where: { id: parsed.data.id, userId: user.id },
    data: {
      categoryId: parsed.data.categoryId,
      amount: parsed.data.amount,
      description: parsed.data.description ?? null,
      icon: parsed.data.icon ?? null,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    },
  });
  if (result.count === 0) {
    return { error: "No se pudo actualizar el ingreso" };
  }

  revalidatePath("/");
  revalidatePath("/ingresos");
  return { success: true };
}

export async function deleteIncome(id: string) {
  const user = await requireUser();
  await prisma.income.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/");
  revalidatePath("/ingresos");
}
