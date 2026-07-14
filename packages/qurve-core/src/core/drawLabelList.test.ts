import { describe, expect, it, vi } from 'vitest';
import { drawChartLabel, drawLabelList, resolveLabelAnchor } from './drawLabelList';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillText: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillStyle: '#000',
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
  } as unknown as CanvasRenderingContext2D;
}

describe('resolveLabelAnchor', () => {
  it('places top labels above a point', () => {
    const anchor = resolveLabelAnchor({ x: 100, y: 50, text: '10' }, 'top', 5);
    expect(anchor).toEqual({
      x: 100,
      y: 45,
      textAlign: 'center',
      textBaseline: 'bottom',
    });
  });

  it('places inside labels at the center of a rect', () => {
    const anchor = resolveLabelAnchor(
      { x: 10, y: 20, width: 40, height: 80, text: '10' },
      'inside',
      5,
    );
    expect(anchor).toEqual({
      x: 30,
      y: 60,
      textAlign: 'center',
      textBaseline: 'middle',
    });
  });

  it('places top labels above a bar rect', () => {
    const anchor = resolveLabelAnchor(
      { x: 10, y: 20, width: 40, height: 80, text: '10' },
      'top',
      5,
    );
    expect(anchor.x).toBe(30);
    expect(anchor.y).toBe(15);
    expect(anchor.textBaseline).toBe('bottom');
  });
});

describe('drawLabelList', () => {
  it('draws fillText for each item', () => {
    const ctx = createMockContext();
    drawLabelList({
      ctx,
      items: [
        { x: 10, y: 20, text: 'a' },
        { x: 30, y: 40, text: 'b' },
      ],
      position: 'top',
      offset: 4,
    });

    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    expect(ctx.fillText).toHaveBeenCalledWith('a', 10, 16);
    expect(ctx.fillText).toHaveBeenCalledWith('b', 30, 36);
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('skips empty text and restores on empty list', () => {
    const ctx = createMockContext();
    drawLabelList({ ctx, items: [] });
    expect(ctx.fillText).not.toHaveBeenCalled();

    drawLabelList({ ctx, items: [{ x: 1, y: 2, text: '' }] });
    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('drawChartLabel', () => {
  it('draws a centered top label above the plot', () => {
    const ctx = createMockContext();
    drawChartLabel({
      ctx,
      value: 'Title',
      margin: { top: 40, right: 10, bottom: 20, left: 30 },
      innerWidth: 200,
      innerHeight: 100,
      position: 'top',
      offset: 8,
    });

    expect(ctx.fillText).toHaveBeenCalledWith('Title', 130, 32);
  });

  it('rotates when angle is set', () => {
    const ctx = createMockContext();
    drawChartLabel({
      ctx,
      value: 'Y',
      margin: { top: 10, right: 10, bottom: 10, left: 40 },
      innerWidth: 100,
      innerHeight: 80,
      position: 'left',
      angle: -90,
    });

    expect(ctx.translate).toHaveBeenCalled();
    expect(ctx.rotate).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith('Y', 0, 0);
  });
});
