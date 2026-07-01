"use client";

import { toast } from "sonner";

export function CopyCodeButton({ code }: { code: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        toast.success("Código copiado");
      }}
      className="mt-2 h-11 px-4 rounded-xl bg-brand-primary/10 text-brand-primary-dark text-sm font-medium"
    >
      Copiar código
    </button>
  );
}
