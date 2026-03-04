import { describe, expect, it, vi } from 'vitest';
import { drawArea } from '@qurve/core';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('drawArea', () => {
  it('returns early for empty point list', () => {
    const ctx = createMockContext();

    drawArea({
      ctx,
      points: [],
      fill: '#333',
      fillOpacity: 0.2,
      strokeWidth: 0,
      hoveredIndex: null,
      hoverOpacity: 0.5,
    });

    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it('fills and strokes area when points are provided', () => {
    const ctx = createMockContext();

    drawArea({
      ctx,
      points: [
        { x: 0, y0: 20, y1: 10 },
        { x: 10, y0: 30, y1: 15 },
      ],
      fill: '#333',
      fillOpacity: 0.2,
      stroke: '#111',
      strokeWidth: 2,
      hoveredIndex: null,
      hoverOpacity: 0.5,
    });

    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });
});
