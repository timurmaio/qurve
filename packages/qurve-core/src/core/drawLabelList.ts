export type LabelListPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'inside'
  | 'center'
  | 'insideTop'
  | 'insideBottom'
  | 'insideLeft'
  | 'insideRight';

export interface LabelListItem {
  /** Anchor x — point x, or left edge of a bar rect. */
  x: number;
  /** Anchor y — point y, or top edge of a bar rect. */
  y: number;
  /** Optional bar/rect width for inside* / center placement. */
  width?: number;
  /** Optional bar/rect height for inside* / center placement. */
  height?: number;
  text: string;
}

export interface LabelAnchor {
  x: number;
  y: number;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
}

function buildFont(fontSize: number, fontFamily: string, fontWeight?: string | number): string {
  const weight = fontWeight != null ? String(fontWeight) : '';
  return [weight, `${fontSize}px`, fontFamily].filter(Boolean).join(' ');
}

/**
 * Resolve canvas text placement relative to a point or optional rect.
 * Without width/height, inside* positions fall back to the point with a small inset offset.
 */
export function resolveLabelAnchor(
  item: LabelListItem,
  position: LabelListPosition,
  offset: number,
): LabelAnchor {
  const w = item.width ?? 0;
  const h = item.height ?? 0;
  const hasRect = w > 0 && h > 0;
  const cx = hasRect ? item.x + w / 2 : item.x;
  const cy = hasRect ? item.y + h / 2 : item.y;

  switch (position) {
    case 'top':
      return {
        x: cx,
        y: (hasRect ? item.y : item.y) - offset,
        textAlign: 'center',
        textBaseline: 'bottom',
      };
    case 'bottom':
      return {
        x: cx,
        y: (hasRect ? item.y + h : item.y) + offset,
        textAlign: 'center',
        textBaseline: 'top',
      };
    case 'left':
      return {
        x: (hasRect ? item.x : item.x) - offset,
        y: cy,
        textAlign: 'right',
        textBaseline: 'middle',
      };
    case 'right':
      return {
        x: (hasRect ? item.x + w : item.x) + offset,
        y: cy,
        textAlign: 'left',
        textBaseline: 'middle',
      };
    case 'inside':
    case 'center':
      return {
        x: cx,
        y: cy,
        textAlign: 'center',
        textBaseline: 'middle',
      };
    case 'insideTop':
      return {
        x: cx,
        y: hasRect ? item.y + offset : item.y + offset,
        textAlign: 'center',
        textBaseline: hasRect ? 'top' : 'top',
      };
    case 'insideBottom':
      return {
        x: cx,
        y: hasRect ? item.y + h - offset : item.y - offset,
        textAlign: 'center',
        textBaseline: hasRect ? 'bottom' : 'bottom',
      };
    case 'insideLeft':
      return {
        x: hasRect ? item.x + offset : item.x + offset,
        y: cy,
        textAlign: 'left',
        textBaseline: 'middle',
      };
    case 'insideRight':
      return {
        x: hasRect ? item.x + w - offset : item.x - offset,
        y: cy,
        textAlign: 'right',
        textBaseline: 'middle',
      };
    default: {
      const _exhaustive: never = position;
      void _exhaustive;
      return { x: cx, y: cy, textAlign: 'center', textBaseline: 'middle' };
    }
  }
}

export function drawLabelList(params: {
  ctx: CanvasRenderingContext2D;
  items: LabelListItem[];
  position?: LabelListPosition;
  offset?: number;
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
}): void {
  const {
    ctx,
    items,
    position = 'top',
    offset = 5,
    fill = '#374151',
    fontSize = 12,
    fontFamily = 'sans-serif',
    fontWeight,
  } = params;

  if (items.length === 0) return;

  ctx.save();
  try {
    ctx.fillStyle = fill;
    ctx.font = buildFont(fontSize, fontFamily, fontWeight);

    for (const item of items) {
      if (!item.text) continue;
      const anchor = resolveLabelAnchor(item, position, offset);
      ctx.textAlign = anchor.textAlign;
      ctx.textBaseline = anchor.textBaseline;
      ctx.fillText(item.text, anchor.x, anchor.y);
    }
  } finally {
    ctx.restore();
  }
}

export type ChartLabelPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

/**
 * Draw a single label relative to the plot area (margin + inner size).
 */
export function drawChartLabel(params: {
  ctx: CanvasRenderingContext2D;
  value: string;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
  position?: ChartLabelPosition;
  offset?: number;
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  angle?: number;
}): void {
  const {
    ctx,
    value,
    margin,
    innerWidth,
    innerHeight,
    position = 'top',
    offset = 0,
    fill = '#374151',
    fontSize = 14,
    fontFamily = 'sans-serif',
    fontWeight,
    angle = 0,
  } = params;

  if (!value) return;

  const left = margin.left;
  const top = margin.top;
  const right = margin.left + innerWidth;
  const bottom = margin.top + innerHeight;
  const cx = left + innerWidth / 2;
  const cy = top + innerHeight / 2;

  let x = cx;
  let y = top - offset;
  let textAlign: CanvasTextAlign = 'center';
  let textBaseline: CanvasTextBaseline = 'bottom';

  switch (position) {
    case 'top':
      x = cx;
      y = top - offset;
      textAlign = 'center';
      textBaseline = 'bottom';
      break;
    case 'bottom':
      x = cx;
      y = bottom + offset;
      textAlign = 'center';
      textBaseline = 'top';
      break;
    case 'left':
      x = left - offset;
      y = cy;
      textAlign = 'right';
      textBaseline = 'middle';
      break;
    case 'right':
      x = right + offset;
      y = cy;
      textAlign = 'left';
      textBaseline = 'middle';
      break;
    case 'center':
      x = cx;
      y = cy;
      textAlign = 'center';
      textBaseline = 'middle';
      break;
    default: {
      const _exhaustive: never = position;
      void _exhaustive;
      break;
    }
  }

  ctx.save();
  try {
    ctx.fillStyle = fill;
    ctx.font = buildFont(fontSize, fontFamily, fontWeight);
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    if (angle !== 0) {
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.fillText(value, 0, 0);
    } else {
      ctx.fillText(value, x, y);
    }
  } finally {
    ctx.restore();
  }
}
