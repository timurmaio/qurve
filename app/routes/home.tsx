import { ResponsiveContainer, Chart, XAxis, YAxis, CartesianGrid, Line, Bar, Area, Pie, Scatter, Tooltip, Legend, Brush } from "qurve";
import { LineBenchmark } from "../../src/components/Benchmarks";
import { useEffect, useMemo, useState } from "react";
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
  grid: "#d8dee8",
  linePrimary: "#60a5fa",
  lineSecondary: "#f97316",
  barPrimary: "#60a5fa",
  barSecondary: "#f59e0b",
  areaPrimary: "#60a5fa",
  areaSecondary: "#34d399",
  pie1: "#60a5fa",
  pie2: "#34d399",
  pie3: "#f59e0b",
  scatter: "#2563eb",
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

// Logo component — uses original dark logo with mix-blend-mode for clean rendering
function Logo({ size = 48 }: { size?: number }) {
  return (
    <div
      className="overflow-hidden rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] rotate-[-3deg] sm:rotate-[-4deg] hover:rotate-[-2deg] transition-transform duration-300 ease-out"
      style={{ width: size, height: size * 0.43 }}
    >
      <img
        src="/logo.png"
        alt="Qurve"
        width={size}
        height={size * 0.43}
        className="object-contain"
        style={{ filter: "invert(1)" }}
      />
    </div>
  );
}

// Status badge component
function StatusBadge({
  status,
}: {
  status: "implemented" | "planned" | "experimental";
}) {
  const styles = {
    implemented: "bg-[var(--accent)] text-white font-mono tracking-[0.18em]",
    planned: "bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border-strong)]",
    experimental: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// Primitive card component
function PrimitiveCard({
  name,
  description,
  status,
  example,
}: {
  name: string;
  description: string;
  status: "implemented" | "planned" | "experimental";
  example?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--surface)] rounded-lg p-6 shadow-[var(--shadow)] border border-transparent hover:border-[var(--border)] hover:-translate-y-px transition-all group flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <code className="text-sm font-mono text-[var(--text)] bg-[var(--surface-muted)] px-2 py-1 rounded">
          {name}
        </code>
        <StatusBadge status={status} />
      </div>
      <p className="text-[var(--text-muted)] text-sm leading-relaxed flex-grow">{description}</p>
      {example && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] opacity-80 group-hover:opacity-100 transition-opacity">
          {example}
        </div>
      )}
    </div>
  );
}

// Feature card component — border-left accent
function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-l-2 border-[var(--accent)] pl-4">
      <h4 className="text-sm font-medium text-[var(--text)] mb-1">{title}</h4>
      <p className="text-[var(--text-muted)] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Planned primitives data
const PLANNED_PRIMITIVES: { name: string; description: string }[] = [];

// Demo charts
function SimpleChartDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      x: i,
      y: 30 + Math.sin(i * 0.7) * 20 + Math.random() * 10,
    }));
  }, []);

  return (
    <Chart data={data} width={280} height={120}>
      <Line
        dataKey="y"
        type="linear"
        stroke={palette.linePrimary}
        strokeWidth={2}
        dot={{ r: 3 }}
      />
    </Chart>
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
    <Chart data={data} width={280} height={120}>
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
  );
}

function MultiLineDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      name: i + 1,
      value1: 50 + Math.sin(i * 0.5) * 20,
      value2: 70 + Math.cos(i * 0.3) * 15,
    }));
  }, []);

  return (
    <Chart data={data} width={280} height={120}>
      <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
      <XAxis dataKey="name" />
      <YAxis />
      <Line dataKey="value1" type="monotone" stroke={palette.linePrimary} dot={false} />
      <Line dataKey="value2" type="monotone" stroke={palette.lineSecondary} dot={false} />
    </Chart>
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
    <Chart data={data} width={280} height={120}>
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
  );
}

function GridDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: i,
      y: 40 + Math.random() * 40,
    }));
  }, []);

  return (
    <Chart data={data} width={280} height={120}>
      <CartesianGrid strokeDasharray="5 5" stroke={palette.grid} />
      <Line
        dataKey="y"
        type="linear"
        stroke={palette.linePrimary}
        strokeWidth={2}
        dot={{ r: 4 }}
      />
    </Chart>
  );
}

function TooltipDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return appleStock.slice(0, 30).map((d, i) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: d.close,
    }));
  }, []);

  return (
    <Chart data={data} width={280} height={120}>
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
    <Chart data={data} width={280} height={120}>
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
      <Tooltip />
    </Chart>
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
    <Chart data={data} width={280} height={120}>
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
    <div className="w-full h-[120px]">
      <ResponsiveContainer>
        <Chart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
          <XAxis dataKey="month" />
          <YAxis />
          <Area dataKey="value" fill={palette.areaSecondary} fillOpacity={0.3} stroke={palette.areaSecondary} />
        </Chart>
      </ResponsiveContainer>
    </div>
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
    <Chart data={data} width={280} height={140} margin={{ top: 6, right: 8, left: 8, bottom: 28 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
      <XAxis dataKey="day" />
      <YAxis />
      <Bar dataKey="bars" fill={palette.barPrimary} maxBarSize={20} />
      <Line dataKey="line" stroke={palette.linePrimary} dot={false} />
      <Legend />
    </Chart>
  );
}

function PieDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return [
      { name: "Desktop", value: 42 },
      { name: "Mobile", value: 35 },
      { name: "Tablet", value: 23 },
    ];
  }, []);

  return (
    <Chart data={data} width={280} height={140} margin={{ top: 6, right: 8, left: 8, bottom: 28 }}>
      <Pie
        dataKey="value"
        nameKey="name"
        innerRadius={24}
        outerRadius={50}
        fill={palette.pie1}
      />
      <Legend />
      <Tooltip />
    </Chart>
  );
}

function ScatterDemo({ palette }: { palette: ChartPalette }) {
  const data = useMemo(() => {
    return [
      { hours: 1, score: 22 },
      { hours: 2, score: 28 },
      { hours: 3, score: 35 },
      { hours: 4, score: 41 },
      { hours: 5, score: 55 },
      { hours: 6, score: 60 },
    ];
  }, []);

  return (
    <Chart data={data} width={280} height={140}>
      <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
      <XAxis dataKey="hours" domain={[0, 7]} />
      <YAxis dataKey="score" domain={[0, 70]} />
      <Scatter xKey="hours" yKey="score" fill={palette.scatter} size={5} name="Samples" />
      <Tooltip />
    </Chart>
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
    <Chart data={data} width={280} height={150} margin={{ top: 6, right: 8, left: 8, bottom: 26 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
      <XAxis dataKey="day" />
      <YAxis />
      <Line dataKey="value" stroke={palette.linePrimary} dot={false} strokeWidth={2} />
      <Brush />
    </Chart>
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

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] px-4 sm:px-8 py-16 transition-colors">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-24">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div className="flex items-end gap-4">
              <div className="translate-y-1 sm:translate-y-2">
                <Logo size={72} />
              </div>
              <h1 className="sr-only">Qurve</h1>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="text-sm font-medium px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] transition-colors"
            >
              {theme === "dark" ? "Light" : "Dark"} mode
            </button>
          </div>
          <div className="max-w-2xl">
            <p
              className="text-2xl text-[var(--text)] leading-relaxed mb-4"
              style={{ textWrap: "balance" }}
            >
              Canvas-powered charts that actually{" "}
              <em className="not-italic font-serif italic">perform</em>.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed mb-8">
              A high-performance React charting library. No DOM bloat. No SVG
              overhead. Just fast, crisp, Recharts-compatible visuals.
            </p>
            {/* CTA */}
            <div className="flex items-center gap-4">
              <code className="text-sm font-mono bg-[var(--accent)] text-white px-4 py-2.5 rounded-lg select-all">
                npm install qurve
              </code>
              <span className="text-[var(--text-muted)] text-sm">or check the source below</span>
            </div>
          </div>
        </header>

        <main>
          {/* Primitives — Implemented */}
          <section className="mb-16">
            <h2 className="text-sm uppercase tracking-wider text-[var(--text-muted)] mb-8 font-medium">
              Primitives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PrimitiveCard
                name="<Chart />"
                description="The root container. Manages canvas context and coordinates all child components."
                status="implemented"
                example={<SimpleChartDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<Line />"
                description="Line series with support for linear, monotone, and step interpolation."
                status="implemented"
                example={<LineChartDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<Bar />"
                description="Vertical bars with grouping, stacking (stackId), rounded corners, and tooltip support."
                status="implemented"
                example={<BarDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<Area />"
                description="Filled area series with stacking, custom fill opacity, and per-series tooltip formatting."
                status="implemented"
                example={<AreaDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<ResponsiveContainer />"
                description="Auto-sizes charts to the parent element via ResizeObserver."
                status="implemented"
                example={<ResponsiveDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<Legend />"
                description="Built-in legend with click-to-toggle visibility for line, bar, and area series."
                status="implemented"
                example={<LegendDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<Pie />"
                description="Pie and donut charts with tooltip hit-testing, legend integration, and slice hover opacity."
                status="implemented"
                example={<PieDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<Scatter />"
                description="Point-based plots with custom x/y keys, tooltip payloads, and legend toggling."
                status="implemented"
                example={<ScatterDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<Brush />"
                description="Interactive range selector with draggable window and handles for x-range zooming."
                status="implemented"
                example={<BrushDemo palette={palette} />}
              />
              <PrimitiveCard
                name="Axes"
                description="Axis components with automatic tick generation and customizable formatting."
                status="implemented"
                example={<AxisDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<CartesianGrid />"
                description="Reference grid lines for easier data reading. Configurable stroke patterns."
                status="implemented"
                example={<GridDemo palette={palette} />}
              />
              <PrimitiveCard
                name="<Tooltip />"
                description="Interactive tooltips with crosshair cursor and value display on hover."
                status="implemented"
                example={<TooltipDemo palette={palette} />}
              />
            </div>
          </section>

          {/* Planned Primitives — compact list */}
          <section className="mb-20">
            <h2 className="text-sm uppercase tracking-wider text-[var(--text-muted)] mb-4 font-medium">
              Planned
            </h2>
            <div className="flex flex-wrap gap-2">
              {PLANNED_PRIMITIVES.map((p) => (
                <span
                  key={p.name}
                  className="text-sm font-mono text-[var(--text-muted)] bg-[var(--surface)] px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
                  title={p.description}
                >
                  {"<"}{p.name}{" />"}
                </span>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-sm uppercase tracking-wider text-[var(--text-muted)] mb-8 font-medium">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--surface)] rounded-lg p-8 shadow-[var(--shadow)]">
              <FeatureCard
                title="Recharts-compatible API"
                description="Drop-in replacement with the same component names and props. Migration is painless."
              />
              <FeatureCard
                title="Canvas Rendering"
                description="GPU-accelerated drawing. Handles 100k+ data points without breaking a sweat."
              />
              <FeatureCard
                title="Auto-scaling"
                description="Smart domain calculation from your data. No manual configuration needed."
              />
              <FeatureCard
                title="High-DPI Support"
                description="Crisp rendering on Retina displays with automatic DPR detection."
              />
              <FeatureCard
                title="TypeScript First"
                description="Full type safety with detailed prop interfaces and generics."
              />
              <FeatureCard
                title="SSR Compatible"
                description="Works seamlessly with Next.js and other server-side rendering frameworks."
              />
            </div>
          </section>

          {/* Example Charts */}
          <section className="mb-20">
            <h2 className="text-sm uppercase tracking-wider text-[var(--text-muted)] mb-8 font-medium">
              Examples
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[var(--surface)] rounded-lg p-8 shadow-[var(--shadow)]">
                <h3 className="text-sm font-medium mb-6 text-[var(--text)]">
                  Single Line
                </h3>
                <div className="mb-6">
                  <LineChartDemo palette={palette} />
                </div>
                <pre className="text-xs text-[var(--text-muted)] bg-[var(--surface-muted)] p-4 rounded-lg overflow-x-auto font-mono">
                  {`<Chart data={data} width={600} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Line
    dataKey="price"
    type="monotone"
    stroke="#3b82f6"
  />
</Chart>`}
                </pre>
              </div>

              <div className="bg-[var(--surface)] rounded-lg p-8 shadow-[var(--shadow)]">
                <h3 className="text-sm font-medium mb-6 text-[var(--text)]">
                  Multiple Lines
                </h3>
                <div className="mb-6">
                  <MultiLineDemo palette={palette} />
                </div>
                <pre className="text-xs text-[var(--text-muted)] bg-[var(--surface-muted)] p-4 rounded-lg overflow-x-auto font-mono">
                  {`<Chart data={data} width={600} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Line dataKey="value1" stroke="#3b82f6" />
  <Line dataKey="value2" stroke="#ef4444" />
</Chart>`}
                </pre>
              </div>
            </div>
          </section>

          {/* Benchmarks */}
          <section className="mb-20">
            <h2 className="text-sm uppercase tracking-wider text-[var(--text-muted)] mb-8 font-medium">
              Performance
            </h2>
            <LineBenchmark />
          </section>
        </main>

        <footer className="mt-24 pt-8 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <p className="text-[var(--text-muted)] text-sm">Proof of concept</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
              <span className="text-[var(--text-muted)] text-sm">Canvas ready</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
