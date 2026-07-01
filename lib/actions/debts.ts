"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
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
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    },
  });

  revalidatePath("/deudas");
  return { success: true };
}

export async function toggleDebtSettled(id: string) {
  const user = await requireUser();
  const debt = await prisma.debt.findFirstOrThrow({ where: { id, userId: user.id } });
  await prisma.debt.update({ where: { id }, data: { settled: !debt.settled } });
  revalidatePath("/deudas");
}

export async function deleteDebt(id: string) {
  const user = await requireUser();
  await prisma.debt.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/deudas");
}
