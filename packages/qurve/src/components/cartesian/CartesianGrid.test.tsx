import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chart } from '../chart/chartContext';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { CartesianGrid } from './CartesianGrid';
import { Line } from '../series/Line';

describe('CartesianGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <CartesianGrid />
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
        <CartesianGrid />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom stroke', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <CartesianGrid stroke="#ff0000" />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom strokeDasharray', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders vertical lines only', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <CartesianGrid vertical={true} horizontal={false} />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders horizontal lines only', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <CartesianGrid vertical={false} horizontal={true} />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with both vertical and horizontal', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <CartesianGrid vertical={true} horizontal={true} />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with custom horizontal and vertical count', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <CartesianGrid horizontalCount={10} verticalCount={10} />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('handles empty data', () => {
    const { container } = render(
      <Chart data={[]} width={280} height={160}>
        <CartesianGrid />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('works with different chart sizes', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={600} height={400}>
        <CartesianGrid />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('works with small chart size', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={100} height={100}>
        <CartesianGrid />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('works with negative values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: -10 }, { x: 2, y: 20 }]} width={280} height={160}>
        <CartesianGrid />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('works with floating point values', () => {
    const { container } = render(
      <Chart data={[{ x: 1, y: 3.14 }, { x: 2, y: 2.71 }]} width={280} height={160}>
        <CartesianGrid />
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
