"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateUser } from "@/lib/actions/users";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

type User = { id: string; name: string; email: string };

export function EditUserSheet({ user, onClose }: { user: User; onClose: () => void }) {
  const [state, formAction] = useActionState(updateUser, initialActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Usuario actualizado");
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
          <p className="text-base font-semibold text-gray-900">Editar usuario</p>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 tap"
          >
            ✕
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={user.id} />
          <div>
            <label htmlFor={`edit-user-name-${user.id}`} className="text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id={`edit-user-name-${user.id}`}
              name="name"
              type="text"
              required
              maxLength={80}
              defaultValue={user.name}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor={`edit-user-email-${user.id}`} className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id={`edit-user-email-${user.id}`}
              name="email"
              type="email"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              defaultValue={user.email}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor={`edit-user-password-${user.id}`} className="text-sm font-medium text-gray-700">
              Nueva contraseña (opcional)
            </label>
            <input
              id={`edit-user-password-${user.id}`}
              name="password"
              type="password"
              minLength={6}
              placeholder="Dejar en blanco para no cambiarla"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
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
