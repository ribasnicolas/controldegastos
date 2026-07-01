"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ActionState } from "./types";

const expenseSchema = z.object({
  categoryId: z.string().min(1, "Elegí una categoría"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().max(200).optional(),
  icon: z.string().max(10).optional(),
  date: z.string().optional(),
});

const updateExpenseSchema = expenseSchema.extend({
  id: z.string().min(1),
});

export async function createExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = expenseSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || undefined,
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.expense.create({
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
  revalidatePath("/gastos");
  return { success: true };
}

export async function updateExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = updateExpenseSchema.safeParse({
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

  const result = await prisma.expense.updateMany({
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
    return { error: "No se pudo actualizar el gasto" };
  }

  revalidatePath("/");
  revalidatePath("/gastos");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const user = await requireUser();
  const expense = await prisma.expense.findFirst({ where: { id, userId: user.id } });
  if (!expense) return;

  await prisma.expense.delete({ where: { id: expense.id } });

  // Si este gasto vino de un gasto fijo confirmado, lo dejamos de nuevo como
  // pendiente de pago en vez de que quede marcado "pagado" sin el gasto real.
  if (expense.sourceRecurringId) {
    await prisma.recurringExpense.updateMany({
      where: {
        id: expense.sourceRecurringId,
        userId: user.id,
        lastGeneratedMonth: expense.date.getMonth() + 1,
        lastGeneratedYear: expense.date.getFullYear(),
      },
      data: { lastGeneratedMonth: null, lastGeneratedYear: null },
    });
  }

  revalidatePath("/");
  revalidatePath("/gastos");
}
