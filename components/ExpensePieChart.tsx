"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

const COLORS = ["#059669", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6", "#84cc16"];

export function ExpensePieChart({ data }: { data: { name: string; amount: number }[] }) {
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
          <Pie data={data} dataKey="amount" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
