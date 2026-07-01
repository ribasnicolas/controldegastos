"use client";

import { useState } from "react";
import { deleteExpense } from "@/lib/actions/expenses";
import { formatCurrency, formatDate } from "@/lib/format";
import { EditExpenseSheet } from "./EditExpenseSheet";

type Category = { id: string; name: string; icon: string | null };
type Expense = {
  id: string;
  amount: number;
  description: string | null;
  date: Date;
  sourceRecurringId: string | null;
  category: { id: string; name: string; icon: string | null };
};

export function ExpenseRow({ expense, categories }: { expense: Expense; categories: Category[] }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span>{expense.category.icon}</span>
          <div className="min-w-0">
            <p className="text-sm text-gray-900 truncate">{expense.description || expense.category.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {expense.category.name} · {formatDate(expense.date)}
              {expense.sourceRecurringId ? " · fijo" : ""}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
          <form action={deleteExpense.bind(null, expense.id)}>
            <button type="submit" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100">
              ✕
            </button>
          </form>
        </div>
      </div>
      {editing && (
        <EditExpenseSheet expense={expense} categories={categories} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
