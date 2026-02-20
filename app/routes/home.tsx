import { Chart, XAxis, YAxis, CartesianGrid, Line, Tooltip } from "../../src/components";
import { LineBenchmark } from "../../src/components/Benchmarks";
import { useMemo } from "react";
import { appleStock } from "../../src/mock";

// Logo component — uses original dark logo with mix-blend-mode for clean rendering
function Logo({ size = 48 }: { size?: number }) {
  return (
    <div className="overflow-hidden rounded-lg" style={{ width: size, height: size * 0.43 }}>
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
    implemented: "bg-[#1a1a1a] text-white",
    planned: "bg-[#e8e8e8] text-[#666] border border-[#d4d4d4]",
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
    <div className="bg-white rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-transparent hover:border-[#e0e0e0] hover:-translate-y-px transition-all group flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <code className="text-sm font-mono text-[#1a1a1a] bg-[#f5f5f5] px-2 py-1 rounded">
          {name}
        </code>
        <StatusBadge status={status} />
      </div>
      <p className="text-[#666] text-sm leading-relaxed flex-grow">{description}</p>
      {example && (
        <div className="mt-4 pt-4 border-t border-[#f0f0f0] opacity-80 group-hover:opacity-100 transition-opacity">
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
    <div className="border-l-2 border-[#1a1a1a] pl-4">
      <h4 className="text-sm font-medium text-[#1a1a1a] mb-1">{title}</h4>
      <p className="text-[#666] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Planned primitives data
const PLANNED_PRIMITIVES = [
  { name: "Area", description: "Filled area charts with gradient support" },
  { name: "Bar", description: "Vertical and horizontal bar charts" },
  { name: "Scatter", description: "Scatter plots with customizable points" },
  { name: "Pie", description: "Pie and donut charts" },
  { name: "Legend", description: "Auto-generated legends with toggle" },
  { name: "Brush", description: "Range selector for zoom and pan" },
  { name: "ResponsiveContainer", description: "Auto-sizing to parent" },
];

// Demo charts
function SimpleChartDemo() {
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
        stroke="#1a1a1a"
        strokeWidth={2}
        dot={{ r: 3 }}
      />
    </Chart>
  );
}

function LineChartDemo() {
  const data = useMemo(() => {
    return appleStock.slice(0, 20).map((d, i) => ({
      name: i + 1,
      value: d.close,
    }));
  }, []);

  return (
    <Chart data={data} width={280} height={120}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
      <XAxis dataKey="name" />
      <YAxis />
      <Line
        dataKey="value"
        type="monotone"
        stroke="#3b82f6"
        strokeWidth={2}
        dot={false}
      />
    </Chart>
  );
}

function MultiLineDemo() {
  const data = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      name: i + 1,
      value1: 50 + Math.sin(i * 0.5) * 20,
      value2: 70 + Math.cos(i * 0.3) * 15,
    }));
  }, []);

  return (
    <Chart data={data} width={280} height={120}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
      <XAxis dataKey="name" />
      <YAxis />
      <Line dataKey="value1" type="monotone" stroke="#3b82f6" dot={false} />
      <Line dataKey="value2" type="monotone" stroke="#ef4444" dot={false} />
    </Chart>
  );
}

function AxisDemo() {
  const data = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][i],
      value: 50 + Math.sin(i * 0.8) * 30,
    }));
  }, []);

  return (
    <Chart data={data} width={280} height={120}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
      <XAxis dataKey="month" />
      <YAxis />
      <Line
        dataKey="value"
        type="monotone"
        stroke="#3b82f6"
        strokeWidth={2}
        dot={false}
      />
    </Chart>
  );
}

function GridDemo() {
  const data = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: i,
      y: 40 + Math.random() * 40,
    }));
  }, []);

  return (
    <Chart data={data} width={280} height={120}>
      <CartesianGrid strokeDasharray="5 5" stroke="#d4d4d4" />
      <Line
        dataKey="y"
        type="linear"
        stroke="#1a1a1a"
        strokeWidth={2}
        dot={{ r: 4 }}
      />
    </Chart>
  );
}

function TooltipDemo() {
  const data = useMemo(() => {
    return appleStock.slice(0, 30).map((d, i) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: d.close,
    }));
  }, []);

  return (
    <Chart data={data} width={280} height={120}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
      <XAxis dataKey="date" />
      <YAxis />
      <Line
        dataKey="price"
        type="monotone"
        stroke="#3b82f6"
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 6 }}
        name="Price"
      />
      <Tooltip />
    </Chart>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 sm:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-24">
          <div className="flex items-center gap-4 mb-6">
            <Logo size={56} />
            <h1 className="sr-only">Qurve</h1>
          </div>
          <div className="max-w-2xl">
            <p
              className="text-2xl text-[#1a1a1a] leading-relaxed mb-4"
              style={{ textWrap: "balance" }}
            >
              Canvas-powered charts that actually{" "}
              <em className="not-italic font-serif italic">perform</em>.
            </p>
            <p className="text-[#666] leading-relaxed mb-8">
              A high-performance React charting library. No DOM bloat. No SVG
              overhead. Just fast, crisp, Recharts-compatible visuals.
            </p>
            {/* CTA */}
            <div className="flex items-center gap-4">
              <code className="text-sm font-mono bg-[#1a1a1a] text-white px-4 py-2.5 rounded-lg select-all">
                npm install qurve
              </code>
              <span className="text-[#999] text-sm">or check the source below</span>
            </div>
          </div>
        </header>

        <main>
          {/* Primitives — Implemented */}
          <section className="mb-16">
            <h2 className="text-sm uppercase tracking-wider text-[#999] mb-8 font-medium">
              Primitives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PrimitiveCard
                name="<Chart />"
                description="The root container. Manages canvas context and coordinates all child components."
                status="implemented"
                example={<SimpleChartDemo />}
              />
              <PrimitiveCard
                name="<Line />"
                description="Line series with support for linear, monotone, and step interpolation."
                status="implemented"
                example={<LineChartDemo />}
              />
              <PrimitiveCard
                name="Axes"
                description="Axis components with automatic tick generation and customizable formatting."
                status="implemented"
                example={<AxisDemo />}
              />
              <PrimitiveCard
                name="<CartesianGrid />"
                description="Reference grid lines for easier data reading. Configurable stroke patterns."
                status="implemented"
                example={<GridDemo />}
              />
              <PrimitiveCard
                name="<Tooltip />"
                description="Interactive tooltips with crosshair cursor and value display on hover."
                status="implemented"
                example={<TooltipDemo />}
              />
            </div>
          </section>

          {/* Planned Primitives — compact list */}
          <section className="mb-20">
            <h2 className="text-sm uppercase tracking-wider text-[#999] mb-4 font-medium">
              Planned
            </h2>
            <div className="flex flex-wrap gap-2">
              {PLANNED_PRIMITIVES.map((p) => (
                <span
                  key={p.name}
                  className="text-sm font-mono text-[#666] bg-white px-3 py-1.5 rounded-lg border border-[#e8e8e8] hover:border-[#d0d0d0] transition-colors"
                  title={p.description}
                >
                  {"<"}{p.name}{" />"}
                </span>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-sm uppercase tracking-wider text-[#999] mb-8 font-medium">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-lg p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
            <h2 className="text-sm uppercase tracking-wider text-[#999] mb-8 font-medium">
              Examples
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="text-sm font-medium mb-6 text-[#1a1a1a]">
                  Single Line
                </h3>
                <div className="mb-6">
                  <LineChartDemo />
                </div>
                <pre className="text-xs text-[#666] bg-[#f8f8f8] p-4 rounded-lg overflow-x-auto font-mono">
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

              <div className="bg-white rounded-lg p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="text-sm font-medium mb-6 text-[#1a1a1a]">
                  Multiple Lines
                </h3>
                <div className="mb-6">
                  <MultiLineDemo />
                </div>
                <pre className="text-xs text-[#666] bg-[#f8f8f8] p-4 rounded-lg overflow-x-auto font-mono">
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
            <h2 className="text-sm uppercase tracking-wider text-[#999] mb-8 font-medium">
              Performance
            </h2>
            <LineBenchmark />
          </section>
        </main>

        <footer className="mt-24 pt-8 border-t border-[#eaeaea]">
          <div className="flex items-center justify-between">
            <p className="text-[#999] text-sm">Proof of concept</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-[#999] text-sm">Canvas ready</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
