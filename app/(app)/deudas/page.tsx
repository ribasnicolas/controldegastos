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

  const totalPending = debts
    .filter((debt) => !debt.settled)
    .reduce((sum, debt) => sum + Number(debt.amount), 0);

  const totalOwed = liabilities.reduce((sum, liability) => {
    const remaining = liability.installments - liability.installmentsPaid;
    return sum + (Number(liability.totalAmount) / liability.installments) * remaining;
  }, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Deudas</h1>
      <DeudasTabs
        initialTab={tab === "debo" ? "debo" : "me-deben"}
        debts={debts.map((debt) => ({
          id: debt.id,
          personName: debt.personName,
          amount: Number(debt.amount),
          description: debt.description,
          settled: debt.settled,
          date: debt.date,
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
