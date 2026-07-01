import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveCategories } from "@/lib/data/categories";
import { currentMonthRange, monthLabel, monthRange } from "@/lib/dates";
import { ExpenseForm } from "./ExpenseForm";
import { RecurringExpenses } from "./RecurringExpenses";
import { ExpenseRow } from "./ExpenseRow";
import { MonthNav } from "@/components/ui/MonthNav";

export default async function GastosPage({
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

  const [categories, expenses, recurring] = await Promise.all([
    getActiveCategories(),
    prisma.expense.findMany({
      where: { userId: user.id, date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
      include: { category: true },
    }),
    prisma.recurringExpense.findMany({
      where: { userId: user.id },
      orderBy: { dayOfMonth: "asc" },
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Gastos</h1>
      <MonthNav basePath="/gastos" year={year} month={month} />

      <ExpenseForm categories={categories} />

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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Gastos de {monthLabel(month, year).toLowerCase()}</h2>
        <div className="card-surface divide-y divide-gray-100">
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              categories={categories}
              expense={{
                id: expense.id,
                amount: Number(expense.amount),
                description: expense.description,
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
      </section>
    </div>
  );
}
