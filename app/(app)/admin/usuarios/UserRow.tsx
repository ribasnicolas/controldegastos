"use client";

import { useState, useTransition } from "react";
import { changeUserRole, toggleUserActive } from "@/lib/actions/users";
import { EditUserSheet } from "./EditUserSheet";

export function UserRow({
  id,
  name,
  email,
  role,
  active,
  isSelf,
}: {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  active: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <button type="button" onClick={() => setEditing(true)} className="min-w-0 flex-1 text-left tap">
          <p className="text-sm text-gray-900 truncate">
            {name} {isSelf && <span className="text-gray-400">(vos)</span>}
          </p>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <select
            defaultValue={role}
            disabled={isSelf || isPending}
            onChange={(e) => startTransition(() => changeUserRole(id, e.target.value as "ADMIN" | "USER"))}
            className="h-9 rounded-lg border border-gray-300 px-2 text-sm disabled:opacity-50"
          >
            <option value="USER">Usuario</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="button"
            disabled={isSelf || isPending}
            onClick={() => startTransition(() => toggleUserActive(id))}
            className={`h-9 px-3 rounded-lg text-xs font-medium disabled:opacity-50 ${
              active ? "bg-brand-primary/10 text-brand-primary-dark" : "bg-gray-100 text-gray-500"
            }`}
          >
            {active ? "Activo" : "Inactivo"}
          </button>
        </div>
      </div>
      {editing && <EditUserSheet user={{ id, name, email }} onClose={() => setEditing(false)} />}
    </>
  );
}
