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
import { ResponsiveContainer, Chart, Line, Bar, Area, Pie, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "qurve";

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

```tsx
<Chart data={data} width={600} height={300} margin={{ bottom: 32 }}>
  <XAxis dataKey="name" />
  <YAxis />
  <Bar dataKey="sales" fill="#93c5fd" />
  <Line dataKey="trend" stroke="#2563eb" dot={false} />
  <Legend />
</Chart>
```

## Pie options

`Pie` provides pie and donut variants in the same primitive:

- Use `innerRadius` to switch from pie to donut
- Use `nameKey` to control slice labels used by tooltip
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

## Notes

- React and React DOM are peer dependencies.
- Current package output is ESM.
