import { useMemo, useRef, useState } from 'react';
import { useChartContext } from './chart/chartContext';

type DragMode = 'window' | 'start' | 'end' | null;

export interface BrushProps {
  height?: number;
  travellerWidth?: number;
  minSpan?: number;
  fill?: string;
  stroke?: string;
  onChange?: (range: { startIndex: number; endIndex: number }) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function Brush({
  height = 22,
  travellerWidth = 10,
  minSpan = 0.08,
  fill = 'rgba(37, 99, 235, 0.16)',
  stroke = '#2563eb',
  onChange,
}: BrushProps) {
  const { width, height: chartHeight, margin, innerWidth, sourceData, visibleRange, setVisibleRange } = useChartContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const dragStartRef = useRef<{ x: number; start: number; end: number } | null>(null);

  const left = margin.left;
  const top = chartHeight - height;
  const span = Math.max(minSpan, Math.min(1, visibleRange.end - visibleRange.start));

  const selection = useMemo(() => {
    const startPx = left + visibleRange.start * innerWidth;
    const endPx = left + visibleRange.end * innerWidth;
    return {
      startPx,
      endPx,
      width: Math.max(1, endPx - startPx),
    };
  }, [left, visibleRange.start, visibleRange.end, innerWidth]);

  const emitChange = (start: number, end: number) => {
    if (!onChange || sourceData.length === 0) return;
    const maxIndex = sourceData.length - 1;
    onChange({
      startIndex: Math.floor(start * maxIndex),
      endIndex: Math.ceil(end * maxIndex),
    });
  };

  const beginDrag = (mode: DragMode, clientX: number) => {
    if (!mode) return;
    setDragMode(mode);
    dragStartRef.current = { x: clientX, start: visibleRange.start, end: visibleRange.end };

    const handleMove = (event: MouseEvent) => {
      const root = rootRef.current;
      const dragStart = dragStartRef.current;
      if (!root || !dragStart) return;

      const rect = root.getBoundingClientRect();
      const dxRatio = (event.clientX - dragStart.x) / Math.max(1, rect.width);

      if (mode === 'window') {
        const widthRatio = dragStart.end - dragStart.start;
        const start = clamp(dragStart.start + dxRatio, 0, 1 - widthRatio);
        const end = start + widthRatio;
        setVisibleRange({ start, end });
        emitChange(start, end);
        return;
      }

      if (mode === 'start') {
        const nextStart = clamp(dragStart.start + dxRatio, 0, dragStart.end - minSpan);
        setVisibleRange({ start: nextStart, end: dragStart.end });
        emitChange(nextStart, dragStart.end);
        return;
      }

      const nextEnd = clamp(dragStart.end + dxRatio, dragStart.start + minSpan, 1);
      setVisibleRange({ start: dragStart.start, end: nextEnd });
      emitChange(dragStart.start, nextEnd);
    };

    const handleUp = () => {
      setDragMode(null);
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  if (sourceData.length <= 1) return null;

  return (
    <div
      ref={rootRef}
      data-testid="brush-root"
      style={{
        position: 'absolute',
        left,
        top,
        width: innerWidth,
        height,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <div
        data-testid="brush-window"
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid #d5dbe7',
          borderRadius: 4,
          background: '#f4f7fb',
        }}
      />
      <div
        data-testid="brush-handle-start"
        style={{
          position: 'absolute',
          left: selection.startPx - left,
          width: selection.width,
          top: 0,
          bottom: 0,
          background: fill,
          border: `1px solid ${stroke}`,
          borderRadius: 4,
          cursor: dragMode === 'window' ? 'grabbing' : 'grab',
          boxSizing: 'border-box',
        }}
        onMouseDown={(event) => beginDrag('window', event.clientX)}
      />

      <div
        data-testid="brush-handle-end"
        style={{
          position: 'absolute',
          left: selection.startPx - left - travellerWidth / 2,
          width: travellerWidth,
          top: 0,
          bottom: 0,
          background: stroke,
          borderRadius: 3,
          cursor: 'ew-resize',
        }}
        onMouseDown={(event) => beginDrag('start', event.clientX)}
      />
      <div
        style={{
          position: 'absolute',
          left: selection.endPx - left - travellerWidth / 2,
          width: travellerWidth,
          top: 0,
          bottom: 0,
          background: stroke,
          borderRadius: 3,
          cursor: 'ew-resize',
        }}
        onMouseDown={(event) => beginDrag('end', event.clientX)}
      />
    </div>
  );
}
