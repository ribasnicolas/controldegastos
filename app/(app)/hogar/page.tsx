import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { currentMonthRange, monthLabel } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { leaveHousehold } from "@/lib/actions/household";
import { CreateJoinForms } from "./CreateJoinForms";
import { CopyCodeButton } from "./CopyCodeButton";

export default async function HogarPage() {
  const user = await requireUser();

  if (!user.householdId) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Hogar</h1>
        <p className="text-sm text-gray-500">
          Todavía no formás parte de ningún hogar. Podés crear uno o unirte con un código.
        </p>
        <CreateJoinForms />
      </div>
    );
  }

  const { start, end, month, year } = currentMonthRange();
  const [household, members, income, expense] = await Promise.all([
    prisma.household.findUniqueOrThrow({ where: { id: user.householdId } }),
    prisma.user.findMany({ where: { householdId: user.householdId }, orderBy: { name: "asc" } }),
    prisma.income.aggregate({
      where: { date: { gte: start, lt: end }, user: { householdId: user.householdId } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: start, lt: end }, user: { householdId: user.householdId } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = Number(income._sum.amount ?? 0);
  const totalExpense = Number(expense._sum.amount ?? 0);
  const available = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{household.name}</h1>
        <p className="text-sm text-gray-500">{monthLabel(month, year)}</p>
      </div>

      <div className={`rounded-2xl p-5 ${available >= 0 ? "bg-brand-primary/10" : "bg-brand-danger/10"}`}>
        <p className="text-sm text-gray-600">Disponible combinado</p>
        <p className={`text-3xl font-bold ${available >= 0 ? "text-brand-primary-dark" : "text-brand-danger"}`}>
          {formatCurrency(available)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Ingresos del hogar</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Gastos del hogar</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Integrantes</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100">
          {members.map((member) => (
            <div key={member.id} className="px-4 py-3 text-sm text-gray-900">
              {member.name}
              {member.id === user.id && <span className="text-gray-400"> (vos)</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-2xl bg-white border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-900">Invitar a alguien</p>
        <p className="text-xs text-gray-500">Compartile este código para que se una desde su cuenta.</p>
        <p className="font-mono text-sm bg-gray-100 rounded-lg px-3 py-2 inline-block">{household.inviteCode}</p>
        <div>
          <CopyCodeButton code={household.inviteCode} />
        </div>
      </section>

      <form action={leaveHousehold}>
        <button type="submit" className="w-full text-center text-sm text-brand-danger py-3">
          Salir del hogar
        </button>
      </form>
    </div>
  );
}
