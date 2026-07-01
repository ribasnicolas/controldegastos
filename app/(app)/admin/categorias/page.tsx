import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { toggleCategoryActive } from "@/lib/actions/categories";
import { CategoryForm } from "./CategoryForm";

function CategoryList({ categories }: { categories: { id: string; name: string; icon: string | null; active: boolean }[] }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-900">
            {category.icon} {category.name}
          </span>
          <form action={toggleCategoryActive.bind(null, category.id)}>
            <button
              type="submit"
              className={`h-9 px-3 rounded-lg text-xs font-medium ${
                category.active ? "bg-brand-primary/10 text-brand-primary-dark" : "bg-gray-100 text-gray-500"
              }`}
            >
              {category.active ? "Activa" : "Inactiva"}
            </button>
          </form>
        </div>
      ))}
      {categories.length === 0 && (
        <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no hay categorías.</p>
      )}
    </div>
  );
}

export default async function AdminCategoriasPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
      <CategoryForm />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Gastos</h2>
        <CategoryList categories={expenseCategories} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Ingresos</h2>
        <CategoryList categories={incomeCategories} />
      </section>
    </div>
  );
}
