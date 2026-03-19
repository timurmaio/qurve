# Code Review: cursor/react-1a0f vs main

**Scope:** 105 files, +4025 / -747 lines across 4 commits.

---

## 1. Architecture: @qurve/core extraction

**Summary:** Chart rendering logic moved to framework-agnostic `@qurve-core` package. Clean separation, types in `types.ts`.

**Positives:**
- Clear split between core logic and React bindings
- Core is testable without React (Vitest)
- Types centralized, no circular imports
- Package build order: core → qurve → app

**Notes:**
- `formatDefaultLabel` renamed to `formatTooltipLabel` — breaking change for any external callers
- `payloadToA11yText` handles `value == null || !Number.isFinite(value)` — correct defensive check

---

## 2. Chart context and two-canvas architecture

**Summary:** Base canvas (static) + overlay canvas (pointer, cursor). RAF-batched pointer events, centralized hover.

**Positives:**
- Base canvas `pointer-events: none`, overlay `pointer-events: auto` — correct event routing
- Pointer updates batched with `requestAnimationFrame`
- `getRelativePosition` accounts for DPR (formula verified in tests)
- `registerShouldClearOnLeave` supports sticky tooltip correctly
- Overlay effect uses `overlayCanvasRef.current ?? canvasRef.current` when overlay is missing

**Potential issues:**

### 2.1 handleMouseLeave — no explicit requestOverlayRender
When leaving, we call `setHoveredIndex(null)` and `setPointer(null)`. Overlay redraw happens because Tooltip re-renders and re-registers with `cursorPoint = null`, which triggers `requestOverlayRender()` via `registerRender`. So behavior is correct, but depends on Tooltip’s effect. If Tooltip is omitted, overlay may not clear. **Risk: Low.** Suggested improvement: call `requestOverlayRender()` directly in `handleMouseLeave` to avoid relying on Tooltip.

### 2.2 Pointer effect — eventCanvas timing
`eventCanvas = overlayCanvasRef.current ?? canvasRef.current` is read when the effect runs. Overlay is rendered in the same Chart tree, so it should exist. In React 18 strict mode (double mount), overlay might be null on first run. **Risk: Low.** Optional: add `overlayCanvasRef` to effect deps.

### 2.3 registerShouldClearOnLeave — single slot
Only one callback stored; last registration wins. Multiple Tooltips would override each other. **Assessment:** Acceptable for current API.

---

## 3. Theme, CSS variables, colors

**Summary:** `theme` read from container via `readThemeFromElement`, `colors` palette, `backgroundColor` prop.

**Positives:**
- Theme read on mount from wrapper’s `getComputedStyle`
- CartesianGrid, XAxis, YAxis use `stroke ?? theme?.gridStroke ?? default`
- `resetSeriesColorIndex()` called at start of Chart render — correct for multi-series colors

**Notes:**
- Theme is read once on mount; dynamic CSS var changes are not reflected. Expected for v1.
- `effectiveBg = backgroundColor ?? theme.chartBg ?? '#fff'` — correct precedence.

---

## 4. Cell detection (Bar, Pie)

**Summary:** Cell recognized via `child.type?.displayName === 'Cell'`.

**Risk:** In production, bundlers may strip `displayName`. More robust option: use a symbol (`export const CELL_TYPE = Symbol('Cell')`) and check `child.type === CELL_TYPE`. **Priority: Medium.**

---

## 5. ReferenceLine / ReferenceDot / ReferenceArea

**Summary:** Recharts-like reference components.

**Positives:**
- Correct use of x/y scales and margin
- ReferenceArea supports horizontal and vertical, `fillOpacity`
- ReferenceDot uses `margin.left + xScale(x)` for positioning
- ReferenceLine uses y or x; y takes precedence when both passed — consistent choice

**Note:** ReferenceLine does not validate that exactly one of x/y is provided; both can be passed. Current behavior: y used if present. Fine for now.

---

## 6. ErrorBar

**Summary:** Error bars via `dataKey`, `errorKey`, `direction`.

**Positives:**
- Symmetric and asymmetric errors supported
- `errorKey` derived from `dataKey` when not provided (e.g. `y` → `errorY`)
- Direction x/y supported
- Uses `projectPoints`, `resolveXValue`, `resolveYValue` correctly

**Notes:**
- `resolvedErrorKey ?? dataKey` used when `dataKey` is a function and `errorKey` not provided — may pass function to `drawErrorBars`. Core `resolveError` handles function `errorKey`. Fine.
- No `try/finally` around the draw loop in `drawErrorBars`; a thrown error could skip `ctx.restore()`. **Priority: Low.** Optional: wrap in `try/finally`.

---

## 7. Customized

**Summary:** Custom draw via `draw` prop.

**Positives:**
- Draw receives full layout props (ctx, margin, scales, data)
- Cleanup via `registerRender` unsubscribe
- `layer` prop for stacking

**Notes:**
- Inline `draw` without `useCallback` causes effect to re-run often. JSDoc should mention `useCallback`.
- Comment “Use registerRender internally” is misleading; user only supplies `draw`. Better: “Component handles registration; provide draw function.”

---

## 8. Tooltip refactor

**Summary:** Subscribe model replaced by centralized pointer; Tooltip reads `hoveredIndex` and `pointer` from context.

**Positives:**
- No `subscribeToMouse`; less coupling
- Uses `requestOverlayRender` for cursor updates (sticky click, Escape, empty data)
- Cursor drawn on overlay (`drawCtx = overlayCtx ?? ctx`)
- `registerTooltipIndexResolver` only when `xAxis` present — avoids wrong index for Pie
- Uses `getRelativePosition` for sticky click coordinates

**Notes:**
- `formatDefaultLabel` → `formatTooltipLabel` in core — all references updated ✓

---

## 9. XAxis / YAxis tickRenderer

**Summary:** `tickRenderer` render prop for custom tick labels.

**Positives:**
- No name clash with boolean `tick` prop (fixed from earlier `tick` collision)
- `drawAxis` updated to pass `(value, index)` to formatter
- `tickRenderer` overrides `tickFormatter` when both provided

---

## 10. Canvas setup effects

### Base canvas effect (lines 609–633)
- Sets `canvas.width = width * dpr`, `canvas.height = height * dpr`
- Cleans up `animationFrameRef` on unmount ✓

### Overlay effect (lines 635–659)
- Sets overlay dimensions and context
- Cleans up `overlayAnimationFrameRef` ✓
- **Note:** `context` may be undefined if `getContext('2d')` fails; cleanup still runs. Fine.

---

## 11. Pie Tooltip index resolver

**Summary:** Tooltip’s fallback `findClosestPointByX` resolver is only registered when `xAxis` exists.

**Positives:** Avoids wrong `hoveredIndex` for Pie charts. Pie uses its own resolver ✓

---

## 12. Test updates

**Summary:** Tests updated for two-canvas setup and pointer behavior.

**Positives:**
- `data-testid="chart-event-canvas"` on overlay for event targeting
- `hoverCanvas` uses `container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas')`
- RAF flush with `await act(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); })` where needed
- Formatting expectations corrected (e.g. `'20.00'` instead of `'20'`) for `toFixed(2)`

---

## 13. getRelativePosition formula

```
x = ((clientX - rect.left) * (canvas.width / rect.width)) / dpr
```

With `canvas.width = width * dpr` and `rect.width = width` (CSS):  
`scaleX = dpr`, so `x = (clientX - rect.left) * dpr / dpr = clientX - rect.left` (CSS pixels).  
Drawing uses `ctx.scale(dpr, dpr)`, so logical coords match. ✓

---

## Summary of recommendations (all fixed)

| Priority | Issue | Action | Status |
|----------|-------|--------|--------|
| Medium | Cell `displayName` in production | Symbol-based Cell detection | ✅ CELL_TYPE |
| Low | handleMouseLeave | Add `requestOverlayRender()` | ✅ |
| Low | drawErrorBars | Wrap in `try/finally` | ✅ |
| Low | Customized JSDoc | Clarify `useCallback` | ✅ |
| Low | Pointer effect deps | Add `overlayCtx` to deps | ✅ |

---

## Verdict

Branch is in good shape for merge. Changes are consistent, tests cover the new behavior, and the architecture (core extraction, two canvases, centralized pointer) is coherent. Remaining items are minor robustness or documentation improvements.
