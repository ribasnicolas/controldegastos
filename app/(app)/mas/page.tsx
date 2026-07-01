import Link from "next/link";
import { requireUser } from "@/lib/session";
import { SignOutButton } from "./SignOutButton";

export default async function MasPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Más</h1>

      <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
        <Link href="/presupuesto" className="flex items-center justify-between px-4 py-4">
          <span className="text-sm font-medium text-gray-900">Presupuesto mensual</span>
          <span className="text-gray-400">›</span>
        </Link>
        <Link href="/hogar" className="flex items-center justify-between px-4 py-4">
          <span className="text-sm font-medium text-gray-900">Hogar</span>
          <span className="text-gray-400">›</span>
        </Link>
        {user.role === "ADMIN" && (
          <>
            <Link href="/admin/usuarios" className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-medium text-gray-900">Administrar usuarios</span>
              <span className="text-gray-400">›</span>
            </Link>
            <Link href="/admin/categorias" className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-medium text-gray-900">Administrar categorías</span>
              <span className="text-gray-400">›</span>
            </Link>
          </>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-gray-200">
        <SignOutButton />
      </div>
    </div>
  );
}
