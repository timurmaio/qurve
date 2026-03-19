import { cloneElement, isValidElement, useEffect, useMemo, useRef } from 'react';
import {
  drawActiveDot,
  drawCrosshair,
  findClosestPointByX,
  getRelativePosition,
  projectPoints,
  resolveXValue,
  LayerOrder,
} from '@qurve/core';
import {
  useChartInteractionContext,
  useChartLayoutContext,
  useChartRenderContext,
  useChartScaleContext,
} from './chart/chartContext';
import type { TooltipPayloadItem } from './chart/chartContext';
import {
  formatTooltipLabel,
  nodeToText,
  payloadToA11yText,
  sortPayload,
  toReverseConfig,
  type TooltipLabel,
} from '@qurve/core';

const TOOLTIP_CONSTANTS = {
  POINT_RADIUS: 6,
  POINT_STROKE_WIDTH: 2,
  DEFAULT_OFFSET: 12,
  ESTIMATED_WIDTH: 170,
  ESTIMATED_HEIGHT: 80,
  Z_INDEX: 1000,
  CURSOR_DEFAULT_STROKE: '#666',
  CURSOR_DEFAULT_WIDTH: 1,
  CURSOR_DEFAULT_DASH: '4 4',
};

export interface TooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: TooltipLabel;
}

type SortFn = (a: TooltipPayloadItem, b: TooltipPayloadItem) => number;

export interface TooltipProps {
  content?: React.ReactElement | ((props: TooltipContentProps) => React.ReactNode);
  formatter?: (value: number | null, name: string, item: TooltipPayloadItem) => React.ReactNode | [React.ReactNode, React.ReactNode];
  labelFormatter?: (label: TooltipLabel) => React.ReactNode;
  cursor?: boolean | { stroke?: string; strokeWidth?: number; strokeDasharray?: string };
  itemSorter?: 'value' | 'name' | SortFn;
  filterNull?: boolean;
  reverseDirection?: boolean | { x?: boolean; y?: boolean };
  position?: { x?: number; y?: number };
  offset?: number;
  sticky?: boolean;
  ariaLive?: 'off' | 'polite' | 'assertive';
  a11yLabelFormatter?: (label: TooltipLabel | undefined, payload: TooltipPayloadItem[]) => string;
  a11ySummaryFormatter?: (payload: TooltipPayloadItem[]) => string;
  a11yIncludeSummary?: boolean;
  hideA11yRegion?: boolean;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

interface TooltipPosition {
  x: number;
  y: number;
}

export function Tooltip({
  content,
  formatter,
  labelFormatter,
  cursor = true,
  filterNull = true,
  itemSorter,
  reverseDirection,
  position,
  offset = TOOLTIP_CONSTANTS.DEFAULT_OFFSET,
  sticky = false,
  ariaLive = 'polite',
  a11yLabelFormatter,
  a11ySummaryFormatter,
  a11yIncludeSummary = false,
  hideA11yRegion = false,
  wrapperClassName,
  wrapperStyle,
  contentClassName,
  contentStyle,
  labelStyle,
  itemStyle,
}: TooltipProps) {
  const { data, width, height, margin, innerWidth, innerHeight } = useChartLayoutContext();
  const { getXScale, getYScale, xAxis } = useChartScaleContext();
  const { ctx, overlayCtx, registerRender, requestRender, requestOverlayRender } = useChartRenderContext();
  const {
    pointer,
    hoveredIndex,
    setHoveredIndex,
    setPointer,
    getTooltipPayload,
    getTooltipIndexFromMouse,
    registerTooltipIndexResolver,
    registerShouldClearOnLeave,
  } = useChartInteractionContext();

  const pointsRef = useRef(projectPoints({ data: [], margin, xAxis, getXScale, getYScale }));
  const isLockedRef = useRef(false);

  const reverse = useMemo(() => toReverseConfig(reverseDirection), [reverseDirection]);

  useEffect(() => {
    if (!data.length) {
      pointsRef.current = [];
      isLockedRef.current = false;
      setHoveredIndex(null);
      setPointer(null);
      requestOverlayRender();
      return;
    }

    pointsRef.current = projectPoints({ data, margin, xAxis, getXScale, getYScale });
    requestRender();
  }, [data, margin, xAxis, getXScale, getYScale, requestRender, requestOverlayRender, setHoveredIndex, setPointer]);

  useEffect(() => {
    if (!xAxis) return;
    return registerTooltipIndexResolver((mouseX, mouseY) => {
      const points = pointsRef.current;
      if (!points.length) return null;
      const closest = findClosestPointByX(points, mouseX);
      return closest?.index ?? null;
    });
  }, [registerTooltipIndexResolver, xAxis]);

  useEffect(() => {
    return registerShouldClearOnLeave(() => sticky && isLockedRef.current);
  }, [registerShouldClearOnLeave, sticky]);

  useEffect(() => {
    const eventCanvas = (overlayCtx ?? ctx)?.canvas as HTMLCanvasElement | undefined;
    if (!eventCanvas) return;

    const canvas = eventCanvas;
    const handleClick = (event: MouseEvent) => {
      if (!sticky) return;

      const { x: mouseX, y: mouseY } = getRelativePosition(event.clientX, event.clientY, canvas);

      if (isLockedRef.current) {
        isLockedRef.current = false;
        setHoveredIndex(null);
        setPointer(null);
        requestOverlayRender();
        return;
      }

      const activeIndex = getTooltipIndexFromMouse(mouseX, mouseY);
      if (activeIndex !== null && Number.isFinite(activeIndex) && activeIndex >= 0) {
        isLockedRef.current = true;
        setHoveredIndex(activeIndex);
        setPointer({ x: mouseX, y: mouseY });
      }
      requestOverlayRender();
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [ctx, overlayCtx, sticky, getTooltipIndexFromMouse, setHoveredIndex, setPointer, requestOverlayRender]);

  useEffect(() => {
    if (!sticky) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isLockedRef.current) return;

      isLockedRef.current = false;
      setHoveredIndex(null);
      setPointer(null);
      requestOverlayRender();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sticky, setHoveredIndex, setPointer, requestOverlayRender]);

  const tooltipProps = useMemo(() => {
    if (!data.length || hoveredIndex === null || hoveredIndex < 0 || hoveredIndex >= data.length) {
      return { active: false, payload: [] as TooltipPayloadItem[], label: undefined as unknown as TooltipLabel };
    }

    const rawPayload = getTooltipPayload(hoveredIndex);
    const filteredPayload = filterNull
      ? rawPayload.filter((item) => item.value !== null)
      : rawPayload;
    const sortedPayload = sortPayload(filteredPayload, itemSorter);

    const item = data[hoveredIndex] ?? {};
    const rawLabel = xAxis?.dataKey
      ? (typeof xAxis.dataKey === 'function'
        ? xAxis.dataKey(item, hoveredIndex)
        : item[xAxis.dataKey as string])
      : item?.name ?? resolveXValue(item, hoveredIndex, xAxis);

    return {
      active: true,
      payload: sortedPayload,
      label: typeof rawLabel === 'number' || typeof rawLabel === 'string'
        ? rawLabel
        : String(rawLabel),
    };
  }, [data, hoveredIndex, getTooltipPayload, filterNull, itemSorter, xAxis]);

  const cursorPoint = useMemo((): { x: number; y: number; value: number; index: number } | null => {
    if (hoveredIndex === null || !tooltipProps.active) return null;
    const payloadAnchor = tooltipProps.payload?.find((i) => i.anchor)?.anchor;
    if (payloadAnchor) {
      return { x: payloadAnchor.x, y: payloadAnchor.y, value: 0, index: hoveredIndex };
    }
    const point = pointsRef.current.find((p) => p.index === hoveredIndex);
    return point ?? null;
  }, [hoveredIndex, tooltipProps.active, tooltipProps.payload]);

  const tooltipPosition = useMemo((): TooltipPosition => {
    if (!pointer || hoveredIndex === null || !tooltipProps.active) {
      return { x: 0, y: 0 };
    }

    const fixedX = position?.x;
    const fixedY = position?.y;
    const payloadAnchor = tooltipProps.payload?.find((i) => i.anchor)?.anchor;
    const point = pointsRef.current.find((p) => p.index === hoveredIndex);
    const anchorX = payloadAnchor?.x ?? point?.x ?? pointer.x;
    const anchorY = payloadAnchor?.y ?? point?.y ?? pointer.y;
    const nextX = fixedX
      ?? (reverse.x
        ? anchorX - offset - TOOLTIP_CONSTANTS.ESTIMATED_WIDTH
        : anchorX + offset);
    const nextY = fixedY
      ?? (reverse.y
        ? anchorY + offset
        : anchorY - offset - TOOLTIP_CONSTANTS.ESTIMATED_HEIGHT);

    return {
      x: Math.max(0, Math.min(nextX, width - TOOLTIP_CONSTANTS.ESTIMATED_WIDTH)),
      y: Math.max(0, Math.min(nextY, height - TOOLTIP_CONSTANTS.ESTIMATED_HEIGHT)),
    };
  }, [pointer, hoveredIndex, tooltipProps.active, tooltipProps.payload, position, reverse, offset, width, height]);

  const drawCtx = overlayCtx ?? ctx;

  useEffect(() => {
    if (!drawCtx) return;

    const render = () => {
      const point = cursorPoint;
      if (!point) return;

      try {
        drawCtx.save();
        drawCrosshair({
          ctx: drawCtx,
          point,
          margin,
          innerWidth,
          innerHeight,
          cursor,
          defaults: {
            stroke: TOOLTIP_CONSTANTS.CURSOR_DEFAULT_STROKE,
            strokeWidth: TOOLTIP_CONSTANTS.CURSOR_DEFAULT_WIDTH,
            strokeDasharray: TOOLTIP_CONSTANTS.CURSOR_DEFAULT_DASH,
          },
        });

        drawActiveDot({
          ctx: drawCtx,
          point,
          radius: TOOLTIP_CONSTANTS.POINT_RADIUS,
          fill: '#fff',
          stroke: '#3b82f6',
          lineWidth: TOOLTIP_CONSTANTS.POINT_STROKE_WIDTH,
        });
        drawCtx.restore();
      } catch (error) {
        console.error('Tooltip render error:', error);
      }
    };

    return registerRender(render, { layer: LayerOrder.tooltip });
  }, [drawCtx, cursor, cursorPoint, innerHeight, innerWidth, margin, registerRender]);

  const activePayload = tooltipProps.payload ?? [];
  const isVisible = tooltipProps.active;
  const a11yText = tooltipProps.active && isVisible
    ? (a11yLabelFormatter
      ? a11yLabelFormatter(tooltipProps.label, activePayload)
      : [
          tooltipProps.label !== undefined ? `Label: ${nodeToText(formatTooltipLabel(tooltipProps.label, xAxis))}` : '',
          payloadToA11yText(activePayload, formatter),
          a11yIncludeSummary
            ? (a11ySummaryFormatter
              ? a11ySummaryFormatter(activePayload)
              : (() => {
                  const total = activePayload.reduce((sum, item) => {
                    return sum + (typeof item.value === 'number' ? item.value : 0);
                  }, 0);
                  return `Total: ${total.toFixed(2)}`;
                })())
            : '',
        ].filter(Boolean).join('. '))
    : '';

  if (!isVisible || !tooltipProps.active) {
    if (hideA11yRegion) return null;
    return (
      <div
        role="status"
        aria-live={ariaLive}
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {a11yText}
      </div>
    );
  }

  if (content) {
    if (typeof content === 'function') {
      return content(tooltipProps);
    }
    if (isValidElement(content)) {
      return cloneElement(content, tooltipProps);
    }
    return content;
  }

  return (
    <>
      {!hideA11yRegion && (
        <div
          role="status"
          aria-live={ariaLive}
          aria-atomic="true"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {a11yText}
        </div>
      )}
      <div
        className={wrapperClassName}
        style={{
          position: 'absolute',
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          pointerEvents: 'none',
          zIndex: TOOLTIP_CONSTANTS.Z_INDEX,
          ...wrapperStyle,
        }}
      >
        <div
          className={contentClassName}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '10px 12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            fontSize: '13px',
            fontFamily: 'sans-serif',
            ...contentStyle,
          }}
        >
          {tooltipProps.label !== undefined && (
              <div style={{ fontWeight: 600, marginBottom: '8px', color: '#1a1a1a', ...labelStyle }}>
              {labelFormatter ? labelFormatter(tooltipProps.label) : formatTooltipLabel(tooltipProps.label, xAxis)}
              </div>
            )}

          {tooltipProps.payload?.map((item) => {
            const valueFormatter = item.formatter ?? formatter;
            const formatted = valueFormatter ? valueFormatter(item.value, item.name, item) : null;
            const valueNode = Array.isArray(formatted)
              ? formatted[0]
              : formatted ?? (item.value === null ? '-' : item.value.toFixed(2));
            const nameNode = Array.isArray(formatted) ? formatted[1] : item.name;

            return (
              <div key={`${item.dataKey}-${item.name}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', ...itemStyle }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: item.color ?? '#3b82f6',
                  }}
                />
                <span style={{ color: '#666' }}>{nameNode}:</span>
                <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{valueNode}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
