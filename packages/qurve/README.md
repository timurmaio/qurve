# qurve

High-performance canvas chart primitives for React.

`qurve` is designed as a Recharts-compatible API surface, with rendering backed by Canvas for better performance on large datasets.

## Status

Developer Preview (`0.x`).

## Installation

```bash
npm install qurve
```

## Quick start

```tsx
import { ResponsiveContainer, Chart, Line, Bar, Area, Pie, Scatter, Brush, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "qurve";

const data = [
  { name: 1, price: 120 },
  { name: 2, price: 180 },
  { name: 3, price: 140 },
];

export function Demo() {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <Chart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="price" fill="#93c5fd" />
          <Area dataKey="price" fill="#93c5fd" fillOpacity={0.2} stroke="#2563eb" />
          <Line dataKey="price" type="monotone" stroke="#3b82f6" dot={false} />
          <Legend />
          <Tooltip />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
```

## Included primitives

- `Chart`
- `Line`
- `Bar`
- `Area`
- `Pie`
- `Scatter`
- `XAxis`
- `YAxis`
- `CartesianGrid`
- `Tooltip`
- `ResponsiveContainer`
- `Legend`
- `Brush`

## API reference (core props)

`Chart`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `data` | `Record<string, unknown>[]` | - | Source dataset |
| `width` | `number` | `600` | Canvas width |
| `height` | `number` | `300` | Canvas height |
| `margin` | `{top,right,bottom,left}` | `0` | Plot padding |

`XAxis`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `dataKey` | `string \| fn` | index | X value resolver |
| `type` | `'number' \| 'time' \| ...` | `'number'` | Time axis supported |
| `domain` | `[number\|Date, number\|Date] \| 'auto'` | `'auto'` | Manual axis domain |
| `tickValues` | `Array<number\|Date>` | auto | Explicit ticks |
| `interval` | `number` | `0` | Skip every N ticks |
| `padding` | `number \| object` | - | Domain padding |
| `locale` | `string` | environment | Time formatting locale |
| `timeZone` | `string` | environment | Time formatting zone |
| `timeFormat` | `'auto' \| 'time' \| 'date' \| 'month' \| 'year' \| Intl options` | `'auto'` | Time label format |

`YAxis`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `dataKey` | `string \| fn` | auto | Y value resolver |
| `domain` | `[number, number] \| 'auto'` | `'auto'` | Manual axis domain |
| `tickValues` | `number[]` | auto | Explicit ticks |
| `interval` | `number` | `0` | Skip every N ticks |
| `padding` | `number \| object` | - | Domain padding |

`Line`

| Prop | Type | Default |
|---|---|---|
| `dataKey` | `string \| fn` | - |
| `type` | `'linear' \| 'monotone' \| 'step'` | `'linear'` |
| `stroke` | `string` | `#8884d8` |
| `strokeWidth` | `number` | `2` |
| `dot` | `boolean \| {r,fill,stroke}` | `false` |
| `activeDot` | `boolean \| {r,fill,stroke}` | `true` |

`Bar`

| Prop | Type | Default |
|---|---|---|
| `dataKey` | `string \| fn` | - |
| `stackId` | `string \| number` | - |
| `barSize` | `number` | auto |
| `maxBarSize` | `number` | - |
| `minPointSize` | `number` | - |
| `radius` | `number \| [tl,tr,br,bl]` | - |

`Area`

| Prop | Type | Default |
|---|---|---|
| `dataKey` | `string \| fn` | - |
| `stackId` | `string \| number` | - |
| `fill` | `string` | `#8884d8` |
| `fillOpacity` | `number` | `0.25` |
| `stroke` | `string` | - |

`Pie`

| Prop | Type | Default |
|---|---|---|
| `dataKey` | `string \| fn` | - |
| `nameKey` | `string \| fn` | auto |
| `colors` | `string[]` | - |
| `innerRadius` | `number` | `0` |
| `outerRadius` | `number` | auto |
| `startAngle/endAngle` | `number` | `0/360` |
| `paddingAngle` | `number` | `0` |
| `label` | `boolean \| fn` | `false` |
| `labelMode` | `'namePercent' \| 'name' \| 'value' \| 'percent' \| 'nameValue' \| 'valuePercent'` | `'namePercent'` |
| `labelFormatter` | `fn` | - |
| `labelLine` | `boolean` | `false` |
| `labelLineColor` | `string` | series stroke |
| `labelLineWidth` | `number` | `1` |
| `labelOffset` | `number` | `18` |
| `labelMinGap` | `number` | `14` |

`Scatter`

| Prop | Type | Default |
|---|---|---|
| `xKey` | `string \| fn` | axis key |
| `yKey` | `string \| fn` | `dataKey` |
| `size` | `number` | `4` |
| `fill` | `string` | `#3b82f6` |

`Tooltip`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `sticky` | `boolean` | `false` | Click to lock/unlock |
| `formatter` | `fn` | - | Global value formatter |
| `labelFormatter` | `fn` | - | Custom label formatter |
| `ariaLive` | `'off' \| 'polite' \| 'assertive'` | `'polite'` | SR live region mode |
| `a11yLabelFormatter` | `fn` | - | Custom SR text |
| `hideA11yRegion` | `boolean` | `false` | Disable SR region |

`Legend`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `selectionMode` | `'multiple' \| 'single'` | `'multiple'` | Single mode resets to all on second click |
| `ariaLabel` | `string` | `'Chart legend'` | Group label for SR |

`Brush`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `enablePan` | `boolean` | `true` | Drag selected window |
| `enableWheelZoom` | `boolean` | `true` | Wheel zoom |
| `wheelZoomStep` | `number` | `0.08` | Zoom sensitivity |
| `showPreview` | `boolean` | `true` | Sparkline preview |
| `previewDataKey` | `string` | auto numeric field | Preview source |
| `showReset` | `boolean` | `true` | Reset control |

`ResponsiveContainer`

| Prop | Type | Default |
|---|---|---|
| `width` | `number \| string` | `'100%'` |
| `height` | `number \| string` | `'100%'` |
| `aspect` | `number` | - |
| `minWidth/minHeight` | `number` | `0` |

For migration notes, see `MIGRATION.md` in this package.

## Bar options

`Bar` supports grouped and stacked layouts:

- **Grouped bars**: render multiple `Bar` components with different `dataKey`s (default behavior)
- **Stacked bars**: pass the same `stackId` to bars that should stack
- **Rounded corners**: set `radius` as a number or tuple `[topLeft, topRight, bottomRight, bottomLeft]` (stacked bars only round outer segments)
- **Width constraints**: `barSize` for fixed width and `maxBarSize` to cap auto width
- **Small values visibility**: `minPointSize` guarantees a minimum visible bar height for non-zero values
- **Series-level tooltip formatting**: `tooltipName` and `tooltipFormatter` customize one bar series without affecting others

```tsx
<Chart data={data} width={600} height={300}>
  <XAxis dataKey="name" />
  <YAxis />
  <Bar
    dataKey="revenue"
    fill="#60a5fa"
    radius={6}
    maxBarSize={28}
    minPointSize={3}
    tooltipName="Revenue"
    tooltipFormatter={(value) => value === null ? '-' : `$${value.toFixed(0)}k`}
  />
  <Bar dataKey="cost" fill="#f59e0b" radius={6} maxBarSize={28} />
</Chart>

<Chart data={data} width={600} height={300}>
  <XAxis dataKey="name" />
  <YAxis />
  <Bar dataKey="profit" fill="#34d399" stackId="total" radius={6} />
  <Bar dataKey="loss" fill="#f87171" stackId="total" radius={6} />
</Chart>
```

## Area options

`Area` supports layered and stacked filled series:

- Use `stackId` to stack multiple areas
- Use `fill` + `fillOpacity` to control fill color and transparency
- Use `tooltipName` and `tooltipFormatter` to override tooltip labels per series

```tsx
<Chart data={data} width={600} height={300}>
  <XAxis dataKey="name" />
  <YAxis domain={[0, 100]} />
  <Area dataKey="organic" stackId="traffic" fill="#60a5fa" stroke="#2563eb" fillOpacity={0.25} />
  <Area dataKey="paid" stackId="traffic" fill="#34d399" stroke="#059669" fillOpacity={0.25} />
  <Tooltip />
</Chart>
```

## Legend

`Legend` reads rendered series and supports click-to-toggle visibility.

- Keyboard toggle with `Enter`/`Space`
- `selectionMode="single"` to focus one series at a time (click active again to reset all)

```tsx
<Chart data={data} width={600} height={300} margin={{ bottom: 32 }}>
  <XAxis dataKey="name" />
  <YAxis />
  <Bar dataKey="sales" fill="#93c5fd" />
  <Line dataKey="trend" stroke="#2563eb" dot={false} />
  <Legend selectionMode="single" />
</Chart>
```

Composed charts use deterministic layering and tooltip payload order:

`Area -> Bar -> Line -> Scatter`

## Pie options

`Pie` provides pie and donut variants in the same primitive:

- Use `innerRadius` to switch from pie to donut
- Use `nameKey` to control slice labels used by tooltip
- Use `colors` to provide a deterministic per-slice palette
- Use `label` with `labelMode`/`labelFormatter` for HTML labels around arcs
- Use `labelLine` to draw connector lines and `labelMinGap` to reduce overlaps
- For narrow cards, increase `labelMinGap` and tune `labelOffset` for cleaner outside labels
- Use `startAngle`/`endAngle` and `paddingAngle` for custom arc layouts

```tsx
<Chart data={data} width={600} height={320}>
  <Pie
    dataKey="value"
    nameKey="name"
    innerRadius={60}
    outerRadius={110}
    startAngle={0}
    endAngle={360}
    paddingAngle={1}
  />
  <Legend />
  <Tooltip />
</Chart>
```

Dense layout example with connector lines:

```tsx
<Chart data={data} width={420} height={280} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
  <Pie
    dataKey="value"
    nameKey="segment"
    innerRadius={56}
    outerRadius={92}
    colors={["#60a5fa", "#34d399", "#f59e0b", "#f97316", "#8b5cf6", "#14b8a6"]}
    label
    labelMode="namePercent"
    labelLine
    labelOffset={20}
    labelMinGap={12}
    startAngle={210}
    endAngle={-150}
  />
  <Tooltip />
</Chart>
```

## Scatter options

`Scatter` renders point clouds using chart-level data:

- Use `xKey` and `yKey` to map numeric axes
- Use `size`, `fill`, and `stroke` to style points
- Works with `Tooltip` and `Legend` out of the box

```tsx
<Chart data={data} width={600} height={320}>
  <XAxis dataKey="hours" domain={[0, 8]} />
  <YAxis dataKey="score" domain={[0, 100]} />
  <Scatter xKey="hours" yKey="score" size={5} fill="#2563eb" name="Samples" />
  <Tooltip />
  <Legend />
</Chart>
```

## Time axis

`XAxis` supports time scale values with locale-aware formatting via `Intl.DateTimeFormat(undefined, ...)`.

- `locale` and `timeZone` for deterministic formatting across environments
- `timeFormat` presets: `auto`, `time`, `date`, `month`, `year`
- `timeFormat` also accepts raw `Intl.DateTimeFormatOptions`

```tsx
<Chart data={data} width={700} height={320}>
  <XAxis
    dataKey="ts"
    type="time"
    tickCount={6}
    locale="en-US"
    timeZone="UTC"
    timeFormat="date"
  />
  <YAxis />
  <Line dataKey="value" stroke="#2563eb" dot={false} />
  <Tooltip />
</Chart>
```

## Brush

`Brush` adds a draggable x-range window for large datasets.

- Drag the window to pan
- Use mouse wheel to zoom in/out around cursor
- Use touch drag and two-finger pinch on mobile
- Press `Esc` or click `Reset` to restore full range
- Built-in mini-preview sparkline (`showPreview`, `previewDataKey`)

```tsx
<Chart data={data} width={700} height={320} margin={{ bottom: 28 }}>
  <XAxis dataKey="day" />
  <YAxis />
  <Line dataKey="value" stroke="#2563eb" dot={false} />
  <Brush />
</Chart>
```

## Tooltip options

`Tooltip` supports sticky interaction mode:

- `sticky`: click/tap to lock tooltip at current point
- Click again or press `Esc` to unlock
- `ariaLive`: controls live region politeness (`polite` by default)
- `a11yLabelFormatter`: custom text for screen readers
- `a11yIncludeSummary`: include default aggregated summary
- `a11ySummaryFormatter`: custom summary text for screen readers
- `hideA11yRegion`: disable built-in SR announcements

```tsx
<Chart data={data} width={600} height={300}>
  <XAxis dataKey="x" />
  <YAxis />
  <Line dataKey="value" stroke="#2563eb" />
  <Tooltip
    sticky
    ariaLive="polite"
    a11yLabelFormatter={(label, payload) => `${label}: ${payload.map((p) => `${p.name} ${p.value}`).join(', ')}`}
    a11yIncludeSummary
    a11ySummaryFormatter={(payload) => `Total: ${payload.reduce((sum, p) => sum + (p.value ?? 0), 0)}`}
  />
</Chart>
```

## Recipes

Large dataset with brush + time axis:

```tsx
<Chart data={data} width={900} height={360} margin={{ bottom: 30 }}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="ts" type="time" tickCount={6} />
  <YAxis />
  <Line dataKey="close" stroke="#2563eb" dot={false} />
  <Tooltip sticky />
  <Brush previewDataKey="close" />
</Chart>
```

Composed chart with focused legend mode:

```tsx
<Chart data={data} width={800} height={360}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Area dataKey="baseline" fill="#93c5fd" fillOpacity={0.2} />
  <Bar dataKey="volume" fill="#60a5fa" />
  <Line dataKey="trend" stroke="#1d4ed8" dot={false} />
  <Scatter xKey="ix" yKey="outlier" size={5} fill="#f97316" />
  <Legend selectionMode="single" />
  <Tooltip />
</Chart>
```

## Notes

- React and React DOM are peer dependencies.
- Current package output is ESM.
