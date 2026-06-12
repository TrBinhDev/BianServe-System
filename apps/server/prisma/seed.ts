import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const code = process.env.SEED_ADMIN_CODE || "ADMIN00001";
  const password = process.env.SEED_ADMIN_PASSWORD || "12345678";

  const existing = await prisma.account.findUnique({ where: { code } });
  if (existing) {
    console.log("Admin already exists, skipping seed.");
    return;
  }

  await prisma.account.create({
    data: {
      code,
      password: await bcrypt.hash(password, 10),
      role: "admin",
    },
  });

  console.log(`Admin seeded: code=${code}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());