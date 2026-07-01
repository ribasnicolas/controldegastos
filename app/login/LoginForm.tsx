"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function LoginForm() {
  const [error, formAction] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      {error && <p className="text-sm text-brand-danger">{error}</p>}
      <SubmitButton pendingText="Ingresando…">Ingresar</SubmitButton>
    </form>
  );
}
