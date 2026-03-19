import { describe, expect, it, vi } from 'vitest';
import { drawErrorBars } from './drawErrorBar';

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
  } as unknown as CanvasRenderingContext2D;
}

describe('drawErrorBars', () => {
  it('draws vertical error bars for symmetric error', () => {
    const ctx = createMockContext();
    const getXScale = () => (v: number) => v * 50;
    const getYScale = () => (v: number) => 80 - v * 4;

    drawErrorBars({
      ctx,
      data: [{ x: 1, y: 10, errorY: 2 }],
      margin: { left: 20, top: 10 },
      xAxis: { dataKey: 'x' },
      dataKey: 'y',
      errorKey: 'errorY',
      getXScale,
      getYScale,
      direction: 'y',
    });

    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('draws nothing when error value is missing', () => {
    const ctx = createMockContext();
    const getXScale = () => (v: number) => v * 50;
    const getYScale = () => (v: number) => 80 - v * 4;

    drawErrorBars({
      ctx,
      data: [{ x: 1, y: 10 }],
      margin: { left: 20, top: 10 },
      xAxis: { dataKey: 'x' },
      dataKey: 'y',
      errorKey: 'errorY',
      getXScale,
      getYScale,
    });

    expect(ctx.stroke).not.toHaveBeenCalled();
  });
});
