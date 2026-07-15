import { niceDomain, ticks } from './ticks';

export interface LinearScale {
  (value: number): number;
  domain: () => [number, number];
  range: () => [number, number];
  invert: (value: number) => number;
  ticks: (count?: number) => number[];
  nice: (count?: number) => LinearScale;
  clamp: (value: number) => number;
}

/**
 * Continuous linear scale domain → range (d3-scale `scaleLinear` subset, deps-free).
 */
export function scaleLinear(config: {
  domain: [number, number];
  range: [number, number];
}): LinearScale {
  let domain: [number, number] = [+config.domain[0], +config.domain[1]];
  let range: [number, number] = [+config.range[0], +config.range[1]];

  const scale = ((value: number) => {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    if (!Number.isFinite(value)) return r0;
    if (d1 === d0) return r0;
    const ratio = (value - d0) / (d1 - d0);
    return r0 + ratio * (r1 - r0);
  }) as LinearScale;

  scale.domain = () => [domain[0], domain[1]];
  scale.range = () => [range[0], range[1]];

  scale.invert = (value: number) => {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    if (r1 === r0) return d0;
    const ratio = (value - r0) / (r1 - r0);
    return d0 + ratio * (d1 - d0);
  };

  scale.clamp = (value: number) => {
    const [d0, d1] = domain;
    const lo = Math.min(d0, d1);
    const hi = Math.max(d0, d1);
    return Math.max(lo, Math.min(hi, value));
  };

  scale.ticks = (count = 10) => ticks(domain[0], domain[1], count);

  scale.nice = (count = 10) => {
    domain = niceDomain(domain, count);
    return scale;
  };

  return scale;
}

/** @deprecated Prefer `scaleLinear` — kept for call-site compatibility. */
export function createLinearScale(config: {
  domain: [number, number];
  range: [number, number];
}): LinearScale {
  return scaleLinear(config);
}
