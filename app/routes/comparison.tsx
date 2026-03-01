import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ResponsiveContainer as QurveContainer,
  Chart as QurveChart,
  Line as QurveLine,
  XAxis as QurveXAxis,
  YAxis as QurveYAxis,
  CartesianGrid as QurveGrid,
  Tooltip as QurveTooltip,
} from "qurve";
import {
  ResponsiveContainer as RechartsContainer,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

type Point = { x: number; value: number };

const DATASETS = [1000, 5000, 10000, 50000, 100000];
const GRID_COLOR = "#cbd5e1";
const LINE_COLOR = "#3b82f6";

function generateData(count: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const trend = Math.sin(index / 180) * 22;
    const wave = Math.cos(index / 40) * 9;
    const drift = (index / count) * 28;
    return {
      x: index,
      value: 72 + trend + wave + drift,
    };
  });
}

function CompareCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
        <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
      </header>
      <div className="h-[280px] rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
        {children}
      </div>
    </article>
  );
}

export default function ComparisonPage() {
  const [points, setPoints] = useState(10000);

  const data = useMemo(() => generateData(points), [points]);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-[var(--text)] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Comparison</p>
            <h1 className="text-3xl font-semibold">Qurve vs Recharts</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
              Same dataset, same dimensions, side-by-side rendering. Use this page as a visual baseline while tuning
              performance for larger point counts.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex w-fit items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)]"
          >
            Back to Home
          </Link>
        </header>

        <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Data volume</p>
          <div className="flex flex-wrap gap-2">
            {DATASETS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPoints(size)}
                className="rounded-md border px-3 py-1.5 text-sm transition-colors"
                style={{
                  borderColor: points === size ? "var(--accent)" : "var(--border)",
                  color: points === size ? "var(--accent)" : "var(--text)",
                  backgroundColor: "var(--surface)",
                }}
              >
                {size.toLocaleString()} pts
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CompareCard title="Qurve (Canvas)" subtitle="Line + Tooltip rendered through canvas primitives.">
            <QurveContainer>
              <QurveChart data={data} margin={{ top: 10, right: 12, left: 12, bottom: 18 }}>
                <QurveGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <QurveXAxis dataKey="x" />
                <QurveYAxis />
                <QurveLine dataKey="value" stroke={LINE_COLOR} dot={false} strokeWidth={2} />
                <QurveTooltip />
              </QurveChart>
            </QurveContainer>
          </CompareCard>

          <CompareCard title="Recharts (SVG)" subtitle="Equivalent line chart in an SVG rendering model.">
            <RechartsContainer width="100%" height="100%">
              <RechartsLineChart data={data} margin={{ top: 10, right: 12, left: 12, bottom: 18 }}>
                <RechartsGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <RechartsXAxis dataKey="x" tickMargin={6} minTickGap={28} />
                <RechartsYAxis />
                <RechartsLine
                  type="monotone"
                  dataKey="value"
                  stroke={LINE_COLOR}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <RechartsTooltip />
              </RechartsLineChart>
            </RechartsContainer>
          </CompareCard>
        </section>
      </div>
    </main>
  );
}
