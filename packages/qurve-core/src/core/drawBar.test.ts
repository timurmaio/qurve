import { describe, expect, it, vi } from 'vitest';
import { drawBars } from './drawBar';

function createMockContext() {
  const alphaValues: number[] = [];
  let alpha = 1;

  const ctx = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D & { __alphaValues: number[] };

  Object.defineProperty(ctx, 'globalAlpha', {
    get() {
      return alpha;
    },
    set(v: number) {
      alpha = v;
      alphaValues.push(v);
    },
  });

  ctx.__alphaValues = alphaValues;
  return ctx;
}

describe('drawBars', () => {
  it('applies hover opacity for non-hovered bars', () => {
    const ctx = createMockContext();

    drawBars({
      ctx,
      bars: [
        { x: 0, y: 0, width: 10, height: 20 },
        { x: 20, y: 0, width: 10, height: 20 },
      ],
      fill: '#333',
      strokeWidth: 0,
      hoveredIndex: 0,
      hoverOpacity: 0.25,
    });

    expect(ctx.fill).toHaveBeenCalledTimes(2);
    expect(ctx.__alphaValues).toContain(1);
    expect(ctx.__alphaValues).toContain(0.25);
  });

  it('uses rounded-rect path when radius is provided', () => {
    const ctx = createMockContext();

    drawBars({
      ctx,
      bars: [{ x: 0, y: 0, width: 12, height: 16, radius: 4 }],
      fill: '#333',
      stroke: '#111',
      strokeWidth: 1,
      hoveredIndex: null,
      hoverOpacity: 0.5,
    });

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.quadraticCurveTo).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });

  it('uses array radius for per-corner rounding', () => {
    const ctx = createMockContext();

    drawBars({
      ctx,
      bars: [{ x: 0, y: 0, width: 20, height: 20, radius: [2, 4, 6, 8] }],
      fill: '#333',
      strokeWidth: 0,
      hoveredIndex: null,
      hoverOpacity: 0.5,
    });

    expect(ctx.quadraticCurveTo).toHaveBeenCalled();
  });
});
