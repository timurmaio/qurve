import type { CellOverride } from './drawBar';

export interface TreemapInputNode {
  name?: string;
  children?: TreemapInputNode[];
  [key: string]: unknown;
}

export interface TreemapRect {
  /** Leaf order index (DFS) for Cell / tooltip. */
  index: number;
  name: string;
  value: number;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  stroke?: string;
  strokeWidth: number;
}

interface SquarifyItem {
  value: number;
  node: TreemapInputNode;
  name: string;
}

function readNumeric(node: TreemapInputNode, dataKey: string): number {
  const raw = node[dataKey];
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, raw);
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  return 0;
}

/** Value of a node: explicit dataKey, else sum of children. */
export function resolveTreemapValue(node: TreemapInputNode, dataKey: string): number {
  const children = node.children;
  if (children && children.length > 0) {
    let sum = 0;
    for (const child of children) sum += resolveTreemapValue(child, dataKey);
    return sum;
  }
  return readNumeric(node, dataKey);
}

function worstAspect(row: SquarifyItem[], length: number): number {
  if (row.length === 0 || length <= 0) return Infinity;
  let sum = 0;
  let min = Infinity;
  let max = 0;
  for (const item of row) {
    sum += item.value;
    if (item.value < min) min = item.value;
    if (item.value > max) max = item.value;
  }
  if (sum <= 0) return Infinity;
  const s2 = sum * sum;
  const l2 = length * length;
  return Math.max((l2 * max) / s2, s2 / (l2 * min));
}

function layoutRow(
  row: SquarifyItem[],
  x: number,
  y: number,
  w: number,
  h: number,
  horizontal: boolean,
  layoutChild: (item: SquarifyItem, rect: { x: number; y: number; width: number; height: number }) => void,
): void {
  const sum = row.reduce((acc, item) => acc + item.value, 0);
  if (sum <= 0) return;

  if (horizontal) {
    let cursorX = x;
    for (const item of row) {
      const width = (item.value / sum) * w;
      layoutChild(item, { x: cursorX, y, width, height: h });
      cursorX += width;
    }
  } else {
    let cursorY = y;
    for (const item of row) {
      const height = (item.value / sum) * h;
      layoutChild(item, { x, y: cursorY, width: w, height });
      cursorY += height;
    }
  }
}

/**
 * Squarified treemap layout (Bruls / squarify).
 * Lays out `items` into the given rectangle, calling `layoutChild` per item.
 */
export function squarify(
  items: SquarifyItem[],
  x: number,
  y: number,
  width: number,
  height: number,
  layoutChild: (item: SquarifyItem, rect: { x: number; y: number; width: number; height: number }) => void,
): void {
  const remaining = items
    .filter((item) => item.value > 0)
    .slice()
    .sort((a, b) => b.value - a.value);

  let cx = x;
  let cy = y;
  let cw = width;
  let ch = height;

  while (remaining.length > 0) {
    if (cw <= 0 || ch <= 0) break;

    const horizontal = cw >= ch;
    const length = horizontal ? ch : cw;
    const row: SquarifyItem[] = [];

    while (remaining.length > 0) {
      const next = remaining[0];
      const withNext = [...row, next];
      if (row.length === 0 || worstAspect(withNext, length) <= worstAspect(row, length)) {
        row.push(remaining.shift()!);
      } else {
        break;
      }
    }

    const rowSum = row.reduce((acc, item) => acc + item.value, 0);
    const totalRemaining =
      rowSum + remaining.reduce((acc, item) => acc + item.value, 0);
    if (totalRemaining <= 0) break;

    if (horizontal) {
      const rowWidth = (rowSum / totalRemaining) * cw;
      layoutRow(row, cx, cy, rowWidth, ch, true, layoutChild);
      cx += rowWidth;
      cw -= rowWidth;
    } else {
      const rowHeight = (rowSum / totalRemaining) * ch;
      layoutRow(row, cx, cy, cw, rowHeight, false, layoutChild);
      cy += rowHeight;
      ch -= rowHeight;
    }
  }
}

export function buildTreemapRects(params: {
  data: TreemapInputNode[];
  dataKey?: string;
  nameKey?: string;
  colors: string[];
  cellOverrides?: CellOverride[];
  plotX: number;
  plotY: number;
  plotWidth: number;
  plotHeight: number;
  stroke?: string;
  strokeWidth?: number;
  /** Internal padding between sibling cells (px). */
  padding?: number;
}): TreemapRect[] {
  const {
    data,
    dataKey = 'value',
    nameKey = 'name',
    colors,
    cellOverrides,
    plotX,
    plotY,
    plotWidth,
    plotHeight,
    stroke = '#fff',
    strokeWidth = 1,
    padding = 1,
  } = params;

  if (data.length === 0 || plotWidth <= 0 || plotHeight <= 0) return [];

  const rects: TreemapRect[] = [];
  let leafIndex = 0;

  const layoutNodes = (
    nodes: TreemapInputNode[],
    x: number,
    y: number,
    w: number,
    h: number,
    depth: number,
  ) => {
    if (nodes.length === 0 || w <= 0 || h <= 0) return;

    const items: SquarifyItem[] = nodes.map((node, i) => {
      const rawName = node[nameKey];
      const name =
        typeof rawName === 'string' && rawName.length > 0
          ? rawName
          : typeof node.name === 'string' && node.name.length > 0
            ? node.name
            : `Item ${i + 1}`;
      return {
        node,
        name,
        value: resolveTreemapValue(node, dataKey),
      };
    });

    squarify(items, x, y, w, h, (item, rect) => {
      const children = item.node.children;
      const pad = padding;
      const ix = rect.x + pad / 2;
      const iy = rect.y + pad / 2;
      const iw = Math.max(0, rect.width - pad);
      const ih = Math.max(0, rect.height - pad);

      if (children && children.length > 0) {
        layoutNodes(children, ix, iy, iw, ih, depth + 1);
        return;
      }

      const cell = cellOverrides?.[leafIndex];
      rects.push({
        index: leafIndex,
        name: item.name,
        value: item.value,
        depth,
        x: ix,
        y: iy,
        width: iw,
        height: ih,
        color: cell?.fill ?? colors[leafIndex % colors.length],
        stroke: cell?.stroke ?? stroke,
        strokeWidth: cell?.strokeWidth ?? strokeWidth,
      });
      leafIndex += 1;
    });
  };

  layoutNodes(data, plotX, plotY, plotWidth, plotHeight, 0);
  return rects;
}

export function drawTreemap(params: {
  ctx: CanvasRenderingContext2D;
  rects: TreemapRect[];
  hoveredIndex: number | null;
  hoverOpacity: number;
}): void {
  const { ctx, rects, hoveredIndex, hoverOpacity } = params;
  ctx.save();
  for (const rect of rects) {
    if (rect.width <= 0 || rect.height <= 0) continue;
    ctx.globalAlpha =
      hoveredIndex == null || hoveredIndex === rect.index ? 1 : hoverOpacity;
    ctx.fillStyle = rect.color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    if (rect.strokeWidth > 0 && rect.stroke) {
      ctx.strokeStyle = rect.stroke;
      ctx.lineWidth = rect.strokeWidth;
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }
  ctx.restore();
}

export function findTreemapIndex(
  rects: TreemapRect[],
  mouseX: number,
  mouseY: number,
): number | null {
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (
      mouseX >= r.x &&
      mouseX <= r.x + r.width &&
      mouseY >= r.y &&
      mouseY <= r.y + r.height
    ) {
      return r.index;
    }
  }
  return null;
}
