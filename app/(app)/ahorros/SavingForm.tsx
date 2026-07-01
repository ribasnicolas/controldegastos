"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createSavingEntry } from "@/lib/actions/savings";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

export function SavingForm() {
  const [state, formAction] = useActionState(createSavingEntry, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Movimiento guardado");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl bg-white border border-gray-200 p-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Tipo</p>
        <SegmentedToggle
          name="type"
          defaultValue="DEPOSIT"
          options={[
            { value: "DEPOSIT", label: "Aporte" },
            { value: "WITHDRAWAL", label: "Retiro" },
          ]}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Moneda</p>
        <SegmentedToggle
          name="currency"
          defaultValue="ARS"
          options={[
            { value: "ARS", label: "Pesos (ARS)" },
            { value: "USD", label: "Dólares (USD)" },
          ]}
        />
      </div>
      <div>
        <label htmlFor="saving-amount" className="text-sm font-medium text-gray-700">
          Monto
        </label>
        <input
          id="saving-amount"
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
        <label htmlFor="saving-description" className="text-sm font-medium text-gray-700">
          Descripción (opcional)
        </label>
        <input
          id="saving-description"
          name="description"
          type="text"
          maxLength={200}
          placeholder="Ej: Plazo fijo"
          className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
      <SubmitButton>Guardar movimiento</SubmitButton>
    </form>
  );
}
