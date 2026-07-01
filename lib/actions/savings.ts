"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ActionState } from "./types";

const savingSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  currency: z.enum(["ARS", "USD"]),
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
  description: z.string().max(200).optional(),
  date: z.string().optional(),
});

export async function createSavingEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = savingSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.savingEntry.create({
    data: {
      userId: user.id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      type: parsed.data.type,
      description: parsed.data.description,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    },
  });

  revalidatePath("/ahorros");
  return { success: true };
}

export async function deleteSavingEntry(id: string) {
  const user = await requireUser();
  await prisma.savingEntry.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/ahorros");
}
