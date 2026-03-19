/** CSS variable names for theming */
export const QURVE_CSS_VARS = {
  chartBg: '--qurve-chart-bg',
  gridStroke: '--qurve-grid-stroke',
  axisStroke: '--qurve-axis-stroke',
  fontFamily: '--qurve-font-family',
  tooltipBg: '--qurve-tooltip-bg',
} as const;

export type QurveTheme = {
  chartBg?: string;
  gridStroke?: string;
  axisStroke?: string;
  fontFamily?: string;
  tooltipBg?: string;
};

export function readThemeFromElement(element: HTMLElement | null): QurveTheme {
  if (!element || typeof window === 'undefined') return {};

  try {
    const style = window.getComputedStyle(element);
    return {
      chartBg: style.getPropertyValue(QURVE_CSS_VARS.chartBg).trim() || undefined,
      gridStroke: style.getPropertyValue(QURVE_CSS_VARS.gridStroke).trim() || undefined,
      axisStroke: style.getPropertyValue(QURVE_CSS_VARS.axisStroke).trim() || undefined,
      fontFamily: style.getPropertyValue(QURVE_CSS_VARS.fontFamily).trim() || undefined,
      tooltipBg: style.getPropertyValue(QURVE_CSS_VARS.tooltipBg).trim() || undefined,
    };
  } catch {
    return {};
  }
}
