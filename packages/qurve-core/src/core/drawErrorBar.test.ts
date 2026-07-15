import { describe, expect, it, vi } from 'vitest';
import { createMockContext } from './mockCanvas';
import { drawErrorBars } from './drawErrorBar';

describe('drawErrorBars', () => {
  const getXScale = () => (v: number) => v * 10;
  const getYScale = () => (v: number) => 100 - v;

  it('draws three strokes per point for symmetric y errors (stem + caps)', () => {
    const ctx = createMockContext();
    drawErrorBars({
      ctx,
      data: [{ x: 1, y: 40, errorY: 5 }],
      margin: { left: 20, top: 10 },
      xAxis: { dataKey: 'x' },
      dataKey: 'y',
      errorKey: 'errorY',
      getXScale,
      getYScale,
      direction: 'y',
      width: 8,
    });

    // vertical stem + low cap + high cap
    expect(ctx.stroke).toHaveBeenCalledTimes(3);
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('supports asymmetric [lo, hi] error arrays on y', () => {
    const ctx = createMockContext();
    const yScale = (v: number) => 100 - v;
    drawErrorBars({
      ctx,
      data: [{ x: 2, y: 50, errorY: [3, 7] }],
      margin: { left: 0, top: 0 },
      xAxis: { dataKey: 'x' },
      dataKey: 'y',
      errorKey: 'errorY',
      getXScale: () => (v: number) => v * 10,
      getYScale: () => yScale,
      direction: 'y',
      width: 4,
    });

    // yLow = 100 - (50-3) = 53; yHigh = 100 - (50+7) = 43
    expect(ctx.moveTo).toHaveBeenCalledWith(20, 53);
    expect(ctx.lineTo).toHaveBeenCalledWith(20, 43);
  });

  it('draws horizontal error bars for direction x', () => {
    const ctx = createMockContext();
    drawErrorBars({
      ctx,
      data: [{ x: 5, y: 20, errorX: 1 }],
      margin: { left: 10, top: 5 },
      xAxis: { dataKey: 'x' },
      dataKey: 'y',
      errorKey: 'errorX',
      getXScale: () => (v: number) => v * 10,
      getYScale: () => (v: number) => v,
      direction: 'x',
      width: 6,
    });

    expect(ctx.stroke).toHaveBeenCalledTimes(3);
    // xLow = 10 + (5-1)*10 = 50; xHigh = 10 + (5+1)*10 = 70; y = 5+20 = 25
    expect(ctx.moveTo).toHaveBeenCalledWith(50, 25);
    expect(ctx.lineTo).toHaveBeenCalledWith(70, 25);
  });

  it('accepts function errorKey', () => {
    const ctx = createMockContext();
    drawErrorBars({
      ctx,
      data: [{ x: 1, y: 10 }],
      margin: { left: 0, top: 0 },
      xAxis: { dataKey: 'x' },
      dataKey: 'y',
      errorKey: () => 2,
      getXScale,
      getYScale,
    });
    expect(ctx.stroke).toHaveBeenCalledTimes(3);
  });

  it('skips invalid error values (negative, NaN, null)', () => {
    const ctx = createMockContext();
    drawErrorBars({
      ctx,
      data: [
        { x: 1, y: 10, errorY: -1 },
        { x: 2, y: 10, errorY: NaN },
        { x: 3, y: 10, errorY: null },
        { x: 4, y: 10, errorY: ['a', 'b'] },
      ],
      margin: { left: 0, top: 0 },
      xAxis: { dataKey: 'x' },
      dataKey: 'y',
      errorKey: 'errorY',
      getXScale,
      getYScale,
    });
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('draws nothing when error value is missing', () => {
    const ctx = createMockContext();
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
