import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { currentMonthRange } from "@/lib/dates";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteIncome } from "@/lib/actions/incomes";
import { IncomeForm } from "./IncomeForm";
import { RecurringIncomes } from "./RecurringIncomes";

export default async function IngresosPage() {
  const user = await requireUser();
  const { start, end } = currentMonthRange();

  const [incomes, recurring] = await Promise.all([
    prisma.income.findMany({
      where: { userId: user.id, date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
    }),
    prisma.recurringIncome.findMany({
      where: { userId: user.id },
      orderBy: { dayOfMonth: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Cargar ingreso</h1>
      <IncomeForm />

      <RecurringIncomes items={recurring} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Ingresos de este mes</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
          {incomes.map((income) => (
            <div key={income.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-gray-900">{income.description || "Ingreso"}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(income.date)}
                  {income.sourceRecurringId ? " · fijo" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-brand-primary-dark">
                  {formatCurrency(Number(income.amount))}
                </span>
                <form action={deleteIncome.bind(null, income.id)}>
                  <button type="submit" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100">
                    ✕
                  </button>
                </form>
              </div>
            </div>
          ))}
          {incomes.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no cargaste ingresos este mes.</p>
          )}
        </div>
      </section>
    </div>
  );
}
