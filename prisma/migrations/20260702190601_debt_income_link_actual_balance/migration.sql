-- AlterTable
ALTER TABLE "User" ADD COLUMN     "actualBalance" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "settledIncomeId" TEXT;
