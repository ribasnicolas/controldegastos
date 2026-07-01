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
  date: z.string().optional(),
});

export async function createExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = expenseSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
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
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/gastos");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const user = await requireUser();
  await prisma.expense.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/");
  revalidatePath("/gastos");
}
