import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveIncomeCategories } from "@/lib/data/categories";
import { currentMonthRange, monthLabel, monthRange } from "@/lib/dates";
import { IncomeForm } from "./IncomeForm";
import { RecurringIncomes } from "./RecurringIncomes";
import { IncomeRow } from "./IncomeRow";
import { MonthNav } from "@/components/ui/MonthNav";
import { CollapsibleCard } from "@/components/ui/CollapsibleCard";

export default async function IngresosPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const user = await requireUser();
  const { y, m } = await searchParams;
  const current = currentMonthRange();
  const year = y ? Number(y) : current.year;
  const month = m ? Number(m) : current.month;
  const { start, end } = monthRange(year, month);

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
      <h1 className="text-xl font-bold text-gray-900">Ingresos</h1>
      <MonthNav basePath="/ingresos" year={year} month={month} />

      <IncomeForm categories={categories} />

      <RecurringIncomes
        categories={categories}
        items={recurring.map((item) => ({
          id: item.id,
          amount: Number(item.amount),
          description: item.description,
          dayOfMonth: item.dayOfMonth,
          active: item.active,
          category: { id: item.category.id, name: item.category.name, icon: item.category.icon },
        }))}
      />

      <CollapsibleCard
        title={`Ingresos de ${monthLabel(month, year).toLowerCase()}`}
        count={incomes.length}
        defaultOpen
      >
        <div className="divide-y divide-gray-100">
          {incomes.map((income) => (
            <IncomeRow
              key={income.id}
              categories={categories}
              income={{
                id: income.id,
                amount: Number(income.amount),
                description: income.description,
                icon: income.icon,
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
      </CollapsibleCard>
    </div>
  );
}
