import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatCurrency, formatDate } from "@/lib/format";
import { monthLabel } from "@/lib/dates";
import { ExpensePieChart } from "@/components/ExpensePieChart";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id, user.householdId);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-500">{monthLabel(data.month, data.year)}</p>
        <div
          className={`mt-2 rounded-3xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ${
            data.available >= 0 ? "bg-brand-primary/10" : "bg-brand-danger/10"
          }`}
        >
          <p className="text-sm text-gray-600">Disponible</p>
          <p
            className={`text-4xl font-bold tracking-tight ${
              data.available >= 0 ? "text-brand-primary-dark" : "text-brand-danger"
            }`}
          >
            {formatCurrency(data.available)}
          </p>
        </div>

        {data.pendingFixedTotal > 0 && (
          <div className="mt-2 card-surface p-4 space-y-2">
            <p className="text-xs text-gray-500">
              Faltan descontar los gastos fijos que aún no fueron pagados
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total pendiente</span>
              <span className="font-semibold text-brand-secondary-dark">
                {formatCurrency(data.pendingFixedTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-600">Saldo real</span>
              <span className="font-semibold text-gray-900">{formatCurrency(data.available)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Saldo si pagás los gastos fijos</span>
              <span
                className={`font-semibold ${
                  data.projectedAvailable >= 0 ? "text-brand-primary-dark" : "text-brand-danger"
                }`}
              >
                {formatCurrency(data.projectedAvailable)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-surface p-4">
          <p className="text-xs text-gray-500">Ingresos del mes</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.totalIncome)}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs text-gray-500">Gastos del mes</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.totalExpense)}</p>
        </div>
      </div>

      {data.creditCardExpense > 0 && (
        <div className="card-surface p-4">
          <p className="text-xs text-gray-500">💳 Acumulado en tarjeta este mes</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.creditCardExpense)}</p>
          <p className="text-xs text-gray-400 mt-1">No se descontó del disponible — se paga el mes que viene.</p>
        </div>
      )}

      {data.household && (
        <Link
          href="/hogar"
          className="block rounded-2xl bg-brand-secondary/10 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] tap"
        >
          <p className="text-xs text-gray-600">Hogar · {data.household.name}</p>
          <p className="text-lg font-semibold text-gray-900">
            Disponible combinado: {formatCurrency(data.household.available)}
          </p>
        </Link>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Gastos por categoría</h2>
        <div className="card-surface p-4">
          <ExpensePieChart data={data.expensesBreakdown} year={data.year} month={data.month} />
          <ul className="mt-2 space-y-1">
            {data.expensesBreakdown.map((row) => (
              <li key={row.categoryId}>
                <Link
                  href={`/gastos?y=${data.year}&m=${data.month}&categoryId=${row.categoryId}`}
                  className="flex items-center justify-between text-sm py-1.5 tap"
                >
                  <span className="text-gray-700">
                    {row.icon} {row.name}
                  </span>
                  <span className="font-medium text-gray-900">{formatCurrency(row.amount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Estampados</h2>
        <div className="card-surface p-4 grid grid-cols-2 gap-4">
          {(
            [
              { label: "Este mes", data: data.estampados.month },
              { label: `Año ${data.year}`, data: data.estampados.year },
            ] as const
          ).map(({ label, data: row }) => (
            <div key={label}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-lg font-bold ${row.net >= 0 ? "text-brand-primary-dark" : "text-brand-danger"}`}>
                {formatCurrency(row.net)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ingresos {formatCurrency(row.income)} · Egresos {formatCurrency(row.expense)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {data.budgetsBreakdown.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Presupuesto vs. gastado</h2>
            <Link href="/presupuesto" className="text-sm text-brand-primary font-medium">
              Editar
            </Link>
          </div>
          <div className="card-surface p-4 space-y-4">
            {data.budgetsBreakdown.map((row) => {
              const pct = row.budgeted > 0 ? Math.min(100, (row.spent / row.budgeted) * 100) : 0;
              const overBudget = row.spent > row.budgeted;
              return (
                <div key={row.categoryId}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">
                      {row.icon} {row.name}
                    </span>
                    <span className={overBudget ? "text-brand-danger font-medium" : "text-gray-600"}>
                      {formatCurrency(row.spent)} / {formatCurrency(row.budgeted)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${overBudget ? "bg-brand-danger" : "bg-brand-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Últimos movimientos</h2>
        <div className="card-surface divide-y divide-gray-100">
          {[
            ...data.recentExpenses.map((e) => ({
              id: e.id,
              label: e.description || e.category.name,
              icon: e.icon || e.category.icon || "💸",
              amount: -Number(e.amount),
              date: e.date,
            })),
            ...data.recentIncomes.map((i) => ({
              id: i.id,
              label: i.description || i.category.name,
              icon: i.icon || i.category.icon || "💰",
              amount: Number(i.amount),
              date: i.date,
            })),
          ]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 6)
            .map((movement) => (
              <div key={movement.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span>{movement.icon}</span>
                  <div>
                    <p className="text-sm text-gray-900">{movement.label}</p>
                    <p className="text-xs text-gray-500">{formatDate(movement.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${movement.amount < 0 ? "text-gray-900" : "text-brand-primary"}`}>
                  {movement.amount < 0 ? "-" : "+"}
                  {formatCurrency(Math.abs(movement.amount))}
                </span>
              </div>
            ))}
          {data.recentExpenses.length === 0 && data.recentIncomes.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no hay movimientos.</p>
          )}
        </div>
      </section>
    </div>
  );
}
