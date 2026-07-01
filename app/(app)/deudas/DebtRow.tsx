"use client";

import { toggleDebtSettled, deleteDebt } from "@/lib/actions/debts";
import { formatCurrency, formatDate } from "@/lib/format";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";

type Debt = {
  id: string;
  personName: string;
  amount: number;
  description: string | null;
  settled: boolean;
  date: Date;
};

export function DebtRow({ debt }: { debt: Debt }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-2">
      <div className="min-w-0">
        <p className={`text-sm text-gray-900 truncate ${debt.settled ? "line-through text-gray-400" : ""}`}>
          {debt.personName}
          {debt.description ? ` · ${debt.description}` : ""}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {formatDate(debt.date)}
          {debt.settled && <span className="text-brand-primary-dark font-medium"> · ✓ Cobrado</span>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-sm font-semibold ${debt.settled ? "text-gray-400 line-through" : "text-gray-900"}`}>
          {formatCurrency(debt.amount)}
        </span>
        <form action={toggleDebtSettled.bind(null, debt.id)}>
          <button
            type="submit"
            className={`h-8 px-3 rounded-full text-xs font-medium tap ${
              debt.settled ? "bg-gray-100 text-gray-500" : "bg-brand-primary/10 text-brand-primary-dark"
            }`}
          >
            {debt.settled ? "Cobrado" : "Marcar cobrado"}
          </button>
        </form>
        <ConfirmDeleteForm action={deleteDebt.bind(null, debt.id)} confirmMessage="¿Eliminar esta deuda?">
          ✕
        </ConfirmDeleteForm>
      </div>
    </div>
  );
}
