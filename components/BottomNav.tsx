"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Inicio" },
  { href: "/gastos", label: "Gastos" },
  { href: "/ingresos", label: "Ingresos" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 backdrop-blur-md bg-white/85 border-t border-black/[0.04] pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-3 px-2 py-2">
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} className="flex items-center justify-center h-12 tap">
                <span
                  className={`px-3 py-2 rounded-full text-sm font-bold tracking-tight transition-colors ${
                    isActive ? "bg-brand-primary/12 text-brand-primary-dark" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
