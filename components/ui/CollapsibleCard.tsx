"use client";

import { useState } from "react";

export function CollapsibleCard({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="card-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left tap"
      >
        <span className="text-sm font-semibold text-gray-700">
          {title}
          {count !== undefined ? ` · ${count}` : ""}
        </span>
        <span className="text-sm text-brand-primary font-medium">{open ? "Cerrar" : "Ver"}</span>
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </section>
  );
}
