# Styling Qurve charts

Qurve is canvas under the hood, but styling should feel like the rest of your React UI. There is **no required ThemeProvider** — pick the layer that fits.

## Three layers

| Layer | What it styles | When to use |
|---|---|---|
| **CSS variables** | Chart background, grid, axes, font, tooltip background | App-wide dark mode / brand chrome |
| **`Chart` props** | `backgroundColor`, `colors` palette | One chart or a design-system palette |
| **Series / `Cell` / Tooltip** | Per-series strokes & fills, categorical colors, HTML tooltip | Precision and product UI match |

Layers compose: set chrome with CSS vars, hand out a palette with `colors`, override one series with `stroke`.

---

## 1. CSS variables (chrome)

Put these on any ancestor of `Chart`. Qurve reads them from the chart container on mount.

```css
.dashboard {
  --qurve-chart-bg: #0b1220;
  --qurve-grid-stroke: #243041;
  --qurve-axis-stroke: #8b95a8;
  --qurve-font-family: "DM Sans", system-ui, sans-serif;
  --qurve-tooltip-bg: rgba(16, 22, 31, 0.96);
}
```

```tsx
<div className="dashboard">
  <Chart data={data}>
    <CartesianGrid />
    <XAxis dataKey="month" />
    <YAxis />
    <Line dataKey="revenue" stroke="#5eead4" type="monotone" />
    <Tooltip />
  </Chart>
</div>
```

Constants are exported as `QURVE_CSS_VARS` / type `QurveTheme` from `qurve`.

> **Note:** Theme is re-read when the chart size changes and when ancestor `style` / `class` / `data-theme` attributes change (so CSS-variable dark-mode toggles work without a forced remount). Default tooltip text / border contrast auto-adapts to `--qurve-tooltip-bg`.

---

## 2. Chart-level props

```tsx
<Chart
  data={data}
  backgroundColor="#f5f7fa"
  colors={["#0d9488", "#0284c7", "#d97706", "#7c3aed"]}
>
  <Bar dataKey="a" /> {/* → colors[0] */}
  <Bar dataKey="b" /> {/* → colors[1] */}
</Chart>
```

- `backgroundColor` overrides `--qurve-chart-bg` for that chart.
- `colors` is the default series / slice palette when a series does not set `stroke` / `fill`.

---

## 3. Series props (Recharts-familiar)

```tsx
<Line
  dataKey="revenue"
  type="monotone"
  stroke="#0f766e"
  strokeWidth={2.5}
  dot={{ r: 3, fill: "#0f766e" }}
/>
<Area
  dataKey="cost"
  fill="#c2410c"
  fillOpacity={0.2}
  stroke="#c2410c"
/>
<Bar dataKey="orders" fill="#0284c7" radius={[4, 4, 0, 0]} />
```

Axes and grid also take `stroke`, `fontSize`, `fontFamily`, `fontWeight`.

---

## 4. `Cell` for per-item color

```tsx
<Pie dataKey="value" nameKey="name">
  <Cell fill="#0d9488" />
  <Cell fill="#0284c7" />
  <Cell fill="#d97706" />
</Pie>

<Bar dataKey="score">
  {data.map((row) => (
    <Cell key={row.id} fill={row.color} />
  ))}
</Bar>
```

Works on Bar, Pie, Funnel, RadialBar, Treemap, Sankey (same idea as Recharts).

---

## 5. Tooltip = HTML

Quick polish:

```tsx
<Tooltip
  contentStyle={{
    background: "#0b1220",
    border: "1px solid #35455c",
    borderRadius: 10,
    color: "#e8edf5",
  }}
  labelStyle={{ color: "#94a3b8" }}
/>
```

Full product UI:

```tsx
<Tooltip
  content={({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return <YourDesignSystemCard label={label} rows={payload} />;
  }}
/>
```

---

## Recipe: dark mode in 30 seconds

```tsx
function ChartPanel({ dark }: { dark: boolean }) {
  return (
    <div
      key={dark ? "dark" : "light"}
      style={
        dark
          ? {
              ["--qurve-chart-bg"]: "#0b1220",
              ["--qurve-grid-stroke"]: "#243041",
              ["--qurve-axis-stroke"]: "#8b95a8",
              ["--qurve-tooltip-bg"]: "rgba(16,22,31,0.96)",
            }
          : {
              ["--qurve-chart-bg"]: "#f5f7fa",
              ["--qurve-grid-stroke"]: "#c5ced9",
              ["--qurve-axis-stroke"]: "#5b6577",
              ["--qurve-tooltip-bg"]: "rgba(245,247,250,0.96)",
            }
      }
    >
      <Chart data={data} colors={dark ? ["#5eead4", "#fb923c"] : ["#0f766e", "#c2410c"]}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Line dataKey="a" type="monotone" strokeWidth={2} dot={false} />
        <Tooltip />
      </Chart>
    </div>
  );
}
```

---

## Live examples

Interactive side-by-side demos ship with the site at **`/styling`**.
