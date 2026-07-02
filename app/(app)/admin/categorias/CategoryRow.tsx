"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteCategory, toggleCategoryActive } from "@/lib/actions/categories";
import { ConfirmDeleteForm } from "@/components/ui/ConfirmDeleteForm";
import { EditCategorySheet } from "./EditCategorySheet";
import { initialActionState } from "@/lib/actions/types";

type Category = { id: string; name: string; icon: string | null; active: boolean };

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [deleteState, deleteAction] = useActionState(
    deleteCategory.bind(null, category.id),
    initialActionState,
  );

  useEffect(() => {
    if (deleteState.error) toast.error(deleteState.error);
  }, [deleteState]);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        <button type="button" onClick={() => setEditing(true)} className="flex-1 min-w-0 text-left tap">
          <span className="text-sm text-gray-900">
            {category.icon} {category.name}
          </span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <form action={toggleCategoryActive.bind(null, category.id)}>
            <button
              type="submit"
              className={`h-9 px-3 rounded-lg text-xs font-medium tap ${
                category.active ? "bg-brand-primary/10 text-brand-primary-dark" : "bg-gray-100 text-gray-500"
              }`}
            >
              {category.active ? "Activa" : "Inactiva"}
            </button>
          </form>
          <ConfirmDeleteForm action={deleteAction} confirmMessage={`¿Eliminar la categoría "${category.name}"?`}>
            ✕
          </ConfirmDeleteForm>
        </div>
      </div>
      {editing && <EditCategorySheet category={category} onClose={() => setEditing(false)} />}
    </>
  );
}
