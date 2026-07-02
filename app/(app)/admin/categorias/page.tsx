import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "./CategoryForm";
import { CategoryRow } from "./CategoryRow";

function CategoryList({ categories }: { categories: { id: string; name: string; icon: string | null; active: boolean }[] }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} />
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
