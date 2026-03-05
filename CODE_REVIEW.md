# Code Review: Centralized Pointer + Two Canvases

## Summary of Changes

1. **Centralized pointer** — Chart processes mouse events, computes `hoveredIndex` via resolvers, stores `pointer` in state. Tooltip reads from context.
2. **Two canvases** — Base (grid, series, axes) with `pointer-events: none`, overlay (cursor, crosshair) with `pointer-events: auto`.

---

## Issues Found

### 1. **BUG: Tooltip uses `requestRender` instead of `requestOverlayRender` for cursor updates**

**Location:** `Tooltip.tsx` lines 165, 175, 191

**Problem:** Sticky click and Escape handlers call `requestRender()`, which redraws the **base** canvas. The cursor is drawn on the **overlay**. Base redraw is unnecessary and doesn't update the overlay.

**Fix:** Use `requestOverlayRender()` for cursor-related updates.

---

### 2. **Potential: Pointer effect canvas selection**

**Location:** `chartContext.tsx` line 447

```ts
const eventCanvas = overlayCanvasRef.current ?? canvasRef.current;
```

**Problem:** Read at effect run time. If overlay mounts after the effect runs (e.g. strict mode double-mount), we might attach to base canvas which has `pointer-events: none` — no events received.

**Assessment:** In normal flow both canvases mount in the same commit. Overlay is always rendered. Low risk. Consider adding `overlayCanvasRef` to effect deps to re-run when overlay is ready.

---

### 3. **registerShouldClearOnLeave: single-slot design**

**Location:** `chartContext.tsx` lines 501-508

**Problem:** Only one callback can be registered. Last writer wins. Multiple Tooltips (rare) would override each other.

**Assessment:** Acceptable for current API. Document or add a warning if needed.

---

### 4. **Tooltip sticky click: getRelativePosition with base ctx canvas**

**Location:** `Tooltip.tsx` line 159

```ts
const eventCanvas = (overlayCtx ?? ctx)?.canvas
```

**Assessment:** Correct — we use the canvas that receives events (overlay when present). Good.

---

### 5. **requestOverlayRender fallback to ctx**

**Location:** `chartContext.tsx` lines 388-389

```ts
const overlayCtxValue = overlayCtx ?? ctx;
const overlayCanvas = overlayCanvasRef.current ?? canvasRef.current;
```

**Assessment:** Fallback when overlay isn't ready. Draws on base canvas temporarily. Acceptable.

---

### 6. **Missing requestOverlayRender in handleMouseLeave**

**Location:** `chartContext.tsx` handleMouseLeave

**Assessment:** We dispatch `setPointer(null)`. Tooltip re-renders, `cursorPoint` becomes null. The `registerRender` effect re-runs (cursorPoint in deps), registers new fn, which calls `requestOverlayRender` (layer >= cursor). So overlay redraw is triggered. **No fix needed.**

---

### 7. **Data clearing: requestRender vs requestOverlayRender**

**Location:** `Tooltip.tsx` line 129

**Problem:** When `!data.length`, we call `requestRender()`. We clear pointer/hoveredIndex. The overlay should clear the cursor. Base doesn't need redraw for empty data (series would clear themselves). Overlay needs to clear cursor.

**Fix:** Use `requestOverlayRender()` when clearing due to empty data.

---

### 8. **Duplicate animationFrameRef cleanup in pointer effect**

**Location:** `chartContext.tsx` lines 495-498

The cleanup cancels `animationFrameRef` (base canvas render) — that seems unrelated to the pointer effect. The pointer effect uses `pointerRafRef`. Likely copy-paste from before. The base `requestRender` uses `animationFrameRef`. When the pointer effect cleans up, we're removing the canvas listeners. Cancelling `animationFrameRef` would prevent a pending base render — incorrect. The pointer effect should only clean up its own RAF (`pointerRafRef`).

**Fix:** Remove `animationFrameRef` cleanup from the pointer effect's cleanup. It belongs to the base render, not pointer handling.

---

## Fixes Applied

1. **Tooltip**: Replaced `requestRender` with `requestOverlayRender` for sticky click, Escape key, and empty-data cursor clearance.
2. **chartContext**: Removed incorrect `animationFrameRef` cleanup from pointer effect (it belongs to base render, not pointer).
