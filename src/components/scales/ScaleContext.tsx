import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AnyScale } from './types';

type ScaleStore = Map<string, AnyScale>;

type ScaleContextValue = {
  scales: ScaleStore;
  getScale: (name: string) => AnyScale | undefined;
  registerScale: (name: string, scale: AnyScale) => void;
};

const ScaleContext = createContext<ScaleContextValue>({
  scales: new Map(),
  getScale: () => undefined,
  registerScale: () => {},
});

export const useScaleContext = () => useContext(ScaleContext);

export const ScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scales, setScales] = useState<ScaleStore>(new Map());

  const registerScale = useCallback((name: string, scale: AnyScale) => {
    setScales(prev => {
      const next = new Map(prev);
      next.set(name, scale);
      return next;
    });
  }, []);

  const getScale = useCallback((name: string) => {
    return scales.get(name);
  }, [scales]);

  return (
    <ScaleContext.Provider value={{ scales, getScale, registerScale }}>
      {children}
    </ScaleContext.Provider>
  );
};

export function useScale(name: string): AnyScale | undefined {
  const { getScale } = useScaleContext();
  return getScale(name);
}

export function useScales() {
  const { scales, getScale } = useScaleContext();
  return { scales, getScale };
}
