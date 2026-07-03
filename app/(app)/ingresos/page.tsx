import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveIncomeCategories } from "@/lib/data/categories";
import { currentMonthRange, monthLabel, monthRange } from "@/lib/dates";
import { IncomeForm } from "./IncomeForm";
import { RecurringIncomes } from "./RecurringIncomes";
import { IncomeRow } from "./IncomeRow";
import { MonthNav } from "@/components/ui/MonthNav";
import { CollapsibleCard } from "@/components/ui/CollapsibleCard";
import { ListFilters } from "@/components/ui/ListFilters";

export default async function IngresosPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string; categoryId?: string }>;
}) {
  const user = await requireUser();
  const { y, m, categoryId } = await searchParams;
  const current = currentMonthRange();
  const year = y ? Number(y) : current.year;
  const month = m ? Number(m) : current.month;
  const { start, end } = monthRange(year, month);

  const [categories, incomes, recurring] = await Promise.all([
    getActiveIncomeCategories(),
    prisma.income.findMany({
      where: {
        userId: user.id,
        date: { gte: start, lt: end },
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { createdAt: "desc" },
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
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ingresos</h1>
      <MonthNav basePath="/ingresos" year={year} month={month} />

      <IncomeForm key={`${year}-${month}`} categories={categories} year={year} month={month} />

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

      <ListFilters
        basePath="/ingresos"
        fixedParams={{ y: String(year), m: String(month) }}
        filters={[
          {
            name: "categoryId",
            value: categoryId ?? "",
            placeholder: "Todas las categorías",
            options: categories.map((c) => ({ value: c.id, label: `${c.icon ?? ""} ${c.name}`.trim() })),
          },
        ]}
      />

      <CollapsibleCard
        title={`Ingresos de ${monthLabel(month, year).toLowerCase()}`}
        count={incomes.length}
        defaultOpen
      >
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
            <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
              Todavía no cargaste ingresos este mes.
            </p>
          )}
        </div>
      </CollapsibleCard>
    </div>
  );
}
