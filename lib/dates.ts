export function currentMonthRange(reference = new Date()) {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 1, 0, 0, 0, 0);
  return { start, end, month: month + 1, year };
}

export function monthLabel(month: number, year: number) {
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
