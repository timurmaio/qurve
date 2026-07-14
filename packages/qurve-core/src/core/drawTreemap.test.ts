import { describe, expect, it, vi } from 'vitest';
import {
  buildTreemapRects,
  drawTreemap,
  findTreemapIndex,
  resolveTreemapValue,
  squarify,
} from './drawTreemap';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('resolveTreemapValue', () => {
  it('sums children when nested', () => {
    expect(
      resolveTreemapValue(
        {
          name: 'root',
          children: [
            { name: 'a', value: 10 },
            { name: 'b', value: 30 },
          ],
        },
        'value',
      ),
    ).toBe(40);
  });

  it('reads leaf dataKey', () => {
    expect(resolveTreemapValue({ name: 'a', size: 12 }, 'size')).toBe(12);
  });
});

describe('squarify', () => {
  it('fills the rectangle with positive areas', () => {
    const laid: Array<{ width: number; height: number; value: number }> = [];
    squarify(
      [
        { value: 6, name: 'a', node: { name: 'a' } },
        { value: 6, name: 'b', node: { name: 'b' } },
        { value: 4, name: 'c', node: { name: 'c' } },
        { value: 3, name: 'd', node: { name: 'd' } },
        { value: 2, name: 'e', node: { name: 'e' } },
        { value: 2, name: 'f', node: { name: 'f' } },
        { value: 1, name: 'g', node: { name: 'g' } },
      ],
      0,
      0,
      100,
      100,
      (item, rect) => {
        laid.push({ ...rect, value: item.value });
      },
    );

    expect(laid).toHaveLength(7);
    const area = laid.reduce((sum, r) => sum + r.width * r.height, 0);
    expect(area).toBeCloseTo(10000, 0);
  });
});

describe('buildTreemapRects', () => {
  it('builds flat leaf rects', () => {
    const rects = buildTreemapRects({
      data: [
        { name: 'A', value: 100 },
        { name: 'B', value: 50 },
        { name: 'C', value: 50 },
      ],
      colors: ['#f00', '#0f0', '#00f'],
      plotX: 0,
      plotY: 0,
      plotWidth: 200,
      plotHeight: 100,
      padding: 0,
    });

    expect(rects).toHaveLength(3);
    expect(rects.map((r) => r.name).sort()).toEqual(['A', 'B', 'C']);
    const area = rects.reduce((sum, r) => sum + r.width * r.height, 0);
    expect(area).toBeCloseTo(20000, 0);
  });

  it('flattens nested children into leaves', () => {
    const rects = buildTreemapRects({
      data: [
        {
          name: 'group',
          children: [
            { name: 'A', value: 40 },
            { name: 'B', value: 60 },
          ],
        },
        { name: 'C', value: 100 },
      ],
      colors: ['#f00', '#0f0', '#00f'],
      plotX: 10,
      plotY: 10,
      plotWidth: 200,
      plotHeight: 100,
      padding: 0,
    });

    expect(rects).toHaveLength(3);
    expect(rects.map((r) => r.name).sort()).toEqual(['A', 'B', 'C']);
  });

  it('applies Cell overrides by leaf index', () => {
    const rects = buildTreemapRects({
      data: [
        { name: 'A', value: 10 },
        { name: 'B', value: 10 },
      ],
      colors: ['#000', '#111'],
      cellOverrides: [{ fill: '#abc' }, { fill: '#def' }],
      plotX: 0,
      plotY: 0,
      plotWidth: 100,
      plotHeight: 100,
      padding: 0,
    });

    expect(rects[0].color).toBe('#abc');
    expect(rects[1].color).toBe('#def');
  });
});

describe('drawTreemap', () => {
  it('fills each rect', () => {
    const ctx = createMockContext();
    const rects = buildTreemapRects({
      data: [
        { name: 'A', value: 10 },
        { name: 'B', value: 10 },
      ],
      colors: ['#f00', '#0f0'],
      plotX: 0,
      plotY: 0,
      plotWidth: 100,
      plotHeight: 50,
      padding: 0,
    });

    drawTreemap({ ctx, rects, hoveredIndex: null, hoverOpacity: 0.4 });
    expect(ctx.fillRect).toHaveBeenCalledTimes(2);
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('findTreemapIndex', () => {
  it('hits containing rect', () => {
    const rects = buildTreemapRects({
      data: [
        { name: 'A', value: 100 },
        { name: 'B', value: 100 },
      ],
      colors: ['#f00', '#0f0'],
      plotX: 0,
      plotY: 0,
      plotWidth: 200,
      plotHeight: 100,
      padding: 0,
    });

    const hit = findTreemapIndex(rects, rects[0].x + 1, rects[0].y + 1);
    expect(hit).toBe(rects[0].index);
    expect(findTreemapIndex(rects, -10, -10)).toBeNull();
  });
});
