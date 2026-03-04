import { describe, expect, it } from 'vitest';
import {
  distributeLabels,
  formatDefaultLabel,
  isAngleInArc,
  normalizeAngle,
  normalizeName,
  pickColor,
  toNumber,
} from '@qurve/core';

describe('pieMath', () => {
  it('normalizes finite/undefined numbers', () => {
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber(Number.NaN)).toBe(0);
    expect(toNumber(12)).toBe(12);
  });

  it('normalizes slice names', () => {
    expect(normalizeName({}, 0)).toBe('Slice 1');
    expect(normalizeName({ name: 'A' }, 1, 'name')).toBe('A');
    expect(normalizeName({ value: 3 }, 2, (item) => `V${String(item.value)}`)).toBe('V3');
  });

  it('normalizes angles and arc inclusion', () => {
    expect(normalizeAngle(-90)).toBe(270);
    expect(isAngleInArc(350, 300, 20)).toBe(true);
    expect(isAngleInArc(120, 300, 20)).toBe(false);
  });

  it('formats labels by mode', () => {
    const label = { index: 0, name: 'A', value: 40, percent: 0.4, color: '#000' };
    expect(formatDefaultLabel('name', label)).toBe('A');
    expect(formatDefaultLabel('value', label)).toBe('40');
    expect(formatDefaultLabel('percent', label)).toBe('40%');
    expect(formatDefaultLabel('valuePercent', label)).toBe('40 (40%)');
  });

  it('picks color from colors, fill, or palette', () => {
    expect(pickColor(1, undefined, ['#111', '#222'])).toBe('#222');
    expect(pickColor(0, '#abc', undefined)).toBe('#abc');
    expect(pickColor(0)).toBe('#3b82f6');
  });

  it('distributes labels with min gap', () => {
    const labels = [
      { key: 'a', x: 0, y: 10, anchor: 'left' as const, content: 'a', lineStartX: 0, lineStartY: 0, lineBendX: 0, lineBendY: 10, lineEndX: 0, lineEndY: 10 },
      { key: 'b', x: 0, y: 12, anchor: 'left' as const, content: 'b', lineStartX: 0, lineStartY: 0, lineBendX: 0, lineBendY: 12, lineEndX: 0, lineEndY: 12 },
    ];

    const out = distributeLabels(labels, 0, 100, 8);
    expect(out[1].y - out[0].y).toBeGreaterThanOrEqual(8);
    expect(out[0].lineBendY).toBe(out[0].y);
    expect(out[1].lineEndY).toBe(out[1].y);
  });
});
