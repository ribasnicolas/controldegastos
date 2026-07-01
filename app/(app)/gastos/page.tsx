import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveCategories } from "@/lib/data/categories";
import { currentMonthRange } from "@/lib/dates";
import { ExpenseForm } from "./ExpenseForm";
import { RecurringExpenses } from "./RecurringExpenses";
import { ExpenseRow } from "./ExpenseRow";

export default async function GastosPage() {
  const user = await requireUser();
  const { start, end } = currentMonthRange();

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
      <h1 className="text-xl font-bold text-gray-900">Cargar gasto</h1>
      <ExpenseForm categories={categories} />

      <RecurringExpenses
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
        <h2 className="text-sm font-semibold text-gray-700">Gastos de este mes</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
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
