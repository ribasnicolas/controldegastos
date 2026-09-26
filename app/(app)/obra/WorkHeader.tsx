"use client";

import { useState } from "react";
import { EditWorkSheet } from "./EditWorkSheet";

type Work = { id: string; name: string; description: string | null };

export function WorkHeader({ work }: { work: Work }) {
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setEditing(true)} className="text-left tap flex items-start gap-2">
        <div>
          <h1 className="text-xl font-semibold">{work.name}</h1>
          <div className="text-sm text-gray-500">{work.description ?? ""}</div>
        </div>
        <span className="text-sm text-brand-primary shrink-0">Editar</span>
      </button>
      {editing && <EditWorkSheet work={work} onClose={() => setEditing(false)} />}
    </div>
  );
}
