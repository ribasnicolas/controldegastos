"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { setBudget } from "@/lib/actions/budgets";
import { initialActionState } from "@/lib/actions/types";

export function BudgetRow({
  categoryId,
  name,
  icon,
  currentAmount,
}: {
  categoryId: string;
  name: string;
  icon: string | null;
  currentAmount: number;
}) {
  const [state, formAction] = useActionState(setBudget, initialActionState);

  useEffect(() => {
    if (state.success) toast.success(`Presupuesto de ${name} actualizado`);
  }, [state, name]);

  return (
    <form action={formAction} className="flex flex-col gap-1 px-4 py-3">
      <div className="flex items-center gap-3">
        <input type="hidden" name="categoryId" value={categoryId} />
        <span className="w-8 text-lg">{icon}</span>
        <span className="flex-1 text-sm text-gray-900">{name}</span>
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          defaultValue={currentAmount || undefined}
          placeholder="0"
          className="w-28 h-10 rounded-lg border border-gray-300 px-3 text-right text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <button type="submit" className="h-10 px-3 rounded-lg bg-brand-primary/10 text-brand-primary-dark text-sm font-medium">
          Guardar
        </button>
      </div>
      {state.error && <p className="text-xs text-brand-danger">{state.error}</p>}
    </form>
  );
}
