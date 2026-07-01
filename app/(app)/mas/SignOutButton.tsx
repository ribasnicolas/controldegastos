"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center justify-between px-4 py-4 text-left text-brand-danger"
    >
      <span className="text-sm font-medium">Cerrar sesión</span>
      <span>›</span>
    </button>
  );
}
