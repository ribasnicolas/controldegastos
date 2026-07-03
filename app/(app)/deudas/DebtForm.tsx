"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createDebt } from "@/lib/actions/debts";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

export function DebtForm() {
  const [state, formAction] = useActionState(createDebt, initialActionState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Deuda guardada");
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
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cargar deuda</span>
        <span className="text-sm text-brand-primary font-medium">{open ? "Cerrar" : "+ Cargar deuda"}</span>
      </button>

      {open && (
        <form
          ref={formRef}
          action={formAction}
          className="space-y-4 p-4 pt-0 border-t border-gray-100 dark:border-gray-800"
        >
          <div>
            <label htmlFor="debt-personName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quién te debe
            </label>
            <input
              id="debt-personName"
              name="personName"
              type="text"
              required
              maxLength={100}
              placeholder="Ej: Juan"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="debt-amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto
            </label>
            <input
              id="debt-amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              placeholder="0"
              className="w-full h-14 rounded-xl border border-gray-300 px-4 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="debt-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción (opcional)
            </label>
            <input
              id="debt-description"
              name="description"
              type="text"
              maxLength={200}
              placeholder="Ej: Préstamo para el viaje"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
          <SubmitButton>Guardar deuda</SubmitButton>
        </form>
      )}
    </section>
  );
}
