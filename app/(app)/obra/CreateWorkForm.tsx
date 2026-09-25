"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createWork } from "@/lib/actions/works";
import { initialActionState } from "@/lib/actions/types";

export function CreateWorkForm() {
  const [state, formAction] = useActionState(createWork, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Obra creada");
      formRef.current?.reset();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <section className="card-surface">
      <form ref={formRef} action={formAction} className="space-y-4 p-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
          <input name="name" required className="w-full h-12 rounded-xl border px-4" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción (opcional)</label>
          <input name="description" className="w-full h-12 rounded-xl border px-4" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Inicio</label>
            <input name="startDate" type="date" className="w-full h-12 rounded-xl border px-4" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fin</label>
            <input name="endDate" type="date" className="w-full h-12 rounded-xl border px-4" />
          </div>
        </div>
        {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
        <button className="w-full h-12 rounded-xl bg-brand-primary text-white">Crear obra</button>
      </form>
    </section>
  );
}
