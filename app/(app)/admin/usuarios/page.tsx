import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { UserForm } from "./UserForm";
import { UserRow } from "./UserRow";

export default async function AdminUsuariosPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
      <UserForm />
      <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
        {users.map((user) => (
          <UserRow
            key={user.id}
            id={user.id}
            name={user.name}
            email={user.email}
            role={user.role}
            active={user.active}
            isSelf={user.id === admin.id}
          />
        ))}
      </div>
    </div>
  );
}
