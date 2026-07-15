import { describe, expect, it, vi } from 'vitest';
import { drawArea } from './drawArea';
import { appendCurve } from './curvePath';

type Cmd =
  | ['M', number, number]
  | ['L', number, number]
  | ['C', number, number, number, number, number, number];

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
    bezierCurveTo: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

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
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
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
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, cmds };
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

  it('applies hover opacity when hoveredIndex is set', () => {
    const ctx = createMockContext();

    drawArea({
      ctx,
      points: [
        { x: 0, y0: 20, y1: 10 },
        { x: 10, y0: 30, y1: 15 },
      ],
      fill: '#333',
      fillOpacity: 0.5,
      strokeWidth: 0,
      hoveredIndex: 1,
      hoverOpacity: 0.3,
    });

    expect(ctx.fill).toHaveBeenCalled();
  });

  it('fills without stroke when stroke not provided', () => {
    const ctx = createMockContext();

    drawArea({
      ctx,
      points: [
        { x: 0, y0: 20, y1: 10 },
        { x: 10, y0: 30, y1: 15 },
      ],
      fill: '#333',
      fillOpacity: 1,
      strokeWidth: 0,
      hoveredIndex: null,
      hoverOpacity: 0.5,
    });

    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('draws monotone area without throwing', () => {
    const ctx = createMockContext();
    drawArea({
      ctx,
      points: [
        { x: 0, y0: 20, y1: 10 },
        { x: 10, y0: 30, y1: 5 },
        { x: 20, y0: 25, y1: 12 },
      ],
      fill: '#333',
      fillOpacity: 0.2,
      stroke: '#111',
      strokeWidth: 1,
      hoveredIndex: null,
      hoverOpacity: 0.5,
      type: 'monotone',
    });
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.bezierCurveTo).toHaveBeenCalled();
  });

  it('stroke path for top edge matches appendCurve(type)', () => {
    const points = [
      { x: 0, y0: 40, y1: 10 },
      { x: 10, y0: 35, y1: 5 },
      { x: 20, y0: 38, y1: 15 },
      { x: 30, y0: 30, y1: 8 },
    ];
    const top = points.map((p) => ({ x: p.x, y: p.y1 }));

    for (const type of ['linear', 'monotone', 'stepAfter'] as const) {
      const { ctx, cmds } = createRecordingContext();
      drawArea({
        ctx,
        points,
        fill: '#333',
        fillOpacity: 1,
        stroke: '#111',
        strokeWidth: 2,
        hoveredIndex: null,
        hoverOpacity: 0.5,
        type,
      });

      const expected: Cmd[] = [['M', top[0].x, top[0].y]];
      const ref = {
        moveTo: () => undefined,
        lineTo: (x: number, y: number) => expected.push(['L', x, y]),
        bezierCurveTo: (...args: number[]) =>
          expected.push(['C', args[0], args[1], args[2], args[3], args[4], args[5]]),
      } as unknown as CanvasRenderingContext2D;
      appendCurve(ref, top, type);

      // Stroke redraw is the last path starting at moveTo(top[0])
      const lastM = [...cmds].reverse().findIndex((c) => c[0] === 'M');
      const start = lastM < 0 ? 0 : cmds.length - 1 - lastM;
      expect(cmds.slice(start)).toEqual(expected);
    }
  });
});
