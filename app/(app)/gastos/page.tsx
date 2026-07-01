import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveCategories } from "@/lib/data/categories";
import { currentMonthRange } from "@/lib/dates";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteExpense } from "@/lib/actions/expenses";
import { ExpenseForm } from "./ExpenseForm";
import { RecurringExpenses } from "./RecurringExpenses";

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

      <RecurringExpenses categories={categories} items={recurring} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Gastos de este mes</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span>{expense.category.icon}</span>
                <div>
                  <p className="text-sm text-gray-900">{expense.description || expense.category.name}</p>
                  <p className="text-xs text-gray-500">
                    {expense.category.name} · {formatDate(expense.date)}
                    {expense.sourceRecurringId ? " · fijo" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(Number(expense.amount))}</span>
                <form action={deleteExpense.bind(null, expense.id)}>
                  <button type="submit" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100">
                    ✕
                  </button>
                </form>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no cargaste gastos este mes.</p>
          )}
        </div>
      </section>
    </div>
  );
}
