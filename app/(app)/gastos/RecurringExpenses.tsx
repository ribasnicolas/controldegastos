"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  confirmRecurringExpensePayment,
  createRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
} from "@/lib/actions/recurring";
import { CategoryPicker } from "@/components/ui/CategoryPicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { EditRecurringExpenseSheet } from "./EditRecurringExpenseSheet";
import { formatCurrency } from "@/lib/format";
import { initialActionState } from "@/lib/actions/types";

type Category = { id: string; name: string; icon: string | null };
type Recurring = {
  id: string;
  amount: number;
  description: string | null;
  dayOfMonth: number;
  active: boolean;
  lastGeneratedMonth: number | null;
  lastGeneratedYear: number | null;
  category: { id: string; name: string; icon: string | null };
};

export function RecurringExpenses({ categories, items }: { categories: Category[]; items: Recurring[] }) {
  const [state, formAction] = useActionState(createRecurringExpense, initialActionState);
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Recurring | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Gasto fijo creado");
      formRef.current?.reset();
    }
  }, [state]);

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return (
    <section className="card-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left tap"
      >
        <span className="text-sm font-semibold text-gray-700">
          Gastos fijos (recurrentes){items.length > 0 ? ` · ${items.length}` : ""}
        </span>
        <span className="text-sm text-brand-primary font-medium">{open ? "Cerrar" : "Ver"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {items.length > 0 && (
            <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {items.map((item) => {
                const isDue = item.active && item.dayOfMonth <= day;
                const isConfirmed = item.lastGeneratedMonth === month && item.lastGeneratedYear === year;
                const pending = isDue && !isConfirmed;
                return (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      className="flex-1 min-w-0 text-left tap"
                    >
                      <p className="text-sm text-gray-900 truncate">
                        {item.category.icon} {item.description || item.category.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Día {item.dayOfMonth} · {formatCurrency(Number(item.amount))}
                        {pending && <span className="text-brand-secondary-dark font-medium"> · Pendiente de pago</span>}
                        {isDue && isConfirmed && <span className="text-brand-primary-dark font-medium"> · Pagado este mes</span>}
                      </p>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      {pending && (
                        <form action={confirmRecurringExpensePayment.bind(null, item.id)}>
                          <button
                            type="submit"
                            className="h-8 px-3 rounded-full text-xs font-medium bg-brand-secondary/15 text-brand-secondary-dark tap"
                          >
                            Marcar pagado
                          </button>
                        </form>
                      )}
                      <form action={toggleRecurringExpense.bind(null, item.id)}>
                        <button
                          type="submit"
                          className={`h-8 px-3 rounded-full text-xs font-medium tap ${
                            item.active ? "bg-brand-primary/10 text-brand-primary-dark" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {item.active ? "Activo" : "Pausado"}
                        </button>
                      </form>
                      <ConfirmDeleteForm
                        action={deleteRecurringExpense.bind(null, item.id)}
                        confirmMessage="¿Eliminar este gasto fijo?"
                      >
                        ✕
                      </ConfirmDeleteForm>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              className="text-sm text-brand-primary font-medium tap"
            >
              {addOpen ? "Cerrar" : "+ Gasto fijo"}
            </button>
          </div>

          {addOpen && (
            <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-gray-100 p-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Categoría</p>
                <CategoryPicker categories={categories} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="rec-amount" className="text-sm font-medium text-gray-700">
                    Monto
                  </label>
                  <input
                    id="rec-amount"
                    name="amount"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    required
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label htmlFor="rec-day" className="text-sm font-medium text-gray-700">
                    Día del mes
                  </label>
                  <input
                    id="rec-day"
                    name="dayOfMonth"
                    type="number"
                    min="1"
                    max="28"
                    required
                    defaultValue={1}
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="rec-description" className="text-sm font-medium text-gray-700">
                  Descripción (opcional)
                </label>
                <input
                  id="rec-description"
                  name="description"
                  type="text"
                  maxLength={200}
                  placeholder="Ej: Alquiler"
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
              <SubmitButton>Crear gasto fijo</SubmitButton>
            </form>
          )}
        </div>
      )}

      {editing && (
        <EditRecurringExpenseSheet item={editing} categories={categories} onClose={() => setEditing(null)} />
      )}
    </section>
  );
}
