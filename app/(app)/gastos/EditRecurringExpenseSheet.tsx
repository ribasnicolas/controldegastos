"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateRecurringExpense } from "@/lib/actions/recurring";
import { CategoryPicker } from "@/components/ui/CategoryPicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

type Category = { id: string; name: string; icon: string | null };
type Recurring = {
  id: string;
  amount: number;
  description: string | null;
  dayOfMonth: number;
  category: { id: string };
};

export function EditRecurringExpenseSheet({
  item,
  categories,
  onClose,
}: {
  item: Recurring;
  categories: Category[];
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(updateRecurringExpense, initialActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Gasto fijo actualizado");
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
          <p className="text-base font-semibold text-gray-900">Editar gasto fijo</p>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 tap"
          >
            ✕
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categoría</p>
            <CategoryPicker categories={categories} defaultValue={item.category.id} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`edit-rec-amount-${item.id}`} className="text-sm font-medium text-gray-700">
                Monto
              </label>
              <input
                id={`edit-rec-amount-${item.id}`}
                name="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
                defaultValue={item.amount}
                className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label htmlFor={`edit-rec-day-${item.id}`} className="text-sm font-medium text-gray-700">
                Día del mes
              </label>
              <input
                id={`edit-rec-day-${item.id}`}
                name="dayOfMonth"
                type="number"
                min="1"
                max="28"
                required
                defaultValue={item.dayOfMonth}
                className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor={`edit-rec-description-${item.id}`} className="text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <input
              id={`edit-rec-description-${item.id}`}
              name="description"
              type="text"
              maxLength={200}
              defaultValue={item.description ?? ""}
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
