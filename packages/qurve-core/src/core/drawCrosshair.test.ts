import { describe, expect, it, vi } from 'vitest';
import { drawCrosshair } from './drawCrosshair';

function createMockContext() {
  return {
    setLineDash: vi.fn(),
    strokeStyle: '#000',
    lineWidth: 1,
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('drawCrosshair', () => {
  it('does nothing when cursor is false', () => {
    const ctx = createMockContext();

    drawCrosshair({
      ctx,
      point: { x: 50, y: 50, value: 10, index: 0 },
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
      cursor: false,
      defaults: { stroke: '#666', strokeWidth: 1, strokeDasharray: '4 4' },
    });

    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('draws crosshair lines when cursor is true', () => {
    const ctx = createMockContext();

    drawCrosshair({
      ctx,
      point: { x: 50, y: 50, value: 10, index: 0 },
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
      cursor: true,
      defaults: { stroke: '#666', strokeWidth: 1, strokeDasharray: '4 4' },
    });

    expect(ctx.stroke).toHaveBeenCalledTimes(2);
    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4]);
  });

  it('uses custom cursor config when provided', () => {
    const ctx = createMockContext();

    drawCrosshair({
      ctx,
      point: { x: 50, y: 50, value: 10, index: 0 },
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
      cursor: { stroke: '#f00', strokeWidth: 2 },
      defaults: { stroke: '#666', strokeWidth: 1, strokeDasharray: '4 4' },
    });

    expect(ctx.strokeStyle).toBe('#f00');
    expect(ctx.lineWidth).toBe(2);
  });

  it('uses custom strokeDasharray from cursor config', () => {
    const ctx = createMockContext();

    drawCrosshair({
      ctx,
      point: { x: 50, y: 50, value: 10, index: 0 },
      margin: { top: 10, left: 20 },
      innerWidth: 200,
      innerHeight: 100,
      cursor: { strokeDasharray: '2 2' },
      defaults: { stroke: '#666', strokeWidth: 1, strokeDasharray: '4 4' },
    });

    expect(ctx.setLineDash).toHaveBeenCalledWith([2, 2]);
  });
});
