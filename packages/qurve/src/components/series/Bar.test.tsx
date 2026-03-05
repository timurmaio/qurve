import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';
import { Bar } from './Bar';
import { Cell } from './Cell';
import { Tooltip } from '../Tooltip';
import { Legend } from '../Legend';

function hoverCanvas(canvas: HTMLCanvasElement, clientX = 100, clientY = 50) {
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      right: 280,
      bottom: 160,
      width: 280,
      height: 160,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });

  fireEvent.mouseMove(canvas, { clientX, clientY });
}

describe('Bar', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Bar dataKey="y" />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('renders with default props', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <Bar dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom fill color', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Bar dataKey="y" fill="#ff0000" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom stroke', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Bar dataKey="y" stroke="#000" strokeWidth={2} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with Cell children for per-bar styling', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="y">
          <Cell fill="#f00" />
          <Cell fill="#0f0" />
          <Cell fill="#00f" />
        </Bar>
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders grouped bars (multiple Bar without stackId)', () => {
    const { container } = render(
      <Chart data={[{ x: 1, a: 10, b: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="a" />
        <Bar dataKey="b" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders stacked bars (same stackId)', () => {
    const { container } = render(
      <Chart data={[{ x: 1, a: 10, b: 5 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="a" stackId="stack" />
        <Bar dataKey="b" stackId="stack" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom barSize', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Bar dataKey="y" barSize={40} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom maxBarSize', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <Bar dataKey="y" maxBarSize={20} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom minPointSize', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 0.5 }, { x: 2, y: 10 }]} width={280} height={160}>
        <Bar dataKey="y" minPointSize={3} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with radius as number', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Bar dataKey="y" radius={4} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with radius as array', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Bar dataKey="y" radius={[4, 4, 0, 0]} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom hoverOpacity', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Bar dataKey="y" hoverOpacity={0.3} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('shows tooltip with correct value', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="y" name="Sales" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Sales:')).toBeInTheDocument();
    expect(screen.getByText('10.00')).toBeInTheDocument();
  });

  it('shows tooltip with custom tooltipName', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="y" tooltipName="Custom Sales" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Custom Sales:')).toBeInTheDocument();
  });

  it('shows tooltip with custom formatter', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="y" tooltipFormatter={(value) => `$${value}k`} />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('$10k')).toBeInTheDocument();
  });

  it('shows stacked values in tooltip', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, sales: 10, refunds: -3 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="sales" stackId="total" tooltipName="Sales" />
        <Bar dataKey="refunds" stackId="total" tooltipName="Refunds" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Sales:')).toBeInTheDocument();
    expect(screen.getByText('Refunds:')).toBeInTheDocument();
  });

  it('works with legend toggle', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="y" name="Revenue" />
        <Legend />
      </Chart>,
    );

    const legendButton = await screen.findByRole('button', { name: 'Revenue, visible' });
    expect(legendButton).toBeInTheDocument();

    fireEvent.click(legendButton);
    expect(legendButton).toHaveStyle({ color: 'rgb(136, 136, 136)' });
  });

  it('handles dataKey as function', () => {
    const { container } = render(
      <Chart data={[{ x: 1, value: 10 }]} width={280} height={160}>
        <Bar dataKey={(d) => (d as { value: number }).value * 2} name="Double" />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles empty data', () => {
    const { container } = render(
      <Chart data={[]} width={280} height={160}>
        <Bar dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles single data point', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Bar dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles negative values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: -10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="y" />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles floating point values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 3.14 }, { x: 2, y: 2.71 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="y" />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles zero values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 0 }, { x: 2, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
