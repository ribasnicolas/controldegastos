import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteSavingEntry } from "@/lib/actions/savings";
import { SavingForm } from "./SavingForm";

export default async function AhorrosPage() {
  const user = await requireUser();

  const entries = await prisma.savingEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const totals = { ARS: 0, USD: 0 };
  for (const entry of entries) {
    const amount = Number(entry.amount);
    totals[entry.currency] += entry.type === "DEPOSIT" ? amount : -amount;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Ahorros</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-brand-primary/10 p-4">
          <p className="text-xs text-gray-600">Ahorrado en pesos</p>
          <p className="text-lg font-bold text-brand-primary-dark">{formatCurrency(totals.ARS, "ARS")}</p>
        </div>
        <div className="rounded-2xl bg-brand-secondary/10 p-4">
          <p className="text-xs text-gray-600">Ahorrado en dólares</p>
          <p className="text-lg font-bold text-brand-secondary-dark">{formatCurrency(totals.USD, "USD")}</p>
        </div>
      </div>

      <SavingForm />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Movimientos</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
          {entries.map((entry) => {
            const isDeposit = entry.type === "DEPOSIT";
            return (
              <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-gray-900">
                    {entry.description || (isDeposit ? "Aporte" : "Retiro")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(entry.date)} · {entry.currency}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${isDeposit ? "text-brand-primary-dark" : "text-brand-danger"}`}
                  >
                    {isDeposit ? "+" : "-"}
                    {formatCurrency(Number(entry.amount), entry.currency)}
                  </span>
                  <form action={deleteSavingEntry.bind(null, entry.id)}>
                    <button type="submit" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100">
                      ✕
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
          {entries.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no registraste ahorros.</p>
          )}
        </div>
      </section>
    </div>
  );
}
