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
import { Chart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "qurve";

const data = [
  { name: 1, price: 120 },
  { name: 2, price: 180 },
  { name: 3, price: 140 },
];

export function Demo() {
  return (
    <Chart data={data} width={600} height={300}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Bar dataKey="price" fill="#93c5fd" />
      <Line dataKey="price" type="monotone" stroke="#3b82f6" dot={false} />
      <Tooltip />
    </Chart>
  );
}
```

## Included primitives

- `Chart`
- `Line`
- `Bar`
- `XAxis`
- `YAxis`
- `CartesianGrid`
- `Tooltip`

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

## Notes

- React and React DOM are peer dependencies.
- Current package output is ESM.
