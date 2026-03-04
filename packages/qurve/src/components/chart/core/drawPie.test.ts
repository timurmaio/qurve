import { describe, expect, it, vi } from 'vitest';
import { drawPieSlices } from '@qurve/core';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
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

describe('drawPieSlices', () => {
  it('does nothing for empty slices', () => {
    const ctx = createMockContext();
    drawPieSlices({ ctx, slices: [], hoveredIndex: null, hoverOpacity: 0.5 });
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it('draws donut slice path and applies stroke', () => {
    const ctx = createMockContext();

    drawPieSlices({
      ctx,
      slices: [
        {
          index: 0,
          value: 10,
          name: 'A',
          color: '#3b82f6',
          startAngle: 0,
          endAngle: 90,
          cx: 50,
          cy: 50,
          innerRadius: 20,
          outerRadius: 40,
          stroke: '#fff',
          strokeWidth: 2,
        },
      ],
      hoveredIndex: null,
      hoverOpacity: 0.3,
    });

    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });
});
