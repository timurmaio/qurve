import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Legend } from './Legend';
import { Chart } from './chart/chartContext';
import { Line } from './series/Line';
import { XAxis } from './cartesian/XAxis';
import { YAxis } from './cartesian/YAxis';

describe('Legend', () => {
  it('renders registered series and toggles visibility state', async () => {
    render(
      <Chart data={[{ x: 0, y: 10 }, { x: 1, y: 20 }]} width={280} height={140}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Legend />
      </Chart>,
    );

    const button = await screen.findByRole('button', { name: 'Revenue, visible' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ color: 'rgb(34, 34, 34)' });

    fireEvent.click(button);
    expect(button).toHaveStyle({ color: 'rgb(136, 136, 136)' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('aria-label', 'Revenue, hidden');
  });

  it('supports keyboard toggle interactions', async () => {
    render(
      <Chart data={[{ x: 0, y: 10 }, { x: 1, y: 20 }]} width={280} height={140}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Legend />
      </Chart>,
    );

    const button = await screen.findByRole('button', { name: 'Revenue, visible' });
    expect(button).toHaveAttribute('aria-pressed', 'true');

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.keyDown(button, { key: ' ' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('supports single selection mode with reset-on-second-click', async () => {
    render(
      <Chart data={[{ x: 0, a: 10, b: 20 }, { x: 1, a: 15, b: 25 }]} width={280} height={140}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="a" name="A" />
        <Line dataKey="b" name="B" />
        <Legend selectionMode="single" />
      </Chart>,
    );

    const buttonA = await screen.findByRole('button', { name: 'A, visible' });
    const buttonB = await screen.findByRole('button', { name: 'B, visible' });

    fireEvent.click(buttonA);
    expect(buttonA).toHaveAttribute('aria-pressed', 'true');
    expect(buttonB).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(buttonA);
    expect(buttonA).toHaveAttribute('aria-pressed', 'true');
    expect(buttonB).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies wrapperClassName, wrapperStyle, itemStyle', () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }]} width={280} height={140}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Legend
          wrapperClassName="custom-legend"
          wrapperStyle={{ padding: '12px' }}
          itemStyle={{ borderRadius: '4px' }}
        />
      </Chart>,
    );

    const wrapper = container.querySelector('.custom-legend');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ padding: '12px' });

    const button = screen.getByRole('button', { name: 'Revenue, visible' });
    expect(button).toHaveStyle({ borderRadius: '4px' });
  });

  it('renders with align left', () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }]} width={280} height={140}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Legend align="left" />
      </Chart>,
    );

    const wrapper = container.querySelector('[role="group"]');
    expect(wrapper).toHaveStyle({ justifyContent: 'flex-start' });
  });

  it('renders with align right', () => {
    const { container } = render(
      <Chart data={[{ x: 0, y: 10 }]} width={280} height={140}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" name="Revenue" />
        <Legend align="right" />
      </Chart>,
    );

    const wrapper = container.querySelector('[role="group"]');
    expect(wrapper).toHaveStyle({ justifyContent: 'flex-end' });
  });
});
