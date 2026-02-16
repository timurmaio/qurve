import { Chart, XAxis, YAxis, CartesianGrid, Line } from "../../src/components";
import { LineBenchmark } from "../../src/components/Benchmarks";
import { useMemo } from "react";
import { appleStock } from "../../src/mock";

// Logo component using the actual logo
function Logo({ size = 64 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="Qurve"
      width={size}
      height={size}
      className="object-contain"
      style={{ filter: "invert(1)" }}
    />
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
    planned: "bg-[#f0f0f0] text-[#999]",
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
    <div className="bg-white rounded-sm p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-transparent hover:border-[#eaeaea] transition-all group flex flex-col h-full">
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

// Feature card component
function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] mt-2 flex-shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-[#1a1a1a] mb-1">{title}</h4>
        <p className="text-[#666] text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

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

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-8 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <Logo size={132} />
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
            <p className="text-[#666] leading-relaxed">
              A high-performance React charting library. No DOM bloat. No SVG
              overhead. Just fast, crisp, Recharts-compatible visuals.
            </p>
          </div>
        </header>

        <main>
          {/* Primitives Grid */}
          <section className="mb-20">
            <h2 className="text-sm uppercase tracking-wider text-[#999] mb-8 font-medium">
              Primitives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                name="<Area />"
                description="Filled area charts with gradient support and stacking."
                status="planned"
              />
              <PrimitiveCard
                name="<Bar />"
                description="Vertical and horizontal bar charts with grouping and stacking."
                status="planned"
              />
              <PrimitiveCard
                name="<Scatter />"
                description="Scatter plots with customizable point shapes and sizes."
                status="planned"
              />
              <PrimitiveCard
                name="<Pie />"
                description="Pie and donut charts with sector highlighting."
                status="planned"
              />
              <PrimitiveCard
                name="<Tooltip />"
                description="Interactive tooltips that follow cursor position."
                status="planned"
              />
              <PrimitiveCard
                name="<Legend />"
                description="Automatic legend generation with click-to-toggle."
                status="planned"
              />
              <PrimitiveCard
                name="<Brush />"
                description="Range selector for zooming and panning through data."
                status="planned"
              />
              <PrimitiveCard
                name="<ResponsiveContainer />"
                description="Automatic sizing based on parent container dimensions."
                status="planned"
              />
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-sm uppercase tracking-wider text-[#999] mb-8 font-medium">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-sm p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
              <div className="bg-white rounded-sm p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="text-sm font-medium mb-6 text-[#1a1a1a]">
                  Single Line
                </h3>
                <div className="mb-6">
                  <LineChartDemo />
                </div>
                <pre className="text-xs text-[#666] bg-[#f8f8f8] p-4 rounded overflow-x-auto font-mono">
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

              <div className="bg-white rounded-sm p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="text-sm font-medium mb-6 text-[#1a1a1a]">
                  Multiple Lines
                </h3>
                <div className="mb-6">
                  <MultiLineDemo />
                </div>
                <pre className="text-xs text-[#666] bg-[#f8f8f8] p-4 rounded overflow-x-auto font-mono">
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
