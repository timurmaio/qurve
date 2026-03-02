import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';
import { Area } from './Area';
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

describe('Area', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Area dataKey="y" />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('renders with default props', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <Area dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom fill color', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Area dataKey="y" fill="#ff0000" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom stroke color', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Area dataKey="y" stroke="#0000ff" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom stroke width', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Area dataKey="y" strokeWidth={4} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom fillOpacity', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Area dataKey="y" fillOpacity={0.5} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom hoverOpacity', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Area dataKey="y" hoverOpacity={0.3} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders stacked areas (same stackId)', () => {
    const { container } = render(
      <Chart data={[{ x: 1, a: 10, b: 5 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="a" stackId="stack" />
        <Area dataKey="b" stackId="stack" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders layered areas (different stackId)', () => {
    const { container } = render(
      <Chart data={[{ x: 1, a: 10, b: 5 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="a" stackId="layer1" />
        <Area dataKey="b" stackId="layer2" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('shows tooltip with correct value', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="y" name="Revenue" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Revenue:')).toBeInTheDocument();
    expect(screen.getByText('10.00')).toBeInTheDocument();
  });

  it('shows tooltip with custom tooltipName', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="y" tooltipName="Custom Revenue" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Custom Revenue:')).toBeInTheDocument();
  });

  it('shows tooltip with custom tooltipFormatter', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="y" tooltipFormatter={(value) => `${value}%`} />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('10%')).toBeInTheDocument();
  });

  it('shows stacked values in tooltip', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, productA: 10, productB: 5 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="productA" stackId="total" tooltipName="Product A" />
        <Area dataKey="productB" stackId="total" tooltipName="Product B" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Product A:')).toBeInTheDocument();
    expect(screen.getByText('Product B:')).toBeInTheDocument();
  });

  it('works with legend toggle', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="y" name="Revenue" />
        <Legend />
      </Chart>,
    );

    const legendButton = await screen.findByRole('button', { name: 'Revenue, visible' });
    expect(legendButton).toBeInTheDocument();

    fireEvent.click(legendButton);
    expect(legendButton).toHaveStyle({ color: 'rgb(136, 136, 136)' });

    fireEvent.click(legendButton);
    expect(legendButton).toHaveStyle({ color: 'rgb(34, 34, 34)' });
  });

  it('handles dataKey as function', () => {
    const { container } = render(
      <Chart data={[{ x: 1, value: 10 }]} width={280} height={160}>
        <Area dataKey={(d) => (d as { value: number }).value * 2} name="Double" />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles empty data', () => {
    const { container } = render(
      <Chart data={[]} width={280} height={160}>
        <Area dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles single data point', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Area dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles negative values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: -10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Area dataKey="y" />
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
        <Area dataKey="y" />
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
        <Area dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom name', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Area dataKey="y" name="Custom Area" />
        <Legend />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
