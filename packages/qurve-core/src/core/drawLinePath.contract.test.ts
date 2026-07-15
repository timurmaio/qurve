import { describe, expect, it, vi } from 'vitest';
import { drawLinePath } from './drawLine';
import { appendCurve } from './curvePath';

type Cmd =
  | ['M', number, number]
  | ['L', number, number]
  | ['C', number, number, number, number, number, number];

function createRecordingContext() {
  const cmds: Cmd[] = [];
  const ctx = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: (x: number, y: number) => {
      cmds.push(['M', x, y]);
    },
    lineTo: (x: number, y: number) => {
      cmds.push(['L', x, y]);
    },
    bezierCurveTo: (
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number,
    ) => {
      cmds.push(['C', a, b, c, d, e, f]);
    },
    stroke: vi.fn(),
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'round' as CanvasLineCap,
    lineJoin: 'round' as CanvasLineJoin,
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, cmds };
}

describe('drawLinePath — curve contract via path recording', () => {
  it('monotone path matches appendCurve golden (single segment)', () => {
    const points = [
      { x: 0, y: 0, value: 0, index: 0 },
      { x: 10, y: 20, value: 20, index: 1 },
      { x: 20, y: 10, value: 10, index: 2 },
      { x: 30, y: 40, value: 40, index: 3 },
    ];

    const { ctx, cmds } = createRecordingContext();
    drawLinePath({ ctx, points, type: 'monotone', stroke: '#000', strokeWidth: 1 });

    // Rebuild expected via appendCurve (same module path)
    const expected: Cmd[] = [];
    const ref = {
      moveTo: (x: number, y: number) => expected.push(['M', x, y]),
      lineTo: (x: number, y: number) => expected.push(['L', x, y]),
      bezierCurveTo: (...args: number[]) =>
        expected.push(['C', args[0], args[1], args[2], args[3], args[4], args[5]]),
    } as unknown as CanvasRenderingContext2D;
    ref.moveTo(points[0].x, points[0].y);
    appendCurve(ref, points, 'monotone');

    // drawLinePath wraps each segment in beginPath; commands should still match
    expect(cmds).toEqual(expected);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('connectNulls=false emits separate path stubs/segments per gap', () => {
    const points = [
      { x: 0, y: 0, value: 0, index: 0 },
      { x: 10, y: Number.NaN, value: null, index: 1 },
      { x: 20, y: 8, value: 8, index: 2 },
      { x: 30, y: 4, value: 4, index: 3 },
    ];
    const { ctx, cmds } = createRecordingContext();
    drawLinePath({ ctx, points, type: 'linear', stroke: '#000', strokeWidth: 1 });

    // stub for lone first point + line for [2,3]
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
    expect(cmds.filter((c) => c[0] === 'M')).toHaveLength(2);
    expect(cmds).toContainEqual(['L', 30, 4]);
  });

  it('connectNulls=true bridges over nulls as one polyline', () => {
    const points = [
      { x: 0, y: 0, value: 0, index: 0 },
      { x: 10, y: Number.NaN, value: null, index: 1 },
      { x: 20, y: 8, value: 8, index: 2 },
      { x: 30, y: 4, value: 4, index: 3 },
    ];
    const { ctx, cmds } = createRecordingContext();
    drawLinePath({
      ctx,
      points,
      type: 'linear',
      stroke: '#000',
      strokeWidth: 1,
      connectNulls: true,
    });
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(cmds).toEqual([
      ['M', 0, 0],
      ['L', 20, 8],
      ['L', 30, 4],
    ]);
  });
});
