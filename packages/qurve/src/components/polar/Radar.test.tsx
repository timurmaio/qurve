import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadarChart } from '../chart/RadarChart';
import { PolarGrid } from './PolarGrid';
import { PolarAngleAxis } from './PolarAngleAxis';
import { PolarRadiusAxis } from './PolarRadiusAxis';
import { Radar } from './Radar';
import { Legend } from '../Legend';
import { Tooltip } from '../Tooltip';

const RADAR_DATA = [
  { subject: 'Math', A: 120, B: 110 },
  { subject: 'Chinese', A: 98, B: 130 },
  { subject: 'English', A: 86, B: 130 },
  { subject: 'Geography', A: 99, B: 100 },
  { subject: 'Physics', A: 85, B: 90 },
  { subject: 'History', A: 65, B: 85 },
];

async function flushRender() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe('Radar chart', () => {
  it('renders radar composition without throwing', async () => {
    const { container } = render(
      <RadarChart data={RADAR_DATA} width={400} height={320}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar dataKey="A" name="Student A" fill="#8884d8" fillOpacity={0.4} />
        <Radar dataKey="B" name="Student B" fill="#82ca9d" fillOpacity={0.3} />
        <Legend />
        <Tooltip />
      </RadarChart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(screen.getByText('Student A')).toBeInTheDocument();
    expect(screen.getByText('Student B')).toBeInTheDocument();
  });

  it('supports circle grid type and custom domain', async () => {
    const { container } = render(
      <RadarChart data={RADAR_DATA} width={360} height={300}>
        <PolarGrid gridType="circle" strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis domain={[0, 150]} tickCount={4} />
        <Radar dataKey="A" stroke="#2563eb" fill="#2563eb" dot />
      </RadarChart>,
    );

    await flushRender();
    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
