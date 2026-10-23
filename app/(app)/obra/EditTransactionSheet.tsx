"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateWorkTransaction } from "@/lib/actions/works";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";
import { defaultDateForMonth } from "@/lib/dates";

type Transaction = {
  id: string;
  kind: string;
  currency: string;
  amount: number;
  category: string | null;
  materialType: string | null;
  description: string | null;
  date: Date;
};

export function EditTransactionSheet({
  transaction,
  onClose,
  approving = false,
}: {
  transaction: Transaction;
  onClose: () => void;
  approving?: boolean;
}) {
  const [state, formAction] = useActionState(updateWorkTransaction, initialActionState);
  const [kind, setKind] = useState(transaction.kind);
  const [currency, setCurrency] = useState(transaction.currency);

  useEffect(() => {
    if (state.success) {
      toast.success(approving ? "Gasto aprobado" : "Movimiento actualizado");
      onClose();
    }
  }, [state, onClose, approving]);

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">{approving ? "Aprobar gasto" : "Editar movimiento"}</p>
          <button type="button" onClick={onClose} className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 tap">
            ✕
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={transaction.id} />
          {approving && <input type="hidden" name="approve" value="true" />}
          {approving && (
            <p className="text-sm text-gray-500">Revisá el monto y la fecha finales. Al aprobarlo se suma a los gastos de la obra.</p>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              disabled={approving}
              className="w-full h-12 rounded-xl border px-4"
            >
              <option value="EXPENSE">Gasto</option>
              <option value="INCOME">Ingreso</option>
            </select>
            {approving && <input type="hidden" name="kind" value={kind} />}
          </div>

          {kind === "EXPENSE" && (
            <div>
              <label className="text-sm font-medium text-gray-700">Categoría</label>
              <select name="category" defaultValue={transaction.category ?? "MATERIALS"} className="w-full h-12 rounded-xl border px-4">
                <option value="LABOR">Mano de obra</option>
                <option value="MATERIALS">Materiales</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Moneda</label>
            <select name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-12 rounded-xl border px-4">
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Monto</label>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              defaultValue={transaction.amount}
              className="w-full h-12 rounded-xl border px-4"
            />
          </div>

          {currency === "USD" && (
            <div>
              <label className="text-sm font-medium text-gray-700">Cotización (ARS por USD)</label>
              <input name="cotizacion" type="number" inputMode="decimal" step="0.01" min="0" className="w-full h-12 rounded-xl border px-4" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Detalle (opcional)</label>
            <input name="materialType" defaultValue={transaction.materialType ?? ""} className="w-full h-12 rounded-xl border px-4" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Descripción (opcional)</label>
            <input name="description" defaultValue={transaction.description ?? ""} className="w-full h-12 rounded-xl border px-4" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Fecha</label>
            <input
              name="date"
              type="date"
              defaultValue={
                approving
                  ? defaultDateForMonth(new Date().getFullYear(), new Date().getMonth() + 1)
                  : new Date(transaction.date).toISOString().slice(0, 10)
              }
              className="w-full h-12 rounded-xl border px-4"
            />
          </div>

          {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
          <SubmitButton pendingText="Guardando…">{approving ? "Aprobar y sumar a gastos" : "Guardar cambios"}</SubmitButton>
        </form>
      </div>
    </div>
  );
}
