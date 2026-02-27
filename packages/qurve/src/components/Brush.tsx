import {
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type TouchEventHandler,
  type WheelEventHandler,
} from 'react';
import { useChartContext } from './chart/chartContext';

type DragMode = 'window' | 'start' | 'end' | null;
type InputMode = 'mouse' | 'touch';

export interface BrushProps {
  height?: number;
  travellerWidth?: number;
  minSpan?: number;
  showPreview?: boolean;
  previewDataKey?: string;
  previewStroke?: string;
  previewStrokeWidth?: number;
  previewOpacity?: number;
  wheelZoomStep?: number;
  enableWheelZoom?: boolean;
  enablePan?: boolean;
  showReset?: boolean;
  fill?: string;
  stroke?: string;
  onChange?: (range: { startIndex: number; endIndex: number }) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getTouchX(event: TouchEvent): number | null {
  const touch = event.touches[0] ?? event.changedTouches[0];
  return touch ? touch.clientX : null;
}

function getTouchDistance(touchA: { clientX: number; clientY: number }, touchB: { clientX: number; clientY: number }): number {
  const dx = touchB.clientX - touchA.clientX;
  const dy = touchB.clientY - touchA.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function Brush({
  height = 22,
  travellerWidth = 10,
  minSpan = 0.08,
  showPreview = true,
  previewDataKey,
  previewStroke = '#64748b',
  previewStrokeWidth = 1.5,
  previewOpacity = 0.85,
  wheelZoomStep = 0.08,
  enableWheelZoom = true,
  enablePan = true,
  showReset = true,
  fill = 'rgba(37, 99, 235, 0.16)',
  stroke = '#2563eb',
  onChange,
}: BrushProps) {
  const { width, height: chartHeight, margin, innerWidth, sourceData, visibleRange, setVisibleRange } = useChartContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const dragStartRef = useRef<{ x: number; start: number; end: number } | null>(null);
  const pinchRef = useRef<{
    distance: number;
    start: number;
    end: number;
    centerRatio: number;
  } | null>(null);

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

  const previewPath = useMemo(() => {
    if (!showPreview || sourceData.length < 2 || innerWidth <= 0 || height <= 0) return null;

    const key = previewDataKey ?? Object.keys(sourceData[0] ?? {}).find((candidate) => {
      const value = sourceData[0]?.[candidate];
      return typeof value === 'number' && Number.isFinite(value);
    });

    if (!key) return null;

    const values = sourceData
      .map((item) => Number(item[key]))
      .filter((value) => Number.isFinite(value));

    if (values.length < 2) return null;

    let min = values[0];
    let max = values[0];
    for (let index = 1; index < values.length; index++) {
      const value = values[index];
      if (value < min) min = value;
      if (value > max) max = value;
    }

    const span = max - min || 1;
    const pathPoints: string[] = [];
    for (let index = 0; index < sourceData.length; index++) {
      const raw = Number(sourceData[index][key]);
      const value = Number.isFinite(raw) ? raw : min;
      const x = sourceData.length === 1
        ? 0
        : (index / Math.max(1, sourceData.length - 1)) * innerWidth;
      const y = (1 - (value - min) / span) * Math.max(1, height - 2) + 1;
      pathPoints.push(`${x},${y}`);
    }

    return pathPoints.join(' ');
  }, [showPreview, previewDataKey, sourceData, innerWidth, height]);

  const emitChange = (start: number, end: number) => {
    if (!onChange || sourceData.length === 0) return;
    const maxIndex = sourceData.length - 1;
    onChange({
      startIndex: Math.floor(start * maxIndex),
      endIndex: Math.ceil(end * maxIndex),
    });
  };

  const applyRange = (start: number, end: number, emit = true) => {
    const clampedStart = clamp(start, 0, 1);
    const clampedEnd = clamp(end, clampedStart, 1);
    setVisibleRange({ start: clampedStart, end: clampedEnd });
    if (emit) emitChange(clampedStart, clampedEnd);
  };

  const resetRange = () => {
    applyRange(0, 1);
  };

  const beginDrag = (mode: DragMode, clientX: number, inputMode: InputMode) => {
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
        if (!enablePan) return;
        const widthRatio = dragStart.end - dragStart.start;
        const start = clamp(dragStart.start + dxRatio, 0, 1 - widthRatio);
        const end = start + widthRatio;
        applyRange(start, end);
        return;
      }

      if (mode === 'start') {
        const nextStart = clamp(dragStart.start + dxRatio, 0, dragStart.end - minSpan);
        applyRange(nextStart, dragStart.end);
        return;
      }

      const nextEnd = clamp(dragStart.end + dxRatio, dragStart.start + minSpan, 1);
      applyRange(dragStart.start, nextEnd);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const root = rootRef.current;
      const dragStart = dragStartRef.current;
      const clientX = getTouchX(event);
      if (!root || !dragStart || clientX === null) return;

      event.preventDefault();
      const rect = root.getBoundingClientRect();
      const dxRatio = (clientX - dragStart.x) / Math.max(1, rect.width);

      if (mode === 'window') {
        if (!enablePan) return;
        const widthRatio = dragStart.end - dragStart.start;
        const start = clamp(dragStart.start + dxRatio, 0, 1 - widthRatio);
        const end = start + widthRatio;
        applyRange(start, end);
        return;
      }

      if (mode === 'start') {
        const nextStart = clamp(dragStart.start + dxRatio, 0, dragStart.end - minSpan);
        applyRange(nextStart, dragStart.end);
        return;
      }

      const nextEnd = clamp(dragStart.end + dxRatio, dragStart.start + minSpan, 1);
      applyRange(dragStart.start, nextEnd);
    };

    const handleUp = () => {
      setDragMode(null);
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };

    if (inputMode === 'mouse') {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    } else {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }
  };

  const beginPinch = (
    touchA: { clientX: number; clientY: number },
    touchB: { clientX: number; clientY: number },
  ) => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const center = (touchA.clientX + touchB.clientX) / 2;
    const centerRatio = clamp((center - rect.left) / Math.max(1, rect.width), 0, 1);
    pinchRef.current = {
      distance: Math.max(1, getTouchDistance(touchA, touchB)),
      start: visibleRange.start,
      end: visibleRange.end,
      centerRatio,
    };

    const handlePinchMove = (event: TouchEvent) => {
      if (!enableWheelZoom || !pinchRef.current || event.touches.length < 2) return;
      const rootNode = rootRef.current;
      if (!rootNode) return;

      event.preventDefault();
      const [first, second] = [event.touches[0], event.touches[1]];
      const currentDistance = Math.max(1, getTouchDistance(first, second));
      const startState = pinchRef.current;
      const startSpan = Math.max(minSpan, startState.end - startState.start);
      const targetSpan = clamp(startSpan * (startState.distance / currentDistance), minSpan, 1);

      const center = startState.start + startState.centerRatio * startSpan;
      const nextStart = clamp(center - startState.centerRatio * targetSpan, 0, 1 - targetSpan);
      const nextEnd = nextStart + targetSpan;
      applyRange(nextStart, nextEnd);
    };

    const handlePinchEnd = () => {
      pinchRef.current = null;
      window.removeEventListener('touchmove', handlePinchMove);
      window.removeEventListener('touchend', handlePinchEnd);
      window.removeEventListener('touchcancel', handlePinchEnd);
    };

    window.addEventListener('touchmove', handlePinchMove, { passive: false });
    window.addEventListener('touchend', handlePinchEnd);
    window.addEventListener('touchcancel', handlePinchEnd);
  };

  const handleWheel: WheelEventHandler<HTMLDivElement> = (event) => {
    if (!enableWheelZoom || sourceData.length <= 1) return;
    event.preventDefault();

    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const cursorRatio = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
    const currentStart = visibleRange.start;
    const currentEnd = visibleRange.end;
    const currentSpan = Math.max(minSpan, currentEnd - currentStart);
    const direction = Math.sign(event.deltaY);
    const delta = wheelZoomStep * (direction >= 0 ? 1 : -1);
    const targetSpan = clamp(currentSpan + delta, minSpan, 1);

    const center = currentStart + cursorRatio * currentSpan;
    const nextStart = clamp(center - cursorRatio * targetSpan, 0, 1 - targetSpan);
    const nextEnd = nextStart + targetSpan;
    applyRange(nextStart, nextEnd);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      resetRange();
    }
  };

  const onWindowMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    beginDrag('window', event.clientX, 'mouse');
  };

  const onWindowTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    if (event.touches.length > 1) return;
    const touch = event.touches[0];
    if (!touch) return;
    beginDrag('window', touch.clientX, 'touch');
  };

  const onStartHandleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    beginDrag('start', event.clientX, 'mouse');
  };

  const onStartHandleTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    beginDrag('start', touch.clientX, 'touch');
  };

  const onEndHandleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    beginDrag('end', event.clientX, 'mouse');
  };

  const onEndHandleTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    beginDrag('end', touch.clientX, 'touch');
  };

  const onRootTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    if (!enableWheelZoom || event.touches.length < 2) return;
    beginPinch(event.touches[0], event.touches[1]);
  };

  if (sourceData.length <= 1) return null;

  return (
    <div
      ref={rootRef}
      data-testid="brush-root"
      tabIndex={0}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onTouchStart={onRootTouchStart}
      style={{
        position: 'absolute',
        left,
        top,
        width: innerWidth,
        height,
        pointerEvents: 'auto',
        userSelect: 'none',
        touchAction: 'none',
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
      {previewPath && (
        <svg
          data-testid="brush-preview"
          width={innerWidth}
          height={height}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            opacity: previewOpacity,
          }}
        >
          <polyline
            points={previewPath}
            fill="none"
            stroke={previewStroke}
            strokeWidth={previewStrokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <div
        data-testid="brush-window-selection"
        style={{
          position: 'absolute',
          left: selection.startPx - left,
          width: selection.width,
          top: 0,
          bottom: 0,
          background: fill,
          border: `1px solid ${stroke}`,
          borderRadius: 4,
          cursor: enablePan ? (dragMode === 'window' ? 'grabbing' : 'grab') : 'default',
          boxSizing: 'border-box',
        }}
        onMouseDown={onWindowMouseDown}
        onTouchStart={onWindowTouchStart}
      />

      <div
        data-testid="brush-handle-start"
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
        onMouseDown={onStartHandleMouseDown}
        onTouchStart={onStartHandleTouchStart}
      />
      <div
        data-testid="brush-handle-end"
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
        onMouseDown={onEndHandleMouseDown}
        onTouchStart={onEndHandleTouchStart}
      />

      {showReset && span < 0.999 && (
        <button
          type="button"
          data-testid="brush-reset"
          onClick={resetRange}
          style={{
            position: 'absolute',
            right: 4,
            top: -24,
            border: `1px solid ${stroke}`,
            background: '#ffffff',
            color: stroke,
            borderRadius: 4,
            fontSize: 11,
            padding: '2px 6px',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}
