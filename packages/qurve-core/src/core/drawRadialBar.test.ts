import { describe, expect, it, vi } from 'vitest';
import { buildRadialBarSectors, drawRadialBars, findRadialBarIndex } from './drawRadialBar';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

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
  });
});

describe('drawRadialBars', () => {
  it('draws background and value sectors', () => {
    const ctx = createMockContext();
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }],
      values: [75],
      names: ['A'],
      colors: ['#00f'],
      cx: 100,
      cy: 100,
      innerRadius: 20,
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
      background: true,
    });

    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('findRadialBarIndex', () => {
  it('returns ring index by distance from center', () => {
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }, { name: 'B' }],
      values: [100, 100],
      names: ['A', 'B'],
      colors: ['#f00', '#0f0'],
      cx: 100,
      cy: 100,
      innerRadius: 0,
      outerRadius: 100,
      startAngle: 0,
      endAngle: 360,
      maxValue: 100,
    });

    expect(findRadialBarIndex(sectors, 100, 100 + sectors[0].innerRadius + 1)).toBe(0);
    expect(findRadialBarIndex(sectors, 100, 100 + sectors[1].innerRadius + 1)).toBe(1);
    expect(findRadialBarIndex(sectors, 100, 250)).toBeNull();
  });
});
