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
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 h-16 text-xs font-medium transition-colors ${
                  isActive ? "text-brand-primary" : "text-gray-500"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
