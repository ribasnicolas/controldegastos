-- Create enum for Work transactions
CREATE TYPE "TransactionKind" AS ENUM ('INCOME', 'EXPENSE');

-- Create Work table
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- Create WorkTransaction table
CREATE TABLE "WorkTransaction" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "TransactionKind" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "amountArs" DECIMAL(12,2),
    "description" TEXT,
    "materialType" TEXT,
    "paymentMethod" "PaymentMethod",
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkTransaction_pkey" PRIMARY KEY ("id")
);

-- Index
CREATE INDEX "WorkTransaction_workId_userId_date_idx" ON "WorkTransaction"("workId", "userId", "date");

-- Foreign keys
ALTER TABLE "Work" ADD CONSTRAINT "Work_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkTransaction" ADD CONSTRAINT "WorkTransaction_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkTransaction" ADD CONSTRAINT "WorkTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
