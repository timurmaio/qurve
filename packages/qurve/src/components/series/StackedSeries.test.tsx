import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';
import { Tooltip } from '../Tooltip';
import { Legend } from '../Legend';
import { Bar } from './Bar';
import { Area } from './Area';

function hoverCanvas(canvas: HTMLCanvasElement, clientX = 10, clientY = 10) {
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

describe('stacked series tooltip payload', () => {
  it('shows values from stacked bars in tooltip', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, a: 10, b: 5 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="a" stackId="total" tooltipName="A" />
        <Bar dataKey="b" stackId="total" tooltipName="B" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('A:')).toBeInTheDocument();
    expect(await screen.findByText('B:')).toBeInTheDocument();
    expect(screen.getByText('10.00')).toBeInTheDocument();
    expect(screen.getByText('5.00')).toBeInTheDocument();
  });

  it('shows values from stacked areas in tooltip', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, first: 7, second: 3 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="first" stackId="total" tooltipName="First" />
        <Area dataKey="second" stackId="total" tooltipName="Second" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('First:')).toBeInTheDocument();
    expect(await screen.findByText('Second:')).toBeInTheDocument();
    expect(screen.getByText('7.00')).toBeInTheDocument();
    expect(screen.getByText('3.00')).toBeInTheDocument();
  });

  it('supports legend toggle for stacked series', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, a: 10, b: 5 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="a" stackId="total" tooltipName="A" />
        <Bar dataKey="b" stackId="total" tooltipName="B" />
        <Legend />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    const legendButtonA = await screen.findByRole('button', { name: 'A, visible' });
    const legendButtonB = await screen.findByRole('button', { name: 'B, visible' });

    fireEvent.click(legendButtonA);
    expect(legendButtonA).toHaveStyle({ color: 'rgb(136, 136, 136)' });

    fireEvent.click(legendButtonA);
    expect(legendButtonA).toHaveStyle({ color: 'rgb(34, 34, 34)' });

    fireEvent.click(legendButtonB);
    expect(legendButtonB).toHaveStyle({ color: 'rgb(136, 136, 136)' });
  });

  it('handles multiple stack groups independently', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, a: 10, b: 5, c: 3, d: 7 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="a" stackId="stack1" tooltipName="A" />
        <Bar dataKey="b" stackId="stack1" tooltipName="B" />
        <Bar dataKey="c" stackId="stack2" tooltipName="C" />
        <Bar dataKey="d" stackId="stack2" tooltipName="D" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('A:')).toBeInTheDocument();
    expect(await screen.findByText('B:')).toBeInTheDocument();
    expect(await screen.findByText('C:')).toBeInTheDocument();
    expect(await screen.findByText('D:')).toBeInTheDocument();
  });

  it('handles mixed stacked and non-stacked series', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, stacked: 10, regular: 5 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="stacked" stackId="stack" tooltipName="Stacked" />
        <Bar dataKey="regular" tooltipName="Regular" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Stacked:')).toBeInTheDocument();
    expect(await screen.findByText('Regular:')).toBeInTheDocument();
  });

  it('handles stacked series with negative values', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, a: -10, b: 5 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="a" stackId="total" tooltipName="A" />
        <Bar dataKey="b" stackId="total" tooltipName="B" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('A:')).toBeInTheDocument();
    expect(await screen.findByText('B:')).toBeInTheDocument();
  });

  it('renders stacked areas with fill opacity', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, a: 10, b: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="a" stackId="total" tooltipName="A" fillOpacity={0.3} />
        <Area dataKey="b" stackId="total" tooltipName="B" fillOpacity={0.5} />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('A:')).toBeInTheDocument();
    expect(await screen.findByText('B:')).toBeInTheDocument();
  });

  it('handles stacked bars with custom colors', async () => {
    const { container } = render(
      <Chart data={[{ x: 0, a: 10, b: 5 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="a" stackId="total" tooltipName="A" fill="#ff0000" />
        <Bar dataKey="b" stackId="total" tooltipName="B" fill="#00ff00" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('[data-testid="chart-event-canvas"]') ?? container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('A:')).toBeInTheDocument();
    expect(await screen.findByText('B:')).toBeInTheDocument();
  });
});
