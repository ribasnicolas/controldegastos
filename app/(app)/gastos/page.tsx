import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveCategories } from "@/lib/data/categories";
import { currentMonthRange, monthLabel, monthRange } from "@/lib/dates";
import { ExpenseForm } from "./ExpenseForm";
import { RecurringExpenses } from "./RecurringExpenses";
import { ExpenseRow } from "./ExpenseRow";
import { MonthNav } from "@/components/ui/MonthNav";
import { CollapsibleCard } from "@/components/ui/CollapsibleCard";

export default async function GastosPage({
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

  const [categories, expenses, recurring] = await Promise.all([
    getActiveCategories(),
    prisma.expense.findMany({
      where: {
        userId: user.id,
        date: { gte: start, lt: end },
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { date: "desc" },
      include: { category: true },
    }),
    prisma.recurringExpense.findMany({
      where: { userId: user.id },
      orderBy: { dayOfMonth: "asc" },
      include: { category: true },
    }),
  ]);

  const filteredCategory = categoryId ? categories.find((c) => c.id === categoryId) : undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Gastos</h1>
      <MonthNav basePath="/gastos" year={year} month={month} />

      <ExpenseForm key={`${year}-${month}`} categories={categories} year={year} month={month} />

      <RecurringExpenses
        categories={categories}
        items={recurring.map((item) => ({
          id: item.id,
          amount: Number(item.amount),
          description: item.description,
          dayOfMonth: item.dayOfMonth,
          active: item.active,
          lastGeneratedMonth: item.lastGeneratedMonth,
          lastGeneratedYear: item.lastGeneratedYear,
          category: { id: item.category.id, name: item.category.name, icon: item.category.icon },
        }))}
      />

      <div className="space-y-3">
        {filteredCategory && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-brand-primary/10 text-brand-primary-dark text-sm font-medium">
              {filteredCategory.icon} {filteredCategory.name}
            </span>
            <Link href={`/gastos?y=${year}&m=${month}`} className="text-sm text-gray-500 tap">
              ✕ Quitar filtro
            </Link>
          </div>
        )}

        <CollapsibleCard
          title={`Gastos de ${monthLabel(month, year).toLowerCase()}`}
          count={expenses.length}
          defaultOpen
        >
          <div className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                categories={categories}
                expense={{
                  id: expense.id,
                  amount: Number(expense.amount),
                  description: expense.description,
                  icon: expense.icon,
                  date: expense.date,
                  sourceRecurringId: expense.sourceRecurringId,
                  category: {
                    id: expense.category.id,
                    name: expense.category.name,
                    icon: expense.category.icon,
                  },
                }}
              />
            ))}
            {expenses.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no cargaste gastos este mes.</p>
            )}
          </div>
        </CollapsibleCard>
      </div>
    </div>
  );
}
