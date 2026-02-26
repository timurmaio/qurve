import { cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';

type SizeValue = number | string;

function toCssValue(value: SizeValue | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

function resolveNumericSize(value: SizeValue | undefined, measured: number): number {
  if (typeof value === 'number') return value;
  return measured;
}

export interface ResponsiveContainerProps {
  width?: SizeValue;
  height?: SizeValue;
  minWidth?: number;
  minHeight?: number;
  aspect?: number;
  children: React.ReactElement;
}

export function ResponsiveContainer({
  width = '100%',
  height = '100%',
  minWidth = 0,
  minHeight = 0,
  aspect,
  children,
}: ResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [{ width: measuredWidth, height: measuredHeight }, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateSize = () => {
      const nextWidth = element.clientWidth;
      const nextHeight = element.clientHeight;
      setSize((current) => {
        if (current.width === nextWidth && current.height === nextHeight) {
          return current;
        }
        return { width: nextWidth, height: nextHeight };
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const resolvedWidth = resolveNumericSize(width, measuredWidth);
  const resolvedHeight = useMemo(() => {
    if (typeof height === 'number') return height;
    if (aspect && aspect > 0) {
      return resolvedWidth / aspect;
    }
    return measuredHeight;
  }, [height, aspect, resolvedWidth, measuredHeight]);

  const finalWidth = Math.max(minWidth, resolvedWidth);
  const finalHeight = Math.max(minHeight, resolvedHeight);
  const canRender = finalWidth > 0 && finalHeight > 0;

  return (
    <div
      ref={containerRef}
      style={{
        width: toCssValue(width, '100%'),
        height: toCssValue(height, '100%'),
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
      }}
    >
      {canRender && isValidElement(children)
        ? cloneElement(children, {
            width: finalWidth,
            height: finalHeight,
          } as Record<string, unknown>)
        : null}
    </div>
  );
}
