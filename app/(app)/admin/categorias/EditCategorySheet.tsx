"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateCategory } from "@/lib/actions/categories";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

type Category = { id: string; name: string; icon: string | null };

export function EditCategorySheet({ category, onClose }: { category: Category; onClose: () => void }) {
  const [state, formAction] = useActionState(updateCategory, initialActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Categoría actualizada");
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
          <p className="text-base font-semibold text-gray-900">Editar categoría</p>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 tap"
          >
            ✕
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={category.id} />
          <div className="flex gap-3">
            <input
              name="icon"
              type="text"
              defaultValue={category.icon ?? ""}
              maxLength={4}
              placeholder="🛒"
              className="w-16 h-12 rounded-xl border border-gray-300 px-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <input
              name="name"
              type="text"
              defaultValue={category.name}
              required
              maxLength={50}
              placeholder="Nombre de la categoría"
              className="flex-1 h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
          <SubmitButton pendingText="Guardando…">Guardar cambios</SubmitButton>
        </form>
      </div>
    </div>
  );
}
