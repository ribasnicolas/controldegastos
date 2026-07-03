import { prisma } from "@/lib/prisma";
import { currentMonthRange, yearRange } from "@/lib/dates";

const ESTAMPADOS_CATEGORY = "Estampados";

export async function getDashboardData(userId: string, householdId: string | null) {
  const now = new Date();
  const { start, end, month, year } = currentMonthRange(now);
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
    debts,
    currentUser,
    liabilities,
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
      where: { userId, date: { lte: now } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
    prisma.income.findMany({
      where: { userId, date: { lte: now } },
      orderBy: { createdAt: "desc" },
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
    prisma.debt.findMany({ where: { userId, settled: false } }),
    prisma.user.findUnique({ where: { id: userId }, select: { actualBalance: true } }),
    prisma.liability.findMany({ where: { userId } }),
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
  const pendingRecurringTotal = activeRecurringExpenses
    .filter((item) => !(item.lastGeneratedMonth === month && item.lastGeneratedYear === year))
    .reduce((sum, item) => sum + Number(item.amount), 0);
  // Deudas propias (simples o en cuotas) cuya cuota de este mes ya empezó
  // a correr y todavía no se pagó.
  const pendingLiabilitiesTotal = liabilities
    .filter((liability) => {
      const notComplete = liability.installmentsPaid < liability.installments;
      const hasStarted = year > liability.startYear || (year === liability.startYear && month >= liability.startMonth);
      const notPaidThisMonth = !(liability.lastPaidMonth === month && liability.lastPaidYear === year);
      return notComplete && hasStarted && notPaidThisMonth;
    })
    .reduce((sum, liability) => sum + Number(liability.totalAmount) / liability.installments, 0);
  const pendingFixedTotal = pendingRecurringTotal + pendingLiabilitiesTotal;
  const projectedAvailable = available - pendingFixedTotal;
  const debtsPending = debts.reduce((sum, debt) => {
    const remaining = debt.installments - debt.installmentsPaid;
    return sum + (Number(debt.amount) / debt.installments) * remaining;
  }, 0);
  const actualBalance = currentUser?.actualBalance != null ? Number(currentUser.actualBalance) : null;

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
    pendingLiabilitiesTotal,
    projectedAvailable,
    debtsPending,
    actualBalance,
    expensesBreakdown,
    budgetsBreakdown,
    recentExpenses,
    recentIncomes,
    household,
    estampados,
  };
}
