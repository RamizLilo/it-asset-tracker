"use client";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";

const AX = { fontSize: 12, fill: "var(--mute)" };
const TIP = { contentStyle: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12, color: "var(--ink)" }, itemStyle: { color: "var(--ink)" } };
export const COLORS = { in_use: "#16a34a", in_stock: "#2563eb", in_repair: "#d97706", retired: "#94a3b8", lost: "#dc2626" };
export const PALETTE = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#db2777", "#0891b2", "#65a30d", "#94a3b8", "#dc2626", "#475569"];

export function Donut({ data, height = 200 }) {
  return (
    <div style={{ height }} role="img" aria-label={data.map((d) => `${d.name}: ${d.value}`).join(", ")}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="90%" paddingAngle={2} stroke="none" isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.color || PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip {...TIP} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HBars({ data, height = 240, fmt = (v) => v, color = "#0f766e" }) {
  return (
    <div style={{ height }} role="img" aria-label={data.map((d) => `${d.name}: ${fmt(d.value)}`).join(", ")}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" horizontal={false} />
          <XAxis type="number" tick={AX} tickLine={false} axisLine={false} tickFormatter={fmt} />
          <YAxis type="category" dataKey="name" tick={AX} tickLine={false} axisLine={false} width={88} />
          <Tooltip {...TIP} formatter={(v) => fmt(v)} cursor={{ fill: "var(--sunk)" }} />
          <Bar dataKey="value" fill={color} radius={[0, 3, 3, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Cols({ data, height = 220, fmt = (v) => v, color = "#0f766e" }) {
  return (
    <div style={{ height }} role="img" aria-label={data.map((d) => `${d.name}: ${fmt(d.value)}`).join(", ")}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="name" tick={AX} tickLine={false} />
          <YAxis tick={AX} tickLine={false} axisLine={false} tickFormatter={fmt} width={48} />
          <Tooltip {...TIP} formatter={(v) => fmt(v)} cursor={{ fill: "var(--sunk)" }} />
          <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Trend({ data, height = 200, color = "#0f766e", fmt = (v) => v }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="name" tick={AX} tickLine={false} />
          <YAxis tick={AX} tickLine={false} axisLine={false} tickFormatter={fmt} width={48} />
          <Tooltip {...TIP} formatter={(v) => fmt(v)} />
          <Line dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
