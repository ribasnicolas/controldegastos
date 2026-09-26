"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateWork } from "@/lib/actions/works";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

type Work = { id: string; name: string; description: string | null };

export function EditWorkSheet({ work, onClose }: { work: Work; onClose: () => void }) {
  const [state, formAction] = useActionState(updateWork, initialActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Obra actualizada");
      onClose();
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">Editar obra</p>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 tap"
          >
            ✕
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={work.id} />
          <div>
            <label htmlFor={`edit-work-name-${work.id}`} className="text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id={`edit-work-name-${work.id}`}
              name="name"
              type="text"
              required
              defaultValue={work.name}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor={`edit-work-description-${work.id}`} className="text-sm font-medium text-gray-700">
              Descripción
            </label>
            <input
              id={`edit-work-description-${work.id}`}
              name="description"
              type="text"
              defaultValue={work.description ?? ""}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
          <SubmitButton pendingText="Guardando…">Guardar cambios</SubmitButton>
        </form>
      </div>
    </div>
  );
}
