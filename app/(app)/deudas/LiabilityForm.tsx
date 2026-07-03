"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createLiability } from "@/lib/actions/liabilities";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

export function LiabilityForm() {
  const [state, formAction] = useActionState(createLiability, initialActionState);
  const [open, setOpen] = useState(false);
  const [installments, setInstallments] = useState(1);
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
        <form ref={formRef} action={formAction} className="space-y-4 p-4 pt-0 border-t border-gray-100 dark:border-gray-800">
          <div>
            <label htmlFor="liability-personName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              A quién le debés
            </label>
            <input
              id="liability-personName"
              name="personName"
              type="text"
              required
              maxLength={100}
              placeholder="Ej: Juan"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="liability-totalAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto total
            </label>
            <input
              id="liability-totalAmount"
              name="totalAmount"
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
            <label htmlFor="liability-installments" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cantidad de cuotas
            </label>
            <input
              id="liability-installments"
              name="installments"
              type="number"
              min="1"
              max="60"
              required
              defaultValue={1}
              onChange={(e) => setInstallments(Number(e.target.value) || 1)}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
            {installments > 1 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                La primera cuota se paga el mes que viene.
              </p>
            )}
          </div>
          {installments === 1 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">¿Cuándo se paga?</p>
              <SegmentedToggle
                name="startWhen"
                defaultValue="this-month"
                options={[
                  { value: "this-month", label: "Este mes" },
                  { value: "next-month", label: "El mes que viene" },
                ]}
              />
            </div>
          )}
          <div>
            <label htmlFor="liability-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción (opcional)
            </label>
            <input
              id="liability-description"
              name="description"
              type="text"
              maxLength={200}
              placeholder="Ej: Préstamo del auto"
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
