import { describe, expect, it, vi } from 'vitest';
import { drawXAxis, drawYAxis } from './drawAxis';

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
    expect(vi.mocked(ctx.fillText).mock.calls[0][0]).toBe('0');
    expect(vi.mocked(ctx.fillText).mock.calls[1][0]).toBe('20');
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

    expect(vi.mocked(ctx.fillText).mock.calls[0][0]).toBe('v:0');
    expect(vi.mocked(ctx.fillText).mock.calls[1][0]).toBe('v:1');
  });

  it('draws axis line when axisLine is true', () => {
    const ctx = createMockContext();

    drawXAxis({
      ctx,
      scale: (v) => v,
      domain: [0, 10],
      margin: { left: 10, top: 10 },
      innerWidth: 100,
      innerHeight: 50,
      position: 'bottom',
      stroke: '#666',
      tick: false,
      tickLine: false,
      axisLine: true,
      tickCount: 5,
    });

    expect(ctx.moveTo).toHaveBeenCalledWith(10, 60);
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('draws tick lines when tickLine is true', () => {
    const ctx = createMockContext();

    drawXAxis({
      ctx,
      scale: (v) => v,
      domain: [0, 10],
      margin: { left: 0, top: 0 },
      innerWidth: 100,
      innerHeight: 100,
      position: 'top',
      stroke: '#666',
      tick: false,
      tickLine: true,
      axisLine: false,
      tickCount: 2,
      tickValues: [0, 10],
    });

    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('uses createTicks when tickValues not provided', () => {
    const ctx = createMockContext();

    drawXAxis({
      ctx,
      scale: (v) => v * 10,
      domain: [0, 100],
      margin: { left: 0, top: 0 },
      innerWidth: 100,
      innerHeight: 50,
      position: 'bottom',
      stroke: '#666',
      tick: true,
      tickLine: false,
      axisLine: false,
      tickCount: 5,
    });

    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('draws Y axis on right position', () => {
    const ctx = createMockContext();

    drawYAxis({
      ctx,
      scale: (v) => v,
      domain: [0, 1],
      margin: { left: 0, top: 0 },
      innerWidth: 100,
      innerHeight: 100,
      position: 'right',
      stroke: '#666',
      tick: true,
      tickLine: true,
      axisLine: true,
      tickCount: 2,
      tickValues: [0, 1],
    });

    expect(ctx.textAlign).toBe('left');
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('uses createTicks when tickValues is empty', () => {
    const ctx = createMockContext();

    drawYAxis({
      ctx,
      scale: (v) => v,
      domain: [0, 100],
      margin: { left: 0, top: 0 },
      innerWidth: 100,
      innerHeight: 100,
      position: 'left',
      stroke: '#666',
      tick: true,
      tickLine: false,
      axisLine: false,
      tickCount: 5,
      tickValues: [],
    });

    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('filters ticks by interval when interval > 0', () => {
    const ctx = createMockContext();

    drawYAxis({
      ctx,
      scale: (v) => v,
      domain: [0, 100],
      margin: { left: 0, top: 0 },
      innerWidth: 100,
      innerHeight: 100,
      position: 'left',
      stroke: '#666',
      tick: true,
      tickLine: false,
      axisLine: false,
      tickCount: 10,
      tickValues: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      interval: 2,
    });

    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('uses default font when typography props omitted', () => {
    const ctx = createMockContext();

    drawXAxis({
      ctx,
      scale: (v) => v,
      domain: [0, 10],
      margin: { left: 0, top: 0 },
      innerWidth: 100,
      innerHeight: 50,
      position: 'bottom',
      stroke: '#666',
      tick: true,
      tickLine: false,
      axisLine: false,
      tickCount: 2,
      tickValues: [0, 10],
    });

    expect(ctx.font).toBe('12px sans-serif');
  });

  it('applies fontSize, fontFamily, fontWeight for X axis', () => {
    const ctx = createMockContext();

    drawXAxis({
      ctx,
      scale: (v) => v,
      domain: [0, 10],
      margin: { left: 0, top: 0 },
      innerWidth: 100,
      innerHeight: 50,
      position: 'bottom',
      stroke: '#666',
      tick: true,
      tickLine: false,
      axisLine: false,
      tickCount: 2,
      tickValues: [0, 10],
      fontSize: 14,
      fontFamily: 'Georgia',
      fontWeight: 'bold',
    });

    expect(ctx.font).toBe('bold 14px Georgia');
  });

  it('applies fontSize and fontFamily for Y axis', () => {
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
      fontSize: 11,
      fontFamily: 'monospace',
    });

    expect(ctx.font).toBe('11px monospace');
  });
});
