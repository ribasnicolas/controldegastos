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
  categoryId: z.string().min(1, "Elegí una categoría"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().max(200).optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(28),
});

const updateRecurringExpenseSchema = recurringExpenseSchema.extend({
  id: z.string().min(1),
});

const updateRecurringIncomeSchema = recurringIncomeSchema.extend({
  id: z.string().min(1),
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
    categoryId: formData.get("categoryId"),
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

export async function updateRecurringExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = updateRecurringExpenseSchema.safeParse({
    id: formData.get("id"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    dayOfMonth: formData.get("dayOfMonth"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, ...data } = parsed.data;
  const result = await prisma.recurringExpense.updateMany({
    where: { id, userId: user.id },
    data,
  });
  if (result.count === 0) {
    return { error: "No se pudo actualizar el gasto fijo" };
  }

  revalidatePath("/gastos");
  return { success: true };
}

export async function updateRecurringIncome(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = updateRecurringIncomeSchema.safeParse({
    id: formData.get("id"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    dayOfMonth: formData.get("dayOfMonth"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, ...data } = parsed.data;
  const result = await prisma.recurringIncome.updateMany({
    where: { id, userId: user.id },
    data,
  });
  if (result.count === 0) {
    return { error: "No se pudo actualizar el ingreso fijo" };
  }

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
 * El usuario confirma que un gasto fijo ya vencido este mes fue pagado:
 * recién en este momento se crea el Expense real y se descuenta del total.
 */
export async function confirmRecurringExpensePayment(
  id: string,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const item = await prisma.recurringExpense.findFirst({ where: { id, userId: user.id } });
  if (!item) {
    return { error: "No se encontró el gasto fijo" };
  }
  if (!item.active) {
    return { error: "Este gasto fijo está pausado" };
  }
  if (item.dayOfMonth > day) {
    return { error: `Todavía no llegó el día ${item.dayOfMonth}` };
  }
  if (item.lastGeneratedMonth === month && item.lastGeneratedYear === year) {
    return { error: "Ya estaba marcado como pagado este mes" };
  }

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

  revalidatePath("/gastos");
  revalidatePath("/");
  return { success: true };
}

/**
 * Deshace la confirmación de pago de un gasto fijo: borra el Expense que se
 * generó al confirmar (si todavía existe) y vuelve a dejarlo pendiente.
 */
export async function undoRecurringExpensePayment(
  id: string,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const item = await prisma.recurringExpense.findFirst({ where: { id, userId: user.id } });
  if (!item) {
    return { error: "No se encontró el gasto fijo" };
  }
  if (item.lastGeneratedMonth == null || item.lastGeneratedYear == null) {
    return { error: "Este gasto fijo no está marcado como pagado" };
  }

  const monthStart = new Date(item.lastGeneratedYear, item.lastGeneratedMonth - 1, 1);
  const monthEnd = new Date(item.lastGeneratedYear, item.lastGeneratedMonth, 1);

  await prisma.$transaction([
    prisma.expense.deleteMany({
      where: { userId: user.id, sourceRecurringId: item.id, date: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.recurringExpense.update({
      where: { id: item.id },
      data: { lastGeneratedMonth: null, lastGeneratedYear: null },
    }),
  ]);

  revalidatePath("/gastos");
  revalidatePath("/");
  return { success: true };
}

/**
 * Materializa en Income los ingresos fijos cuyo dayOfMonth ya pasó este
 * mes y todavía no fueron generados. Pensado para llamarse desde un cron
 * diario (ver app/api/cron/recurring/route.ts). Los gastos fijos ya no se
 * generan automáticamente: requieren confirmación manual del usuario
 * (ver confirmRecurringExpensePayment).
 */
export async function generateDueRecurring() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

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
          categoryId: item.categoryId,
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

  return { incomes: dueIncomes.length };
}
