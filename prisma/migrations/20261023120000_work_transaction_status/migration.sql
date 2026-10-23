-- CreateEnum
CREATE TYPE "WorkTransactionStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- AlterTable
ALTER TABLE "WorkTransaction" ADD COLUMN "status" "WorkTransactionStatus" NOT NULL DEFAULT 'CONFIRMED';
