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
    return {
      chartBg: readCssVar(element, QURVE_CSS_VARS.chartBg),
      gridStroke: readCssVar(element, QURVE_CSS_VARS.gridStroke),
      axisStroke: readCssVar(element, QURVE_CSS_VARS.axisStroke),
      fontFamily: readCssVar(element, QURVE_CSS_VARS.fontFamily),
      tooltipBg: readCssVar(element, QURVE_CSS_VARS.tooltipBg),
    };
  } catch {
    return {};
  }
}

/** Resolve a CSS custom property from the element or any ancestor (jsdom-safe). */
function readCssVar(element: HTMLElement, name: string): string | undefined {
  let node: HTMLElement | null = element;
  while (node) {
    const computed = window.getComputedStyle(node).getPropertyValue(name).trim();
    if (computed) return computed;
    const inline = node.style.getPropertyValue(name).trim();
    if (inline) return inline;
    node = node.parentElement;
  }
  return undefined;
}

export function themesEqual(a: QurveTheme, b: QurveTheme): boolean {
  return (
    a.chartBg === b.chartBg &&
    a.gridStroke === b.gridStroke &&
    a.axisStroke === b.axisStroke &&
    a.fontFamily === b.fontFamily &&
    a.tooltipBg === b.tooltipBg
  );
}

/** Parse #rgb / #rrggbb / rgb() / rgba() into sRGB 0–1 channels. */
export function parseCssColor(input: string): { r: number; g: number; b: number; a: number } | null {
  const value = input.trim().toLowerCase();
  if (!value) return null;

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) {
      return {
        r: Number.parseInt(h[0] + h[0], 16) / 255,
        g: Number.parseInt(h[1] + h[1], 16) / 255,
        b: Number.parseInt(h[2] + h[2], 16) / 255,
        a: 1,
      };
    }
    return {
      r: Number.parseInt(h.slice(0, 2), 16) / 255,
      g: Number.parseInt(h.slice(2, 4), 16) / 255,
      b: Number.parseInt(h.slice(4, 6), 16) / 255,
      a: 1,
    };
  }

  const rgb = /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/.exec(value);
  if (rgb) {
    return {
      r: Number(rgb[1]) / 255,
      g: Number(rgb[2]) / 255,
      b: Number(rgb[3]) / 255,
      a: rgb[4] != null ? Number(rgb[4]) : 1,
    };
  }

  return null;
}

function channelLuminance(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance 0–1 (WCAG). Returns null if color cannot be parsed. */
export function relativeLuminance(cssColor: string): number | null {
  const parsed = parseCssColor(cssColor);
  if (!parsed) return null;
  // Blend semi-transparent colors onto white for contrast decisions
  const a = Math.min(1, Math.max(0, parsed.a));
  const r = parsed.r * a + (1 - a);
  const g = parsed.g * a + (1 - a);
  const b = parsed.b * a + (1 - a);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function isDarkCssColor(cssColor: string | undefined, fallbackDark = false): boolean {
  if (!cssColor) return fallbackDark;
  const L = relativeLuminance(cssColor);
  if (L == null) return fallbackDark;
  return L < 0.45;
}

export type TooltipTone = {
  color: string;
  muted: string;
  border: string;
  shadow: string;
};

export function tooltipToneForBackground(bg: string | undefined): TooltipTone {
  if (isDarkCssColor(bg, false)) {
    return {
      color: '#e8edf5',
      muted: '#94a3b8',
      border: '1px solid #35455c',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
    };
  }
  return {
    color: '#1a1a1a',
    muted: '#666666',
    border: '1px solid #e0e0e0',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  };
}
