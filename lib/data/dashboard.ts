import { prisma } from "@/lib/prisma";
import { currentMonthRange, yearRange } from "@/lib/dates";

const ESTAMPADOS_CATEGORY = "Estampados";

export async function getDashboardData(userId: string, householdId: string | null) {
  const { start, end, month, year } = currentMonthRange();
  const { start: yearStart, end: yearEnd } = yearRange(year);

  const [
    expensesByCategory,
    incomeAgg,
    budgets,
    categories,
    recentExpenses,
    recentIncomes,
    estampadosMonthExpense,
    estampadosMonthIncome,
    estampadosYearExpense,
    estampadosYearIncome,
    creditCardAgg,
    activeRecurringExpenses,
    debtsAgg,
  ] = await Promise.all([
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: { userId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.income.aggregate({
      where: { userId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    }),
    prisma.category.findMany({ where: { active: true, type: "EXPENSE" }, orderBy: { name: "asc" } }),
    prisma.expense.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
      include: { category: true },
    }),
    prisma.income.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
      include: { category: true },
    }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: start, lt: end }, category: { name: ESTAMPADOS_CATEGORY } },
      _sum: { amount: true },
    }),
    prisma.income.aggregate({
      where: { userId, date: { gte: start, lt: end }, category: { name: ESTAMPADOS_CATEGORY } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: yearStart, lt: yearEnd }, category: { name: ESTAMPADOS_CATEGORY } },
      _sum: { amount: true },
    }),
    prisma.income.aggregate({
      where: { userId, date: { gte: yearStart, lt: yearEnd }, category: { name: ESTAMPADOS_CATEGORY } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: start, lt: end }, paymentMethod: "CREDIT_CARD" },
      _sum: { amount: true },
    }),
    prisma.recurringExpense.findMany({ where: { userId, active: true } }),
    prisma.debt.aggregate({ where: { userId, settled: false }, _sum: { amount: true } }),
  ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const expensesBreakdown = expensesByCategory
    .map((row) => ({
      categoryId: row.categoryId,
      name: categoryById.get(row.categoryId)?.name ?? "Sin categoría",
      icon: categoryById.get(row.categoryId)?.icon ?? "",
      amount: Number(row._sum.amount ?? 0),
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalExpense = expensesBreakdown.reduce((sum, row) => sum + row.amount, 0);
  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const creditCardExpense = Number(creditCardAgg._sum.amount ?? 0);
  // La tarjeta de crédito no descuenta del saldo disponible: se paga el mes que viene.
  const available = totalIncome - (totalExpense - creditCardExpense);

  // Gastos fijos activos que todavía no fueron confirmados como pagados este mes.
  const pendingFixedTotal = activeRecurringExpenses
    .filter((item) => !(item.lastGeneratedMonth === month && item.lastGeneratedYear === year))
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const projectedAvailable = available - pendingFixedTotal;
  const debtsPending = Number(debtsAgg._sum.amount ?? 0);

  const budgetsBreakdown = budgets.map((budget) => {
    const spent = expensesBreakdown.find((row) => row.categoryId === budget.categoryId)?.amount ?? 0;
    return {
      categoryId: budget.categoryId,
      name: budget.category.name,
      icon: budget.category.icon ?? "",
      budgeted: Number(budget.amount),
      spent,
    };
  });

  const estampadosMonth = {
    income: Number(estampadosMonthIncome._sum.amount ?? 0),
    expense: Number(estampadosMonthExpense._sum.amount ?? 0),
  };
  const estampadosYear = {
    income: Number(estampadosYearIncome._sum.amount ?? 0),
    expense: Number(estampadosYearExpense._sum.amount ?? 0),
  };
  const estampados = {
    month: { ...estampadosMonth, net: estampadosMonth.income - estampadosMonth.expense },
    year: { ...estampadosYear, net: estampadosYear.income - estampadosYear.expense },
  };

  let household: { name: string; totalIncome: number; totalExpense: number; available: number } | null = null;
  if (householdId) {
    const [householdIncome, householdExpense, householdCreditCard, householdInfo] = await Promise.all([
      prisma.income.aggregate({
        where: { date: { gte: start, lt: end }, user: { householdId } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: start, lt: end }, user: { householdId } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: start, lt: end }, user: { householdId }, paymentMethod: "CREDIT_CARD" },
        _sum: { amount: true },
      }),
      prisma.household.findUnique({ where: { id: householdId } }),
    ]);
    const hIncome = Number(householdIncome._sum.amount ?? 0);
    const hExpense = Number(householdExpense._sum.amount ?? 0);
    const hCreditCard = Number(householdCreditCard._sum.amount ?? 0);
    household = {
      name: householdInfo?.name ?? "Hogar",
      totalIncome: hIncome,
      totalExpense: hExpense,
      available: hIncome - (hExpense - hCreditCard),
    };
  }

  return {
    month,
    year,
    totalIncome,
    totalExpense,
    available,
    creditCardExpense,
    pendingFixedTotal,
    projectedAvailable,
    debtsPending,
    expensesBreakdown,
    budgetsBreakdown,
    recentExpenses,
    recentIncomes,
    household,
    estampados,
  };
}
