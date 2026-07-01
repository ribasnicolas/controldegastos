"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createRecurringIncome,
  deleteRecurringIncome,
  toggleRecurringIncome,
} from "@/lib/actions/recurring";
import { CategoryPicker } from "@/components/ui/CategoryPicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { formatCurrency } from "@/lib/format";
import { initialActionState } from "@/lib/actions/types";

type Category = { id: string; name: string; icon: string | null };
type Recurring = {
  id: string;
  amount: number;
  description: string | null;
  dayOfMonth: number;
  active: boolean;
  category: { name: string; icon: string | null };
};

export function RecurringIncomes({ categories, items }: { categories: Category[]; items: Recurring[] }) {
  const [state, formAction] = useActionState(createRecurringIncome, initialActionState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Ingreso fijo creado");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Ingresos fijos (recurrentes)</h2>
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-sm text-brand-primary font-medium">
          {open ? "Cerrar" : "+ Ingreso fijo"}
        </button>
      </div>

      {items.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-gray-900">
                  {item.category.icon} {item.description || item.category.name}
                </p>
                <p className="text-xs text-gray-500">
                  Día {item.dayOfMonth} · {formatCurrency(Number(item.amount))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleRecurringIncome.bind(null, item.id)}>
                  <button
                    type="submit"
                    className={`h-8 px-3 rounded-full text-xs font-medium ${
                      item.active ? "bg-brand-primary/10 text-brand-primary-dark" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.active ? "Activo" : "Pausado"}
                  </button>
                </form>
                <ConfirmDeleteForm
                  action={deleteRecurringIncome.bind(null, item.id)}
                  confirmMessage="¿Eliminar este ingreso fijo?"
                >
                  ✕
                </ConfirmDeleteForm>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl bg-white border border-gray-200 p-4">
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
              placeholder="Ej: Sueldo"
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
          <SubmitButton>Crear ingreso fijo</SubmitButton>
        </form>
      )}
    </section>
  );
}
