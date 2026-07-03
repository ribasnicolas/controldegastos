"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseDateInput } from "@/lib/dates";
import type { ActionState } from "./types";

const debtSchema = z.object({
  personName: z.string().min(1, "Ingresá quién te debe").max(100),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().max(200).optional(),
  date: z.string().optional(),
});

export async function createDebt(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = debtSchema.safeParse({
    personName: formData.get("personName"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.debt.create({
    data: {
      userId: user.id,
      personName: parsed.data.personName,
      amount: parsed.data.amount,
      description: parsed.data.description,
      date: parsed.data.date ? parseDateInput(parsed.data.date) : new Date(),
    },
  });

  revalidatePath("/deudas");
  return { success: true };
}

const DEBT_INCOME_CATEGORY = "Deudas cobradas";

/**
 * Cobrar una deuda suma su monto al disponible como un ingreso real (así se
 * refleja en "Ingresos del mes" y en el saldo); deshacerlo borra ese ingreso.
 */
export async function toggleDebtSettled(id: string) {
  const user = await requireUser();
  const debt = await prisma.debt.findFirstOrThrow({ where: { id, userId: user.id } });

  await prisma.$transaction(async (tx) => {
    if (debt.settled) {
      if (debt.settledIncomeId) {
        await tx.income.deleteMany({ where: { id: debt.settledIncomeId, userId: user.id } });
      }
      await tx.debt.update({ where: { id }, data: { settled: false, settledIncomeId: null } });
      return;
    }

    let category = await tx.category.findFirst({
      where: { name: DEBT_INCOME_CATEGORY, type: "INCOME" },
    });
    if (!category) {
      category = await tx.category.create({
        data: { name: DEBT_INCOME_CATEGORY, icon: "🤝", type: "INCOME" },
      });
    }

    const income = await tx.income.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        amount: debt.amount,
        description: `Cobro: ${debt.personName}`,
        date: new Date(),
      },
    });

    await tx.debt.update({ where: { id }, data: { settled: true, settledIncomeId: income.id } });
  });

  revalidatePath("/deudas");
  revalidatePath("/ingresos");
  revalidatePath("/");
}

export async function deleteDebt(id: string) {
  const user = await requireUser();
  const debt = await prisma.debt.findFirst({ where: { id, userId: user.id } });
  if (!debt) return;

  if (debt.settledIncomeId) {
    await prisma.income.deleteMany({ where: { id: debt.settledIncomeId, userId: user.id } });
  }
  await prisma.debt.delete({ where: { id: debt.id } });

  revalidatePath("/deudas");
  revalidatePath("/ingresos");
  revalidatePath("/");
}
