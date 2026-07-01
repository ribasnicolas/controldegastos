"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { currentMonthRange } from "@/lib/dates";
import type { ActionState } from "./types";

const budgetSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().nonnegative("El monto no puede ser negativo"),
});

export async function setBudget(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = budgetSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { month, year } = currentMonthRange();
  await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: user.id,
        categoryId: parsed.data.categoryId,
        month,
        year,
      },
    },
    create: {
      userId: user.id,
      categoryId: parsed.data.categoryId,
      amount: parsed.data.amount,
      month,
      year,
    },
    update: { amount: parsed.data.amount },
  });

  revalidatePath("/presupuesto");
  revalidatePath("/");
  return { success: true };
}
