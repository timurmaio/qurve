/**
 * Map client coordinates (from MouseEvent) to canvas drawing coordinates.
 * Accounts for devicePixelRatio and canvas display scaling.
 */
export function getRelativePosition(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: ((clientX - rect.left) * scaleX) / dpr,
    y: ((clientY - rect.top) * scaleY) / dpr,
  };
}
