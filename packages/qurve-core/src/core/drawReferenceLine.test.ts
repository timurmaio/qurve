import { describe, expect, it, vi } from 'vitest';
import { drawReferenceLine } from './drawReferenceLine';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: '#000',
    lineWidth: 1,
    setLineDash: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('drawReferenceLine', () => {
  it('draws horizontal line at y value', () => {
    const ctx = createMockContext();
    const scale = (v: number) => (v - 0) / (100 - 0) * 80;

    drawReferenceLine({
      ctx,
      orientation: 'horizontal',
      value: 50,
      scale,
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
    });

    expect(ctx.moveTo).toHaveBeenCalledWith(20, 50);
    expect(ctx.lineTo).toHaveBeenCalledWith(220, 50);
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('draws vertical line at x value', () => {
    const ctx = createMockContext();
    const scale = (v: number) => (v - 0) / (10 - 0) * 200;

    drawReferenceLine({
      ctx,
      orientation: 'vertical',
      value: 5,
      scale,
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
    });

    expect(ctx.moveTo).toHaveBeenCalledWith(120, 10);
    expect(ctx.lineTo).toHaveBeenCalledWith(120, 110);
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
