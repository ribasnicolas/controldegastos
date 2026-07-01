"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createCategory } from "@/lib/actions/categories";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

export function CategoryForm() {
  const [state, formAction] = useActionState(createCategory, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Categoría creada");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-2xl bg-white border border-gray-200 p-4">
      <p className="text-sm font-semibold text-gray-900">Nueva categoría</p>
      <div className="flex gap-3">
        <input
          name="icon"
          type="text"
          placeholder="🛒"
          maxLength={4}
          className="w-16 h-12 rounded-xl border border-gray-300 px-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <input
          name="name"
          type="text"
          placeholder="Nombre de la categoría"
          required
          className="flex-1 h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <select
        name="type"
        defaultValue="EXPENSE"
        className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        <option value="EXPENSE">Gasto</option>
        <option value="INCOME">Ingreso</option>
      </select>
      {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
      <SubmitButton>Crear categoría</SubmitButton>
    </form>
  );
}
