import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';
import { Line } from './Line';
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

describe('Line', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Line dataKey="y" />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('renders with default props', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <Line dataKey="y" />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('renders with custom stroke color', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Line dataKey="y" stroke="#ff0000" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom stroke width', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Line dataKey="y" strokeWidth={4} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with dot={true}', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <Line dataKey="y" dot={true} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with dot={false}', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <Line dataKey="y" dot={false} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with dot={object}', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Line dataKey="y" dot={{ r: 5, fill: 'red', stroke: 'blue' }} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with activeDot={true}', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <Line dataKey="y" activeDot={true} />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);
  });

  it('renders with activeDot={false}', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <Line dataKey="y" activeDot={false} />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with activeDot={object}', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Line dataKey="y" activeDot={{ r: 8, fill: 'green', stroke: 'yellow' }} />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with all curve types', () => {
    const types = ['linear', 'monotone', 'step'] as const;

    for (const type of types) {
      const { container } = render(
        <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
          <Line dataKey="y" type={type} />
        </Chart>,
      );

      expect(container.querySelector('canvas')).not.toBeNull();
    }
  });

  it('shows tooltip with correct value', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Revenue:')).toBeInTheDocument();
    expect(screen.getByText('10.00')).toBeInTheDocument();
  });

  it('shows tooltip with custom name', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Custom Name" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('Custom Name:')).toBeInTheDocument();
  });

  it('works with legend toggle', async () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
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
        <Line dataKey={(d) => (d as { value: number }).value * 2} name="Double Value" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('handles empty data', () => {
    const { container } = render(
      <Chart data={[]} width={280} height={160}>
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles single data point', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles negative values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: -10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('handles floating point values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 3.14159 }, { x: 2, y: 2.71828 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <Tooltip />
      </Chart>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('renders with multiple lines', () => {
    const { container } = render(
      <Chart data={[{ x: 1, a: 10, b: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="a" name="Line A" />
        <Line dataKey="b" name="Line B" />
        <Tooltip />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
