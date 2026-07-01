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
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`${basePath}?y=${prev.year}&m=${prev.month}`}
        className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        aria-label="Mes anterior"
      >
        ‹
      </Link>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">{monthLabel(month, year)}</p>
        {!isCurrentMonth && (
          <Link href={basePath} className="text-xs text-brand-primary font-medium">
            Volver a este mes
          </Link>
        )}
      </div>
      {isCurrentMonth ? (
        <span className="h-9 w-9 flex items-center justify-center text-gray-300">›</span>
      ) : (
        <Link
          href={`${basePath}?y=${next.year}&m=${next.month}`}
          className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="Mes siguiente"
        >
          ›
        </Link>
      )}
    </div>
  );
}
