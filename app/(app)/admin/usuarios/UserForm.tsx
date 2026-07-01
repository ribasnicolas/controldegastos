"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createUser } from "@/lib/actions/users";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

export function UserForm() {
  const [state, formAction] = useActionState(createUser, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Usuario creado");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-2xl bg-white border border-gray-200 p-4">
      <p className="text-sm font-semibold text-gray-900">Nuevo usuario</p>
      <input
        name="name"
        type="text"
        placeholder="Nombre"
        required
        className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        required
        minLength={6}
        className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />
      <select
        name="role"
        defaultValue="USER"
        className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        <option value="USER">Usuario</option>
        <option value="ADMIN">Administrador</option>
      </select>
      {state.error && <p className="text-sm text-brand-danger">{state.error}</p>}
      <SubmitButton>Crear usuario</SubmitButton>
    </form>
  );
}
