"use client";

import { useRouter } from "next/navigation";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

const COLORS = ["#059669", "#f59e0b", "#3b82f6", "#8b5cf6", "#f43f8e", "#ef4444", "#14b8a6", "#84cc16"];

type Row = { categoryId: string; name: string; amount: number };

export function ExpensePieChart({ data, year, month }: { data: Row[]; year: number; month: number }) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-500">
        Todavía no cargaste gastos este mes.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            cornerRadius={6}
            onClick={(entry) => {
              const categoryId = (entry as unknown as Row).categoryId;
              router.push(`/gastos?y=${year}&m=${month}&categoryId=${categoryId}`);
            }}
          >
            {data.map((entry, index) => (
              <Cell key={entry.categoryId} fill={COLORS[index % COLORS.length]} cursor="pointer" />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
