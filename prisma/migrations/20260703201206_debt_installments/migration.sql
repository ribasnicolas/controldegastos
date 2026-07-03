-- AlterTable
ALTER TABLE "Income" ADD COLUMN     "sourceDebtId" TEXT;

-- AlterTable
ALTER TABLE "Debt"
  ADD COLUMN     "installments" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN     "installmentsPaid" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN     "startMonth" INTEGER,
  ADD COLUMN     "startYear" INTEGER,
  ADD COLUMN     "lastCollectedMonth" INTEGER,
  ADD COLUMN     "lastCollectedYear" INTEGER;

-- Backfill startMonth/startYear from the existing date column
UPDATE "Debt"
SET "startMonth" = EXTRACT(MONTH FROM "date")::int,
    "startYear" = EXTRACT(YEAR FROM "date")::int
WHERE "startMonth" IS NULL;

-- Backfill installmentsPaid for debts already marked as collected
UPDATE "Debt" SET "installmentsPaid" = 1 WHERE "settled" = true;

-- Now that every row has a value, enforce NOT NULL
ALTER TABLE "Debt" ALTER COLUMN "startMonth" SET NOT NULL;
ALTER TABLE "Debt" ALTER COLUMN "startYear" SET NOT NULL;
