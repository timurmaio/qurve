import { describe, expect, it, vi } from 'vitest';
import { createMockContext } from './mockCanvas';
import {
  drawPolarAngleAxis,
  drawPolarGrid,
  drawPolarRadiusAxis,
  drawRadarPolygon,
} from './drawPolar';

const layout = { cx: 100, cy: 100, outerRadius: 80 };

describe('drawPolarGrid', () => {
  it('returns early for invalid layout or angle count', () => {
    const ctx = createMockContext();
    drawPolarGrid({ ctx, layout: { ...layout, outerRadius: 0 }, angleCount: 4, radiusDomain: [0, 100] });
    drawPolarGrid({ ctx, layout, angleCount: 0, radiusDomain: [0, 100] });
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('draws polygon rings and spokes', () => {
    const ctx = createMockContext();
    drawPolarGrid({
      ctx,
      layout,
      angleCount: 4,
      radiusDomain: [0, 100],
      tickCount: 3,
      gridType: 'polygon',
    });
    // 2 rings (skip center) + 4 spokes
    expect(ctx.stroke).toHaveBeenCalledTimes(6);
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('draws circular rings when gridType is circle', () => {
    const ctx = createMockContext();
    drawPolarGrid({
      ctx,
      layout,
      angleCount: 3,
      radiusDomain: [0, 50],
      tickCount: 3,
      gridType: 'circle',
      strokeDasharray: '4 2',
    });
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 2]);
  });

  it('accepts numeric dash array', () => {
    const ctx = createMockContext();
    drawPolarGrid({
      ctx,
      layout,
      angleCount: 3,
      radiusDomain: [0, 10],
      tickCount: 2,
      strokeDasharray: [3, 1],
    });
    expect(ctx.setLineDash).toHaveBeenCalledWith([3, 1]);
  });
});

describe('drawPolarAngleAxis', () => {
  it('returns early when empty or no radius', () => {
    const ctx = createMockContext();
    drawPolarAngleAxis({ ctx, layout, labels: [] });
    drawPolarAngleAxis({ ctx, layout: { ...layout, outerRadius: 0 }, labels: ['A'] });
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('draws ticks and labels around the circle', () => {
    const ctx = createMockContext();
    drawPolarAngleAxis({
      ctx,
      layout,
      labels: ['A', 'B', 'C', 'D'],
      tick: true,
      fontWeight: 600,
      labelOffset: 10,
    });
    expect(ctx.fillText).toHaveBeenCalledTimes(4);
    expect(ctx.fillText).toHaveBeenCalledWith('A', expect.any(Number), expect.any(Number));
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('skips tick marks when tick is false', () => {
    const ctx = createMockContext();
    drawPolarAngleAxis({ ctx, layout, labels: ['A', 'B'], tick: false });
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    // Only label drawing — no tick strokes beyond setup
    expect(ctx.moveTo).not.toHaveBeenCalled();
  });
});

describe('drawPolarRadiusAxis', () => {
  it('returns early when outerRadius is 0', () => {
    const ctx = createMockContext();
    drawPolarRadiusAxis({
      ctx,
      layout: { ...layout, outerRadius: 0 },
      domain: [0, 100],
    });
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('draws axis line, ticks, and formatted labels', () => {
    const ctx = createMockContext();
    const formatter = (v: number) => `${v}%`;
    drawPolarRadiusAxis({
      ctx,
      layout,
      domain: [0, 100],
      tickCount: 3,
      angle: 90,
      tickFormatter: formatter,
      fontWeight: 'bold',
    });
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalled();
    const calls = vi.mocked(ctx.fillText).mock.calls;
    expect(calls.some((call) => String(call[0]).includes('%'))).toBe(true);
  });

  it('handles degenerate domain (min === max)', () => {
    const ctx = createMockContext();
    drawPolarRadiusAxis({ ctx, layout, domain: [5, 5], tickCount: 2 });
    expect(ctx.fillText).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('drawRadarPolygon', () => {
  const points = [
    { x: 100, y: 40, angle: 0, radius: 60, index: 0, value: 75 },
    { x: 160, y: 100, angle: 90, radius: 60, index: 1, value: 75 },
    { x: 100, y: 160, angle: 180, radius: 60, index: 2, value: 75 },
  ];

  it('returns early for empty points', () => {
    const ctx = createMockContext();
    drawRadarPolygon({ ctx, points: [] });
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('fills and strokes the closed polygon', () => {
    const ctx = createMockContext();
    drawRadarPolygon({
      ctx,
      points,
      fill: '#abc',
      fillOpacity: 0.3,
      stroke: '#123',
      strokeWidth: 2,
    });
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.closePath).toHaveBeenCalled();
  });

  it('skips fill when fillOpacity is 0', () => {
    const ctx = createMockContext();
    drawRadarPolygon({ ctx, points, fillOpacity: 0 });
    expect(ctx.fill).not.toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('draws dots when enabled and enlarges hovered point', () => {
    const ctx = createMockContext();
    drawRadarPolygon({
      ctx,
      points,
      dot: { r: 4, fill: '#f00', stroke: '#0f0' },
      hoveredIndex: 1,
    });
    expect(ctx.arc).toHaveBeenCalledTimes(3);
  });

  it('draws only hovered dot when dot is false', () => {
    const ctx = createMockContext();
    drawRadarPolygon({ ctx, points, dot: false, hoveredIndex: 2 });
    expect(ctx.arc).toHaveBeenCalledTimes(1);
  });
});
