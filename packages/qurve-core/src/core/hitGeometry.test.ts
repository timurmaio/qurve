import { describe, expect, it } from 'vitest';
import {
  buildRadialBarSectors,
  findRadialBarIndex,
} from './drawRadialBar';
import { buildFunnelTrapezoids, findFunnelIndex } from './drawFunnel';
import { findSankeyIndex, layoutSankey } from './drawSankey';
import { buildTreemapRects, findTreemapIndex } from './drawTreemap';

/** Point on a circle at canvas degrees (0 = east, CCW in math / CW on screen with y-down). */
function polarPoint(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
}

describe('findRadialBarIndex — angle × radius contract', () => {
  const cx = 100;
  const cy = 100;

  it('misses outside the ring band even when angle is valid', () => {
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }],
      values: [100],
      names: ['A'],
      colors: ['#f00'],
      cx,
      cy,
      innerRadius: 40,
      outerRadius: 80,
      startAngle: 0,
      endAngle: 360,
      maxValue: 100,
    });

    const tooInner = polarPoint(cx, cy, 20, 0);
    const tooOuter = polarPoint(cx, cy, 90, 0);
    const hit = polarPoint(cx, cy, 60, 45);
    expect(findRadialBarIndex(sectors, tooInner.x, tooInner.y)).toBeNull();
    expect(findRadialBarIndex(sectors, tooOuter.x, tooOuter.y)).toBeNull();
    expect(findRadialBarIndex(sectors, hit.x, hit.y)).toBe(0);
  });

  it('rejects angles outside a partial sweep (0→90)', () => {
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }],
      values: [100],
      names: ['A'],
      colors: ['#f00'],
      cx,
      cy,
      innerRadius: 10,
      outerRadius: 80,
      startAngle: 0,
      endAngle: 90,
      maxValue: 100,
    });
    const r = 45;
    for (const deg of [0, 45, 90]) {
      const p = polarPoint(cx, cy, r, deg);
      expect(findRadialBarIndex(sectors, p.x, p.y)).toBe(0);
    }
    for (const deg of [91, 180, -10, 270]) {
      const p = polarPoint(cx, cy, r, deg);
      expect(findRadialBarIndex(sectors, p.x, p.y)).toBeNull();
    }
  });

  it('scales hit arc with value ratio (half fill → half sweep)', () => {
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }],
      values: [50],
      names: ['A'],
      colors: ['#f00'],
      cx,
      cy,
      innerRadius: 10,
      outerRadius: 80,
      startAngle: 0,
      endAngle: 180,
      maxValue: 100,
    });
    // valueEnd = 90°
    expect(sectors[0].endAngle).toBe(90);
    const r = 45;
    expect(findRadialBarIndex(sectors, polarPoint(cx, cy, r, 45).x, polarPoint(cx, cy, r, 45).y)).toBe(0);
    expect(findRadialBarIndex(sectors, polarPoint(cx, cy, r, 90).x, polarPoint(cx, cy, r, 90).y)).toBe(0);
    expect(findRadialBarIndex(sectors, polarPoint(cx, cy, r, 120).x, polarPoint(cx, cy, r, 120).y)).toBeNull();
  });

  it('prefers the outermost ring when radii would otherwise overlap at boundaries', () => {
    const sectors = buildRadialBarSectors({
      data: [{ name: 'inner' }, { name: 'outer' }],
      values: [100, 100],
      names: ['inner', 'outer'],
      colors: ['#f00', '#0f0'],
      cx,
      cy,
      innerRadius: 0,
      outerRadius: 100,
      startAngle: 0,
      endAngle: 360,
      maxValue: 100,
      barSize: 40,
    });
    // Point in outer ring
    const outerMid = (sectors[1].innerRadius + sectors[1].outerRadius) / 2;
    expect(findRadialBarIndex(sectors, cx + outerMid, cy)).toBe(1);
    const innerMid = (sectors[0].innerRadius + sectors[0].outerRadius) / 2;
    expect(findRadialBarIndex(sectors, cx + innerMid, cy)).toBe(0);
  });

  it('returns null for empty sectors', () => {
    expect(findRadialBarIndex([], 0, 0)).toBeNull();
  });
});

describe('findFunnelIndex — point-in-trapezoid contract', () => {
  const traps = buildFunnelTrapezoids({
    data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
    values: [100, 60, 30],
    names: ['A', 'B', 'C'],
    colors: ['#f00', '#0f0', '#00f'],
    plotX: 0,
    plotY: 0,
    plotWidth: 200,
    plotHeight: 300,
  });

  function bandCenter(index: number) {
    const t = traps[index];
    return {
      x: t.x + t.topWidth / 2,
      y: t.y + t.height / 2,
    };
  }

  function widthAt(index: number, y: number) {
    const t = traps[index];
    const u = t.height > 0 ? (y - t.y) / t.height : 0;
    return t.topWidth + (t.bottomWidth - t.topWidth) * u;
  }

  it('hits the stage that owns the Y band and X within interpolated width', () => {
    for (let i = 0; i < traps.length; i++) {
      const c = bandCenter(i);
      expect(findFunnelIndex(traps, c.x, c.y)).toBe(i);
    }
  });

  it('misses just outside left/right edges at mid-band', () => {
    const i = 1;
    const y = traps[i].y + traps[i].height / 2;
    const half = widthAt(i, y) / 2;
    const cx = traps[i].x + traps[i].topWidth / 2;
    expect(findFunnelIndex(traps, cx, y)).toBe(i);
    expect(findFunnelIndex(traps, cx - half - 0.5, y)).toBeNull();
    expect(findFunnelIndex(traps, cx + half + 0.5, y)).toBeNull();
  });

  it('misses above first stage and below last stage', () => {
    const c0 = bandCenter(0);
    expect(findFunnelIndex(traps, c0.x, traps[0].y - 1)).toBeNull();
    const last = traps[traps.length - 1];
    expect(findFunnelIndex(traps, c0.x, last.y + last.height + 1)).toBeNull();
  });

  it('does not bleed into a neighbor stage via wrong Y', () => {
    // Point centered in stage 0 must not resolve to stage 1
    const c0 = bandCenter(0);
    expect(findFunnelIndex(traps, c0.x, c0.y)).toBe(0);
    const c1 = bandCenter(1);
    expect(findFunnelIndex(traps, c1.x, c1.y)).toBe(1);
  });

  it('lastShape=rectangle keeps bottom width = top width for the last stage', () => {
    const rectTraps = buildFunnelTrapezoids({
      data: [{ name: 'A' }, { name: 'B' }],
      values: [100, 40],
      names: ['A', 'B'],
      colors: ['#f00', '#0f0'],
      plotX: 0,
      plotY: 0,
      plotWidth: 200,
      plotHeight: 200,
      lastShape: 'rectangle',
    });
    const last = rectTraps[1];
    expect(last.bottomWidth).toBe(last.topWidth);
    const y = last.y + last.height * 0.9;
    const half = last.topWidth / 2;
    const cx = last.x + last.topWidth / 2;
    expect(findFunnelIndex(rectTraps, cx, y)).toBe(1);
    expect(findFunnelIndex(rectTraps, cx - half - 1, y)).toBeNull();
  });
});

describe('findSankeyIndex — nodes win, then ribbons', () => {
  const data = {
    nodes: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
    links: [
      { source: 0, target: 1, value: 40 },
      { source: 0, target: 2, value: 20 },
      { source: 1, target: 2, value: 30 },
    ],
  };

  const { nodes, links } = layoutSankey({
    data,
    colors: ['#f00', '#0f0', '#00f'],
    plotX: 0,
    plotY: 0,
    plotWidth: 400,
    plotHeight: 240,
    nodeWidth: 12,
  });

  it('hits every laid-out node interior and misses outside padding', () => {
    for (const node of nodes) {
      if (node.height <= 0) continue;
      expect(
        findSankeyIndex(nodes, node.x + node.width / 2, node.y + node.height / 2),
      ).toBe(node.index);
      expect(findSankeyIndex(nodes, node.x - 2, node.y + node.height / 2)).toBeNull();
    }
  });

  it('hits ribbon midline as source when the sample is not on a node', () => {
    const cubic = (t: number, p0: number, p1: number, p2: number, p3: number) => {
      const u = 1 - t;
      return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    };
    const pointInNode = (x: number, y: number) =>
      nodes.some(
        (n) =>
          x >= n.x &&
          x <= n.x + n.width &&
          y >= n.y &&
          y <= n.y + n.height,
      );

    let sampled = 0;
    for (const link of links) {
      const ctrlX = (link.x0 + link.x1) / 2;
      // Prefer mid-span; fall back if a multi-column ribbon crosses a middle node
      let hit: { x: number; y: number } | null = null;
      for (const t of [0.5, 0.35, 0.65, 0.25, 0.75]) {
        const x = cubic(t, link.x0, ctrlX, ctrlX, link.x1);
        const top = cubic(t, link.y0, link.y0, link.y1, link.y1);
        const y = top + link.thickness / 2;
        if (!pointInNode(x, y)) {
          hit = { x, y };
          break;
        }
      }
      expect(hit).not.toBeNull();
      expect(findSankeyIndex(nodes, hit!.x, hit!.y, links)).toBe(link.source);
      expect(
        findSankeyIndex(nodes, hit!.x, Math.min(link.y0, link.y1) - 30, links),
      ).toBeNull();
      sampled++;
    }
    expect(sampled).toBe(links.length);
  });

  it('A→C ribbon mid can land on middle-column node B (nodes win)', () => {
    const linkAC = links.find((l) => l.source === 0 && l.target === 2);
    expect(linkAC).toBeDefined();
    const midX = (linkAC!.x0 + linkAC!.x1) / 2;
    const nodeB = nodes.find((n) => n.index === 1)!;
    // Mid-X of A→C sits in B's column; if Y overlaps B, hit must be B not A
    if (midX >= nodeB.x && midX <= nodeB.x + nodeB.width) {
      const yOnB = nodeB.y + nodeB.height / 2;
      expect(findSankeyIndex(nodes, midX, yOnB, links)).toBe(1);
    }
  });

  it('prefers node over overlapping link geometry', () => {
    const node = nodes.find((n) => n.height > 0)!;
    // Even with links present, a click on the node rect is the node
    expect(
      findSankeyIndex(
        nodes,
        node.x + 1,
        node.y + Math.min(2, node.height / 2),
        links,
      ),
    ).toBe(node.index);
  });
});

describe('findTreemapIndex — topmost leaf wins', () => {
  const rects = buildTreemapRects({
    data: [
      { name: 'A', value: 60 },
      { name: 'B', value: 40 },
    ],
    colors: ['#f00', '#0f0'],
    plotX: 0,
    plotY: 0,
    plotWidth: 200,
    plotHeight: 100,
    padding: 0,
  });

  it('hits each leaf and misses outside the plot', () => {
    expect(rects.length).toBe(2);
    for (const r of rects) {
      expect(findTreemapIndex(rects, r.x + r.width / 2, r.y + r.height / 2)).toBe(r.index);
    }
    expect(findTreemapIndex(rects, -1, -1)).toBeNull();
    expect(findTreemapIndex(rects, 999, 999)).toBeNull();
  });
});
