import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Comida", icon: "🛒" },
  { name: "Transporte", icon: "🚗" },
  { name: "Vivienda", icon: "🏠" },
  { name: "Servicios", icon: "💡" },
  { name: "Salud", icon: "🩺" },
  { name: "Ocio", icon: "🎉" },
  { name: "Educación", icon: "📚" },
  { name: "Ropa", icon: "👕" },
  { name: "Otros", icon: "📦" },
];

async function main() {
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`Categorías: ${DEFAULT_CATEGORIES.length} listas.`);

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
