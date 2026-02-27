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
});
