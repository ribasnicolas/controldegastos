"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { ActualBalanceSheet } from "./ActualBalanceSheet";

export function ActualBalanceWidget({ actualBalance }: { actualBalance: number | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-brand-primary font-medium tap"
      >
        {actualBalance !== null ? `Tu saldo: ${formatCurrency(actualBalance)}` : "Ingresar tu saldo"}
        <span className="text-gray-400 dark:text-gray-500">✏️</span>
      </button>

      {open && <ActualBalanceSheet actualBalance={actualBalance} onClose={() => setOpen(false)} />}
    </>
  );
}
