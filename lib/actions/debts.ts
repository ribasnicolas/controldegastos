"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { shiftMonth } from "@/lib/dates";
import type { ActionState } from "./types";

const DEBT_INCOME_CATEGORY = "Deudas cobradas";

const debtSchema = z.object({
  personName: z.string().min(1, "Ingresá quién te debe").max(100),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  installments: z.coerce.number().int().min(1).max(60).default(1),
  startWhen: z.enum(["this-month", "next-month"]).default("this-month"),
  description: z.string().max(200).optional(),
});

/**
 * Registra una deuda que te deben. Si es en cuotas, la primera se puede
 * cobrar recién el mes que viene; si es un cobro único, vos elegís si
 * arranca este mes o el que viene.
 */
export async function createDebt(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = debtSchema.safeParse({
    personName: formData.get("personName"),
    amount: formData.get("amount"),
    installments: formData.get("installments") || undefined,
    startWhen: formData.get("startWhen") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const start =
    parsed.data.installments > 1 || parsed.data.startWhen === "next-month"
      ? shiftMonth(currentYear, currentMonth, 1)
      : { year: currentYear, month: currentMonth };

  await prisma.debt.create({
    data: {
      userId: user.id,
      personName: parsed.data.personName,
      amount: parsed.data.amount,
      installments: parsed.data.installments,
      description: parsed.data.description,
      startMonth: start.month,
      startYear: start.year,
    },
  });

  revalidatePath("/deudas");
  revalidatePath("/");
  return { success: true };
}

/**
 * Cobra la próxima cuota (o el cobro único): crea el Income real que se
 * suma al disponible y avanza el contador de cuotas cobradas.
 */
export async function collectDebtInstallment(
  id: string,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const debt = await prisma.debt.findFirst({ where: { id, userId: user.id } });
  if (!debt) {
    return { error: "No se encontró la deuda" };
  }
  if (debt.installmentsPaid >= debt.installments) {
    return { error: "Ya está cobrada por completo" };
  }
  if (year < debt.startYear || (year === debt.startYear && month < debt.startMonth)) {
    return { error: "Todavía no empieza a cobrarse" };
  }
  if (debt.lastCollectedMonth === month && debt.lastCollectedYear === year) {
    return { error: "Ya cobraste la cuota de este mes" };
  }

  const installmentAmount = Math.round((Number(debt.amount) / debt.installments) * 100) / 100;
  const installmentNumber = debt.installmentsPaid + 1;
  const fullyCollected = installmentNumber >= debt.installments;

  await prisma.$transaction(async (tx) => {
    let category = await tx.category.findFirst({
      where: { name: DEBT_INCOME_CATEGORY, type: "INCOME" },
    });
    if (!category) {
      category = await tx.category.create({
        data: { name: DEBT_INCOME_CATEGORY, icon: "🤝", type: "INCOME" },
      });
    }

    await tx.income.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        amount: installmentAmount,
        description:
          debt.installments > 1
            ? `Cuota ${installmentNumber}/${debt.installments} - ${debt.personName}`
            : `Cobro: ${debt.personName}`,
        sourceDebtId: debt.id,
        date: now,
      },
    });

    await tx.debt.update({
      where: { id: debt.id },
      data: {
        installmentsPaid: installmentNumber,
        lastCollectedMonth: month,
        lastCollectedYear: year,
        settled: fullyCollected,
      },
    });
  });

  revalidatePath("/deudas");
  revalidatePath("/ingresos");
  revalidatePath("/");
  return { success: true };
}

/**
 * Deshace el último cobro de cuota: borra el Income generado y retrocede
 * el contador.
 */
export async function undoDebtInstallmentCollection(
  id: string,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const debt = await prisma.debt.findFirst({ where: { id, userId: user.id } });
  if (!debt) {
    return { error: "No se encontró la deuda" };
  }
  if (debt.lastCollectedMonth == null || debt.lastCollectedYear == null) {
    return { error: "Esta deuda no tiene cobros para deshacer" };
  }

  const monthStart = new Date(debt.lastCollectedYear, debt.lastCollectedMonth - 1, 1);
  const monthEnd = new Date(debt.lastCollectedYear, debt.lastCollectedMonth, 1);

  await prisma.$transaction([
    prisma.income.deleteMany({
      where: { userId: user.id, sourceDebtId: debt.id, date: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.debt.update({
      where: { id: debt.id },
      data: {
        installmentsPaid: Math.max(0, debt.installmentsPaid - 1),
        lastCollectedMonth: null,
        lastCollectedYear: null,
        settled: false,
      },
    }),
  ]);

  revalidatePath("/deudas");
  revalidatePath("/ingresos");
  revalidatePath("/");
  return { success: true };
}

export async function deleteDebt(id: string) {
  const user = await requireUser();
  await prisma.debt.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/deudas");
  revalidatePath("/ingresos");
  revalidatePath("/");
}
