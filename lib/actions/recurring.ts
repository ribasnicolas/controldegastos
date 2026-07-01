"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ActionState } from "./types";

const recurringExpenseSchema = z.object({
  categoryId: z.string().min(1, "Elegí una categoría"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().max(200).optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(28),
});

const recurringIncomeSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().max(200).optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(28),
});

export async function createRecurringExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = recurringExpenseSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    dayOfMonth: formData.get("dayOfMonth"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.recurringExpense.create({ data: { userId: user.id, ...parsed.data } });
  revalidatePath("/gastos");
  return { success: true };
}

export async function createRecurringIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = recurringIncomeSchema.safeParse({
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    dayOfMonth: formData.get("dayOfMonth"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.recurringIncome.create({ data: { userId: user.id, ...parsed.data } });
  revalidatePath("/ingresos");
  return { success: true };
}

export async function toggleRecurringExpense(id: string) {
  const user = await requireUser();
  const item = await prisma.recurringExpense.findFirstOrThrow({ where: { id, userId: user.id } });
  await prisma.recurringExpense.update({ where: { id }, data: { active: !item.active } });
  revalidatePath("/gastos");
}

export async function toggleRecurringIncome(id: string) {
  const user = await requireUser();
  const item = await prisma.recurringIncome.findFirstOrThrow({ where: { id, userId: user.id } });
  await prisma.recurringIncome.update({ where: { id }, data: { active: !item.active } });
  revalidatePath("/ingresos");
}

export async function deleteRecurringExpense(id: string) {
  const user = await requireUser();
  await prisma.recurringExpense.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/gastos");
}

export async function deleteRecurringIncome(id: string) {
  const user = await requireUser();
  await prisma.recurringIncome.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/ingresos");
}

/**
 * Materializa en Expense/Income los recurrentes cuyo dayOfMonth ya pasó
 * este mes y todavía no fueron generados. Pensado para llamarse desde
 * un cron diario (ver app/api/cron/recurring/route.ts).
 */
export async function generateDueRecurring() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const dueExpenses = await prisma.recurringExpense.findMany({
    where: {
      active: true,
      dayOfMonth: { lte: day },
      OR: [
        { lastGeneratedMonth: null },
        { lastGeneratedYear: { not: year } },
        { AND: [{ lastGeneratedYear: year }, { lastGeneratedMonth: { not: month } }] },
      ],
    },
  });

  for (const item of dueExpenses) {
    await prisma.$transaction([
      prisma.expense.create({
        data: {
          userId: item.userId,
          categoryId: item.categoryId,
          amount: item.amount,
          description: item.description ?? undefined,
          date: new Date(year, month - 1, item.dayOfMonth),
          sourceRecurringId: item.id,
        },
      }),
      prisma.recurringExpense.update({
        where: { id: item.id },
        data: { lastGeneratedMonth: month, lastGeneratedYear: year },
      }),
    ]);
  }

  const dueIncomes = await prisma.recurringIncome.findMany({
    where: {
      active: true,
      dayOfMonth: { lte: day },
      OR: [
        { lastGeneratedMonth: null },
        { lastGeneratedYear: { not: year } },
        { AND: [{ lastGeneratedYear: year }, { lastGeneratedMonth: { not: month } }] },
      ],
    },
  });

  for (const item of dueIncomes) {
    await prisma.$transaction([
      prisma.income.create({
        data: {
          userId: item.userId,
          amount: item.amount,
          description: item.description ?? undefined,
          date: new Date(year, month - 1, item.dayOfMonth),
          sourceRecurringId: item.id,
        },
      }),
      prisma.recurringIncome.update({
        where: { id: item.id },
        data: { lastGeneratedMonth: month, lastGeneratedYear: year },
      }),
    ]);
  }

  return { expenses: dueExpenses.length, incomes: dueIncomes.length };
}
