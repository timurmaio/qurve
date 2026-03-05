import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from './chart/chartContext';
import { XAxis } from './cartesian/XAxis';
import { YAxis } from './cartesian/YAxis';
import { Line } from './series/Line';
import { Bar } from './series/Bar';
import { Tooltip } from './Tooltip';

function hoverCanvas(canvas: HTMLCanvasElement, clientX = 10, clientY = 10) {
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      right: 320,
      bottom: 160,
      width: 320,
      height: 160,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });

  fireEvent.mouseMove(canvas, { clientX, clientY });
}

describe('Tooltip', () => {
  it('uses global formatter when series formatter is absent', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }, { x: 1, y: 20 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Tooltip formatter={(value) => `global:${String(value)}`} />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 300, 20);

    expect(await screen.findByText('global:20')).toBeInTheDocument();
  });

  it('prefers series formatter over global formatter', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 15 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar
          dataKey="y"
          tooltipName="Orders"
          tooltipFormatter={(value) => `series:${String(value)}`}
        />
        <Tooltip formatter={(value) => `global:${String(value)}`} />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 20, 20);

    expect(await screen.findByText('series:15')).toBeInTheDocument();
    expect(screen.queryByText('global:15')).toBeNull();
  });

  it('formats time labels with Intl when x axis is time', async () => {
    const { container } = render(
      <Chart
        data={[
          { ts: new Date('2024-01-01T10:00:00.000Z').getTime(), y: 10 },
          { ts: new Date('2024-01-02T10:00:00.000Z').getTime(), y: 20 },
        ]}
        width={320}
        height={160}
      >
        <XAxis dataKey="ts" type="time" locale="en-US" timeZone="UTC" timeFormat="date" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 300, 20);

    const expected = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(
      new Date('2024-01-02T10:00:00.000Z').getTime(),
    );
    expect(await screen.findByText(expected)).toBeInTheDocument();
  });

  it('supports sticky mode lock and unlock', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }, { x: 1, y: 20 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Tooltip sticky />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();

    hoverCanvas(canvas as HTMLCanvasElement, 20, 20);
    expect(await screen.findByText('10.00')).toBeInTheDocument();

    fireEvent.click(canvas as HTMLCanvasElement, { clientX: 20, clientY: 20 });
    hoverCanvas(canvas as HTMLCanvasElement, 300, 20);
    expect(screen.queryByText('20.00')).toBeNull();
    expect(screen.getByText('10.00')).toBeInTheDocument();

    fireEvent.click(canvas as HTMLCanvasElement, { clientX: 300, clientY: 20 });
    hoverCanvas(canvas as HTMLCanvasElement, 300, 20);
    expect(await screen.findByText('20.00')).toBeInTheDocument();
  });

  it('updates screen-reader live region text', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }, { x: 1, y: 20 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Tooltip ariaLive="assertive" />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 300, 20);

    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });

    const status = await screen.findByRole('status');
    expect(status).toHaveAttribute('aria-live', 'assertive');
    expect(status.textContent).toContain('Label: 1');
    expect(status.textContent).toContain('Revenue: 20.00');
  });

  it('can hide screen-reader live region', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Tooltip hideA11yRegion />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 20, 20);

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('can include and customize accessibility summary', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, a: 10, b: 5 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="a" name="A" />
        <Line dataKey="b" name="B" />
        <Tooltip
          a11yIncludeSummary
          a11ySummaryFormatter={(payload) => `Sum=${payload.reduce((sum, item) => sum + (item.value ?? 0), 0).toFixed(0)}`}
        />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 20, 20);

    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });

    const status = await screen.findByRole('status');
    expect(status.textContent).toContain('A: 10.00');
    expect(status.textContent).toContain('B: 5.00');
    expect(status.textContent).toContain('Sum=15');
  });

  it('applies wrapperClassName, contentClassName, contentStyle, itemStyle', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }, { x: 1, y: 20 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Tooltip
          wrapperClassName="custom-tooltip-wrapper"
          contentClassName="custom-tooltip-content"
          contentStyle={{ backgroundColor: 'rgb(240, 240, 240)' }}
          itemStyle={{ marginTop: '4px' }}
        />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement, 300, 20);

    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });

    const wrapper = container.querySelector('.custom-tooltip-wrapper');
    expect(wrapper).toBeInTheDocument();

    const content = container.querySelector('.custom-tooltip-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveStyle({ backgroundColor: 'rgb(240, 240, 240)' });

    const valueSpan = screen.getByText('20.00');
    const itemDiv = valueSpan.closest('div');
    expect(itemDiv).toHaveStyle({ marginTop: '4px' });
  });

  it('accepts cursor false to hide crosshair', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }, { x: 1, y: 20 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <Tooltip cursor={false} />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    hoverCanvas(canvas as HTMLCanvasElement, 300, 20);

    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });

    expect(screen.getByText('20.00')).toBeInTheDocument();
  });

  it('accepts custom cursor styling', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }]} width={320} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <Tooltip cursor={{ stroke: '#f00', strokeWidth: 2, strokeDasharray: '2 2' }} />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    hoverCanvas(canvas as HTMLCanvasElement, 20, 20);

    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });

    expect(screen.getByText('10.00')).toBeInTheDocument();
  });
});
