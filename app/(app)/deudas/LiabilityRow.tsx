"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { deleteLiability, payLiabilityInstallment, undoLiabilityPayment } from "@/lib/actions/liabilities";
import { formatCurrency } from "@/lib/format";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { initialActionState } from "@/lib/actions/types";

type Liability = {
  id: string;
  personName: string;
  totalAmount: number;
  installments: number;
  installmentsPaid: number;
  description: string | null;
  startMonth: number;
  startYear: number;
  lastPaidMonth: number | null;
  lastPaidYear: number | null;
};

export function LiabilityRow({ liability }: { liability: Liability }) {
  const [payState, payAction] = useActionState(
    payLiabilityInstallment.bind(null, liability.id),
    initialActionState,
  );
  const [undoState, undoAction] = useActionState(
    undoLiabilityPayment.bind(null, liability.id),
    initialActionState,
  );

  useEffect(() => {
    if (payState.success) toast.success("Cuota pagada");
    if (payState.error) toast.error(payState.error);
  }, [payState]);

  useEffect(() => {
    if (undoState.success) toast.success("Pago deshecho");
    if (undoState.error) toast.error(undoState.error);
  }, [undoState]);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const installmentAmount = liability.totalAmount / liability.installments;
  const isComplete = liability.installmentsPaid >= liability.installments;
  const hasStarted = year > liability.startYear || (year === liability.startYear && month >= liability.startMonth);
  const isPaidThisMonth = liability.lastPaidMonth === month && liability.lastPaidYear === year;
  const canPay = !isComplete && hasStarted && !isPaidThisMonth;

  let status: string;
  let statusClass: string;
  if (isComplete) {
    status = "✓ Pagada por completo";
    statusClass = "text-brand-primary-dark font-medium";
  } else if (!hasStarted) {
    status = `Empieza ${liability.startMonth}/${liability.startYear}`;
    statusClass = "text-gray-400";
  } else if (isPaidThisMonth) {
    status = "✓ Cuota de este mes pagada";
    statusClass = "text-brand-primary-dark font-medium";
  } else {
    status = "Cuota pendiente";
    statusClass = "text-brand-secondary-dark font-medium";
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-2">
      <div className="min-w-0">
        <p className="text-sm text-gray-900 truncate">
          {liability.personName}
          {liability.description ? ` · ${liability.description}` : ""}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {liability.installments > 1
            ? `Cuota ${Math.min(liability.installmentsPaid + 1, liability.installments)}/${liability.installments} · ${formatCurrency(installmentAmount)}`
            : formatCurrency(installmentAmount)}
          {" · "}
          <span className={statusClass}>{status}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {canPay && (
          <form action={payAction}>
            <button
              type="submit"
              className="h-8 px-3 rounded-full text-xs font-medium bg-brand-secondary/15 text-brand-secondary-dark tap"
            >
              Pagar cuota
            </button>
          </form>
        )}
        {isPaidThisMonth && (
          <ConfirmDeleteForm
            action={undoAction}
            confirmMessage="¿Deshacer el pago de esta cuota? Se borra el gasto generado."
            className="h-8 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-500 tap"
          >
            Deshacer
          </ConfirmDeleteForm>
        )}
        <ConfirmDeleteForm
          action={deleteLiability.bind(null, liability.id)}
          confirmMessage="¿Eliminar esta deuda? No borra los pagos ya hechos."
        >
          ✕
        </ConfirmDeleteForm>
      </div>
    </div>
  );
}
