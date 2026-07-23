import { prisma } from "@/lib/prisma";
import { monthRange } from "@/lib/dates";

/**
 * Proyecta cómo quedarían los números de un mes (típicamente el que viene):
 * combina lo que ya se cargó a mano con esa fecha futura, los fijos
 * (recurrentes, cuotas de deudas/pasivos) que todavía no se generaron para
 * ese mes puntual, y resta la tarjeta de crédito (se paga el mes siguiente).
 */
export async function getMonthProjection(userId: string, year: number, month: number) {
  const { start, end } = monthRange(year, month);

  const [
    actualIncomeAgg,
    actualExpenseAgg,
    creditCardAgg,
    recurringExpenses,
    recurringIncomes,
    liabilities,
    debts,
  ] = await Promise.all([
    prisma.income.aggregate({ where: { userId, date: { gte: start, lt: end } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { userId, date: { gte: start, lt: end } }, _sum: { amount: true } }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: start, lt: end }, paymentMethod: "CREDIT_CARD" },
      _sum: { amount: true },
    }),
    prisma.recurringExpense.findMany({ where: { userId, active: true }, include: { category: true } }),
    prisma.recurringIncome.findMany({ where: { userId, active: true }, include: { category: true } }),
    prisma.liability.findMany({ where: { userId } }),
    prisma.debt.findMany({ where: { userId, settled: false } }),
  ]);

  const actualIncome = Number(actualIncomeAgg._sum.amount ?? 0);
  const actualExpense = Number(actualExpenseAgg._sum.amount ?? 0);
  const creditCardExpense = Number(creditCardAgg._sum.amount ?? 0);

  const notGeneratedThisMonth = (item: { lastGeneratedMonth: number | null; lastGeneratedYear: number | null }) =>
    !(item.lastGeneratedMonth === month && item.lastGeneratedYear === year);

  const expectedRecurringExpenses = recurringExpenses.filter(notGeneratedThisMonth);
  const expectedRecurringIncomes = recurringIncomes.filter(notGeneratedThisMonth);

  const hasStarted = (startYear: number, startMonth: number) =>
    year > startYear || (year === startYear && month >= startMonth);

  const expectedLiabilities = liabilities.filter((l) => {
    const notComplete = l.installmentsPaid < l.installments;
    const notPaidThisMonth = !(l.lastPaidMonth === month && l.lastPaidYear === year);
    return notComplete && hasStarted(l.startYear, l.startMonth) && notPaidThisMonth;
  });

  const expectedDebts = debts.filter((d) => {
    const notComplete = d.installmentsPaid < d.installments;
    const notCollectedThisMonth = !(d.lastCollectedMonth === month && d.lastCollectedYear === year);
    return notComplete && hasStarted(d.startYear, d.startMonth) && notCollectedThisMonth;
  });

  const recurringExpenseItems = expectedRecurringExpenses.map((item) => ({
    id: item.id,
    name: item.description || item.category.name,
    icon: item.category.icon ?? "💸",
    amount: Number(item.amount),
  }));
  const recurringIncomeItems = expectedRecurringIncomes.map((item) => ({
    id: item.id,
    name: item.description || item.category.name,
    icon: item.category.icon ?? "💰",
    amount: Number(item.amount),
  }));
  const liabilityItems = expectedLiabilities.map((l) => ({
    id: l.id,
    name: l.personName,
    amount: Math.round((Number(l.totalAmount) / l.installments) * 100) / 100,
  }));
  const debtItems = expectedDebts.map((d) => ({
    id: d.id,
    name: d.personName,
    amount: Math.round((Number(d.amount) / d.installments) * 100) / 100,
  }));

  const expectedRecurringExpenseTotal = recurringExpenseItems.reduce((sum, i) => sum + i.amount, 0);
  const expectedRecurringIncomeTotal = recurringIncomeItems.reduce((sum, i) => sum + i.amount, 0);
  const expectedLiabilityTotal = liabilityItems.reduce((sum, i) => sum + i.amount, 0);
  const expectedDebtTotal = debtItems.reduce((sum, i) => sum + i.amount, 0);

  const projectedIncome = actualIncome + expectedRecurringIncomeTotal + expectedDebtTotal;
  const projectedExpense = actualExpense + expectedRecurringExpenseTotal + expectedLiabilityTotal;
  // La tarjeta de crédito no descuenta del disponible de este mes: se paga el que viene.
  const projectedAvailable = projectedIncome - (projectedExpense - creditCardExpense);

  return {
    year,
    month,
    actualIncome,
    actualExpense,
    creditCardExpense,
    expectedRecurringIncomeTotal,
    expectedRecurringExpenseTotal,
    expectedLiabilityTotal,
    expectedDebtTotal,
    recurringExpenseItems,
    recurringIncomeItems,
    liabilityItems,
    debtItems,
    projectedIncome,
    projectedExpense,
    projectedAvailable,
  };
}
