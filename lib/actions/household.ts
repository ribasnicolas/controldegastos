"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ActionState } from "./types";

const createSchema = z.object({ name: z.string().min(1, "Ponele un nombre a tu hogar").max(60) });
const joinSchema = z.object({ inviteCode: z.string().min(1, "Ingresá un código de invitación") });

export async function createHousehold(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = createSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const household = await prisma.household.create({ data: { name: parsed.data.name } });
  await prisma.user.update({ where: { id: user.id }, data: { householdId: household.id } });

  revalidatePath("/hogar");
  revalidatePath("/");
  return { success: true };
}

export async function joinHousehold(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = joinSchema.safeParse({ inviteCode: formData.get("inviteCode") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const household = await prisma.household.findUnique({ where: { inviteCode: parsed.data.inviteCode.trim() } });
  if (!household) {
    return { error: "No existe ningún hogar con ese código" };
  }

  await prisma.user.update({ where: { id: user.id }, data: { householdId: household.id } });
  revalidatePath("/hogar");
  revalidatePath("/");
  return { success: true };
}

export async function leaveHousehold() {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { householdId: null } });
  revalidatePath("/hogar");
  revalidatePath("/");
}
