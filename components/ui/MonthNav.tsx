import Link from "next/link";
import { monthLabel, shiftMonth } from "@/lib/dates";

export function MonthNav({
  basePath,
  year,
  month,
}: {
  basePath: string;
  year: number;
  month: number;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isCurrentMonth = year === currentYear && month === currentMonth;
  const isFuture = year > currentYear || (year === currentYear && month > currentMonth);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`${basePath}?y=${prev.year}&m=${prev.month}`}
        className="tap h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Mes anterior"
      >
        ‹
      </Link>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{monthLabel(month, year)}</p>
        {isFuture && <p className="text-xs text-brand-secondary-dark font-medium">Planificando</p>}
        {!isCurrentMonth && (
          <Link href={basePath} className="text-xs text-brand-primary font-medium">
            Volver a este mes
          </Link>
        )}
      </div>
      <Link
        href={`${basePath}?y=${next.year}&m=${next.month}`}
        className="tap h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Mes siguiente"
      >
        ›
      </Link>
    </div>
  );
}
