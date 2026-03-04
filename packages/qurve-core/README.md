# @qurve/core

Framework-agnostic chart renderer and math utilities for Qurve. Use this package when you need the drawing logic and calculations without React or any other framework dependency.

## Use cases

- **Vue bindings**: Create `qurve-vue` that uses `@qurve/core` for canvas rendering
- **Svelte / Solid / Angular**: Same approach — use core for drawing, framework for components
- **Headless / Node**: Use the math utilities and types without any DOM/framework
- **Custom renderers**: Build your own chart components on top of the core drawing API

## What's included

- **Drawing functions**: `drawLinePath`, `drawBars`, `drawArea`, `drawPieSlices`, `drawScatterPoints`, `drawXAxis`, `drawYAxis`, `drawGrid`, `drawCrosshair`
- **Math & utils**: `chartMath`, `pointUtils`, `timeUtils`, `pieMath`, `legendUtils`, `brushUtils`, `responsiveUtils`, `tooltipUtils`
- **Types**: `ChartData`, `DataKey`, `AxisConfig`, `TooltipPayloadItem`, `ProjectedPoint`, etc.

## Example: Vue integration

```ts
// qurve-vue would use @qurve/core like this:
import { drawLinePath, projectPoints } from '@qurve/core';

// In your Vue component's render loop:
const points = projectPoints({ data, margin, xAxis, dataKey, getXScale, getYScale });
drawLinePath({ ctx, points, type: 'linear', stroke: '#888', strokeWidth: 2 });
```

## React usage

Use the main `qurve` package for React — it depends on `@qurve/core` and provides `<Chart>`, `<Line>`, etc.
