import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { Line } from '../series/Line';
import { Bar } from '../series/Bar';

describe('YAxis', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with default props', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom dataKey', () => {
    const { container } = render(
      <Chart data={[{ name: 'a', value: 10 }]} width={280} height={160}>
        <XAxis dataKey="name" />
        <YAxis dataKey="value" />
        <Line dataKey="value" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with no dataKey (auto-detect)', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom domain', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis domain={[0, 100]} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with domain="auto"', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis domain="auto" />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with reversed', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis reversed />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom tickCount', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis tickCount={10} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with tickFormatter', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis tickFormatter={(value) => `${value}%`} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with allowDecimals=false', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis allowDecimals={false} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with interval', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis interval={2} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with padding', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis padding={10} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with object padding', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis padding={{ top: 10, bottom: 20 }} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with tick={false}', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis tick={false} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with tickLine={false}', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis tickLine={false} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with axisLine={false}', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis axisLine={false} />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with width', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis width={60} />
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
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles zero values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 0 }, { x: 2, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles floating point values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 3.14 }, { x: 2, y: 2.71 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('works with Bar chart', () => {
    const { container } = render(
      <Chart data={[{ x: 'a', y: 10 }, { x: 'b', y: 20 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Bar dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles empty data', () => {
    const { container } = render(
      <Chart data={[]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
