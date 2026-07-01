import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Comida", icon: "🛒" },
  { name: "Transporte", icon: "🚗" },
  { name: "Vivienda", icon: "🏠" },
  { name: "Servicios", icon: "💡" },
  { name: "Salud", icon: "🩺" },
  { name: "Ocio", icon: "🎉" },
  { name: "Educación", icon: "📚" },
  { name: "Ropa", icon: "👕" },
  { name: "Actividades", icon: "⚽" },
  { name: "Estampados", icon: "🖨️" },
  { name: "Otros", icon: "📦" },
] as const;

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Sueldo", icon: "💼" },
  { name: "Estampados", icon: "🖨️" },
  { name: "Otros", icon: "📦" },
] as const;

async function main() {
  for (const category of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.category.upsert({
      where: { name_type: { name: category.name, type: "EXPENSE" } },
      update: {},
      create: { ...category, type: "EXPENSE" },
    });
  }
  for (const category of DEFAULT_INCOME_CATEGORIES) {
    await prisma.category.upsert({
      where: { name_type: { name: category.name, type: "INCOME" } },
      update: {},
      create: { ...category, type: "INCOME" },
    });
  }
  console.log(
    `Categorías: ${DEFAULT_EXPENSE_CATEGORIES.length} de gasto, ${DEFAULT_INCOME_CATEGORIES.length} de ingreso.`,
  );

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "Admin";

  if (adminEmail && adminPassword) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {},
      create: {
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: hashed,
        role: "ADMIN",
      },
    });
    console.log(`Usuario admin listo: ${adminEmail}`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD no definidos: no se creó ningún usuario admin.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
