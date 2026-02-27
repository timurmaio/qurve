import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';
import { Tooltip } from '../Tooltip';
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

    const canvas = container.querySelector('canvas');
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

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    hoverCanvas(canvas as HTMLCanvasElement);

    expect(await screen.findByText('First:')).toBeInTheDocument();
    expect(await screen.findByText('Second:')).toBeInTheDocument();
    expect(screen.getByText('7.00')).toBeInTheDocument();
    expect(screen.getByText('3.00')).toBeInTheDocument();
  });
});
