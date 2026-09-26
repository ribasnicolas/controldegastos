import { getWorkWithTransactions } from "@/lib/actions/works";
import { requireUser } from "@/lib/session";
import { TransactionForm } from "../TransactionForm";
import { WorkHeader } from "../WorkHeader";
import { WorkTransactionRow } from "../WorkTransactionRow";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  LABOR: "Mano de obra",
  MATERIALS: "Materiales",
  OTHER: "Otro",
};

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await requireUser();
  const work = await getWorkWithTransactions(id);
  if (!work || work.userId !== user.id) return <div>Obra no encontrada</div>;

  // Calcular saldo, totales de ingresos/gastos y desglose de gastos por categoría
  let totalArs = 0;
  let totalUsd = 0;
  let totalIncomeArs = 0;
  let totalExpenseArs = 0;
  const expenseByCategory: Record<string, number> = { LABOR: 0, MATERIALS: 0, OTHER: 0 };

  for (const t of work.transactions) {
    const amount = Number(t.amount);
    const arsEquivalent = t.amountArs != null ? Number(t.amountArs) : t.currency === "ARS" ? amount : 0;

    if (t.currency === "ARS") {
      if (t.kind === "INCOME") totalArs += amount;
      else totalArs -= amount;
    } else {
      if (t.kind === "INCOME") totalUsd += amount;
      else totalUsd -= amount;
      totalArs += t.kind === "INCOME" ? arsEquivalent : -arsEquivalent;
    }

    if (t.kind === "INCOME") {
      totalIncomeArs += arsEquivalent;
    } else {
      totalExpenseArs += arsEquivalent;
      const category = t.category ?? "OTHER";
      expenseByCategory[category] = (expenseByCategory[category] ?? 0) + arsEquivalent;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <WorkHeader work={{ id: work.id, name: work.name, description: work.description }} />
        <Link href="/obra" className="text-sm text-brand-primary">Volver</Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card-surface p-4">
          <div className="text-sm text-gray-500">Saldo (ARS)</div>
          <div className="text-2xl font-semibold">{totalArs.toFixed(2)}</div>
        </div>
        <div className="card-surface p-4">
          <div className="text-sm text-gray-500">Saldo (USD)</div>
          <div className="text-2xl font-semibold">{totalUsd.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card-surface p-4">
          <div className="text-sm text-gray-500">Total ingresado (ARS)</div>
          <div className="text-xl font-semibold text-brand-primary">{totalIncomeArs.toFixed(2)}</div>
        </div>
        <div className="card-surface p-4">
          <div className="text-sm text-gray-500">Total gastado (ARS)</div>
          <div className="text-xl font-semibold text-brand-danger">{totalExpenseArs.toFixed(2)}</div>
        </div>
      </div>

      <section className="card-surface p-4">
        <h2 className="font-medium mb-2">Gastos por categoría</h2>
        <ul className="space-y-2">
          {(["LABOR", "MATERIALS", "OTHER"] as const).map((category) => (
            <li key={category} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{CATEGORY_LABELS[category]}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-brand-primary"
                    style={{
                      width: `${totalExpenseArs > 0 ? Math.min(100, (expenseByCategory[category] / totalExpenseArs) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-24 text-right">ARS {expenseByCategory[category].toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <TransactionForm workId={work.id} />

      <section className="card-surface p-4">
        <h2 className="font-medium mb-2">Movimientos</h2>
        {work.transactions.length === 0 ? (
          <p className="text-sm text-gray-600">No hay movimientos</p>
        ) : (
          <ul className="space-y-2">
            {work.transactions.map((t) => (
              <WorkTransactionRow
                key={t.id}
                transaction={{
                  id: t.id,
                  kind: t.kind,
                  currency: t.currency,
                  amount: Number(t.amount),
                  amountArs: t.amountArs != null ? Number(t.amountArs) : null,
                  category: t.category,
                  materialType: t.materialType,
                  description: t.description,
                  date: t.date,
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
