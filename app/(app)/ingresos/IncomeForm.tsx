"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createIncome } from "@/lib/actions/incomes";
import { CategoryPicker } from "@/components/ui/CategoryPicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

type Category = { id: string; name: string; icon: string | null };

export function IncomeForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(createIncome, initialActionState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Ingreso guardado");
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
        <span className="text-sm font-semibold text-gray-700">Cargar ingreso</span>
        <span className="text-sm text-brand-primary font-medium">{open ? "Cerrar" : "+ Cargar ingreso"}</span>
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
              placeholder="Ej: Sueldo"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
          <SubmitButton>Guardar ingreso</SubmitButton>
        </form>
      )}
    </section>
  );
}
