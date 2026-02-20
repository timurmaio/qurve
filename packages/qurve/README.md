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
import { Chart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "qurve";

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
      <Line dataKey="price" type="monotone" stroke="#3b82f6" dot={false} />
      <Tooltip />
    </Chart>
  );
}
```

## Included primitives

- `Chart`
- `Line`
- `XAxis`
- `YAxis`
- `CartesianGrid`
- `Tooltip`

## Notes

- React and React DOM are peer dependencies.
- Current package output is ESM.
