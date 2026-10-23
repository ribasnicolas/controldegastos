"use client";

import { useState } from "react";
import { deleteWorkTransaction } from "@/lib/actions/works";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { EditTransactionSheet } from "./EditTransactionSheet";

type Transaction = {
  id: string;
  kind: string;
  currency: string;
  amount: number;
  amountArs: number | null;
  category: string | null;
  materialType: string | null;
  description: string | null;
  date: Date;
  status: string;
};

export function WorkTransactionRow({ transaction }: { transaction: Transaction }) {
  const [editing, setEditing] = useState(false);
  const [approving, setApproving] = useState(false);
  const pending = transaction.status === "PENDING";

  return (
    <li className="p-2 border rounded-lg flex justify-between items-center gap-2">
      <button type="button" onClick={() => setEditing(true)} className="flex-1 min-w-0 text-left tap">
        <div className="font-medium truncate">{transaction.description ?? transaction.materialType ?? transaction.kind}</div>
        <div className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</div>
      </button>
      <div className="text-right shrink-0">
        <div className="font-medium">
          {transaction.currency} {transaction.amount.toFixed(2)}
        </div>
        {transaction.amountArs != null && (
          <div className="text-sm text-gray-500">(~ARS {transaction.amountArs.toFixed(2)})</div>
        )}
      </div>
      {pending && (
        <button
          type="button"
          onClick={() => setApproving(true)}
          className="shrink-0 h-8 px-3 rounded-full bg-brand-primary text-white text-sm tap"
        >
          Aprobar
        </button>
      )}
      <ConfirmDeleteForm
        action={deleteWorkTransaction.bind(null, transaction.id)}
        confirmMessage="¿Eliminar este movimiento?"
      >
        ✕
      </ConfirmDeleteForm>
      {editing && <EditTransactionSheet transaction={transaction} onClose={() => setEditing(false)} />}
      {approving && <EditTransactionSheet transaction={transaction} approving onClose={() => setApproving(false)} />}
    </li>
  );
}
