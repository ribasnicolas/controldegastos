"use client";

import { useRouter } from "next/navigation";

type FilterOption = { value: string; label: string };
type FilterDef = { name: string; value: string; placeholder: string; options: FilterOption[] };

export function ListFilters({
  basePath,
  fixedParams,
  filters,
}: {
  basePath: string;
  fixedParams: Record<string, string>;
  filters: FilterDef[];
}) {
  const router = useRouter();

  function handleChange(name: string, value: string) {
    const params = new URLSearchParams(fixedParams);
    for (const filter of filters) {
      const v = filter.name === name ? value : filter.value;
      if (v) params.set(filter.name, v);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <select
          key={filter.name}
          value={filter.value}
          onChange={(e) => handleChange(filter.name, e.target.value)}
          className="h-9 flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="">{filter.placeholder}</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
