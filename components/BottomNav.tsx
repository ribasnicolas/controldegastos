"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/gastos", label: "Gastos", icon: "💸" },
  { href: "/ingresos", label: "Ingresos", icon: "💰" },
  { href: "/mas", label: "Más", icon: "⋯" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 backdrop-blur-md bg-white/85 border-t border-black/[0.04] pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4 px-2 py-1.5">
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 h-14 text-xs font-medium tap"
              >
                <span
                  className={`flex items-center justify-center h-8 w-12 rounded-full text-xl leading-none transition-colors ${
                    isActive ? "bg-brand-primary/12" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className={isActive ? "text-brand-primary-dark" : "text-gray-500"}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
