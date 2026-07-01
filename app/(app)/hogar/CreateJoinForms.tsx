"use client";

import { useActionState } from "react";
import { createHousehold, joinHousehold } from "@/lib/actions/household";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions/types";

export function CreateJoinForms() {
  const [createState, createAction] = useActionState(createHousehold, initialActionState);
  const [joinState, joinAction] = useActionState(joinHousehold, initialActionState);

  return (
    <div className="space-y-6">
      <form action={createAction} className="space-y-3 rounded-2xl bg-white border border-gray-200 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Crear un hogar</p>
          <p className="text-xs text-gray-500">Vas a poder invitar a otras personas para ver un dashboard combinado.</p>
        </div>
        <input
          name="name"
          type="text"
          placeholder="Ej: Familia Ribas"
          required
          className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        {createState.error && <p className="text-sm text-brand-danger">{createState.error}</p>}
        <SubmitButton>Crear hogar</SubmitButton>
      </form>

      <form action={joinAction} className="space-y-3 rounded-2xl bg-white border border-gray-200 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Unirme a un hogar</p>
          <p className="text-xs text-gray-500">Pedile el código de invitación a quien lo creó.</p>
        </div>
        <input
          name="inviteCode"
          type="text"
          placeholder="Código de invitación"
          required
          className="w-full h-12 rounded-xl border border-gray-300 px-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        {joinState.error && <p className="text-sm text-brand-danger">{joinState.error}</p>}
        <SubmitButton>Unirme</SubmitButton>
      </form>
    </div>
  );
}
