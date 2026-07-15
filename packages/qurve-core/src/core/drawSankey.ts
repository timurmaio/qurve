import type { CellOverride } from './drawBar';

export interface SankeyNodeInput {
  name?: string;
  [key: string]: unknown;
}

export interface SankeyLinkInput {
  source: number;
  target: number;
  value: number;
}

export interface SankeyNodeLayout {
  index: number;
  name: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  stroke?: string;
  strokeWidth: number;
  column: number;
}

export interface SankeyLinkLayout {
  index: number;
  source: number;
  target: number;
  value: number;
  /** Source attachment y (top of ribbon at source). */
  y0: number;
  /** Target attachment y (top of ribbon at target). */
  y1: number;
  thickness: number;
  color: string;
  x0: number;
  x1: number;
}

export interface SankeyData {
  nodes: SankeyNodeInput[];
  links: SankeyLinkInput[];
}

function nodeName(node: SankeyNodeInput, index: number): string {
  return typeof node.name === 'string' && node.name.length > 0
    ? node.name
    : `Node ${index}`;
}

/**
 * Assigns each node a column depth via longest-path from sources.
 */
function computeColumns(
  nodeCount: number,
  links: SankeyLinkInput[],
): number[] {
  const columns = new Array<number>(nodeCount).fill(0);
  const out = Array.from({ length: nodeCount }, () => [] as number[]);
  for (const link of links) {
    if (
      link.source >= 0 &&
      link.source < nodeCount &&
      link.target >= 0 &&
      link.target < nodeCount &&
      link.source !== link.target
    ) {
      out[link.source].push(link.target);
    }
  }

  // Relax longest-path for a few iterations (DAG expected).
  for (let pass = 0; pass < nodeCount; pass++) {
    let changed = false;
    for (let s = 0; s < nodeCount; s++) {
      for (const t of out[s]) {
        const next = columns[s] + 1;
        if (next > columns[t]) {
          columns[t] = next;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  return columns;
}

export function layoutSankey(params: {
  data: SankeyData;
  colors: string[];
  cellOverrides?: CellOverride[];
  plotX: number;
  plotY: number;
  plotWidth: number;
  plotHeight: number;
  nodeWidth?: number;
  nodePadding?: number;
  linkOpacity?: number;
  nodeStroke?: string;
  nodeStrokeWidth?: number;
}): { nodes: SankeyNodeLayout[]; links: SankeyLinkLayout[] } {
  const {
    data,
    colors,
    cellOverrides,
    plotX,
    plotY,
    plotWidth,
    plotHeight,
    nodeWidth = 14,
    nodePadding = 12,
    nodeStroke,
    nodeStrokeWidth = 0,
  } = params;

  const { nodes: inputNodes, links: inputLinks } = data;
  const n = inputNodes.length;
  if (n === 0 || plotWidth <= 0 || plotHeight <= 0) {
    return { nodes: [], links: [] };
  }

  const validLinks = inputLinks.filter(
    (link) =>
      link.value > 0 &&
      link.source >= 0 &&
      link.target >= 0 &&
      link.source < n &&
      link.target < n &&
      link.source !== link.target,
  );

  const inflow = new Array<number>(n).fill(0);
  const outflow = new Array<number>(n).fill(0);
  for (const link of validLinks) {
    outflow[link.source] += link.value;
    inflow[link.target] += link.value;
  }

  const values = inputNodes.map((_, i) => Math.max(inflow[i], outflow[i], 0));
  const columns = computeColumns(n, validLinks);
  const maxColumn = Math.max(0, ...columns);

  const byColumn = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const col = columns[i];
    const list = byColumn.get(col);
    if (list) list.push(i);
    else byColumn.set(col, [i]);
  }

  const xForColumn = (col: number) => {
    if (maxColumn === 0) return plotX + (plotWidth - nodeWidth) / 2;
    return plotX + (col / maxColumn) * (plotWidth - nodeWidth);
  };

  const nodeLayouts: SankeyNodeLayout[] = new Array(n);
  const nodeY = new Array<number>(n).fill(0);
  const nodeH = new Array<number>(n).fill(0);

  for (const [col, indices] of byColumn) {
    const colValue = indices.reduce((sum, i) => sum + values[i], 0);
    const gaps = Math.max(0, indices.length - 1) * nodePadding;
    const available = Math.max(0, plotHeight - gaps);
    const scale = colValue > 0 ? available / colValue : 0;
    let y = plotY;
    for (const i of indices) {
      const height = Math.max(values[i] * scale, values[i] > 0 ? 2 : 0);
      const cell = cellOverrides?.[i];
      nodeY[i] = y;
      nodeH[i] = height;
      nodeLayouts[i] = {
        index: i,
        name: nodeName(inputNodes[i], i),
        value: values[i],
        x: xForColumn(col),
        y,
        width: nodeWidth,
        height,
        color: cell?.fill ?? colors[i % colors.length],
        stroke: cell?.stroke ?? nodeStroke,
        strokeWidth: cell?.strokeWidth ?? nodeStrokeWidth,
        column: col,
      };
      y += height + nodePadding;
    }
  }

  // Fill any isolated nodes not laid out (shouldn't happen)
  for (let i = 0; i < n; i++) {
    if (!nodeLayouts[i]) {
      nodeLayouts[i] = {
        index: i,
        name: nodeName(inputNodes[i], i),
        value: values[i],
        x: plotX,
        y: plotY,
        width: nodeWidth,
        height: 0,
        color: colors[i % colors.length],
        stroke: nodeStroke,
        strokeWidth: nodeStrokeWidth,
        column: 0,
      };
    }
  }

  // Stack link offsets along each node side
  const sourceOffset = new Array<number>(n).fill(0);
  const targetOffset = new Array<number>(n).fill(0);

  // Sort links by target then source for stable stacking
  const sortedLinks = validLinks
    .map((link, index) => ({ link, index }))
    .toSorted((a, b) => {
      if (a.link.source !== b.link.source) return a.link.source - b.link.source;
      return a.link.target - b.link.target;
    });

  const linkLayouts: SankeyLinkLayout[] = [];
  for (const { link, index } of sortedLinks) {
    const source = nodeLayouts[link.source];
    const target = nodeLayouts[link.target];
    const sourceScale = source.value > 0 ? source.height / source.value : 0;
    const targetScale = target.value > 0 ? target.height / target.value : 0;
    const thickness = Math.max(
      link.value * Math.min(sourceScale, targetScale),
      1,
    );

    const y0 = source.y + sourceOffset[link.source];
    const y1 = target.y + targetOffset[link.target];
    sourceOffset[link.source] += link.value * sourceScale;
    targetOffset[link.target] += link.value * targetScale;

    linkLayouts.push({
      index,
      source: link.source,
      target: link.target,
      value: link.value,
      y0,
      y1,
      thickness,
      color: source.color,
      x0: source.x + source.width,
      x1: target.x,
    });
  }

  return { nodes: nodeLayouts, links: linkLayouts };
}

function drawLinkRibbon(
  ctx: CanvasRenderingContext2D,
  link: SankeyLinkLayout,
): void {
  const { x0, x1, y0, y1, thickness } = link;
  const midX = (x0 + x1) / 2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.bezierCurveTo(midX, y0, midX, y1, x1, y1);
  ctx.lineTo(x1, y1 + thickness);
  ctx.bezierCurveTo(midX, y1 + thickness, midX, y0 + thickness, x0, y0 + thickness);
  ctx.closePath();
  ctx.fill();
}

export function drawSankey(params: {
  ctx: CanvasRenderingContext2D;
  nodes: SankeyNodeLayout[];
  links: SankeyLinkLayout[];
  hoveredIndex: number | null;
  hoverOpacity: number;
  linkOpacity?: number;
}): void {
  const {
    ctx,
    nodes,
    links,
    hoveredIndex,
    hoverOpacity,
    linkOpacity = 0.35,
  } = params;

  ctx.save();

  for (const link of links) {
    const related =
      hoveredIndex == null ||
      hoveredIndex === link.source ||
      hoveredIndex === link.target;
    ctx.globalAlpha = related ? linkOpacity : linkOpacity * hoverOpacity;
    ctx.fillStyle = link.color;
    drawLinkRibbon(ctx, link);
  }

  for (const node of nodes) {
    if (node.height <= 0) continue;
    ctx.globalAlpha =
      hoveredIndex == null || hoveredIndex === node.index ? 1 : hoverOpacity;
    ctx.fillStyle = node.color;
    ctx.fillRect(node.x, node.y, node.width, node.height);
    if (node.strokeWidth > 0 && node.stroke) {
      ctx.strokeStyle = node.stroke;
      ctx.lineWidth = node.strokeWidth;
      ctx.strokeRect(node.x, node.y, node.width, node.height);
    }
  }

  ctx.restore();
}

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function pointInLinkRibbon(link: SankeyLinkLayout, mouseX: number, mouseY: number): boolean {
  const { x0, x1, y0, y1, thickness } = link;
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  if (mouseX < minX || mouseX > maxX || thickness <= 0) return false;

  const midX = (x0 + x1) / 2;
  // Binary-search t so that bezier X(t) ≈ mouseX (controls: midX,midX).
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const x = cubicBezier(mid, x0, midX, midX, x1);
    if (x < mouseX) lo = mid;
    else hi = mid;
  }
  const t = (lo + hi) / 2;
  const top = cubicBezier(t, y0, y0, y1, y1);
  const bot = cubicBezier(t, y0 + thickness, y0 + thickness, y1 + thickness, y1 + thickness);
  const yMin = Math.min(top, bot);
  const yMax = Math.max(top, bot);
  return mouseY >= yMin && mouseY <= yMax;
}

/**
 * Hit-test nodes first, then link ribbons.
 * Link hits resolve to the source node index (highlights the related flow).
 */
export function findSankeyIndex(
  nodes: SankeyNodeLayout[],
  mouseX: number,
  mouseY: number,
  links: SankeyLinkLayout[] = [],
): number | null {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (
      mouseX >= node.x &&
      mouseX <= node.x + node.width &&
      mouseY >= node.y &&
      mouseY <= node.y + node.height
    ) {
      return node.index;
    }
  }

  for (let i = links.length - 1; i >= 0; i--) {
    if (pointInLinkRibbon(links[i], mouseX, mouseY)) {
      return links[i].source;
    }
  }
  return null;
}
