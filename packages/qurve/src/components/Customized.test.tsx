import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Chart } from './chart/chartContext';
import { Customized } from './Customized';
import { XAxis } from './cartesian/XAxis';
import { YAxis } from './cartesian/YAxis';
import { Line } from './series/Line';

describe('Customized', () => {
  it('calls draw function when ctx is available', async () => {
    const draw = vi.fn();
    const { container } = render(
      <Chart data={[{ x: 1, y: 10 }]} width={280} height={160}>
        <XAxis dataKey="x" />
        <YAxis />
        <Line dataKey="y" />
        <Customized draw={draw} />
      </Chart>,
    );

    expect(container.querySelector('canvas')).not.toBeNull();

    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });

    expect(draw).toHaveBeenCalled();
  });
});
