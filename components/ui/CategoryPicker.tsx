type Category = { id: string; name: string; icon: string | null };

export function CategoryPicker({ categories, defaultValue }: { categories: Category[]; defaultValue?: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Categoría">
      {categories.map((category) => (
        <label key={category.id} className="cursor-pointer">
          <input
            type="radio"
            name="categoryId"
            value={category.id}
            defaultChecked={category.id === defaultValue}
            required
            className="peer sr-only"
          />
          <span className="block h-11 leading-[2.75rem] px-4 rounded-full text-sm font-medium transition-colors border bg-brand-primary/5 text-gray-700 border-transparent hover:bg-brand-primary/10 peer-checked:bg-brand-primary peer-checked:text-white peer-checked:border-brand-primary">
            {category.icon ? `${category.icon} ` : ""}
            {category.name}
          </span>
        </label>
      ))}
      {categories.length === 0 && (
        <p className="text-sm text-gray-500">
          Todavía no hay categorías. Pedile a un administrador que cree alguna.
        </p>
      )}
    </div>
  );
}
