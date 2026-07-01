"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateExpense } from "@/lib/actions/expenses";
import { CategoryPicker } from "@/components/ui/CategoryPicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

type Category = { id: string; name: string; icon: string | null };
type Expense = {
  id: string;
  amount: number;
  description: string | null;
  date: Date;
  category: { id: string };
};

export function EditExpenseSheet({
  expense,
  categories,
  onClose,
}: {
  expense: Expense;
  categories: Category[];
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(updateExpense, initialActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Gasto actualizado");
      onClose();
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-white rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Editar gasto</p>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={expense.id} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categoría</p>
            <CategoryPicker categories={categories} defaultValue={expense.category.id} />
          </div>
          <div>
            <label htmlFor={`edit-amount-${expense.id}`} className="text-sm font-medium text-gray-700">
              Monto
            </label>
            <input
              id={`edit-amount-${expense.id}`}
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              defaultValue={expense.amount}
              className="w-full h-14 rounded-xl border border-gray-300 px-4 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor={`edit-description-${expense.id}`} className="text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <input
              id={`edit-description-${expense.id}`}
              name="description"
              type="text"
              maxLength={200}
              defaultValue={expense.description ?? ""}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor={`edit-date-${expense.id}`} className="text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              id={`edit-date-${expense.id}`}
              name="date"
              type="date"
              defaultValue={new Date(expense.date).toISOString().slice(0, 10)}
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
