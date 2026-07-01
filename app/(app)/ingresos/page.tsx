import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveIncomeCategories } from "@/lib/data/categories";
import { currentMonthRange } from "@/lib/dates";
import { IncomeForm } from "./IncomeForm";
import { RecurringIncomes } from "./RecurringIncomes";
import { IncomeRow } from "./IncomeRow";

export default async function IngresosPage() {
  const user = await requireUser();
  const { start, end } = currentMonthRange();

  const [categories, incomes, recurring] = await Promise.all([
    getActiveIncomeCategories(),
    prisma.income.findMany({
      where: { userId: user.id, date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
      include: { category: true },
    }),
    prisma.recurringIncome.findMany({
      where: { userId: user.id },
      orderBy: { dayOfMonth: "asc" },
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Cargar ingreso</h1>
      <IncomeForm categories={categories} />

      <RecurringIncomes
        categories={categories}
        items={recurring.map((item) => ({
          id: item.id,
          amount: Number(item.amount),
          description: item.description,
          dayOfMonth: item.dayOfMonth,
          active: item.active,
          category: { name: item.category.name, icon: item.category.icon },
        }))}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Ingresos de este mes</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
          {incomes.map((income) => (
            <IncomeRow
              key={income.id}
              categories={categories}
              income={{
                id: income.id,
                amount: Number(income.amount),
                description: income.description,
                date: income.date,
                sourceRecurringId: income.sourceRecurringId,
                category: {
                  id: income.category.id,
                  name: income.category.name,
                  icon: income.category.icon,
                },
              }}
            />
          ))}
          {incomes.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no cargaste ingresos este mes.</p>
          )}
        </div>
      </section>
    </div>
  );
}
