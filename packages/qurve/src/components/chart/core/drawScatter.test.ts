import { describe, expect, it, vi } from 'vitest';
import { drawScatterPoints } from '@qurve/core';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('drawScatterPoints', () => {
  it('returns early when no points', () => {
    const ctx = createMockContext();
    drawScatterPoints({
      ctx,
      points: [],
      fill: '#111',
      strokeWidth: 0,
      hoveredIndex: null,
      hoverOpacity: 0.5,
    });

    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it('draws points and optional strokes', () => {
    const ctx = createMockContext();
    drawScatterPoints({
      ctx,
      points: [
        { x: 10, y: 20, radius: 3 },
        { x: 20, y: 30, radius: 4 },
      ],
      fill: '#111',
      stroke: '#222',
      strokeWidth: 1,
      hoveredIndex: 0,
      hoverOpacity: 0.3,
    });

    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.fill).toHaveBeenCalledTimes(2);
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
  });
});
