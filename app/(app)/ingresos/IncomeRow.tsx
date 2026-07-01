"use client";

import { useState } from "react";
import { deleteIncome } from "@/lib/actions/incomes";
import { formatCurrency, formatDate } from "@/lib/format";
import { EditIncomeSheet } from "./EditIncomeSheet";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";

type Category = { id: string; name: string; icon: string | null };
type Income = {
  id: string;
  amount: number;
  description: string | null;
  date: Date;
  sourceRecurringId: string | null;
  category: { id: string; name: string; icon: string | null };
};

export function IncomeRow({ income, categories }: { income: Income; categories: Category[] }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span>{income.category.icon}</span>
          <div className="min-w-0">
            <p className="text-sm text-gray-900 truncate">{income.description || income.category.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {income.category.name} · {formatDate(income.date)}
              {income.sourceRecurringId ? " · fijo" : ""}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold text-brand-primary-dark">{formatCurrency(income.amount)}</span>
          <ConfirmDeleteForm
            action={deleteIncome.bind(null, income.id)}
            confirmMessage="¿Eliminar este ingreso?"
          >
            ✕
          </ConfirmDeleteForm>
        </div>
      </div>
      {editing && (
        <EditIncomeSheet income={income} categories={categories} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
