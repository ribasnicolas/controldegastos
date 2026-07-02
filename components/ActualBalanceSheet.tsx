"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateActualBalance } from "@/lib/actions/profile";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

export function ActualBalanceSheet({
  actualBalance,
  onClose,
}: {
  actualBalance: number | null;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(updateActualBalance, initialActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Saldo actualizado");
      onClose();
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Tu saldo real</p>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 tap"
          >
            ✕
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="actualBalance" className="text-sm font-medium text-gray-700">
              Cuánto tenés realmente
            </label>
            <input
              id="actualBalance"
              name="actualBalance"
              type="number"
              inputMode="decimal"
              step="0.01"
              required
              defaultValue={actualBalance ?? ""}
              className="w-full h-14 rounded-xl border border-gray-300 px-4 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
          <SubmitButton pendingText="Guardando…">Guardar</SubmitButton>
        </form>
      </div>
    </div>
  );
}
