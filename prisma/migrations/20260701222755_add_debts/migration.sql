-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "settled" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Debt_userId_settled_idx" ON "Debt"("userId", "settled");

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
