"use client";

import { useState } from "react";
import { DebtForm } from "./DebtForm";
import { DebtRow } from "./DebtRow";
import { LiabilityForm } from "./LiabilityForm";
import { LiabilityRow } from "./LiabilityRow";
import { formatCurrency } from "@/lib/format";

type Debt = {
  id: string;
  personName: string;
  amount: number;
  description: string | null;
  settled: boolean;
  date: Date;
};

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

export function DeudasTabs({
  debts,
  totalPending,
  liabilities,
  totalOwed,
}: {
  debts: Debt[];
  totalPending: number;
  liabilities: Liability[];
  totalOwed: number;
}) {
  const [tab, setTab] = useState<"me-deben" | "debo">("me-deben");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setTab("me-deben")}
          className={`flex-1 h-10 rounded-lg text-sm font-semibold tap ${
            tab === "me-deben" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Me deben
        </button>
        <button
          type="button"
          onClick={() => setTab("debo")}
          className={`flex-1 h-10 rounded-lg text-sm font-semibold tap ${
            tab === "debo" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Debo
        </button>
      </div>

      {tab === "me-deben" ? (
        <div className="space-y-6">
          <div className="card-surface p-5">
            <p className="text-sm text-gray-600">Total pendiente de cobro</p>
            <p className="text-3xl font-bold text-brand-primary-dark">{formatCurrency(totalPending)}</p>
          </div>

          <DebtForm />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Deudas</h2>
            <div className="card-surface divide-y divide-gray-100">
              {debts.map((debt) => (
                <DebtRow key={debt.id} debt={debt} />
              ))}
              {debts.length === 0 && (
                <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no anotaste ninguna deuda.</p>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card-surface p-5">
            <p className="text-sm text-gray-600">Total pendiente de pago</p>
            <p className="text-3xl font-bold text-brand-danger">{formatCurrency(totalOwed)}</p>
          </div>

          <LiabilityForm />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Deudas</h2>
            <div className="card-surface divide-y divide-gray-100">
              {liabilities.map((liability) => (
                <LiabilityRow key={liability.id} liability={liability} />
              ))}
              {liabilities.length === 0 && (
                <p className="px-4 py-6 text-sm text-gray-500 text-center">Todavía no registraste ninguna deuda.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
