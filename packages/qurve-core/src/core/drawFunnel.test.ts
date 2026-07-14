import { describe, expect, it, vi } from 'vitest';
import { buildFunnelTrapezoids, drawFunnel, findFunnelIndex } from './drawFunnel';

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
  } as unknown as CanvasRenderingContext2D;
}

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
  it('fills each trapezoid', () => {
    const ctx = createMockContext();
    const traps = buildFunnelTrapezoids({
      data: [{ name: 'A' }, { name: 'B' }],
      values: [100, 50],
      names: ['A', 'B'],
      colors: ['#f00', '#0f0'],
      plotX: 10,
      plotY: 10,
      plotWidth: 100,
      plotHeight: 200,
    });

    drawFunnel({ ctx, trapezoids: traps, hoveredIndex: null, hoverOpacity: 0.4 });
    expect(ctx.fill).toHaveBeenCalledTimes(2);
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('findFunnelIndex', () => {
  it('hits by y band', () => {
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

    expect(findFunnelIndex(traps, 50)).toBe(0);
    expect(findFunnelIndex(traps, 150)).toBe(1);
    expect(findFunnelIndex(traps, 250)).toBeNull();
  });
});
