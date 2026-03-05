import { describe, expect, it, vi } from 'vitest';
import { drawReferenceDot } from './drawReferenceDot';

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
  } as unknown as CanvasRenderingContext2D;
}

describe('drawReferenceDot', () => {
  it('draws dot at position', () => {
    const ctx = createMockContext();

    drawReferenceDot({ ctx, x: 50, y: 75 });

    expect(ctx.arc).toHaveBeenCalledWith(50, 75, 4, 0, Math.PI * 2);
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('accepts custom r, fill, stroke', () => {
    const ctx = createMockContext();

    drawReferenceDot({ ctx, x: 10, y: 20, r: 8, fill: '#f00', stroke: '#0f0', strokeWidth: 3 });

    expect(ctx.arc).toHaveBeenCalledWith(10, 20, 8, 0, Math.PI * 2);
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
