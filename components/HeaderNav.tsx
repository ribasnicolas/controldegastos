"use client";

import { usePathname, useRouter } from "next/navigation";

export function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") {
    return (
      <span className="font-semibold text-gray-900 tracking-tight dark:text-gray-100">Control de Gastos</span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-1 text-gray-700 tap -ml-1 dark:text-gray-300"
    >
      <span className="text-lg leading-none">‹</span>
      <span className="text-sm font-medium">Atrás</span>
    </button>
  );
}
