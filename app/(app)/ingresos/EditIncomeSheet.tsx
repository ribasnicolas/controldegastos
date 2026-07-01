"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateIncome } from "@/lib/actions/incomes";
import { CategoryPicker } from "@/components/ui/CategoryPicker";
import { IconPicker } from "@/components/ui/IconPicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

type Category = { id: string; name: string; icon: string | null };
type Income = {
  id: string;
  amount: number;
  description: string | null;
  icon: string | null;
  date: Date;
  category: { id: string };
};

export function EditIncomeSheet({
  income,
  categories,
  onClose,
}: {
  income: Income;
  categories: Category[];
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(updateIncome, initialActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Ingreso actualizado");
      onClose();
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Editar ingreso</p>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 tap"
          >
            ✕
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={income.id} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categoría</p>
            <CategoryPicker categories={categories} defaultValue={income.category.id} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Ícono (opcional)</p>
            <IconPicker defaultValue={income.icon} />
          </div>
          <div>
            <label htmlFor={`edit-income-amount-${income.id}`} className="text-sm font-medium text-gray-700">
              Monto
            </label>
            <input
              id={`edit-income-amount-${income.id}`}
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              defaultValue={income.amount}
              className="w-full h-14 rounded-xl border border-gray-300 px-4 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor={`edit-income-description-${income.id}`} className="text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <input
              id={`edit-income-description-${income.id}`}
              name="description"
              type="text"
              maxLength={200}
              defaultValue={income.description ?? ""}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor={`edit-income-date-${income.id}`} className="text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              id={`edit-income-date-${income.id}`}
              name="date"
              type="date"
              defaultValue={new Date(income.date).toISOString().slice(0, 10)}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
          <SubmitButton pendingText="Guardando…">Guardar cambios</SubmitButton>
        </form>
      </div>
    </div>
  );
}
