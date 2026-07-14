import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ComposedChart } from '../chart/ComposedChart';
import { XAxis } from '../cartesian/XAxis';
import { YAxis } from '../cartesian/YAxis';
import { Line } from './Line';

const DATA = [
  { name: 'A', uv: 40, temp: 18 },
  { name: 'B', uv: 80, temp: 22 },
  { name: 'C', uv: 60, temp: 19 },
];

async function flushRender() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe('dual YAxis yAxisId', () => {
  it('renders composed chart with left and right axes', async () => {
    const { container } = render(
      <ComposedChart data={DATA} width={420} height={260} margin={{ top: 10, right: 40, bottom: 20, left: 40 }}>
        <XAxis dataKey="name" />
        <YAxis yAxisId={0} />
        <YAxis yAxisId={1} position="right" />
        <Line dataKey="uv" yAxisId={0} stroke="#2563eb" dot={false} />
        <Line dataKey="temp" yAxisId={1} stroke="#f97316" dot={false} />
      </ComposedChart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
