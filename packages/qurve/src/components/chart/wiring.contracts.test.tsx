import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as core from '@qurve/core';
import { Chart } from './chartContext';
import { FunnelChart } from './FunnelChart';
import { RadialBarChart } from './RadialBarChart';
import { SankeyChart } from './SankeyChart';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';
import { RadialBar } from '../polar/RadialBar';
import { Area } from '../series/Area';
import { Funnel } from '../series/Funnel';
import { Line } from '../series/Line';
import { Sankey } from '../series/Sankey';
import { Tooltip } from '../Tooltip';
import { ticks } from '@qurve/core';

vi.mock('@qurve/core', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@qurve/core')>();
  return {
    ...mod,
    drawLinePath: vi.fn((...args: Parameters<typeof mod.drawLinePath>) =>
      mod.drawLinePath(...args),
    ),
    drawArea: vi.fn((...args: Parameters<typeof mod.drawArea>) => mod.drawArea(...args)),
    niceDomain: vi.fn((...args: Parameters<typeof mod.niceDomain>) =>
      mod.niceDomain(...args),
    ),
    drawYAxis: vi.fn((...args: Parameters<typeof mod.drawYAxis>) => mod.drawYAxis(...args)),
    findFunnelIndex: vi.fn((...args: Parameters<typeof mod.findFunnelIndex>) =>
      mod.findFunnelIndex(...args),
    ),
    findSankeyIndex: vi.fn((...args: Parameters<typeof mod.findSankeyIndex>) =>
      mod.findSankeyIndex(...args),
    ),
    findRadialBarIndex: vi.fn((...args: Parameters<typeof mod.findRadialBarIndex>) =>
      mod.findRadialBarIndex(...args),
    ),
  };
});

async function flushRender() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

function hoverCanvas(
  canvas: Element,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
) {
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
  fireEvent.mouseMove(canvas, { clientX, clientY });
}

describe('React wiring — curve type → core draw', () => {
  beforeEach(() => {
    vi.mocked(core.drawLinePath).mockClear();
    vi.mocked(core.drawArea).mockClear();
  });

  it('Line forwards type and connectNulls to drawLinePath', async () => {
    render(
      <Chart
        data={[{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: null }, { x: 3, y: 4 }]}
        width={280}
        height={160}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" type="monotone" connectNulls stroke="#111" />
      </Chart>,
    );
    await flushRender();
    expect(core.drawLinePath).toHaveBeenCalled();
    const call = vi
      .mocked(core.drawLinePath)
      .mock.calls.find((c) => c[0].type === 'monotone');
    expect(call?.[0].type).toBe('monotone');
    expect(call?.[0].connectNulls).toBe(true);
  });

  it('Area forwards type to drawArea', async () => {
    render(
      <Chart data={[{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="y" type="stepAfter" stroke="#111" fill="#ccc" />
      </Chart>,
    );
    await flushRender();
    expect(core.drawArea).toHaveBeenCalled();
    expect(vi.mocked(core.drawArea).mock.calls.some((c) => c[0].type === 'stepAfter')).toBe(
      true,
    );
  });
});

describe('React wiring — axis labels use nice ticks', () => {
  beforeEach(() => {
    vi.mocked(core.niceDomain).mockClear();
    vi.mocked(core.drawYAxis).mockClear();
  });

  it('auto Y domain goes through niceDomain before drawYAxis', async () => {
    const data = [
      { x: 0, y: 12 },
      { x: 1, y: 87 },
      { x: 2, y: 45 },
    ];
    render(
      <Chart
        data={data}
        width={320}
        height={200}
        margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
      >
        <XAxis dataKey="x" />
        <YAxis dataKey="y" tickCount={5} />
        <Line dataKey="y" dot={false} />
      </Chart>,
    );
    await flushRender();

    expect(core.niceDomain).toHaveBeenCalled();
    expect(core.drawYAxis).toHaveBeenCalled();

    const yDomains = vi
      .mocked(core.drawYAxis)
      .mock.calls.map((c) => c[0].domain as [number, number]);
    const covering = yDomains.find((d) => d[0] <= 12 && d[1] >= 87);
    expect(covering).toBeDefined();

    const niceResults = vi
      .mocked(core.niceDomain)
      .mock.results.map((r) => r.value as [number, number]);
    expect(niceResults).toContainEqual(covering);

    const lastDraw = vi.mocked(core.drawYAxis).mock.calls.find(
      (c) => c[0].domain?.[0] === covering![0] && c[0].domain?.[1] === covering![1],
    )?.[0];
    expect(lastDraw?.tickValues).toBeUndefined();
    expect(lastDraw?.tickCount).toBe(5);
    expect(ticks(covering![0], covering![1], Math.max(2, 5)).length).toBeGreaterThanOrEqual(2);
  });
});

describe('React wiring — hit-test → tooltip payload', () => {
  beforeEach(() => {
    vi.mocked(core.findFunnelIndex).mockClear();
    vi.mocked(core.findSankeyIndex).mockClear();
    vi.mocked(core.findRadialBarIndex).mockClear();
  });

  it('Funnel hover resolves stage name via findFunnelIndex path', async () => {
    const data = [
      { value: 100, name: 'Impression' },
      { value: 60, name: 'Click' },
      { value: 30, name: 'Order' },
    ];
    const { container } = render(
      <FunnelChart data={data} width={400} height={300}>
        <Funnel dataKey="value" nameKey="name" />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <div data-testid="funnel-tip">{String(payload[0].name)}</div>
            ) : null
          }
        />
      </FunnelChart>,
    );
    await flushRender();
    const canvas =
      container.querySelector('[data-testid="chart-event-canvas"]') ??
      container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas!, 200, 40, 400, 300);
    await flushRender();

    expect(core.findFunnelIndex).toHaveBeenCalled();
    expect(await screen.findByTestId('funnel-tip')).toHaveTextContent('Impression');
  });

  it('Sankey node hover resolves node name', async () => {
    const data = {
      nodes: [{ name: 'Visit' }, { name: 'Order' }],
      links: [{ source: 0, target: 1, value: 50 }],
    };
    const { container } = render(
      <SankeyChart data={data} width={400} height={240}>
        <Sankey />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <div data-testid="sankey-tip">{String(payload[0].name)}</div>
            ) : null
          }
        />
      </SankeyChart>,
    );
    await flushRender();
    const canvas =
      container.querySelector('[data-testid="chart-event-canvas"]') ??
      container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas!, 24, 120, 400, 240);
    await flushRender();

    expect(core.findSankeyIndex).toHaveBeenCalled();
    expect(await screen.findByTestId('sankey-tip')).toHaveTextContent('Visit');
  });

  it('RadialBar hover resolves sector via findRadialBarIndex', async () => {
    const data = [
      { name: 'A', uv: 100 },
      { name: 'B', uv: 100 },
    ];
    const { container } = render(
      <RadialBarChart data={data} width={300} height={300}>
        <RadialBar
          dataKey="uv"
          nameKey="name"
          innerRadius={20}
          outerRadius={120}
          startAngle={0}
          endAngle={360}
        />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <div data-testid="radial-tip">{String(payload[0].name)}</div>
            ) : null
          }
        />
      </RadialBarChart>,
    );
    await flushRender();
    const canvas =
      container.querySelector('[data-testid="chart-event-canvas"]') ??
      container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas!, 150 + 90, 150, 300, 300);
    await flushRender();

    expect(core.findRadialBarIndex).toHaveBeenCalled();
    expect(await screen.findByTestId('radial-tip')).toBeInTheDocument();
  });
});
