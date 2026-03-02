export type PieNameKey = string | ((data: Record<string, unknown>, index: number) => string);
export type PieLabelMode = 'namePercent' | 'name' | 'value' | 'percent' | 'nameValue' | 'valuePercent';

export interface PieLabelContext {
  index: number;
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface PieLabelLayoutItem {
  key: string;
  x: number;
  y: number;
  anchor: 'left' | 'right';
  content: React.ReactNode;
  lineStartX: number;
  lineStartY: number;
  lineBendX: number;
  lineBendY: number;
  lineEndX: number;
  lineEndY: number;
}

export function toNumber(value: number | undefined): number {
  if (value === undefined) return 0;
  return Number.isFinite(value) ? value : 0;
}

export function normalizeName(item: Record<string, unknown>, index: number, nameKey?: PieNameKey): string {
  if (!nameKey) return `Slice ${index + 1}`;
  if (typeof nameKey === 'function') return String(nameKey(item, index));
  return String(item[nameKey] ?? `Slice ${index + 1}`);
}

export function normalizeAngle(value: number): number {
  let angle = value % 360;
  if (angle < 0) angle += 360;
  return angle;
}

export function isAngleInArc(angle: number, start: number, end: number): boolean {
  const normalizedAngle = normalizeAngle(angle);
  const normalizedStart = normalizeAngle(start);
  const normalizedEnd = normalizeAngle(end);

  if (normalizedStart <= normalizedEnd) {
    return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd;
  }

  return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
}

export function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function formatDefaultLabel(mode: PieLabelMode, label: PieLabelContext): string {
  const valueText = formatValue(label.value);
  const percentText = `${Math.round(label.percent * 100)}%`;

  switch (mode) {
    case 'name':
      return label.name;
    case 'value':
      return valueText;
    case 'percent':
      return percentText;
    case 'nameValue':
      return `${label.name} ${valueText}`;
    case 'valuePercent':
      return `${valueText} (${percentText})`;
    case 'namePercent':
    default:
      return `${label.name} ${percentText}`;
  }
}

export function distributeLabels(items: PieLabelLayoutItem[], minY: number, maxY: number, minGap: number): PieLabelLayoutItem[] {
  if (items.length <= 1) return items;

  const next = [...items];
  next[0] = {
    ...next[0],
    y: Math.max(minY, Math.min(maxY, next[0].y)),
  };

  for (let index = 1; index < next.length; index++) {
    const previous = next[index - 1];
    next[index] = {
      ...next[index],
      y: Math.max(next[index].y, previous.y + minGap),
    };
  }

  const overflow = next[next.length - 1].y - maxY;
  if (overflow > 0) {
    next[next.length - 1] = {
      ...next[next.length - 1],
      y: next[next.length - 1].y - overflow,
    };

    for (let index = next.length - 2; index >= 0; index--) {
      const following = next[index + 1];
      next[index] = {
        ...next[index],
        y: Math.min(next[index].y, following.y - minGap),
      };
    }
  }

  const underflow = minY - next[0].y;
  if (underflow > 0) {
    for (let index = 0; index < next.length; index++) {
      next[index] = {
        ...next[index],
        y: next[index].y + underflow,
      };
    }
  }

  return next.map((item) => ({
    ...item,
    lineBendY: item.y,
    lineEndY: item.y,
  }));
}

export const PIE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
];

export function pickColor(index: number, fill?: string, colors?: string[]): string {
  if (colors && colors.length > 0) {
    return colors[index % colors.length];
  }
  if (fill) return fill;
  return PIE_COLORS[index % PIE_COLORS.length];
}
