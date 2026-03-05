/**
 * Layer order constants for chart rendering.
 * Lower values draw first (behind); higher values draw on top.
 */
export const LayerOrder = {
  background: 0,
  grid: 10,
  axes: 20,
  area: 30,
  bar: 40,
  line: 50,
  pie: 45,
  pieLabels: 46,
  scatter: 60,
  overlays: 80,
  cursor: 90,
  tooltip: 100,
} as const;
