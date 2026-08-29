"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";

export interface Series {
  key: string;
  label: string;
  color: string;
}

export interface ReferenceLineConfig {
  label: string;
  value: number;
  color: string;
}

interface MonthlyBarChartProps {
  data: Array<Record<string, number | string>>;
  series: Series[];
  height?: number;
  referenceLines?: ReferenceLineConfig[];
}

export default function MonthlyBarChart({ data, series, height = 300, referenceLines }: MonthlyBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#EAF0F6" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#64748B" }}
          axisLine={{ stroke: "#EAF0F6" }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} width={48} />
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
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={28} />
        ))}
        {referenceLines?.map((r) => (
          <ReferenceLine
            key={r.label}
            y={r.value}
            stroke={r.color}
            strokeDasharray="5 4"
            strokeWidth={1.5}
            label={{ value: r.label, position: "insideTopRight", fontSize: 11, fill: r.color }}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
