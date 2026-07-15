import { describe, expect, it } from 'vitest';
import { createMockContext } from './mockCanvas';
import { buildRadialBarSectors, drawRadialBars, findRadialBarIndex } from './drawRadialBar';

describe('buildRadialBarSectors', () => {
  it('builds concentric sectors proportional to values', () => {
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }, { name: 'B' }],
      values: [50, 100],
      names: ['A', 'B'],
      colors: ['#f00', '#0f0'],
      cx: 100,
      cy: 100,
      innerRadius: 20,
      outerRadius: 100,
      startAngle: 0,
      endAngle: 360,
      maxValue: 100,
    });

    expect(sectors).toHaveLength(2);
    expect(sectors[0].endAngle).toBe(180);
    expect(sectors[1].endAngle).toBe(360);
    expect(sectors[0].innerRadius).toBeLessThan(sectors[1].innerRadius);
    expect(sectors[0].backgroundEndAngle).toBe(360);
  });

  it('returns empty for empty data or non-positive domain', () => {
    expect(
      buildRadialBarSectors({
        data: [],
        values: [],
        names: [],
        colors: [],
        cx: 0,
        cy: 0,
        innerRadius: 0,
        outerRadius: 10,
        startAngle: 0,
        endAngle: 180,
      }),
    ).toEqual([]);

    expect(
      buildRadialBarSectors({
        data: [{ name: 'A' }],
        values: [0],
        names: ['A'],
        colors: ['#f00'],
        cx: 0,
        cy: 0,
        innerRadius: 0,
        outerRadius: 10,
        startAngle: 0,
        endAngle: 180,
      }),
    ).toEqual([]);
  });

  it('applies barSize, cell overrides, and skips non-finite values', () => {
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
      values: [50, NaN, 25],
      names: ['A', 'B', 'C'],
      colors: ['#000', '#111', '#222'],
      cellOverrides: [{ fill: '#abc', stroke: '#fff', strokeWidth: 2 }],
      cx: 50,
      cy: 50,
      innerRadius: 0,
      outerRadius: 40,
      startAngle: 90,
      endAngle: -90,
      barSize: 5,
    });

    expect(sectors).toHaveLength(2);
    expect(sectors[0].color).toBe('#abc');
    expect(sectors[0].stroke).toBe('#fff');
    expect(sectors[0].strokeWidth).toBe(2);
    expect(sectors[0].outerRadius - sectors[0].innerRadius).toBeCloseTo(5, 10);
  });
});

describe('drawRadialBars', () => {
  it('draws background tracks, value sectors, and strokes', () => {
    const ctx = createMockContext();
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }],
      values: [75],
      names: ['A'],
      colors: ['#00f'],
      cellOverrides: [{ stroke: '#111', strokeWidth: 1 }],
      cx: 100,
      cy: 100,
      innerRadius: 0,
      outerRadius: 80,
      startAngle: 180,
      endAngle: 0,
      maxValue: 100,
    });

    drawRadialBars({
      ctx,
      sectors,
      hoveredIndex: null,
      hoverOpacity: 0.5,
      background: { fill: 'rgba(0,0,0,0.1)' },
    });

    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('dims non-hovered sectors and skips empty list', () => {
    const ctx = createMockContext();
    drawRadialBars({ ctx, sectors: [], hoveredIndex: null, hoverOpacity: 0.4 });
    expect(ctx.fill).not.toHaveBeenCalled();

    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }, { name: 'B' }],
      values: [100, 100],
      names: ['A', 'B'],
      colors: ['#f00', '#0f0'],
      cx: 100,
      cy: 100,
      innerRadius: 10,
      outerRadius: 80,
      startAngle: 0,
      endAngle: 360,
      maxValue: 100,
    });

    drawRadialBars({ ctx, sectors, hoveredIndex: 0, hoverOpacity: 0.25, background: false });
    expect(ctx.fill).toHaveBeenCalled();
  });
});

describe('findRadialBarIndex', () => {
  it('returns ring index by distance and angle', () => {
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }, { name: 'B' }],
      values: [100, 50],
      names: ['A', 'B'],
      colors: ['#f00', '#0f0'],
      cx: 100,
      cy: 100,
      innerRadius: 0,
      outerRadius: 100,
      startAngle: 0,
      endAngle: 180,
      maxValue: 100,
    });

    // Right of center (angle ~0°) — inside first ring full sweep and second half-sweep
    expect(findRadialBarIndex(sectors, 100 + sectors[0].innerRadius + 2, 100)).toBe(0);
    // Left of center (angle ~180°) — outside the 0→90 half bar of B (50%)
    expect(findRadialBarIndex(sectors, 100 - sectors[1].innerRadius - 2, 100)).toBeNull();
    expect(findRadialBarIndex(sectors, 100, 250)).toBeNull();
  });

  it('accepts negative sweep arcs', () => {
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }],
      values: [100],
      names: ['A'],
      colors: ['#f00'],
      cx: 100,
      cy: 100,
      innerRadius: 20,
      outerRadius: 80,
      startAngle: 90,
      endAngle: -90,
      maxValue: 100,
    });
    // Down from center (angle ~90°)
    expect(findRadialBarIndex(sectors, 100, 100 + 40)).toBe(0);
    // Up from center (angle ~-90°) — at end of sweep
    expect(findRadialBarIndex(sectors, 100, 100 - 40)).toBe(0);
  });
});
