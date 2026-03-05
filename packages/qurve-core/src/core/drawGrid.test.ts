import { describe, expect, it, vi } from 'vitest';
import { drawGrid } from './drawGrid';

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

describe('drawGrid', () => {
  it('draws vertical lines when vertical is true', () => {
    const ctx = createMockContext();

    drawGrid({
      ctx,
      stroke: '#ccc',
      strokeDasharray: '0',
      horizontal: false,
      vertical: true,
      horizontalCount: 5,
      verticalCount: 4,
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
    });

    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.setLineDash).toHaveBeenCalled();
  });

  it('draws horizontal lines when horizontal is true', () => {
    const ctx = createMockContext();

    drawGrid({
      ctx,
      stroke: '#ccc',
      strokeDasharray: '4 4',
      horizontal: true,
      vertical: false,
      horizontalCount: 5,
      verticalCount: 4,
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
    });

    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4]);
  });
});
