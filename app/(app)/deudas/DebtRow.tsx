"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { collectDebtInstallment, deleteDebt, undoDebtInstallmentCollection } from "@/lib/actions/debts";
import { formatCurrency } from "@/lib/format";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { initialActionState } from "@/lib/actions/types";

type Debt = {
  id: string;
  personName: string;
  amount: number;
  installments: number;
  installmentsPaid: number;
  description: string | null;
  startMonth: number;
  startYear: number;
  lastCollectedMonth: number | null;
  lastCollectedYear: number | null;
};

export function DebtRow({ debt }: { debt: Debt }) {
  const [collectState, collectAction] = useActionState(
    collectDebtInstallment.bind(null, debt.id),
    initialActionState,
  );
  const [undoState, undoAction] = useActionState(
    undoDebtInstallmentCollection.bind(null, debt.id),
    initialActionState,
  );

  useEffect(() => {
    if (collectState.success) toast.success("Cuota cobrada");
    if (collectState.error) toast.error(collectState.error);
  }, [collectState]);

  useEffect(() => {
    if (undoState.success) toast.success("Cobro deshecho");
    if (undoState.error) toast.error(undoState.error);
  }, [undoState]);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const installmentAmount = debt.amount / debt.installments;
  const isComplete = debt.installmentsPaid >= debt.installments;
  const hasStarted = year > debt.startYear || (year === debt.startYear && month >= debt.startMonth);
  const isCollectedThisMonth = debt.lastCollectedMonth === month && debt.lastCollectedYear === year;
  const canCollect = !isComplete && hasStarted && !isCollectedThisMonth;

  let status: string;
  let statusClass: string;
  if (isComplete) {
    status = "✓ Cobrada por completo";
    statusClass = "text-brand-primary-dark font-medium";
  } else if (!hasStarted) {
    status = `Empieza ${debt.startMonth}/${debt.startYear}`;
    statusClass = "text-gray-400 dark:text-gray-500";
  } else if (isCollectedThisMonth) {
    status = "✓ Cuota de este mes cobrada";
    statusClass = "text-brand-primary-dark font-medium";
  } else {
    status = "Cuota pendiente";
    statusClass = "text-brand-secondary-dark font-medium";
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-2">
      <div className="min-w-0">
        <p className={`text-sm truncate ${isComplete ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-900 dark:text-gray-100"}`}>
          {debt.personName}
          {debt.description ? ` · ${debt.description}` : ""}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {debt.installments > 1
            ? `Cuota ${Math.min(debt.installmentsPaid + 1, debt.installments)}/${debt.installments} · ${formatCurrency(installmentAmount)}`
            : formatCurrency(installmentAmount)}
          {" · "}
          <span className={statusClass}>{status}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {canCollect && (
          <form action={collectAction}>
            <button
              type="submit"
              className="h-8 px-3 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary-dark tap"
            >
              Cobrar cuota
            </button>
          </form>
        )}
        {isCollectedThisMonth && (
          <ConfirmDeleteForm
            action={undoAction}
            confirmMessage="¿Deshacer el cobro de esta cuota? Se borra el ingreso generado."
            className="h-8 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-500 tap dark:bg-gray-800 dark:text-gray-400"
          >
            Deshacer
          </ConfirmDeleteForm>
        )}
        <ConfirmDeleteForm
          action={deleteDebt.bind(null, debt.id)}
          confirmMessage="¿Eliminar esta deuda? No borra los cobros ya hechos."
        >
          ✕
        </ConfirmDeleteForm>
      </div>
    </div>
  );
}
