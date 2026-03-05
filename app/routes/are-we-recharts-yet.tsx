import { Link } from "react-router";

type Status = "done" | "partial" | "missing";

interface Item {
  component: string;
  recharts: string;
  qurve: string;
  status: Status;
  notes?: string;
}

const COMPONENTS: Item[] = [
  // Chart containers
  { component: "LineChart", recharts: "LineChart", qurve: "Chart", status: "done", notes: "Use Chart; compose Line, XAxis, YAxis" },
  { component: "BarChart", recharts: "BarChart", qurve: "Chart", status: "done", notes: "Use Chart; compose Bar, XAxis, YAxis" },
  { component: "AreaChart", recharts: "AreaChart", qurve: "Chart", status: "done", notes: "Use Chart; compose Area, XAxis, YAxis" },
  { component: "ComposedChart", recharts: "ComposedChart", qurve: "Chart", status: "done", notes: "Single Chart; mix Line, Bar, Area, Scatter" },
  { component: "PieChart", recharts: "PieChart", qurve: "Chart + Pie", status: "done", notes: "Chart with Pie child" },
  { component: "ScatterChart", recharts: "ScatterChart", qurve: "Chart", status: "done", notes: "Use Chart; compose Scatter, XAxis, YAxis" },
  { component: "RadarChart", recharts: "RadarChart", qurve: "—", status: "missing" },
  { component: "RadialBarChart", recharts: "RadialBarChart", qurve: "—", status: "missing" },
  { component: "FunnelChart", recharts: "FunnelChart", qurve: "—", status: "missing" },
  { component: "Treemap", recharts: "Treemap", qurve: "—", status: "missing" },
  { component: "SankeyChart", recharts: "SankeyChart", qurve: "—", status: "missing" },
  // General
  { component: "ResponsiveContainer", recharts: "ResponsiveContainer", qurve: "ResponsiveContainer", status: "done" },
  { component: "Legend", recharts: "Legend", qurve: "Legend", status: "done" },
  { component: "Tooltip", recharts: "Tooltip", qurve: "Tooltip", status: "done" },
  { component: "Cell", recharts: "Cell", qurve: "—", status: "partial", notes: "Use colors[] on Pie; fill/stroke per series on Bar" },
  { component: "Label", recharts: "Label", qurve: "Pie label", status: "partial", notes: "Pie label prop; no general Label component" },
  { component: "LabelList", recharts: "LabelList", qurve: "—", status: "partial", notes: "Pie has label/labelFormatter" },
  { component: "Customized", recharts: "Customized", qurve: "—", status: "missing", notes: "Custom draw slot" },
  // Cartesian series
  { component: "Area", recharts: "Area", qurve: "Area", status: "done" },
  { component: "Bar", recharts: "Bar", qurve: "Bar", status: "done" },
  { component: "Line", recharts: "Line", qurve: "Line", status: "done" },
  { component: "Scatter", recharts: "Scatter", qurve: "Scatter", status: "done" },
  { component: "XAxis", recharts: "XAxis", qurve: "XAxis", status: "done" },
  { component: "YAxis", recharts: "YAxis", qurve: "YAxis", status: "done" },
  { component: "ZAxis", recharts: "ZAxis", qurve: "—", status: "missing" },
  { component: "Brush", recharts: "Brush", qurve: "Brush", status: "done" },
  { component: "CartesianGrid", recharts: "CartesianGrid", qurve: "CartesianGrid", status: "done" },
  { component: "ReferenceLine", recharts: "ReferenceLine", qurve: "—", status: "missing" },
  { component: "ReferenceDot", recharts: "ReferenceDot", qurve: "—", status: "missing" },
  { component: "ReferenceArea", recharts: "ReferenceArea", qurve: "—", status: "missing" },
  { component: "ErrorBar", recharts: "ErrorBar", qurve: "—", status: "missing" },
  // Polar
  { component: "Pie", recharts: "Pie", qurve: "Pie", status: "done" },
  { component: "Radar", recharts: "Radar", qurve: "—", status: "missing" },
  { component: "RadialBar", recharts: "RadialBar", qurve: "—", status: "missing" },
  { component: "PolarGrid", recharts: "PolarGrid", qurve: "—", status: "missing" },
  { component: "PolarAngleAxis", recharts: "PolarAngleAxis", qurve: "—", status: "missing" },
  { component: "PolarRadiusAxis", recharts: "PolarRadiusAxis", qurve: "—", status: "missing" },
  // Shapes (Recharts low-level; Qurve draws via canvas)
  { component: "Sector", recharts: "Sector", qurve: "—", status: "done", notes: "Internal to Pie; canvas drawing" },
  { component: "Curve", recharts: "Curve", qurve: "—", status: "done", notes: "Internal to Line; drawLinePath in core" },
  { component: "Dot", recharts: "Dot", qurve: "—", status: "done", notes: "Line dot/activeDot; drawLineDots" },
];

function statusBadge(status: Status) {
  switch (status) {
    case "done":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          ✓ Done
        </span>
      );
    case "partial":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          ~ Partial
        </span>
      );
    case "missing":
      return (
        <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-600 dark:text-slate-300">
          — Missing
        </span>
      );
  }
}

function ProgressBar({ done, partial, total }: { done: number; partial: number; total: number }) {
  const donePct = total > 0 ? (done / total) * 100 : 0;
  const partialPct = total > 0 ? (partial / total) * 100 : 0;
  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <div className="flex h-full">
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: `${donePct}%` }}
        />
        <div
          className="bg-amber-400 transition-all duration-500"
          style={{ width: `${partialPct}%` }}
        />
      </div>
    </div>
  );
}

export default function AreWeRechartsYet() {
  const done = COMPONENTS.filter((c) => c.status === "done").length;
  const partial = COMPONENTS.filter((c) => c.status === "partial").length;
  const total = COMPONENTS.length;
  const score = total > 0 ? Math.round(((done + partial * 0.5) / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-[var(--text)] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/"
              className="mb-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
            >
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Are we Recharts yet?</h1>
            <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
              Progress toward a drop-in replacement for Recharts. Same composable API, Canvas rendering for performance.
            </p>
          </div>
        </header>

        <section className="mb-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Overall compatibility</h2>
            <span className="text-2xl font-bold text-[var(--accent)]">{score}%</span>
          </div>
          <ProgressBar done={done} partial={partial} total={total} />
          <div className="mt-3 flex gap-6 text-sm text-[var(--text-muted)]">
            <span>{done} full</span>
            <span>{partial} partial</span>
            <span>{total - done - partial} missing</span>
            <span>{total} total</span>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  <th className="px-4 py-3 text-left font-medium">Component</th>
                  <th className="px-4 py-3 text-left font-medium">Recharts</th>
                  <th className="px-4 py-3 text-left font-medium">Qurve</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {COMPONENTS.map((item) => (
                  <tr
                    key={item.component}
                    className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]/50"
                  >
                    <td className="px-4 py-3 font-medium">{item.component}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{item.recharts}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{item.qurve}</td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    <td className="max-w-xs px-4 py-3 text-[var(--text-muted)]">{item.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <h2 className="mb-3 text-lg font-semibold">Migration notes</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-[var(--text-muted)]">
            <li>
              <strong>Chart vs LineChart/BarChart:</strong> Qurve uses a single <code className="rounded bg-[var(--surface-muted)] px-1">Chart</code>.
              Replace <code className="rounded bg-[var(--surface-muted)] px-1">LineChart</code> with <code className="rounded bg-[var(--surface-muted)] px-1">Chart</code> and keep the same children.
            </li>
            <li>
              <strong>dataKey:</strong> Same prop name. Works with string or function.
            </li>
            <li>
              <strong>stroke, fill, strokeWidth:</strong> Same props on Line, Bar, Area, Scatter.
            </li>
            <li>
              <strong>margin:</strong> Chart accepts <code className="rounded bg-[var(--surface-muted)] px-1">margin</code> object.
            </li>
            <li>
              <strong>Animation:</strong> Recharts animates by default. Qurve has no built-in animation (Canvas redraws directly).
            </li>
            <li>
              <strong>ReferenceLine/ReferenceDot/ReferenceArea:</strong> Not yet implemented.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
