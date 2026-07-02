"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { ActionState } from "./types";

const actualBalanceSchema = z.object({
  actualBalance: z.coerce.number(),
});

export async function updateActualBalance(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = actualBalanceSchema.safeParse({
    actualBalance: formData.get("actualBalance"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { actualBalance: parsed.data.actualBalance },
  });

  revalidatePath("/");
  return { success: true };
}
