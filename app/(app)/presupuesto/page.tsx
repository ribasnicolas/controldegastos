import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveCategories } from "@/lib/data/categories";
import { currentMonthRange, monthLabel } from "@/lib/dates";
import { BudgetRow } from "./BudgetRow";

export default async function PresupuestoPage() {
  const user = await requireUser();
  const { month, year } = currentMonthRange();

  const [categories, budgets] = await Promise.all([
    getActiveCategories(),
    prisma.budget.findMany({ where: { userId: user.id, month, year } }),
  ]);

  const budgetByCategory = new Map(budgets.map((b) => [b.categoryId, Number(b.amount)]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Presupuesto</h1>
        <p className="text-sm text-gray-500">{monthLabel(month, year)} · definí cuánto querés gastar por categoría</p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
        {categories.map((category) => (
          <BudgetRow
            key={category.id}
            categoryId={category.id}
            name={category.name}
            icon={category.icon}
            currentAmount={budgetByCategory.get(category.id) ?? 0}
          />
        ))}
        {categories.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500 text-center">No hay categorías activas todavía.</p>
        )}
      </div>
    </div>
  );
}
