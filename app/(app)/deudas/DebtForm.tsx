"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createDebt } from "@/lib/actions/debts";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

export function DebtForm() {
  const [state, formAction] = useActionState(createDebt, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Deuda guardada");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 card-surface p-4">
      <div>
        <label htmlFor="debt-personName" className="text-sm font-medium text-gray-700">
          Quién te debe
        </label>
        <input
          id="debt-personName"
          name="personName"
          type="text"
          required
          maxLength={100}
          placeholder="Ej: Juan"
          className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label htmlFor="debt-amount" className="text-sm font-medium text-gray-700">
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
          className="w-full h-14 rounded-xl border border-gray-300 px-4 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label htmlFor="debt-description" className="text-sm font-medium text-gray-700">
          Descripción (opcional)
        </label>
        <input
          id="debt-description"
          name="description"
          type="text"
          maxLength={200}
          placeholder="Ej: Préstamo para el viaje"
          className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
      <SubmitButton>Guardar deuda</SubmitButton>
    </form>
  );
}
