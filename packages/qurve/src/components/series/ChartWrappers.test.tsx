import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PieChart } from '../chart/PieChart';
import { ScatterChart } from '../chart/ScatterChart';
import { ComposedChart } from '../chart/ComposedChart';
import { Pie } from './Pie';
import { Scatter } from './Scatter';
import { Line } from './Line';
import { Bar } from './Bar';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';

async function flushRender() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe('chart wrappers', () => {
  it('PieChart renders pie canvas', async () => {
    const { container } = render(
      <PieChart
        data={[
          { name: 'A', value: 40 },
          { name: 'B', value: 60 },
        ]}
        width={320}
        height={280}
      >
        <Pie dataKey="value" nameKey="name" />
      </PieChart>,
    );
    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('ScatterChart renders scatter canvas', async () => {
    const { container } = render(
      <ScatterChart
        data={[
          { x: 1, y: 2 },
          { x: 3, y: 4 },
        ]}
        width={360}
        height={240}
      >
        <XAxis dataKey="x" />
        <YAxis dataKey="y" />
        <Scatter xKey="x" yKey="y" />
      </ScatterChart>,
    );
    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('ComposedChart mixes line and bar', async () => {
    const { container } = render(
      <ComposedChart
        data={[
          { name: 'a', uv: 10, pv: 20 },
          { name: 'b', uv: 15, pv: 25 },
        ]}
        width={400}
        height={240}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <Bar dataKey="pv" />
        <Line dataKey="uv" />
      </ComposedChart>,
    );
    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
