-- CreateEnum
CREATE TYPE "WorkExpenseCategory" AS ENUM ('LABOR', 'MATERIALS', 'OTHER');

-- AlterTable
ALTER TABLE "WorkTransaction" ADD COLUMN "category" "WorkExpenseCategory";
