"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createIncome } from "@/lib/actions/incomes";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

export function IncomeForm() {
  const [state, formAction] = useActionState(createIncome, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Ingreso guardado");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl bg-white border border-gray-200 p-4">
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
  );
}
