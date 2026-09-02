"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export interface Series {
  key: string;
  label: string;
  color: string;
}

export default function OperacionalBarChart({
  data,
  xKey,
  series,
  height = 280,
}: {
  data: Array<Record<string, number | string>>;
  xKey: string;
  series: Series[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#EAF0F6" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "#64748B" }}
          axisLine={{ stroke: "#EAF0F6" }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #EAF0F6",
            fontSize: 13,
            boxShadow: "0 4px 12px rgba(11,42,74,0.08)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={18} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
