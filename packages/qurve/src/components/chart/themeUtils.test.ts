import { describe, expect, it } from 'vitest';
import {
  isDarkCssColor,
  parseCssColor,
  readThemeFromElement,
  relativeLuminance,
  themesEqual,
  tooltipToneForBackground,
} from './themeUtils';

describe('themeUtils color contrast', () => {
  it('parses hex and rgb(a)', () => {
    expect(parseCssColor('#0b1220')).toEqual({
      r: expect.closeTo(11 / 255, 5),
      g: expect.closeTo(18 / 255, 5),
      b: expect.closeTo(32 / 255, 5),
      a: 1,
    });
    expect(parseCssColor('#fff')).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    expect(parseCssColor('rgba(16, 22, 31, 0.96)')?.a).toBeCloseTo(0.96, 5);
  });

  it('treats dark backgrounds as dark', () => {
    expect(isDarkCssColor('#0b1220')).toBe(true);
    expect(isDarkCssColor('rgba(16, 22, 31, 0.96)')).toBe(true);
    expect(isDarkCssColor('#f5f7fa')).toBe(false);
    expect(isDarkCssColor(undefined)).toBe(false);
  });

  it('picks light text tone for dark tooltip backgrounds', () => {
    const dark = tooltipToneForBackground('rgba(16, 22, 31, 0.96)');
    expect(dark.color).toBe('#e8edf5');
    expect(dark.muted).toBe('#94a3b8');

    const light = tooltipToneForBackground('rgba(245, 247, 250, 0.96)');
    expect(light.color).toBe('#1a1a1a');
    expect(light.muted).toBe('#666666');
  });

  it('relativeLuminance is higher for white than black', () => {
    expect(relativeLuminance('#ffffff')!).toBeGreaterThan(relativeLuminance('#000000')!);
  });

  it('themesEqual compares fields', () => {
    expect(themesEqual({ chartBg: '#fff' }, { chartBg: '#fff' })).toBe(true);
    expect(themesEqual({ chartBg: '#fff' }, { chartBg: '#000' })).toBe(false);
  });

  it('readThemeFromElement walks ancestors for CSS vars', () => {
    const parent = document.createElement('div');
    parent.style.setProperty('--qurve-tooltip-bg', 'rgba(16, 22, 31, 0.96)');
    parent.style.setProperty('--qurve-chart-bg', '#0b1220');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    expect(readThemeFromElement(child)).toEqual({
      chartBg: '#0b1220',
      gridStroke: undefined,
      axisStroke: undefined,
      fontFamily: undefined,
      tooltipBg: 'rgba(16, 22, 31, 0.96)',
    });

    parent.remove();
  });
});
