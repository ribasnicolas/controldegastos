"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createWorkTransaction } from "@/lib/actions/works";
import { initialActionState } from "@/lib/actions/types";

export function TransactionForm({ workId }: { workId: string }) {
  const [state, formAction] = useActionState(createWorkTransaction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState("EXPENSE");
  const [currency, setCurrency] = useState("ARS");

  useEffect(() => {
    if (state.success) {
      toast.success("Movimiento guardado");
      formRef.current?.reset();
      setKind("EXPENSE");
      setCurrency("ARS");
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <section className="card-surface">
      <form
        ref={formRef}
        action={formAction}
        className="space-y-4 p-4"
      >
        <input type="hidden" name="workId" value={workId} />
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
          <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)} className="w-full h-12 rounded-xl border px-4">
            <option value="EXPENSE">Gasto</option>
            <option value="INCOME">Ingreso</option>
          </select>
        </div>

        {kind === "EXPENSE" && (
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
            <select name="category" defaultValue="MATERIALS" className="w-full h-12 rounded-xl border px-4">
              <option value="LABOR">Mano de obra</option>
              <option value="MATERIALS">Materiales</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Moneda</label>
          <select name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-12 rounded-xl border px-4">
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
          <input name="amount" type="number" inputMode="decimal" step="0.01" min="0" required className="w-full h-12 rounded-xl border px-4" />
        </div>

        {currency === "USD" && (
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cotización (ARS por USD)</label>
            <input name="cotizacion" type="number" inputMode="decimal" step="0.01" min="0" className="w-full h-12 rounded-xl border px-4" />
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Detalle (opcional)</label>
          <input name="materialType" placeholder="Ej: cemento, albañil Juan" className="w-full h-12 rounded-xl border px-4" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción (opcional)</label>
          <input name="description" className="w-full h-12 rounded-xl border px-4" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
          <input name="date" type="date" className="w-full h-12 rounded-xl border px-4" />
        </div>

        {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
        <button className="w-full h-12 rounded-xl bg-brand-primary text-white">Guardar movimiento</button>
      </form>
    </section>
  );
}
