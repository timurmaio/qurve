import { describe, expect, it } from 'vitest';
import {
  distributeLabels,
  formatDefaultLabel,
  formatValue,
  isAngleInArc,
  normalizeAngle,
  normalizeName,
  pickColor,
  toNumber,
  PIE_COLORS,
} from './pieMath';

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

  it('isAngleInArc handles wrapping arc (start > end)', () => {
    expect(isAngleInArc(10, 350, 20)).toBe(true);
    expect(isAngleInArc(100, 350, 20)).toBe(false);
  });

  it('formats labels by mode', () => {
    const label = { index: 0, name: 'A', value: 40, percent: 0.4, color: '#000' };
    expect(formatDefaultLabel('name', label)).toBe('A');
    expect(formatDefaultLabel('value', label)).toBe('40');
    expect(formatDefaultLabel('percent', label)).toBe('40%');
    expect(formatDefaultLabel('valuePercent', label)).toBe('40 (40%)');
    expect(formatDefaultLabel('namePercent', label)).toBe('A 40%');
    expect(formatDefaultLabel('nameValue', label)).toBe('A 40');
  });

  it('formats non-integer value in formatValue', () => {
    expect(formatValue(3.14159)).toBe('3.14');
  });

  it('formats value correctly', () => {
    expect(formatValue(42)).toBe('42');
    expect(formatValue(3.14)).toBe('3.14');
  });

  it('picks color from colors, fill, or palette', () => {
    expect(pickColor(1, undefined, ['#111', '#222'])).toBe('#222');
    expect(pickColor(0, '#abc', undefined)).toBe('#abc');
    expect(pickColor(0)).toBe(PIE_COLORS[0]);
    expect(pickColor(7)).toBe(PIE_COLORS[7]);
    expect(pickColor(8)).toBe(PIE_COLORS[0]);
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

  it('returns single item unchanged in distributeLabels', () => {
    const labels = [
      { key: 'a', x: 0, y: 50, anchor: 'left' as const, content: 'a', lineStartX: 0, lineStartY: 0, lineBendX: 0, lineBendY: 50, lineEndX: 0, lineEndY: 50 },
    ];
    const out = distributeLabels(labels, 0, 100, 8);
    expect(out).toHaveLength(1);
    expect(out[0].y).toBe(50);
  });

  it('distributes labels with overflow adjustment', () => {
    const labels = [
      { key: 'a', x: 0, y: 0, anchor: 'left' as const, content: 'a', lineStartX: 0, lineStartY: 0, lineBendX: 0, lineBendY: 0, lineEndX: 0, lineEndY: 0 },
      { key: 'b', x: 0, y: 5, anchor: 'left' as const, content: 'b', lineStartX: 0, lineStartY: 0, lineBendX: 0, lineBendY: 5, lineEndX: 0, lineEndY: 5 },
      { key: 'c', x: 0, y: 50, anchor: 'left' as const, content: 'c', lineStartX: 0, lineStartY: 0, lineBendX: 0, lineBendY: 50, lineEndX: 0, lineEndY: 50 },
    ];
    const out = distributeLabels(labels, 0, 15, 5);
    expect(out[2].y).toBeLessThanOrEqual(15);
  });

  it('distributes labels with underflow adjustment', () => {
    const labels = [
      { key: 'a', x: 0, y: 20, anchor: 'left' as const, content: 'a', lineStartX: 0, lineStartY: 0, lineBendX: 0, lineBendY: 20, lineEndX: 0, lineEndY: 20 },
      { key: 'b', x: 0, y: 20, anchor: 'left' as const, content: 'b', lineStartX: 0, lineStartY: 0, lineBendX: 0, lineBendY: 20, lineEndX: 0, lineEndY: 20 },
      { key: 'c', x: 0, y: 100, anchor: 'left' as const, content: 'c', lineStartX: 0, lineStartY: 0, lineBendX: 0, lineBendY: 100, lineEndX: 0, lineEndY: 100 },
    ];
    const out = distributeLabels(labels, 20, 25, 10);
    expect(out[0].y).toBeGreaterThanOrEqual(20);
  });
});
