"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "Guardando…",
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full h-14 rounded-2xl bg-brand-primary text-white text-base font-semibold transition-colors active:scale-95 disabled:opacity-60 disabled:active:scale-100 ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
