import { useEffect, useMemo } from 'react';
import { createLinearScale } from './linearScale';
import { useScaleContext } from './ScaleContext';
import type { LinearScale } from './types';

export interface YScaleProps {
  name?: string;
  domain: [number, number];
  range: [number, number];
  nice?: boolean;
}

export function YScale({ name = 'y', domain, range, nice = false }: YScaleProps) {
  const { registerScale } = useScaleContext();

  const scale = useMemo(() => {
    const s = createLinearScale({ domain, range });
    if (nice) {
      s.nice();
    }
    return s;
  }, [domain, range, nice]);

  useEffect(() => {
    registerScale(name, scale);
  }, [name, scale, registerScale]);

  return null;
}
