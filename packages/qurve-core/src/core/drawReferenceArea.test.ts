import { describe, expect, it, vi } from 'vitest';
import { drawReferenceArea } from './drawReferenceArea';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    globalAlpha: 1,
    fillStyle: '#000',
  } as unknown as CanvasRenderingContext2D;
}

describe('drawReferenceArea', () => {
  it('draws horizontal area between y1 and y2', () => {
    const ctx = createMockContext();
    const scale = (v: number) => (v - 0) / (100 - 0) * 80;

    drawReferenceArea({
      ctx,
      orientation: 'horizontal',
      startValue: 20,
      endValue: 60,
      scale,
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
    });

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('draws vertical area between x1 and x2', () => {
    const ctx = createMockContext();
    const scale = (v: number) => (v - 0) / (10 - 0) * 200;

    drawReferenceArea({
      ctx,
      orientation: 'vertical',
      startValue: 2,
      endValue: 6,
      scale,
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
    });

    expect(ctx.fillRect).toHaveBeenCalled();
  });
});
