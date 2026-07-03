"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { shiftMonth } from "@/lib/dates";
import type { ActionState } from "./types";

const LIABILITY_EXPENSE_CATEGORY = "Deudas pagadas";

const liabilitySchema = z.object({
  personName: z.string().min(1, "Ingresá a quién le debés").max(100),
  totalAmount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  installments: z.coerce.number().int().min(1).max(60).default(1),
  startWhen: z.enum(["this-month", "next-month"]).default("this-month"),
  description: z.string().max(200).optional(),
});

/**
 * Registra una deuda que vos debés. Si es en cuotas, la primera se paga el
 * mes que viene; si es un pago único, vos elegís si arranca este mes o el
 * que viene.
 */
export async function createLiability(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = liabilitySchema.safeParse({
    personName: formData.get("personName"),
    totalAmount: formData.get("totalAmount"),
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

  await prisma.liability.create({
    data: {
      userId: user.id,
      personName: parsed.data.personName,
      totalAmount: parsed.data.totalAmount,
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
 * Paga la próxima cuota (o el pago único): crea el Expense real que se
 * descuenta del disponible y avanza el contador de cuotas pagadas.
 */
export async function payLiabilityInstallment(
  id: string,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const liability = await prisma.liability.findFirst({ where: { id, userId: user.id } });
  if (!liability) {
    return { error: "No se encontró la deuda" };
  }
  if (liability.installmentsPaid >= liability.installments) {
    return { error: "Ya está totalmente pagada" };
  }
  if (year < liability.startYear || (year === liability.startYear && month < liability.startMonth)) {
    return { error: "Todavía no empieza a pagarse" };
  }
  if (liability.lastPaidMonth === month && liability.lastPaidYear === year) {
    return { error: "Ya pagaste la cuota de este mes" };
  }

  const installmentAmount = Math.round((Number(liability.totalAmount) / liability.installments) * 100) / 100;
  const installmentNumber = liability.installmentsPaid + 1;

  await prisma.$transaction(async (tx) => {
    let category = await tx.category.findFirst({
      where: { name: LIABILITY_EXPENSE_CATEGORY, type: "EXPENSE" },
    });
    if (!category) {
      category = await tx.category.create({
        data: { name: LIABILITY_EXPENSE_CATEGORY, icon: "🫱", type: "EXPENSE" },
      });
    }

    await tx.expense.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        amount: installmentAmount,
        description:
          liability.installments > 1
            ? `Cuota ${installmentNumber}/${liability.installments} - ${liability.personName}`
            : `Deuda: ${liability.personName}`,
        sourceLiabilityId: liability.id,
        date: now,
      },
    });

    await tx.liability.update({
      where: { id: liability.id },
      data: { installmentsPaid: installmentNumber, lastPaidMonth: month, lastPaidYear: year },
    });
  });

  revalidatePath("/deudas");
  revalidatePath("/gastos");
  revalidatePath("/");
  return { success: true };
}

/**
 * Deshace el último pago de cuota: borra el Expense generado y retrocede
 * el contador.
 */
export async function undoLiabilityPayment(
  id: string,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const liability = await prisma.liability.findFirst({ where: { id, userId: user.id } });
  if (!liability) {
    return { error: "No se encontró la deuda" };
  }
  if (liability.lastPaidMonth == null || liability.lastPaidYear == null) {
    return { error: "Esta deuda no tiene pagos para deshacer" };
  }

  const monthStart = new Date(liability.lastPaidYear, liability.lastPaidMonth - 1, 1);
  const monthEnd = new Date(liability.lastPaidYear, liability.lastPaidMonth, 1);

  await prisma.$transaction([
    prisma.expense.deleteMany({
      where: { userId: user.id, sourceLiabilityId: liability.id, date: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.liability.update({
      where: { id: liability.id },
      data: {
        installmentsPaid: Math.max(0, liability.installmentsPaid - 1),
        lastPaidMonth: null,
        lastPaidYear: null,
      },
    }),
  ]);

  revalidatePath("/deudas");
  revalidatePath("/gastos");
  revalidatePath("/");
  return { success: true };
}

export async function deleteLiability(id: string) {
  const user = await requireUser();
  await prisma.liability.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/deudas");
  revalidatePath("/");
}
