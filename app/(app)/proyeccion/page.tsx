import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getMonthProjection } from "@/lib/data/projection";
import { formatCurrency } from "@/lib/format";
import { monthLabel, shiftMonth } from "@/lib/dates";

export default async function ProyeccionPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const user = await requireUser();
  const { y, m } = await searchParams;
  const now = new Date();
  const defaultTarget = shiftMonth(now.getFullYear(), now.getMonth() + 1, 1);
  const year = y ? Number(y) : defaultTarget.year;
  const month = m ? Number(m) : defaultTarget.month;

  const data = await getMonthProjection(user.id, year, month);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const isNextMonth = year === defaultTarget.year && month === defaultTarget.month;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Proyección</h1>

      <div className="flex items-center justify-between">
        <Link
          href={`/proyeccion?y=${prev.year}&m=${prev.month}`}
          className="tap h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Mes anterior"
        >
          ‹
        </Link>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{monthLabel(month, year)}</p>
          {!isNextMonth && (
            <Link href="/proyeccion" className="text-xs text-brand-primary font-medium">
              Volver al mes que viene
            </Link>
          )}
        </div>
        <Link
          href={`/proyeccion?y=${next.year}&m=${next.month}`}
          className="tap h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Mes siguiente"
        >
          ›
        </Link>
      </div>

      <div
        className={`rounded-3xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ${
          data.projectedAvailable >= 0 ? "bg-brand-primary/10" : "bg-brand-danger/10"
        }`}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">Saldo proyectado</p>
        <p
          className={`text-4xl font-bold tracking-tight ${
            data.projectedAvailable >= 0 ? "text-brand-primary-dark" : "text-brand-danger"
          }`}
        >
          {formatCurrency(data.projectedAvailable)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Con lo que ya cargaste para este mes más los fijos, cuotas y cobros esperados.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ingresos proyectados</h2>
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total proyectado</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(data.projectedIncome)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <Link href={`/ingresos?y=${year}&m=${month}`} className="text-gray-600 dark:text-gray-400 tap">
              Ya cargados este mes
            </Link>
            <span className="text-gray-900 dark:text-gray-100">{formatCurrency(data.actualIncome)}</span>
          </div>
          {data.expectedRecurringIncomeTotal > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos fijos esperados</p>
              {data.recurringIncomeItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.icon} {item.name}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
          {data.expectedDebtTotal > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Cobros de deudas esperados</p>
              {data.debtItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">🤝 {item.name}</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gastos proyectados</h2>
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total proyectado</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(data.projectedExpense)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <Link href={`/gastos?y=${year}&m=${month}`} className="text-gray-600 dark:text-gray-400 tap">
              Ya cargados este mes
            </Link>
            <span className="text-gray-900 dark:text-gray-100">{formatCurrency(data.actualExpense)}</span>
          </div>
          {data.expectedRecurringExpenseTotal > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Gastos fijos esperados</p>
              {data.recurringExpenseItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.icon} {item.name}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
          {data.expectedLiabilityTotal > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Cuotas a pagar esperadas</p>
              {data.liabilityItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">💸 {item.name}</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
          {data.creditCardExpense > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">💳 Tarjeta (se paga el mes siguiente)</span>
                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(data.creditCardExpense)}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
