import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  Chart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "qurve";
import { useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { Link } from "react-router";

const SERIES = [
  { month: "Jan", a: 42, b: 28 },
  { month: "Feb", a: 55, b: 34 },
  { month: "Mar", a: 48, b: 41 },
  { month: "Apr", a: 70, b: 38 },
  { month: "May", a: 62, b: 52 },
  { month: "Jun", a: 78, b: 47 },
];

const PIE = [
  { name: "Product", value: 42 },
  { name: "Services", value: 28 },
  { name: "Other", value: 18 },
];

type Recipe = {
  id: string;
  anchor: string;
  title: string;
  blurb: string;
  code: string;
  demo: ReactNode;
};

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4 font-mono text-[12px] leading-relaxed text-[var(--text)]">
      <code>{code.trim()}</code>
    </pre>
  );
}

function DemoShell({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className="flex min-h-[280px] flex-col overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]"
      style={style}
    >
      <div className="border-b border-[var(--border)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="min-h-0 flex-1 p-2">{children}</div>
    </div>
  );
}

function ChartBox({ height = 220, children }: { height?: number; children: ReactNode }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>{children as ReactElement}</ResponsiveContainer>
    </div>
  );
}

/** Remount when CSS vars change so Chart re-reads theme from the container. */
function ThemedFrame({
  vars,
  label,
  children,
}: {
  vars: Record<string, string>;
  label: string;
  children: ReactNode;
}) {
  const key = Object.values(vars).join("|");
  return (
    <DemoShell label={label} style={vars as CSSProperties}>
      <div key={key}>{children}</div>
    </DemoShell>
  );
}

function RecipeSection({ recipe }: { recipe: Recipe }) {
  return (
    <section id={recipe.anchor} className="scroll-mt-24 border-t border-[var(--border)] pt-14">
      <div className="mb-6 max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">
          {recipe.id}
        </p>
        <h2
          className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl"
          style={{ textWrap: "balance" }}
        >
          {recipe.title}
        </h2>
        <p className="mt-3 text-[var(--text-muted)] text-base leading-relaxed">{recipe.blurb}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {recipe.demo}
      </div>
      <div className="mt-6">
        <CodeBlock code={recipe.code} />
      </div>
    </section>
  );
}

export default function StylingGuide() {
  const [chrome, setChrome] = useState<"paper" | "ink">("paper");

  const recipes: Recipe[] = [
    {
      id: "01 · css vars",
      anchor: "css-vars",
      title: "Theme the chrome once — keep series free",
      blurb:
        "Set Qurve CSS variables on a parent. Axes, grid, background, and tooltip pick them up. Series colors stay yours to invent.",
      code: `
<div style={{
  ['--qurve-chart-bg']: '#0b1220',
  ['--qurve-grid-stroke']: '#243041',
  ['--qurve-axis-stroke']: '#8b95a8',
  ['--qurve-font-family']: 'DM Sans, sans-serif',
  ['--qurve-tooltip-bg']: 'rgba(16, 22, 31, 0.96)',
}}>
  <Chart data={data}>
    <CartesianGrid />
    <XAxis dataKey="month" />
    <YAxis />
    <Line dataKey="a" stroke="#5eead4" />
  </Chart>
</div>
`,
      demo: (
        <>
          <ThemedFrame
            label="Paper chrome"
            vars={{
              ["--qurve-chart-bg"]: "#f5f7fa",
              ["--qurve-grid-stroke"]: "#c5ced9",
              ["--qurve-axis-stroke"]: "#5b6577",
              ["--qurve-font-family"]: "DM Sans, sans-serif",
              ["--qurve-tooltip-bg"]: "rgba(245, 247, 250, 0.96)",
            }}
          >
            <ChartBox>
              <Chart data={SERIES} margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Line dataKey="a" type="monotone" stroke="#0f766e" strokeWidth={2.5} dot={false} />
                <Tooltip />
              </Chart>
            </ChartBox>
          </ThemedFrame>
          <ThemedFrame
            label="Ink chrome"
            vars={{
              ["--qurve-chart-bg"]: "#0b1220",
              ["--qurve-grid-stroke"]: "#243041",
              ["--qurve-axis-stroke"]: "#8b95a8",
              ["--qurve-font-family"]: "DM Sans, sans-serif",
              ["--qurve-tooltip-bg"]: "rgba(16, 22, 31, 0.96)",
            }}
          >
            <ChartBox>
              <Chart data={SERIES} margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Line dataKey="a" type="monotone" stroke="#5eead4" strokeWidth={2.5} dot={false} />
                <Tooltip
                  contentStyle={{ border: "1px solid #35455c", color: "#e8edf5" }}
                  labelStyle={{ color: "#e8edf5" }}
                  itemStyle={{ color: "#e8edf5" }}
                />
              </Chart>
            </ChartBox>
          </ThemedFrame>
        </>
      ),
    },
    {
      id: "02 · series props",
      anchor: "series-props",
      title: "Or style each series like a design token",
      blurb:
        "stroke, fill, strokeWidth, dash, dots — Recharts-familiar props. Same chart, two brand moods.",
      code: `
<Line dataKey="a" stroke="#0f766e" strokeWidth={2.5} type="monotone" dot={false} />
<Line dataKey="b" stroke="#c2410c" strokeWidth={2} type="monotone" dot={false} />

{/* …or loud product marketing */}
<Line dataKey="a" stroke="#db2777" strokeWidth={3} type="monotone" />
<Area dataKey="b" fill="#8b5cf6" fillOpacity={0.25} stroke="#7c3aed" />
`,
      demo: (
        <>
          <DemoShell label="Editorial teal / copper">
            <ChartBox>
              <Chart data={SERIES} backgroundColor="#f5f7fa" margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
                <CartesianGrid stroke="#c5ced9" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#5b6577" />
                <YAxis stroke="#5b6577" />
                <Line dataKey="a" type="monotone" stroke="#0f766e" strokeWidth={2.5} dot={false} name="Revenue" />
                <Line dataKey="b" type="monotone" stroke="#c2410c" strokeWidth={2} dot={false} name="Cost" />
                <Legend />
              </Chart>
            </ChartBox>
          </DemoShell>
          <DemoShell label="Loud marketing">
            <ChartBox>
              <Chart data={SERIES} backgroundColor="#0f0a12" margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
                <CartesianGrid stroke="#3b2748" strokeDasharray="2 4" />
                <XAxis dataKey="month" stroke="#c4b5d4" />
                <YAxis stroke="#c4b5d4" />
                <Area
                  dataKey="b"
                  type="monotone"
                  fill="#8b5cf6"
                  fillOpacity={0.28}
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                  name="Cost"
                />
                <Line dataKey="a" type="monotone" stroke="#f472b6" strokeWidth={3} dot={{ r: 3 }} name="Revenue" />
                <Legend />
              </Chart>
            </ChartBox>
          </DemoShell>
        </>
      ),
    },
    {
      id: "03 · palette",
      anchor: "palette",
      title: "Hand Chart a palette — series inherit in order",
      blurb:
        "Pass colors on Chart (or PieChart). Leave fill/stroke off the series and Qurve walks the list. Great for design-system palettes.",
      code: `
<Chart
  data={data}
  colors={['#0d9488', '#0284c7', '#d97706', '#7c3aed']}
>
  <Bar dataKey="a" />   {/* → #0d9488 */}
  <Bar dataKey="b" />   {/* → #0284c7 */}
</Chart>
`,
      demo: (
        <>
          <DemoShell label="Ocean system palette">
            <ChartBox>
              <Chart
                data={SERIES}
                backgroundColor="#f5f7fa"
                colors={["#0d9488", "#0284c7", "#d97706"]}
                margin={{ top: 12, right: 12, bottom: 8, left: 8 }}
              >
                <CartesianGrid stroke="#c5ced9" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#5b6577" />
                <YAxis stroke="#5b6577" />
                <Bar dataKey="a" name="A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="b" name="B" radius={[4, 4, 0, 0]} />
                <Legend />
              </Chart>
            </ChartBox>
          </DemoShell>
          <DemoShell label="Warm dusk palette">
            <ChartBox>
              <Chart
                data={SERIES}
                backgroundColor="#1a1410"
                colors={["#f59e0b", "#ef4444", "#a855f7"]}
                margin={{ top: 12, right: 12, bottom: 8, left: 8 }}
              >
                <CartesianGrid stroke="#3d3228" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#d6c3b0" />
                <YAxis stroke="#d6c3b0" />
                <Bar dataKey="a" name="A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="b" name="B" radius={[4, 4, 0, 0]} />
                <Legend />
              </Chart>
            </ChartBox>
          </DemoShell>
        </>
      ),
    },
    {
      id: "04 · cell",
      anchor: "cell",
      title: "Per-slice / per-bar color with Cell",
      blurb:
        "When one series needs many colors, nest Cell children. Same pattern as Recharts — works on Bar, Pie, Funnel, RadialBar, Treemap, Sankey.",
      code: `
<Pie dataKey="value" nameKey="name">
  <Cell fill="#0d9488" />
  <Cell fill="#0284c7" />
  <Cell fill="#d97706" />
</Pie>
`,
      demo: (
        <>
          <DemoShell label="Pie · Cell palette">
            <ChartBox height={240}>
              <PieChart data={PIE} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} label>
                  <Cell fill="#0d9488" />
                  <Cell fill="#0284c7" />
                  <Cell fill="#d97706" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartBox>
          </DemoShell>
          <DemoShell label="Bar · categorical Cell">
            <ChartBox height={240}>
              <Chart data={SERIES.slice(0, 4)} backgroundColor="#f5f7fa" margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
                <CartesianGrid stroke="#c5ced9" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#5b6577" />
                <YAxis stroke="#5b6577" />
                <Bar dataKey="a" radius={[6, 6, 0, 0]}>
                  <Cell fill="#0f766e" />
                  <Cell fill="#0d9488" />
                  <Cell fill="#14b8a6" />
                  <Cell fill="#5eead4" />
                </Bar>
              </Chart>
            </ChartBox>
          </DemoShell>
        </>
      ),
    },
    {
      id: "05 · tooltip",
      anchor: "tooltip",
      title: "Tooltip is just HTML — style it your way",
      blurb:
        "contentStyle / labelStyle / itemStyle for quick polish, or pass content for a fully custom React tooltip that matches your product UI.",
      code: `
<Tooltip
  contentStyle={{
    background: '#0b1220',
    border: '1px solid #35455c',
    borderRadius: 10,
    color: '#e8edf5',
  }}
  labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
/>

{/* or fully custom */}
<Tooltip content={({ active, payload, label }) =>
  active ? <YourCard label={label} rows={payload} /> : null
} />
`,
      demo: (
        <>
          <DemoShell label="Default-ish · light">
            <ChartBox>
              <Chart data={SERIES} backgroundColor="#f5f7fa" margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
                <CartesianGrid stroke="#c5ced9" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#5b6577" />
                <YAxis stroke="#5b6577" />
                <Line dataKey="a" type="monotone" stroke="#0f766e" strokeWidth={2} dot={false} />
                <Tooltip />
              </Chart>
            </ChartBox>
          </DemoShell>
          <DemoShell label="Custom card · dark">
            <ChartBox>
              <Chart data={SERIES} backgroundColor="#0b1220" margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
                <CartesianGrid stroke="#243041" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#8b95a8" />
                <YAxis stroke="#8b95a8" />
                <Line dataKey="a" type="monotone" stroke="#5eead4" strokeWidth={2} dot={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border border-[#35455c] bg-[#10161f] px-3 py-2 shadow-lg">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-[#8b95a8]">
                          {String(label)}
                        </div>
                        <div className="mt-1 text-sm font-medium text-[#e8edf5]">
                          {payload[0].name}:{" "}
                          <span className="text-[#5eead4]">
                            {typeof payload[0].value === "number"
                              ? payload[0].value.toFixed(0)
                              : String(payload[0].value)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
              </Chart>
            </ChartBox>
          </DemoShell>
        </>
      ),
    },
  ];

  const liveVars =
    chrome === "paper"
      ? {
          ["--qurve-chart-bg"]: "#f5f7fa",
          ["--qurve-grid-stroke"]: "#c5ced9",
          ["--qurve-axis-stroke"]: "#5b6577",
          ["--qurve-font-family"]: "DM Sans, sans-serif",
          ["--qurve-tooltip-bg"]: "rgba(245, 247, 250, 0.96)",
        }
      : {
          ["--qurve-chart-bg"]: "#0b1220",
          ["--qurve-grid-stroke"]: "#243041",
          ["--qurve-axis-stroke"]: "#8b95a8",
          ["--qurve-font-family"]: "DM Sans, sans-serif",
          ["--qurve-tooltip-bg"]: "rgba(16, 22, 31, 0.96)",
        };

  return (
    <div className="site-atmosphere text-[var(--text)]">
      <div className="site-content relative mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
        <header className="mb-16">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/"
              className="font-display text-sm font-semibold tracking-tight text-[var(--text)] hover:text-[var(--accent)]"
            >
              Qurve
            </Link>
            <nav className="flex flex-wrap gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              <Link to="/comparison" className="hover:text-[var(--accent)]">
                Comparison
              </Link>
              <Link to="/are-we-recharts-yet" className="hover:text-[var(--accent)]">
                Parity
              </Link>
              <span className="text-[var(--accent)]">Styling</span>
            </nav>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Guide · Styling
          </p>
          <h1
            className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl"
            style={{ textWrap: "balance" }}
          >
            Style charts like the rest of your UI.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--text-muted)] text-base leading-relaxed">
            Three layers, no theme provider required: CSS variables for chrome,{" "}
            <code className="rounded bg-[var(--surface-muted)] px-1 font-mono text-[13px]">colors</code>{" "}
            for palettes, series props /{" "}
            <code className="rounded bg-[var(--surface-muted)] px-1 font-mono text-[13px]">Cell</code> for
            precision. Pick the layer that fits.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {recipes.map((r) => (
              <a
                key={r.anchor}
                href={`#${r.anchor}`}
                className="rounded-full border border-[var(--border)] px-3 py-1.5 font-mono text-[11px] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {r.id}
              </a>
            ))}
          </div>
        </header>

        {/* Interactive hero: flip chrome */}
        <section className="mb-20">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">Flip the chrome</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Same series. Only <code className="font-mono text-[12px]">--qurve-*</code> variables change.
              </p>
            </div>
            <div className="flex gap-2">
              {(["paper", "ink"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChrome(mode)}
                  className={`rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                    chrome === mode
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <ThemedFrame label={`Live · ${chrome}`} vars={liveVars}>
            <ChartBox height={260}>
              <Chart
                key={chrome}
                data={SERIES}
                colors={chrome === "paper" ? ["#0f766e", "#c2410c"] : ["#5eead4", "#fb923c"]}
                margin={{ top: 16, right: 16, bottom: 12, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Line dataKey="a" type="monotone" strokeWidth={2.5} dot={false} name="Revenue" />
                <Line dataKey="b" type="monotone" strokeWidth={2} dot={false} name="Cost" />
                <Tooltip
                  contentStyle={
                    chrome === "ink"
                      ? { border: "1px solid #35455c", color: "#e8edf5" }
                      : undefined
                  }
                  labelStyle={chrome === "ink" ? { color: "#e8edf5" } : undefined}
                  itemStyle={chrome === "ink" ? { color: "#e8edf5" } : undefined}
                />
                <Legend />
              </Chart>
            </ChartBox>
          </ThemedFrame>
        </section>

        <div className="space-y-4">
          {recipes.map((recipe) => (
            <RecipeSection key={recipe.id} recipe={recipe} />
          ))}
        </div>

        <section className="mt-20 border-t border-[var(--border)] pt-12">
          <h2 className="font-display text-xl font-semibold tracking-tight">Cheat sheet</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="py-2 pr-4 font-medium">Layer</th>
                  <th className="py-2 pr-4 font-medium">Controls</th>
                  <th className="py-2 font-medium">Best for</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text)]">
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4 font-medium">CSS variables</td>
                  <td className="py-3 pr-4 font-mono text-[12px] text-[var(--text-muted)]">
                    --qurve-chart-bg, -grid-stroke, -axis-stroke, -font-family, -tooltip-bg
                  </td>
                  <td className="py-3 text-[var(--text-muted)]">App dark mode / brand chrome</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4 font-medium">Chart props</td>
                  <td className="py-3 pr-4 font-mono text-[12px] text-[var(--text-muted)]">
                    backgroundColor, colors
                  </td>
                  <td className="py-3 text-[var(--text-muted)]">One-off backgrounds & palettes</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4 font-medium">Series props</td>
                  <td className="py-3 pr-4 font-mono text-[12px] text-[var(--text-muted)]">
                    stroke, fill, strokeWidth, strokeDasharray, font*
                  </td>
                  <td className="py-3 text-[var(--text-muted)]">Per-series brand expression</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4 font-medium">Cell</td>
                  <td className="py-3 pr-4 font-mono text-[12px] text-[var(--text-muted)]">
                    fill / stroke per item
                  </td>
                  <td className="py-3 text-[var(--text-muted)]">Categorical / multi-hue series</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Tooltip</td>
                  <td className="py-3 pr-4 font-mono text-[12px] text-[var(--text-muted)]">
                    contentStyle, content render prop
                  </td>
                  <td className="py-3 text-[var(--text-muted)]">Match product UI chrome</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            Full write-up also ships in the package:{" "}
            <code className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[12px]">
              packages/qurve/STYLING.md
            </code>
          </p>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-8 text-sm text-[var(--text-muted)]">
          <Link to="/" className="hover:text-[var(--accent)]">
            ← Home
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--accent)]">
            Style is a feature
          </p>
        </footer>
      </div>
    </div>
  );
}
