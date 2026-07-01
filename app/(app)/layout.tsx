import { requireUser } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Control de Gastos</span>
        <span className="text-sm text-gray-500">{user.name}</span>
      </header>
      <main className="flex-1 px-4 pt-4 pb-24 max-w-lg w-full mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
