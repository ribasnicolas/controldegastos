import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { DebtForm } from "./DebtForm";
import { DebtRow } from "./DebtRow";

export default async function DeudasPage() {
  const user = await requireUser();

  const debts = await prisma.debt.findMany({
    where: { userId: user.id },
    orderBy: [{ settled: "asc" }, { date: "desc" }],
  });

  const totalPending = debts
    .filter((debt) => !debt.settled)
    .reduce((sum, debt) => sum + Number(debt.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Me deben</h1>

      <div className="card-surface p-5">
        <p className="text-sm text-gray-600">Total pendiente de cobro</p>
        <p className="text-3xl font-bold text-brand-primary-dark">{formatCurrency(totalPending)}</p>
      </div>

      <DebtForm />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Deudas</h2>
        <div className="card-surface divide-y divide-gray-100">
          {debts.map((debt) => (
            <DebtRow
              key={debt.id}
              debt={{
                id: debt.id,
                personName: debt.personName,
                amount: Number(debt.amount),
                description: debt.description,
                settled: debt.settled,
                date: debt.date,
              }}
            />
          ))}
          {debts.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no anotaste ninguna deuda.</p>
          )}
        </div>
      </section>
    </div>
  );
}
