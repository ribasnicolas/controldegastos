import { getWorkWithTransactions } from "@/lib/actions/works";
import { requireUser } from "@/lib/session";
import { TransactionForm } from "../TransactionForm";
import Link from "next/link";

export default async function WorkPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const work = await getWorkWithTransactions(params.id);
  if (!work || work.userId !== user.id) return <div>Obra no encontrada</div>;

  // Calcular totales simples
  let totalArs = 0;
  let totalUsd = 0;
  for (const t of work.transactions) {
    if (t.currency === "ARS") {
      if (t.kind === "INCOME") totalArs += Number(t.amount);
      else totalArs -= Number(t.amount);
    } else {
      if (t.kind === "INCOME") totalUsd += Number(t.amount);
      else totalUsd -= Number(t.amount);
      if (t.amountArs) {
        if (t.kind === "INCOME") totalArs += Number(t.amountArs);
        else totalArs -= Number(t.amountArs);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{work.name}</h1>
          <div className="text-sm text-gray-500">{work.description ?? ""}</div>
        </div>
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

      <TransactionForm workId={work.id} />

      <section className="card-surface p-4">
        <h2 className="font-medium mb-2">Movimientos</h2>
        {work.transactions.length === 0 ? (
          <p className="text-sm text-gray-600">No hay movimientos</p>
        ) : (
          <ul className="space-y-2">
            {work.transactions.map((t) => (
              <li key={t.id} className="p-2 border rounded-lg flex justify-between">
                <div>
                  <div className="font-medium">{t.description ?? (t.materialType ?? t.kind)}</div>
                  <div className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{t.currency} {Number(t.amount).toFixed(2)}</div>
                  {t.amountArs && <div className="text-sm text-gray-500">(~ARS {Number(t.amountArs).toFixed(2)})</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
