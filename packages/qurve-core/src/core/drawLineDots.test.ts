import { describe, expect, it, vi } from 'vitest';
import { drawLineDots, drawActiveDot } from './drawLine';

function createMockContext() {
  return {
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

const points = [
  { x: 10, y: 20, value: 10, index: 0 },
  { x: 20, y: 30, value: 20, index: 1 },
];

describe('drawLineDots', () => {
  it('returns early when radius is 0', () => {
    const ctx = createMockContext();
    drawLineDots({ ctx, points, radius: 0, fill: '#333', stroke: '#fff' });
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it('draws dots for each point', () => {
    const ctx = createMockContext();
    drawLineDots({ ctx, points, radius: 3, fill: '#333', stroke: '#fff' });
    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.fill).toHaveBeenCalledTimes(2);
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
  });
});

describe('drawActiveDot', () => {
  it('returns early when radius is 0', () => {
    const ctx = createMockContext();
    drawActiveDot({
      ctx,
      point: points[0],
      radius: 0,
      fill: '#fff',
      stroke: '#333',
    });
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it('draws active dot', () => {
    const ctx = createMockContext();
    drawActiveDot({
      ctx,
      point: points[0],
      radius: 6,
      fill: '#fff',
      stroke: '#333',
    });
    expect(ctx.arc).toHaveBeenCalledWith(10, 20, 6, 0, Math.PI * 2);
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
