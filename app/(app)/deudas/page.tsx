import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DeudasTabs } from "./DeudasTabs";

export default async function DeudasPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const { tab } = await searchParams;

  const [debts, liabilities] = await Promise.all([
    prisma.debt.findMany({
      where: { userId: user.id },
      orderBy: [{ settled: "asc" }, { date: "desc" }],
    }),
    prisma.liability.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPending = debts.reduce((sum, debt) => {
    const remaining = debt.installments - debt.installmentsPaid;
    return sum + (Number(debt.amount) / debt.installments) * remaining;
  }, 0);

  const totalOwed = liabilities.reduce((sum, liability) => {
    const remaining = liability.installments - liability.installmentsPaid;
    return sum + (Number(liability.totalAmount) / liability.installments) * remaining;
  }, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Deudas</h1>
      <DeudasTabs
        initialTab={tab === "debo" ? "debo" : "me-deben"}
        debts={debts.map((debt) => ({
          id: debt.id,
          personName: debt.personName,
          amount: Number(debt.amount),
          installments: debt.installments,
          installmentsPaid: debt.installmentsPaid,
          description: debt.description,
          startMonth: debt.startMonth,
          startYear: debt.startYear,
          lastCollectedMonth: debt.lastCollectedMonth,
          lastCollectedYear: debt.lastCollectedYear,
        }))}
        totalPending={totalPending}
        liabilities={liabilities.map((liability) => ({
          id: liability.id,
          personName: liability.personName,
          totalAmount: Number(liability.totalAmount),
          installments: liability.installments,
          installmentsPaid: liability.installmentsPaid,
          description: liability.description,
          startMonth: liability.startMonth,
          startYear: liability.startYear,
          lastPaidMonth: liability.lastPaidMonth,
          lastPaidYear: liability.lastPaidYear,
        }))}
        totalOwed={totalOwed}
      />
    </div>
  );
}
