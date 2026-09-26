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

const updateWorkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().max(500).optional(),
});

const categorySchema = z.enum(["LABOR", "MATERIALS", "OTHER"]);

const transactionSchema = z
  .object({
    workId: z.string().min(1),
    kind: z.enum(["INCOME", "EXPENSE"]),
    currency: z.enum(["ARS", "USD"]),
    amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
    cotizacion: z.coerce.number().optional(),
    category: categorySchema.optional(),
    description: z.string().max(200).optional(),
    materialType: z.string().max(100).optional(),
    date: z.string().optional(),
  })
  .refine((data) => data.kind !== "EXPENSE" || !!data.category, {
    message: "Elegí una categoría para el gasto",
    path: ["category"],
  });

const updateTransactionSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(["INCOME", "EXPENSE"]),
    currency: z.enum(["ARS", "USD"]),
    amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
    cotizacion: z.coerce.number().optional(),
    category: categorySchema.optional(),
    description: z.string().max(200).optional(),
    materialType: z.string().max(100).optional(),
    date: z.string().optional(),
  })
  .refine((data) => data.kind !== "EXPENSE" || !!data.category, {
    message: "Elegí una categoría para el gasto",
    path: ["category"],
  });

async function computeAmountArs(currency: "ARS" | "USD", amount: number, cotizacion?: number): Promise<number | null> {
  if (currency === "ARS") return amount;
  if (cotizacion) return amount * cotizacion;
  try {
    const res = await fetch("https://api.exchangerate.host/convert?from=USD&to=ARS&amount=1");
    if (res.ok) {
      const json = await res.json();
      const rate = json?.info?.rate ?? json?.result ?? null;
      if (rate) return amount * Number(rate);
    }
  } catch {
    // ignore fetch errors, caller falls back to the previous value
  }
  return null;
}

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

export async function updateWork(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = updateWorkSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const work = await prisma.work.findFirst({ where: { id: parsed.data.id, userId: user.id } });
  if (!work) return { error: "Obra no encontrada" };

  await prisma.work.update({
    where: { id: work.id },
    data: { name: parsed.data.name, description: parsed.data.description ?? null },
  });

  revalidatePath("/obra");
  revalidatePath(`/obra/${work.id}`);
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
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    materialType: formData.get("materialType") || undefined,
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const amountArs = await computeAmountArs(parsed.data.currency, parsed.data.amount, parsed.data.cotizacion);

  await prisma.workTransaction.create({
    data: {
      workId: parsed.data.workId,
      userId: user.id,
      kind: parsed.data.kind,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      amountArs: amountArs ?? undefined,
      category: parsed.data.kind === "EXPENSE" ? parsed.data.category : undefined,
      description: parsed.data.description ?? undefined,
      materialType: parsed.data.materialType ?? undefined,
      date: parsed.data.date ? parseDateInput(parsed.data.date) : new Date(),
    },
  });

  revalidatePath("/obra");
  revalidatePath(`/obra/${parsed.data.workId}`);
  return { success: true };
}

export async function updateWorkTransaction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = updateTransactionSchema.safeParse({
    id: formData.get("id"),
    kind: formData.get("kind"),
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    cotizacion: formData.get("cotizacion"),
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    materialType: formData.get("materialType") || undefined,
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const transaction = await prisma.workTransaction.findFirst({ where: { id: parsed.data.id, userId: user.id } });
  if (!transaction) return { error: "Movimiento no encontrado" };

  const computedAmountArs = await computeAmountArs(parsed.data.currency, parsed.data.amount, parsed.data.cotizacion);
  const amountArs = computedAmountArs ?? (transaction.amountArs ? Number(transaction.amountArs) : null);

  await prisma.workTransaction.update({
    where: { id: transaction.id },
    data: {
      kind: parsed.data.kind,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      amountArs: amountArs ?? undefined,
      category: parsed.data.kind === "EXPENSE" ? parsed.data.category : null,
      description: parsed.data.description ?? null,
      materialType: parsed.data.materialType ?? null,
      date: parsed.data.date ? parseDateInput(parsed.data.date) : transaction.date,
    },
  });

  revalidatePath("/obra");
  revalidatePath(`/obra/${transaction.workId}`);
  return { success: true };
}

export async function deleteWorkTransaction(id: string) {
  const user = await requireUser();
  const transaction = await prisma.workTransaction.findFirst({ where: { id, userId: user.id } });
  if (!transaction) return;
  await prisma.workTransaction.delete({ where: { id: transaction.id } });
  revalidatePath("/obra");
  revalidatePath(`/obra/${transaction.workId}`);
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
