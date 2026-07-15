import { describe, expect, it } from 'vitest';
import { createMockContext } from './mockCanvas';
import { buildFunnelTrapezoids, drawFunnel, findFunnelIndex } from './drawFunnel';

describe('buildFunnelTrapezoids', () => {
  it('builds decreasing trapezoids from values', () => {
    const traps = buildFunnelTrapezoids({
      data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
      values: [100, 60, 30],
      names: ['A', 'B', 'C'],
      colors: ['#f00', '#0f0', '#00f'],
      plotX: 0,
      plotY: 0,
      plotWidth: 200,
      plotHeight: 300,
    });

    expect(traps).toHaveLength(3);
    expect(traps[0].topWidth).toBe(200);
    expect(traps[1].topWidth).toBe(120);
    expect(traps[2].topWidth).toBe(60);
    expect(traps[0].height).toBe(100);
  });
});

describe('drawFunnel', () => {
  it('fills each trapezoid and strokes when configured', () => {
    const ctx = createMockContext();
    const traps = buildFunnelTrapezoids({
      data: [{ name: 'A' }, { name: 'B' }],
      values: [100, 50],
      names: ['A', 'B'],
      colors: ['#f00', '#0f0'],
      cellOverrides: [{ stroke: '#111', strokeWidth: 2 }],
      plotX: 10,
      plotY: 10,
      plotWidth: 100,
      plotHeight: 200,
      stroke: '#222',
      strokeWidth: 1,
    });

    drawFunnel({ ctx, trapezoids: traps, hoveredIndex: 0, hoverOpacity: 0.4 });
    expect(ctx.fill).toHaveBeenCalledTimes(2);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('returns early for empty trapezoids', () => {
    const ctx = createMockContext();
    drawFunnel({ ctx, trapezoids: [], hoveredIndex: null, hoverOpacity: 0.4 });
    expect(ctx.fill).not.toHaveBeenCalled();
  });
});

describe('findFunnelIndex', () => {
  it('hits by point-in-trapezoid', () => {
    const traps = buildFunnelTrapezoids({
      data: [{ name: 'A' }, { name: 'B' }],
      values: [100, 50],
      names: ['A', 'B'],
      colors: ['#f00', '#0f0'],
      plotX: 0,
      plotY: 0,
      plotWidth: 100,
      plotHeight: 200,
    });

    expect(findFunnelIndex(traps, 50, traps[0].y + 1)).toBe(0);
    expect(findFunnelIndex(traps, 50, traps[1].y + 1)).toBe(1);
    expect(findFunnelIndex(traps, 50, 250)).toBeNull();
    // Outside trapezoid width
    expect(findFunnelIndex(traps, -100, traps[0].y + 1)).toBeNull();
  });
});
