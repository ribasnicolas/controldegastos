import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Link from "next/link";
import { CreateWorkForm } from "./CreateWorkForm";

export default async function ObraPage() {
  const user = await requireUser();
  const works = await prisma.work.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Obras</h1>
      <CreateWorkForm />

      <section className="card-surface p-4">
        {works.length === 0 ? (
          <p className="text-sm text-gray-600">No hay obras creadas todavía.</p>
        ) : (
          <ul className="space-y-2">
            {works.map((w) => (
              <li key={w.id} className="p-2 border rounded-lg">
                <Link href={`/obra/${w.id}`} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{w.name}</div>
                    <div className="text-sm text-gray-500">{w.description ?? "-"}</div>
                  </div>
                  <div className="text-sm text-brand-primary">Ver</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
