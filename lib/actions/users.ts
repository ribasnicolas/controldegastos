"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { ActionState } from "./types";

const userSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(80),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "USER"]),
});

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe un usuario con ese email" };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { name: parsed.data.name, email, password: hashed, role: parsed.data.role },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function toggleUserActive(id: string) {
  const admin = await requireAdmin();
  if (admin.id === id) return;
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  revalidatePath("/admin/usuarios");
}

export async function changeUserRole(id: string, role: "ADMIN" | "USER") {
  const admin = await requireAdmin();
  if (admin.id === id) return;
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/usuarios");
}
