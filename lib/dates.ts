export function currentMonthRange(reference = new Date()) {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 1, 0, 0, 0, 0);
  return { start, end, month: month + 1, year };
}

// month es 1-12
export function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end, month, year };
}

export function yearRange(year: number) {
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year + 1, 0, 1, 0, 0, 0, 0);
  return { start, end };
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

// Fecha por defecto para cargar un movimiento mientras se navega un mes:
// "hoy" si es el mes actual, o el día 1 si se está viendo otro mes (pasado o futuro).
export function defaultDateForMonth(year: number, month: number) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const date = isCurrentMonth ? now : new Date(year, month - 1, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function monthLabel(month: number, year: number) {
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
