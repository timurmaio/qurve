import { describe, expect, it, vi } from 'vitest';
import { drawSankey, findSankeyIndex, layoutSankey } from './drawSankey';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

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
});

describe('drawSankey', () => {
  it('draws links then nodes', () => {
    const ctx = createMockContext();
    const layout = layoutSankey({
      data: SAMPLE,
      colors: ['#f00', '#0f0', '#00f'],
      plotX: 0,
      plotY: 0,
      plotWidth: 300,
      plotHeight: 200,
    });

    drawSankey({
      ctx,
      nodes: layout.nodes,
      links: layout.links,
      hoveredIndex: null,
      hoverOpacity: 0.4,
    });

    expect(ctx.fill).toHaveBeenCalledTimes(3);
    expect(ctx.fillRect).toHaveBeenCalledTimes(3);
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
