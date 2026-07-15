import { ResponsiveContainer, Chart, XAxis, YAxis, ZAxis, CartesianGrid, Line, Bar, Area, Pie, Scatter, Tooltip, Legend, Brush, LabelList, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBar, Funnel, Treemap, Sankey } from "qurve";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { appleStock } from "../../src/mock";

type ThemeMode = "light" | "dark";

type ChartPalette = {
  grid: string;
  linePrimary: string;
  lineSecondary: string;
  barPrimary: string;
  barSecondary: string;
  areaPrimary: string;
  areaSecondary: string;
  pie1: string;
  pie2: string;
  pie3: string;
  scatter: string;
};

const FALLBACK_PALETTE: ChartPalette = {
  grid: "#c5ced9",
  linePrimary: "#0f766e",
  lineSecondary: "#c2410c",
  barPrimary: "#0d9488",
  barSecondary: "#d97706",
  areaPrimary: "#14b8a6",
  areaSecondary: "#ea580c",
  pie1: "#0d9488",
  pie2: "#0284c7",
  pie3: "#d97706",
  scatter: "#0f766e",
};

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function readPalette(): ChartPalette {
  return {
    grid: cssVar("--chart-grid", FALLBACK_PALETTE.grid),
    linePrimary: cssVar("--chart-line-primary", FALLBACK_PALETTE.linePrimary),
    lineSecondary: cssVar("--chart-line-secondary", FALLBACK_PALETTE.lineSecondary),
    barPrimary: cssVar("--chart-bar-primary", FALLBACK_PALETTE.barPrimary),
    barSecondary: cssVar("--chart-bar-secondary", FALLBACK_PALETTE.barSecondary),
    areaPrimary: cssVar("--chart-area-primary", FALLBACK_PALETTE.areaPrimary),
    areaSecondary: cssVar("--chart-area-secondary", FALLBACK_PALETTE.areaSecondary),
    pie1: cssVar("--chart-pie-1", FALLBACK_PALETTE.pie1),
    pie2: cssVar("--chart-pie-2", FALLBACK_PALETTE.pie2),
    pie3: cssVar("--chart-pie-3", FALLBACK_PALETTE.pie3),
    scatter: cssVar("--chart-scatter", FALLBACK_PALETTE.scatter),
  };
}

function Mark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/logo.png"
      alt="Qurve"
      width={size}
      height={Math.round(size * 0.43)}
      className={`mark-logo object-contain ${className}`}
    />
  );
}

function PrimitiveRow({
  name,
  description,
  example,
}: {
  name: string;
  description: string;
  example?: React.ReactNode;
}) {
  return (
    <article className="primitive-row">
      <code className="font-mono text-sm text-[var(--text)] tracking-tight">{name}</code>
      <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-prose">{description}</p>
      {example ? <div className="min-w-0 w-full">{example}</div> : <div />}
    </article>
  );
}

function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-l-2 border-[var(--accent)] pl-4">
      <h3 className="text-sm font-medium text-[var(--text)] mb-1">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xs uppercase tracking-[0.22em] text-[var(--text-muted)] mb-8">
      {children}
    </h2>
  );
}

// Shared wrapper for responsive chart demos
function ChartDemo({ height = 120, children }: { height?: number; children: React.ReactNode }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>{children as React.ReactElement}</ResponsiveContainer>
    </div>
  );
}

// Demo charts
function SimpleChartDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      x: i,
      y: 30 + Math.sin(i * 0.7) * 20 + (((i * 7 + 3) % 11) / 11) * 10,
    }));
  }, []);

  return (
    <ChartDemo>
      <Chart data={data} margin={{ top: 8, right: 10, bottom: 8, left: 10 }}>
        <Line
          dataKey="y"
          type="linear"
          stroke={palette.linePrimary}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </Chart>
    </ChartDemo>
  );
}

function LineChartDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return appleStock.slice(0, 20).map((d, i) => ({
      name: i + 1,
      value: d.close,
    }));
  }, []);

  return (
    <ChartDemo>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="name" />
        <YAxis />
        <Line
          dataKey="value"
          type="monotone"
          stroke={palette.linePrimary}
          strokeWidth={2}
          dot={false}
        />
      </Chart>
    </ChartDemo>
  );
}

function AxisDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      ts: new Date(2024, 0, i + 1).getTime(),
      value: 52 + Math.sin(i * 0.8) * 20,
    }));
  }, []);

  return (
    <ChartDemo>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="ts" type="time" tickCount={4} locale="en-US" timeZone="UTC" timeFormat="date" />
        <YAxis />
        <Line
          dataKey="value"
          type="monotone"
          stroke={palette.linePrimary}
          strokeWidth={2}
          dot={false}
        />
      </Chart>
    </ChartDemo>
  );
}

function GridDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: i,
      y: 40 + ((i * 13 + 7) % 40),
    }));
  }, []);

  return (
    <ChartDemo>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="5 5" stroke={palette.grid} />
        <XAxis dataKey="x" />
        <YAxis />
        <Line
          dataKey="y"
          type="linear"
          stroke={palette.linePrimary}
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </Chart>
    </ChartDemo>
  );
}

function TooltipDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return appleStock.slice(0, 30).map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: d.close,
    }));
  }, []);

  return (
    <ChartDemo>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="date" />
        <YAxis />
        <Line
          dataKey="price"
          type="monotone"
          stroke={palette.linePrimary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
          name="Price"
        />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function BarDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return [
      { name: "Mon", sales: 22, refunds: -4 },
      { name: "Tue", sales: 18, refunds: -3 },
      { name: "Wed", sales: 30, refunds: -6 },
      { name: "Thu", sales: 26, refunds: -5 },
      { name: "Fri", sales: 34, refunds: -7 },
      { name: "Sat", sales: 28, refunds: -4 },
      { name: "Sun", sales: 20, refunds: -2 },
    ];
  }, []);

  return (
    <ChartDemo>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="name" />
        <YAxis />
        <Bar
          dataKey="sales"
          fill={palette.barPrimary}
          radius={4}
          stackId="net"
          maxBarSize={24}
          minPointSize={3}
          tooltipName="Sales"
          tooltipFormatter={(value) => value === null ? "-" : `$${value.toFixed(0)}k`}
        />
        <Bar
          dataKey="refunds"
          fill={palette.barSecondary}
          radius={4}
          stackId="net"
          maxBarSize={24}
          minPointSize={3}
          tooltipName="Refunds"
          tooltipFormatter={(value) => value === null ? "-" : `$${Math.abs(value).toFixed(0)}k`}
        />
        <LabelList dataKey="sales" shape="bar" position="top" offset={4} fontSize={10} fill={palette.linePrimary} />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function AreaDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return [
      { name: "Q1", productA: 18, productB: 10 },
      { name: "Q2", productA: 24, productB: 14 },
      { name: "Q3", productA: 20, productB: 16 },
      { name: "Q4", productA: 28, productB: 18 },
    ];
  }, []);

  return (
    <ChartDemo>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 50]} />
        <Area
          dataKey="productA"
          stackId="total"
          fill={palette.areaPrimary}
          fillOpacity={0.28}
          stroke={palette.linePrimary}
          tooltipName="Product A"
        />
        <Area
          dataKey="productB"
          stackId="total"
          fill={palette.areaSecondary}
          fillOpacity={0.28}
          stroke={palette.areaSecondary}
          tooltipName="Product B"
        />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function ResponsiveDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      value: 30 + Math.sin(i * 0.45) * 12 + i,
    }));
  }, []);

  return (
    <ChartDemo>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="month" />
        <YAxis />
        <Area dataKey="value" fill={palette.areaSecondary} fillOpacity={0.3} stroke={palette.areaSecondary} />
      </Chart>
    </ChartDemo>
  );
}

function LegendDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      day: i + 1,
      line: 24 + Math.sin(i * 0.7) * 8,
      bars: 20 + Math.cos(i * 0.45) * 6,
    }));
  }, []);

  return (
    <ChartDemo height={160}>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="day" />
        <YAxis />
        <Bar dataKey="bars" fill={palette.barPrimary} maxBarSize={20} />
        <Line dataKey="line" stroke={palette.linePrimary} dot={false} />
        <Legend />
      </Chart>
    </ChartDemo>
  );
}

function PieDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return [
      { name: "Desktop", value: 31 },
      { name: "Mobile Web", value: 26 },
      { name: "Mobile App", value: 19 },
      { name: "Tablet", value: 10 },
      { name: "Smart TV", value: 8 },
      { name: "Other", value: 6 },
    ];
  }, []);

  return (
    <ChartDemo height={168}>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 28 }}>
        <Pie
          dataKey="value"
          nameKey="name"
          innerRadius={22}
          outerRadius={50}
          colors={[palette.pie1, palette.pie2, palette.pie3, '#f97316', '#8b5cf6', '#14b8a6']}
          label
          labelMode="namePercent"
          labelLine
          labelMinGap={10}
          startAngle={210}
          endAngle={-150}
        />
        <Legend />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function ScatterDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    const clusters = [
      { centerHours: 1.5, centerScore: 28, count: 10 },
      { centerHours: 4, centerScore: 52, count: 12 },
      { centerHours: 7, centerScore: 74, count: 12 },
    ];
    return clusters.flatMap(({ centerHours, centerScore, count }, ci) =>
      Array.from({ length: count }, (_, i) => ({
        hours: Math.max(0.2, centerHours + ((((ci * 17 + i * 7) % 20) / 10) - 1) * 1.2),
        score: Math.min(100, Math.max(10, centerScore + ((((ci * 11 + i * 13) % 20) / 10) - 1) * 14)),
        size: 8 + ((ci * 9 + i * 5) % 40),
      }))
    );
  }, []);

  return (
    <ChartDemo height={160}>
      <Chart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="hours" domain={[0, 9]} />
        <YAxis dataKey="score" domain={[0, 100]} />
        <ZAxis dataKey="size" range={[3, 12]} />
        <Scatter xKey="hours" yKey="score" zKey="size" fill={palette.scatter} name="Samples" />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function RadarDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(
    () => [
      { subject: "Math", A: 120, B: 110 },
      { subject: "Chinese", A: 98, B: 130 },
      { subject: "English", A: 86, B: 130 },
      { subject: "Geo", A: 99, B: 100 },
      { subject: "Physics", A: 85, B: 90 },
      { subject: "History", A: 65, B: 85 },
    ],
    [],
  );

  return (
    <ChartDemo height={200}>
      <Chart data={data} margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
        <PolarGrid stroke={palette.grid} />
        <PolarAngleAxis dataKey="subject" fontSize={10} />
        <PolarRadiusAxis domain={[0, 150]} tickCount={4} fontSize={9} />
        <Radar dataKey="A" name="A" stroke={palette.linePrimary} fill={palette.linePrimary} fillOpacity={0.35} />
        <Radar dataKey="B" name="B" stroke={palette.lineSecondary} fill={palette.lineSecondary} fillOpacity={0.25} />
        <Legend />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function RadialBarDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(
    () => [
      { name: "18-24", uv: 31 },
      { name: "25-29", uv: 27 },
      { name: "30-34", uv: 16 },
      { name: "35-39", uv: 8 },
      { name: "40-49", uv: 9 },
      { name: "50+", uv: 3 },
    ],
    [],
  );

  return (
    <ChartDemo height={200}>
      <Chart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <RadialBar
          dataKey="uv"
          nameKey="name"
          background
          innerRadius={18}
          outerRadius={90}
          startAngle={90}
          endAngle={-270}
          colors={[palette.pie1, palette.pie2, palette.pie3, '#f97316', '#8b5cf6', '#14b8a6']}
        />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function FunnelDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(
    () => [
      { name: "Impression", value: 100 },
      { name: "Click", value: 80 },
      { name: "Visit", value: 50 },
      { name: "Consult", value: 40 },
      { name: "Order", value: 26 },
    ],
    [],
  );

  return (
    <ChartDemo height={200}>
      <Chart data={data} margin={{ top: 8, right: 100, bottom: 8, left: 8 }}>
        <Funnel
          dataKey="value"
          nameKey="name"
          label
          colors={[palette.pie1, palette.pie2, palette.pie3, '#f97316', '#8b5cf6']}
        />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function TreemapDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(
    () => [
      { name: "Axis", value: 40 },
      { name: "Controls", value: 25 },
      {
        name: "Data",
        children: [
          { name: "DataField", value: 18 },
          { name: "DataSchema", value: 12 },
        ],
      },
      { name: "Mark", value: 30 },
    ],
    [],
  );

  return (
    <ChartDemo height={200}>
      <Chart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Treemap
          dataKey="value"
          nameKey="name"
          label
          colors={[palette.pie1, palette.pie2, palette.pie3, palette.barPrimary, palette.barSecondary]}
        />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function SankeyDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(
    () => ({
      nodes: [
        { name: "Visit" },
        { name: "Direct" },
        { name: "Search" },
        { name: "Order" },
      ],
      links: [
        { source: 0, target: 1, value: 40 },
        { source: 0, target: 2, value: 60 },
        { source: 1, target: 3, value: 28 },
        { source: 2, target: 3, value: 45 },
      ],
    }),
    [],
  );

  return (
    <ChartDemo height={200}>
      <Chart data={data.nodes} margin={{ top: 12, right: 72, bottom: 12, left: 12 }}>
        <Sankey
          data={data}
          label
          colors={[palette.pie1, palette.pie2, palette.pie3, palette.barPrimary]}
        />
        <Tooltip />
      </Chart>
    </ChartDemo>
  );
}

function BrushDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return appleStock.slice(0, 60).map((d, i) => ({
      day: i + 1,
      value: d.close,
    }));
  }, []);

  return (
    <ChartDemo height={160}>
      <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 26 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="day" />
        <YAxis />
        <Line dataKey="value" stroke={palette.linePrimary} dot={false} strokeWidth={2} />
        <Brush />
      </Chart>
    </ChartDemo>
  );
}

/** Full-bleed hero visual — the product is the chart. */
function HeroChart({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return appleStock.slice(0, 120).map((d, i) => ({
      day: i + 1,
      close: d.close,
    }));
  }, []);

  return (
    <div className="h-[min(42vh,320px)] sm:h-[min(48vh,420px)] w-full relative z-0">
      <ResponsiveContainer>
        <Chart data={data} margin={{ top: 24, right: 24, left: 8, bottom: 16 }}>
          <CartesianGrid strokeDasharray="2 6" stroke={palette.grid} vertical={false} />
          <XAxis dataKey="day" tick={false} tickLine={false} axisLine={false} />
          <YAxis domain="auto" tick={false} tickLine={false} axisLine={false} width={0} />
          <Area
            dataKey="close"
            fill={palette.areaPrimary}
            fillOpacity={0.16}
            stroke={palette.linePrimary}
            strokeWidth={2.5}
            name="AAPL"
          />
          <Tooltip />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

// Example: Stock Dashboard — Line + Brush + Tooltip
function StockDashboardExample({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return appleStock.slice(0, 90).map((d, i) => ({
      day: i + 1,
      price: d.close,
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
  }, []);

  return (
    <div className="border-t border-[var(--border)] pt-8">
      <div className="mb-6">
        <h3 className="font-display text-lg text-[var(--text)] mb-1">Stock Dashboard</h3>
        <p className="text-sm text-[var(--text-muted)]">Line + CartesianGrid + Tooltip + Brush — 90 data points</p>
      </div>
      <div className="h-[220px] mb-6">
        <ResponsiveContainer>
          <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
            <XAxis dataKey="day" />
            <YAxis />
            <Line
              dataKey="price"
              type="monotone"
              stroke={palette.linePrimary}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              name="AAPL"
            />
            <Tooltip />
            <Brush />
          </Chart>
        </ResponsiveContainer>
      </div>
      <pre className="text-xs text-[var(--text-muted)] bg-[var(--surface-muted)]/80 p-4 overflow-x-auto font-mono leading-relaxed border border-[var(--border)]">{`<Chart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="day" />
  <YAxis />
  <Line
    dataKey="price"
    type="monotone"
    stroke="#0f766e"
    strokeWidth={2}
    dot={false}
    activeDot={{ r: 5 }}
    name="AAPL"
  />
  <Tooltip />
  <Brush />
</Chart>`}</pre>
    </div>
  );
}

// Example: Sales Overview — Bar + Line + Legend + Tooltip
function SalesOverviewExample({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return [
      { month: "Jan", revenue: 42, target: 38 },
      { month: "Feb", revenue: 38, target: 40 },
      { month: "Mar", revenue: 55, target: 45 },
      { month: "Apr", revenue: 48, target: 48 },
      { month: "May", revenue: 62, target: 52 },
      { month: "Jun", revenue: 58, target: 55 },
      { month: "Jul", revenue: 71, target: 60 },
      { month: "Aug", revenue: 65, target: 63 },
    ];
  }, []);

  return (
    <div className="border-t border-[var(--border)] pt-8">
      <div className="mb-6">
        <h3 className="font-display text-lg text-[var(--text)] mb-1">Sales Overview</h3>
        <p className="text-sm text-[var(--text-muted)]">Bar + Line + Legend + Tooltip — revenue vs target</p>
      </div>
      <div className="h-[220px] mb-6">
        <ResponsiveContainer>
          <Chart data={data} margin={{ top: 6, right: 8, left: 8, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
            <XAxis dataKey="month" />
            <YAxis />
            <Bar
              dataKey="revenue"
              fill={palette.barPrimary}
              radius={4}
              maxBarSize={32}
              tooltipName="Revenue"
              tooltipFormatter={(v) => v === null ? "-" : `$${v}k`}
            />
            <Line
              dataKey="target"
              type="monotone"
              stroke={palette.lineSecondary}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Target"
            />
            <Legend />
            <Tooltip />
          </Chart>
        </ResponsiveContainer>
      </div>
      <pre className="text-xs text-[var(--text-muted)] bg-[var(--surface-muted)]/80 p-4 overflow-x-auto font-mono leading-relaxed border border-[var(--border)]">{`<Chart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Bar
    dataKey="revenue"
    fill="#0d9488"
    radius={4}
    tooltipName="Revenue"
  />
  <Line
    dataKey="target"
    stroke="#c2410c"
    strokeWidth={2}
    name="Target"
  />
  <Legend />
  <Tooltip />
</Chart>`}</pre>
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [palette, setPalette] = useState<ChartPalette>(FALLBACK_PALETTE);

  useEffect(() => {
    const stored = localStorage.getItem("qurve-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === "dark" || stored === "light" ? (stored as ThemeMode) : (systemDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setPalette(readPalette());
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("qurve-theme", next);
    setPalette(readPalette());
  };

  const primitives = useMemo(
    () => [
      {
        name: "<Chart />",
        description: "The root container. Manages canvas context and coordinates all child components.",
        example: <SimpleChartDemo palette={palette} />,
      },
      {
        name: "<Line />",
        description: "Line series with support for linear, monotone, and step interpolation.",
        example: <LineChartDemo palette={palette} />,
      },
      {
        name: "<Bar />",
        description: "Vertical bars with grouping, stacking (stackId), rounded corners, and tooltip support.",
        example: <BarDemo palette={palette} />,
      },
      {
        name: "<Area />",
        description: "Filled area series with stacking, custom fill opacity, and per-series tooltip formatting.",
        example: <AreaDemo palette={palette} />,
      },
      {
        name: "<ResponsiveContainer />",
        description: "Auto-sizes charts to the parent element via ResizeObserver.",
        example: <ResponsiveDemo palette={palette} />,
      },
      {
        name: "<Legend />",
        description: "Built-in legend with click-to-toggle visibility for line, bar, and area series.",
        example: <LegendDemo palette={palette} />,
      },
      {
        name: "<Pie />",
        description: "Pie and donut charts with palette-driven slices, outside labels, connector lines, and tooltip hit-testing.",
        example: <PieDemo palette={palette} />,
      },
      {
        name: "<Scatter />",
        description: "Point / bubble plots with x/y/z keys, ZAxis sizing, tooltip payloads, and legend toggling.",
        example: <ScatterDemo palette={palette} />,
      },
      {
        name: "<Radar />",
        description: "Radar charts with PolarGrid, angle/radius axes, multi-series polygons, and tooltip.",
        example: <RadarDemo palette={palette} />,
      },
      {
        name: "<RadialBar />",
        description: "Concentric gauge arcs with optional background track, Cell colors, and tooltip hit-testing.",
        example: <RadialBarDemo palette={palette} />,
      },
      {
        name: "<Funnel />",
        description: "Conversion funnel with trapezoid stages, Cell colors, and side labels.",
        example: <FunnelDemo palette={palette} />,
      },
      {
        name: "<Treemap />",
        description: "Squarified treemap with nested children, Cell colors, and leaf labels.",
        example: <TreemapDemo palette={palette} />,
      },
      {
        name: "<Sankey />",
        description: "Flow diagram with nodes, weighted links, Cell colors, and tooltip on nodes.",
        example: <SankeyDemo palette={palette} />,
      },
      {
        name: "<Brush />",
        description: "Interactive range selector with draggable window and handles for x-range zooming.",
        example: <BrushDemo palette={palette} />,
      },
      {
        name: "Axes",
        description: "Axis components with automatic tick generation and customizable formatting.",
        example: <AxisDemo palette={palette} />,
      },
      {
        name: "<CartesianGrid />",
        description: "Reference grid lines for easier data reading. Configurable stroke patterns.",
        example: <GridDemo palette={palette} />,
      },
      {
        name: "<Tooltip />",
        description: "Interactive tooltips with crosshair cursor and value display on hover.",
        example: <TooltipDemo palette={palette} />,
      },
    ],
    [palette],
  );

  return (
    <div className="site-atmosphere text-[var(--text)] transition-colors">
      <div className="site-content px-4 sm:px-8 pt-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Top bar — theme only; brand lives in the hero */}
          <div className="flex items-center justify-end gap-4 mb-10 anim-rise">
            <button
              type="button"
              onClick={toggleTheme}
              className="cta-secondary py-2 px-3 text-xs tracking-wide"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          {/* Hero — logo as brand, claim, CTA, dominant chart */}
          <header className="mb-6">
            <h1 className="anim-rise anim-delay-1">
              <Mark
                size={360}
                className="h-auto w-[min(100%,18rem)] sm:w-[min(100%,22rem)] md:w-[min(100%,26rem)]"
              />
            </h1>
            <p
              className="mt-8 max-w-xl text-xl sm:text-2xl text-[var(--text)] leading-snug anim-rise anim-delay-2"
              style={{ textWrap: "balance" }}
            >
              Canvas charts that actually{" "}
              <em className="not-italic font-display font-semibold text-[var(--accent)]">perform</em>.
            </p>
            <p className="mt-3 max-w-lg text-[var(--text-muted)] text-base leading-relaxed anim-rise anim-delay-3">
              Recharts-compatible API. No DOM bloat. No SVG overhead — just fast, crisp canvas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 anim-rise anim-delay-4">
              <code className="cta-primary">npm install qurve</code>
              <a
                href="https://github.com/tnbt/qurve"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary"
              >
                GitHub
              </a>
            </div>
          </header>
        </div>

        <div className="hero-chart-plane anim-chart mt-10 mb-20">
          <div className="max-w-6xl mx-auto px-2 sm:px-6">
            <HeroChart palette={palette} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <main>
            {/* Performance — primary differentiator, right after hero */}
            <section className="mb-24">
              <SectionLabel>Performance</SectionLabel>
              <p
                className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] leading-tight max-w-2xl mb-5"
                style={{ textWrap: "balance" }}
              >
                Same API. Different ceiling.
              </p>
              <p className="text-[var(--text-muted)] text-base leading-relaxed mb-8 max-w-xl">
                Canvas rendering unlocks 100k+ points without SVG DOM cost.
                Compare Qurve and Recharts side-by-side, or track drop-in compatibility.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/styling" className="cta-secondary">
                  Styling guide
                </Link>
                <Link to="/comparison" className="cta-secondary">
                  Live comparison
                </Link>
                <Link to="/are-we-recharts-yet" className="cta-secondary">
                  Are we Recharts yet?
                </Link>
              </div>
            </section>

            {/* Primitives — compact rows, not a card wall */}
            <section className="mb-24">
              <SectionLabel>Primitives</SectionLabel>
              <p className="text-[var(--text-muted)] text-sm mb-2 max-w-xl">
                Compose charts from familiar pieces. Hover a row to focus it.
              </p>
              <div className="border-t border-[var(--border)]">
                {primitives.map((p) => (
                  <PrimitiveRow
                    key={p.name}
                    name={p.name}
                    description={p.description}
                    example={p.example}
                  />
                ))}
              </div>
            </section>

            {/* Features — no wrapping card */}
            <section className="mb-24">
              <SectionLabel>Features</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <FeatureItem
                  title="Recharts-compatible API"
                  description="Drop-in replacement with the same component names and props. Migration is painless."
                />
                <FeatureItem
                  title="Canvas Rendering"
                  description="GPU-accelerated drawing. Handles 100k+ data points without breaking a sweat."
                />
                <FeatureItem
                  title="Composable styling"
                  description="CSS variables for chrome, Chart colors for palettes, series props and Cell for precision — no ThemeProvider required."
                />
                <FeatureItem
                  title="Auto-scaling"
                  description="Smart domain calculation from your data. No manual configuration needed."
                />
                <FeatureItem
                  title="High-DPI Support"
                  description="Crisp rendering on Retina displays with automatic DPR detection."
                />
                <FeatureItem
                  title="TypeScript First"
                  description="Full type safety with detailed prop interfaces and generics."
                />
                <FeatureItem
                  title="SSR Compatible"
                  description="Works seamlessly with Next.js and other server-side rendering frameworks."
                />
              </div>
            </section>

            {/* Examples */}
            <section className="mb-20">
              <SectionLabel>Examples</SectionLabel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                <StockDashboardExample palette={palette} />
                <SalesOverviewExample palette={palette} />
              </div>
            </section>
          </main>

          <footer className="mt-20 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[var(--text-muted)] text-sm">Open source. MIT license.</p>
              <p className="font-mono text-xs tracking-widest uppercase text-[var(--accent)]">
                Canvas ready
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
