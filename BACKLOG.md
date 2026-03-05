# Qurve — Architecture Backlog

Ideas from analyzing react-canvas-charts and other sources that could be applied to Qurve.

**Core principle:** The library's purpose is customization — users should be able to style and theme every visual element.

---

## Styling & Customization (High Priority)

### 8. Chart background color

**Problem:** Background is hardcoded to `#fff` in chartContext. No way to set chart background via props.

**Solution:** Add `backgroundColor` prop to `Chart`. Pass to canvas fill before drawing layers.

---

### 9. Theme / default color palette

**Problem:** No built-in palette. Each series needs explicit `fill`/`stroke`. Hard to get consistent multi-series charts.

**Solution:** Introduce `ChartTheme` or `colors` prop on Chart:
- Default palette (e.g. from pieMath.PIE_COLORS or extend)
- Series without explicit color use `colors[index % colors.length]`
- Optional `ChartThemeProvider` with `colors`, `gridStroke`, `axisStroke`, `fontFamily`, etc.

---

### 10. Axis typography (fontFamily, fontSize)

**Problem:** Axes use hardcoded `ctx.font = '12px sans-serif'`. No way to customize font.

**Solution:** Add to XAxis/YAxis (or theme): `fontSize`, `fontFamily`, `fontWeight`. Pass to drawAxis in core.

---

### 11. Tooltip styling props

**Problem:** Tooltip uses inline styles; no `className`, `style`, or `contentStyle` for the container.

**Solution:** Add `wrapperClassName`, `wrapperStyle`, `contentClassName`, `contentStyle`, `itemStyle`, `labelStyle` (or similar). Let users pass CSS/Tailwind classes or style objects.

---

### 12. Legend styling props

**Problem:** Legend layout/colors are internal. No `className`, `style`, `itemStyle` for legend items.

**Solution:** Add `align`, `verticalAlign`, `wrapperClassName`, `wrapperStyle`, `itemClassName`, `itemStyle`, `iconSize`, etc.

---

### 13. CartesianGrid stroke customization

**Current:** `stroke`, `strokeDasharray` exist. Could add `verticalStroke`, `horizontalStroke` for different colors per direction.

---

### 14. Cursor (crosshair) styling from Tooltip

**Current:** `cursor: { stroke, strokeWidth, strokeDasharray }` exists. Ensure all options are documented and work correctly.

---

### 15. CSS variables / design tokens

**Idea:** Support CSS custom properties so users can theme via CSS:
- `--qurve-chart-bg`
- `--qurve-grid-stroke`
- `--qurve-axis-stroke`
- `--qurve-tooltip-bg`
- `--qurve-font-family`

Components read these where applicable. Fallback to props or defaults.

---

### 16. Slot-based customization (renderProps / children)

**Idea:** Allow custom tooltip content, legend item render, axis tick render:
- `Tooltip content={<CustomTooltip />}` or `Tooltip content={(props) => <Custom {...props} />}`
- `Legend item={(item) => <CustomLegendItem {...item} />}`
- `XAxis tick={(value) => <CustomTick value={value} />}`

Enables full control while keeping defaults simple.

---

## Priority: High (easy to implement)

### 1. DPR in mouse coordinates

**Problem:** When `devicePixelRatio > 1`, `mouseX` and `mouseY` are computed without accounting for DPR. Canvas draws in CSS pixels (with scale), but `getBoundingClientRect` returns CSS dimensions — the mapping can be inaccurate on HiDPI displays.

**Solution:** Add `getRelativePosition(clientX, clientY, canvas)` to core that accounts for DPR:
```ts
x = ((clientX - rect.left) * (canvas.width / rect.width)) / devicePixelRatio
y = ((clientY - rect.top) * (canvas.height / rect.height)) / devicePixelRatio
```

**Where to change:** `chartContext.tsx` — `mousemove` and `mouseleave` handlers; all `subscribeToMouse` subscribers.

---

### 2. LayerOrder constants

**Problem:** Layer numbers (40, 45, 50, 100, 1000) are scattered across components. Hard to control render order.

**Solution:** Export from `@qurve/core` or `chartContext`:
```ts
export const LayerOrder = {
  background: 0,
  grid: 10,
  area: 20,
  series: 30,
  bar: 40,
  line: 50,
  scatter: 60,
  axes: 70,
  overlays: 80,
  cursor: 90,
  tooltip: 100,
} as const
```

Use `layer: LayerOrder.line` instead of `layer: 50`.

---

## Priority: Medium (moderate complexity)

### 3. RAF-batching pointer events

**Problem:** `subscribeToMouse` invokes callbacks on every `mousemove`. With fast mouse movement — hundreds of calls per second.

**Solution:** Introduce `schedulePointerUpdate(x, y)`:
- Store the latest `{ x, y }` in a ref
- If RAF is not yet scheduled — `requestAnimationFrame(processPendingPointer)`
- In `processPendingPointer` — pass coordinates to all subscribers once per frame

**Where to change:** `chartContext.tsx` — `handleMouseMove` logic.

---

### 4. onRegisterRedraw for overlay (if using two canvases)

**Idea:** When overlay canvas exists, allow it to redraw without React:
- `CanvasWrapper` accepts `onRegisterRedraw(draw: () => void)`
- Chart holds `overlayRedrawRef` and calls `overlayRedrawRef.current()` directly on pointer/selection change
- No `setState` or React re-renders

**Depends on:** "Two canvases" item.

---

### 5. Centralized pointer

**Problem:** Many `registerTooltipIndexResolver` and `subscribeToMouse` calls — logic scattered across Tooltip, Line, Bar, Scatter, etc.

**Idea:** ChartSurface alone handles pointer events, computes `(x, y)` and stores in `helpers.pointer`. Layers only read. Tooltip/Cursor are regular layers that receive pointer from context.

**Requires refactor:** Tooltip, Series, Brush.

---

## Priority: Low (significant work)

### 6. Two canvases: base + overlay

**Idea:**
- **Base canvas** — grid, series, axes. `pointer-events: none`. Redraws on data/config change.
- **Overlay canvas** — cursor, tooltip, selection. `pointer-events: auto`. Redraws on pointer/selection.

**Benefits:** With streaming data, base redraws less often; overlay is light (cursor lines, tooltip).

**Complexity:** Split `registerRender` into base/overlay; two canvases in DOM; coordinates must match.

---

### 7. Base/overlay pointer-events split

**Related to item 6.** Base: `pointer-events: none`. Overlay: `pointer-events: auto`. All mouse events go to overlay.

---

## Additional ideas (from discussions)

### D3 for full-featured

When expanding: consider `d3-scale`, `d3-shape`, `d3-time` for log/band/time scales and complex curves. Currently using own primitives for minimal bundle.

### Rust/WASM core + TUI

Long-term idea: core in Rust, compile to WASM for web + native for TUI (ratatui). One core — many targets. Relevant if TUI or very large datasets become goals.

---

## Checklist

**Styling & Customization**
- [x] Chart background color
- [x] Theme / default palette
- [x] Axis typography (fontFamily, fontSize)
- [x] Tooltip styling props (className, style)
- [x] Legend styling props
- [ ] CartesianGrid per-direction stroke (optional)
- [ ] CSS variables / design tokens
- [ ] Slot-based customization (renderProps)

**Architecture**
- [x] DPR in mouse coordinates
- [x] LayerOrder constants
- [x] RAF-batching pointer
- [ ] onRegisterRedraw (with two canvases)
- [x] Centralized pointer
- [x] Two canvases (base + overlay)
- [ ] pointer-events split
