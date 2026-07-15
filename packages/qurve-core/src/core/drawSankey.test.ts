import { describe, expect, it } from 'vitest';
import { createMockContext } from './mockCanvas';
import { drawSankey, findSankeyIndex, layoutSankey } from './drawSankey';

const SAMPLE = {
  nodes: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
  links: [
    { source: 0, target: 1, value: 50 },
    { source: 0, target: 2, value: 30 },
    { source: 1, target: 2, value: 20 },
  ],
};

describe('layoutSankey', () => {
  it('places nodes in columns and builds link ribbons', () => {
    const { nodes, links } = layoutSankey({
      data: SAMPLE,
      colors: ['#f00', '#0f0', '#00f'],
      plotX: 0,
      plotY: 0,
      plotWidth: 300,
      plotHeight: 200,
      nodeWidth: 12,
      nodePadding: 8,
    });

    expect(nodes).toHaveLength(3);
    expect(links).toHaveLength(3);
    expect(nodes[0].column).toBe(0);
    expect(nodes[2].column).toBeGreaterThan(nodes[0].column);
    expect(nodes[0].x).toBeLessThan(nodes[2].x);
    expect(links.every((l) => l.thickness > 0)).toBe(true);
    const fromA = links.filter((l) => l.source === 0).reduce((s, l) => s + l.value, 0);
    expect(fromA).toBe(80);
  });

  it('applies Cell overrides to nodes', () => {
    const { nodes } = layoutSankey({
      data: {
        nodes: [{ name: 'A' }, { name: 'B' }],
        links: [{ source: 0, target: 1, value: 10 }],
      },
      colors: ['#000', '#111'],
      cellOverrides: [{ fill: '#abc' }, { fill: '#def' }],
      plotX: 0,
      plotY: 0,
      plotWidth: 200,
      plotHeight: 100,
    });

    expect(nodes[0].color).toBe('#abc');
    expect(nodes[1].color).toBe('#def');
  });

  it('returns empty for empty nodes or zero plot', () => {
    expect(
      layoutSankey({
        data: { nodes: [], links: [] },
        colors: [],
        plotX: 0,
        plotY: 0,
        plotWidth: 100,
        plotHeight: 100,
      }),
    ).toEqual({ nodes: [], links: [] });

    expect(
      layoutSankey({
        data: SAMPLE,
        colors: ['#f00', '#0f0', '#00f'],
        plotX: 0,
        plotY: 0,
        plotWidth: 0,
        plotHeight: 100,
      }),
    ).toEqual({ nodes: [], links: [] });
  });

  it('ignores invalid and self links', () => {
    const { links } = layoutSankey({
      data: {
        nodes: [{ name: 'A' }, { name: 'B' }],
        links: [
          { source: 0, target: 0, value: 5 },
          { source: 0, target: 9, value: 5 },
          { source: 0, target: 1, value: 0 },
          { source: 0, target: 1, value: 8 },
        ],
      },
      colors: ['#f00', '#0f0'],
      plotX: 0,
      plotY: 0,
      plotWidth: 200,
      plotHeight: 100,
    });
    expect(links).toHaveLength(1);
    expect(links[0].value).toBe(8);
  });
});

describe('drawSankey', () => {
  it('draws links then nodes with optional strokes', () => {
    const ctx = createMockContext();
    const layout = layoutSankey({
      data: SAMPLE,
      colors: ['#f00', '#0f0', '#00f'],
      cellOverrides: [{ stroke: '#111', strokeWidth: 1 }],
      plotX: 0,
      plotY: 0,
      plotWidth: 300,
      plotHeight: 200,
      nodeStrokeWidth: 1,
      nodeStroke: '#222',
    });

    drawSankey({
      ctx,
      nodes: layout.nodes,
      links: layout.links,
      hoveredIndex: 0,
      hoverOpacity: 0.4,
      linkOpacity: 0.3,
    });

    expect(ctx.fill).toHaveBeenCalledTimes(3);
    expect(ctx.fillRect).toHaveBeenCalledTimes(3);
    expect(ctx.bezierCurveTo).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});

describe('findSankeyIndex', () => {
  it('hits node rectangles', () => {
    const { nodes } = layoutSankey({
      data: SAMPLE,
      colors: ['#f00', '#0f0', '#00f'],
      plotX: 0,
      plotY: 0,
      plotWidth: 300,
      plotHeight: 200,
    });

    const node = nodes[0];
    expect(findSankeyIndex(nodes, node.x + 1, node.y + 1)).toBe(0);
    expect(findSankeyIndex(nodes, -5, -5)).toBeNull();
  });
});
