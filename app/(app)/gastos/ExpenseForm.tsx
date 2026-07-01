"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createExpense } from "@/lib/actions/expenses";
import { CategoryPicker } from "@/components/ui/CategoryPicker";
import { IconPicker } from "@/components/ui/IconPicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";
import { defaultDateForMonth, monthLabel } from "@/lib/dates";

type Category = { id: string; name: string; icon: string | null };

export function ExpenseForm({ categories, year, month }: { categories: Category[]; year: number; month: number }) {
  const [state, formAction] = useActionState(createExpense, initialActionState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  useEffect(() => {
    if (state.success) {
      toast.success("Gasto guardado");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <section className="card-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left tap"
      >
        <span className="text-sm font-semibold text-gray-700">
          {isCurrentMonth ? "Cargar gasto" : `Cargar gasto de ${monthLabel(month, year).toLowerCase()}`}
        </span>
        <span className="text-sm text-brand-primary font-medium">{open ? "Cerrar" : "+ Cargar gasto"}</span>
      </button>

      {open && (
        <form
          ref={formRef}
          action={formAction}
          className="space-y-4 p-4 pt-0 border-t border-gray-100"
        >
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categoría</p>
            <CategoryPicker categories={categories} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Ícono (opcional)</p>
            <IconPicker />
          </div>
          <div>
            <label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Monto
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              placeholder="0"
              className="w-full h-14 rounded-xl border border-gray-300 px-4 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <input
              id="description"
              name="description"
              type="text"
              maxLength={200}
              placeholder="Ej: Supermercado"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDateForMonth(year, month)}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
          <SubmitButton>Guardar gasto</SubmitButton>
        </form>
      )}
    </section>
  );
}
