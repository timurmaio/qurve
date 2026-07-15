import { describe, expect, it } from 'vitest';
import { createMockContext } from './mockCanvas';
import {
  drawChartLabel,
  drawLabelList,
  resolveLabelAnchor,
  type LabelListPosition,
} from './drawLabelList';

describe('resolveLabelAnchor', () => {
  const point = { x: 100, y: 50, text: '10' };
  const rect = { x: 10, y: 20, width: 40, height: 80, text: '10' };

  it.each([
    ['top', { x: 100, y: 45, textAlign: 'center', textBaseline: 'bottom' }],
    ['bottom', { x: 100, y: 55, textAlign: 'center', textBaseline: 'top' }],
    ['left', { x: 95, y: 50, textAlign: 'right', textBaseline: 'middle' }],
    ['right', { x: 105, y: 50, textAlign: 'left', textBaseline: 'middle' }],
    ['center', { x: 100, y: 50, textAlign: 'center', textBaseline: 'middle' }],
    ['inside', { x: 100, y: 50, textAlign: 'center', textBaseline: 'middle' }],
    ['insideTop', { x: 100, y: 55, textAlign: 'center', textBaseline: 'top' }],
    ['insideBottom', { x: 100, y: 45, textAlign: 'center', textBaseline: 'bottom' }],
    ['insideLeft', { x: 105, y: 50, textAlign: 'left', textBaseline: 'middle' }],
    ['insideRight', { x: 95, y: 50, textAlign: 'right', textBaseline: 'middle' }],
  ] as const)('point position %s', (position, expected) => {
    expect(resolveLabelAnchor(point, position, 5)).toEqual(expected);
  });

  it('places labels relative to a rect for all positions', () => {
    expect(resolveLabelAnchor(rect, 'top', 5)).toMatchObject({ x: 30, y: 15, textBaseline: 'bottom' });
    expect(resolveLabelAnchor(rect, 'bottom', 5)).toMatchObject({ x: 30, y: 105, textBaseline: 'top' });
    expect(resolveLabelAnchor(rect, 'left', 5)).toMatchObject({ x: 5, y: 60, textAlign: 'right' });
    expect(resolveLabelAnchor(rect, 'right', 5)).toMatchObject({ x: 55, y: 60, textAlign: 'left' });
    expect(resolveLabelAnchor(rect, 'inside', 5)).toMatchObject({ x: 30, y: 60 });
    expect(resolveLabelAnchor(rect, 'insideTop', 5)).toMatchObject({ x: 30, y: 25, textBaseline: 'top' });
    expect(resolveLabelAnchor(rect, 'insideBottom', 5)).toMatchObject({ x: 30, y: 95, textBaseline: 'bottom' });
    expect(resolveLabelAnchor(rect, 'insideLeft', 5)).toMatchObject({ x: 15, y: 60, textAlign: 'left' });
    expect(resolveLabelAnchor(rect, 'insideRight', 5)).toMatchObject({ x: 45, y: 60, textAlign: 'right' });
  });

  it('covers every LabelListPosition discriminant', () => {
    const positions: LabelListPosition[] = [
      'top', 'bottom', 'left', 'right', 'inside', 'center',
      'insideTop', 'insideBottom', 'insideLeft', 'insideRight',
    ];
    for (const position of positions) {
      const anchor = resolveLabelAnchor(rect, position, 2);
      expect(Number.isFinite(anchor.x)).toBe(true);
      expect(Number.isFinite(anchor.y)).toBe(true);
    }
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
      fontWeight: 700,
    });

    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    expect(ctx.fillText).toHaveBeenCalledWith('a', 10, 16);
    expect(ctx.fillText).toHaveBeenCalledWith('b', 30, 36);
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('skips empty text and empty lists', () => {
    const ctx = createMockContext();
    drawLabelList({ ctx, items: [] });
    expect(ctx.fillText).not.toHaveBeenCalled();

    drawLabelList({ ctx, items: [{ x: 1, y: 2, text: '' }] });
    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('drawChartLabel', () => {
  const base = {
    margin: { top: 40, right: 10, bottom: 20, left: 30 },
    innerWidth: 200,
    innerHeight: 100,
  };

  it('draws each plot-relative position', () => {
    const cases: Array<{ position: 'top' | 'bottom' | 'left' | 'right' | 'center'; x: number; y: number }> = [
      { position: 'top', x: 130, y: 32 },
      { position: 'bottom', x: 130, y: 148 },
      { position: 'left', x: 22, y: 90 },
      { position: 'right', x: 238, y: 90 },
      { position: 'center', x: 130, y: 90 },
    ];

    for (const { position, x, y } of cases) {
      const ctx = createMockContext();
      drawChartLabel({
        ctx,
        value: position,
        ...base,
        position,
        offset: 8,
      });
      expect(ctx.fillText).toHaveBeenCalledWith(position, x, y);
    }
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
      fontWeight: 'bold',
    });

    expect(ctx.translate).toHaveBeenCalled();
    expect(ctx.rotate).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith('Y', 0, 0);
  });

  it('skips empty value', () => {
    const ctx = createMockContext();
    drawChartLabel({
      ctx,
      value: '',
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      innerWidth: 100,
      innerHeight: 100,
    });
    expect(ctx.fillText).not.toHaveBeenCalled();
  });
});
