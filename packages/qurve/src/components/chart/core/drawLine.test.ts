import { describe, expect, it, vi } from 'vitest';
import { drawLinePath } from './drawLine';

function createMockContext() {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'round',
    lineJoin: 'round',
  } as unknown as CanvasRenderingContext2D;
}

const points = [
  { x: 0, y: 0, value: 0, index: 0 },
  { x: 10, y: 10, value: 10, index: 1 },
  { x: 20, y: 8, value: 8, index: 2 },
];

describe('drawLinePath', () => {
  it('draws linear segments with lineTo', () => {
    const ctx = createMockContext();
    drawLinePath({ ctx, points, type: 'linear', stroke: '#333', strokeWidth: 2 });

    expect(ctx.lineTo).toHaveBeenCalledTimes(2);
    expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
  });

  it('draws monotone segments with bezierCurveTo', () => {
    const ctx = createMockContext();
    drawLinePath({ ctx, points, type: 'monotone', stroke: '#333', strokeWidth: 2 });

    expect(ctx.bezierCurveTo).toHaveBeenCalledTimes(2);
  });

  it('draws step segments with two lineTo calls per segment', () => {
    const ctx = createMockContext();
    drawLinePath({ ctx, points, type: 'step', stroke: '#333', strokeWidth: 2 });

    expect(ctx.lineTo).toHaveBeenCalledTimes(4);
  });
});
