"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseDateInput } from "@/lib/dates";
import type { ActionState } from "./types";

const workSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().max(500).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const transactionSchema = z.object({
  workId: z.string().min(1),
  kind: z.enum(["INCOME", "EXPENSE"]),
  currency: z.enum(["ARS", "USD"]),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  cotizacion: z.coerce.number().optional(),
  description: z.string().max(200).optional(),
  materialType: z.string().max(100).optional(),
  paymentMethod: z.string().optional(),
  date: z.string().optional(),
});

export async function createWork(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = workSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  await prisma.work.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      startDate: parsed.data.startDate ? parseDateInput(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? parseDateInput(parsed.data.endDate) : undefined,
    },
  });

  revalidatePath("/obra");
  return { success: true };
}

export async function createWorkTransaction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = transactionSchema.safeParse({
    workId: formData.get("workId"),
    kind: formData.get("kind"),
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    cotizacion: formData.get("cotizacion"),
    description: formData.get("description") || undefined,
    materialType: formData.get("materialType") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  // Determine ARS equivalent. If currency is ARS, store amount directly.
  // If currency is USD and cotizacion provided, use it. Otherwise try to fetch latest USD->ARS rate.
  let amountArs: number | null = null;
  if (parsed.data.currency === "ARS") {
    amountArs = parsed.data.amount;
  } else {
    if (parsed.data.cotizacion) {
      amountArs = parsed.data.amount * parsed.data.cotizacion;
    } else {
      try {
        const res = await fetch("https://api.exchangerate.host/convert?from=USD&to=ARS&amount=1");
        if (res.ok) {
          const json = await res.json();
          const rate = json?.info?.rate ?? json?.result ?? null;
          if (rate) amountArs = parsed.data.amount * Number(rate);
        }
      } catch (e) {
        // ignore fetch errors, amountArs will remain null
      }
    }
  }

  await prisma.workTransaction.create({
    data: {
      workId: parsed.data.workId,
      userId: user.id,
      kind: parsed.data.kind,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      amountArs: amountArs ?? undefined,
      description: parsed.data.description ?? undefined,
      materialType: parsed.data.materialType ?? undefined,
      paymentMethod: parsed.data.paymentMethod as any,
      date: parsed.data.date ? parseDateInput(parsed.data.date) : new Date(),
    },
  });

  revalidatePath("/obra");
  return { success: true };
}

export async function deleteWorkTransaction(id: string) {
  const user = await requireUser();
  await prisma.workTransaction.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/obra");
}

export async function listWorksForUser(userId: string) {
  return prisma.work.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function getWorkWithTransactions(workId: string) {
  return prisma.work.findUnique({
    where: { id: workId },
    include: { transactions: { orderBy: { date: "desc" } } },
  });
}
