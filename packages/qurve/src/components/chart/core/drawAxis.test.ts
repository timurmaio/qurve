import { describe, expect, it, vi } from 'vitest';
import { drawXAxis, drawYAxis } from '@qurve/core';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeStyle: '#000',
    fillStyle: '#000',
    lineWidth: 1,
    textAlign: 'left',
    textBaseline: 'alphabetic',
    font: '12px sans-serif',
  } as unknown as CanvasRenderingContext2D;
}

describe('drawAxis', () => {
  it('uses tickValues and interval for X axis labels', () => {
    const ctx = createMockContext();

    drawXAxis({
      ctx,
      scale: (v) => v,
      domain: [0, 30],
      margin: { left: 0, top: 0 },
      innerWidth: 300,
      innerHeight: 100,
      position: 'bottom',
      stroke: '#666',
      tick: true,
      tickLine: false,
      axisLine: false,
      tickCount: 5,
      tickValues: [0, 10, 20, 30],
      interval: 1,
    });

    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    expect((ctx.fillText as any).mock.calls[0][0]).toBe('0');
    expect((ctx.fillText as any).mock.calls[1][0]).toBe('20');
  });

  it('applies tickFormatter for Y axis labels', () => {
    const ctx = createMockContext();

    drawYAxis({
      ctx,
      scale: (v) => v,
      domain: [0, 1],
      margin: { left: 0, top: 0 },
      innerWidth: 100,
      innerHeight: 100,
      position: 'left',
      stroke: '#666',
      tick: true,
      tickLine: false,
      axisLine: false,
      tickCount: 2,
      tickValues: [0, 1],
      tickFormatter: (value) => `v:${String(value)}`,
    });

    expect((ctx.fillText as any).mock.calls[0][0]).toBe('v:0');
    expect((ctx.fillText as any).mock.calls[1][0]).toBe('v:1');
  });
});
