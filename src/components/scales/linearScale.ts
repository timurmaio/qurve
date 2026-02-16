import type { LinearScale, LinearScaleOptions } from './types';

export function createLinearScale(options: LinearScaleOptions): LinearScale {
  const { domain: initialDomain, range: initialRange } = options;
  
  let domain = [...initialDomain];
  let range = [...initialRange];

  const scale = ((value: number) => {
    if (!domain || domain.length < 2 || !range || range.length < 2) return 0;
    
    const [d0, d1] = domain;
    const [r0, r1] = range;
    
    if (d0 === undefined || d1 === undefined) return r0 ?? 0;
    if (d1 === d0) return r0 ?? 0;
    
    const ratio = (value - d0) / (d1 - d0);
    return r0 + ratio * (r1 - r0);
  }) as LinearScale;

  scale.domain = () => [...domain] as [number, number];
  scale.range = () => [...range] as [number, number];
  
  scale.invert = (pixel: number) => {
    if (!domain || domain.length < 2 || !range || range.length < 2) return 0;
    
    const [d0, d1] = domain;
    const [r0, r1] = range;
    
    if (d0 === undefined || d1 === undefined) return d0 ?? 0;
    if (r1 === r0) return d0;
    
    const ratio = (pixel - r0) / (r1 - r0);
    return d0 + ratio * (d1 - d0);
  };

  scale.ticks = (count: number) => {
    if (!domain || domain.length < 2) return [];
    
    const [d0, d1] = domain;
    if (d0 === undefined || d1 === undefined || isNaN(d0) || isNaN(d1)) return [];
    
    const step = (d1 - d0) / count;
    if (!isFinite(step) || step === 0) return [d0];
    
    if (step === 0) return [d0];
    
    const magnitude = Math.floor(Math.log10(Math.abs(step)));
    const stepMagnitude = Math.pow(10, magnitude);
    const stepNormalized = step / stepMagnitude;
    
    let tickStep: number;
    if (stepNormalized < 2) tickStep = 1;
    else if (stepNormalized < 5) tickStep = 2;
    else tickStep = 5;
    
    tickStep *= stepMagnitude;
    
    const start = Math.ceil(d0 / tickStep) * tickStep;
    const end = Math.floor(d1 / tickStep) * tickStep;
    
    const ticks: number[] = [];
    for (let t = start; t <= end; t += tickStep) {
      ticks.push(t);
    }
    
    return ticks;
  };

  scale.copy = () => {
    const newScale = createLinearScale({
      domain: [...domain] as [number, number],
      range: [...range] as [number, number],
    });
    return newScale;
  };

  scale.nice = (count = 10) => {
    if (!domain || domain.length < 2) return scale;
    
    const [d0, d1] = domain;
    if (d0 === undefined || d1 === undefined) return scale;
    
    const step = (d1 - d0) / count;
    const magnitude = Math.floor(Math.log10(Math.abs(step)));
    const stepMagnitude = Math.pow(10, magnitude);
    const stepNormalized = step / stepMagnitude;
    
    let tickStep: number;
    if (stepNormalized < 2) tickStep = 1;
    else if (stepNormalized < 5) tickStep = 2;
    else tickStep = 5;
    
    tickStep *= stepMagnitude;
    
    domain = [Math.floor(d0 / tickStep) * tickStep, Math.ceil(d1 / tickStep) * tickStep] as [number, number];
    
    return scale;
  };

  return scale;
}
