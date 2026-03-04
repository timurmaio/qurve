import { cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  drawActiveDot,
  drawCrosshair,
  findClosestPointByX,
  projectPoints,
  resolveXValue,
} from '@qurve/core';
import { useChartContext } from './chart/chartContext';
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
  RENDER_LAYER: 1000,
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
  wrapperStyle?: React.CSSProperties;
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
  wrapperStyle,
  contentStyle,
  labelStyle,
  itemStyle,
}: TooltipProps) {
  const {
    data,
    width,
    height,
    margin,
    innerWidth,
    innerHeight,
    getXScale,
    getYScale,
    xAxis,
    ctx,
    registerRender,
    requestRender,
    subscribeToMouse,
    setHoveredIndex,
    getTooltipPayload,
    getTooltipIndexFromMouse,
  } = useChartContext();

  const pointsRef = useRef(projectPoints({ data: [], margin, xAxis, getXScale, getYScale }));
  const hoveredPointRef = useRef<(typeof pointsRef.current)[number] | null>(null);
  const tooltipDataRef = useRef<TooltipContentProps>({ active: false, payload: [] });
  const tooltipPositionRef = useRef<TooltipPosition>({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);
  const isLockedRef = useRef(false);
  const [, forceUpdate] = useState({});

  const reverse = useMemo(() => toReverseConfig(reverseDirection), [reverseDirection]);

  useEffect(() => {
    if (!data.length) {
      pointsRef.current = [];
      isVisibleRef.current = false;
      isLockedRef.current = false;
      tooltipDataRef.current = { active: false, payload: [] };
      setHoveredIndex(null);
      requestRender();
      forceUpdate({});
      return;
    }

    pointsRef.current = projectPoints({ data, margin, xAxis, getXScale, getYScale });
    requestRender();
  }, [data, margin, xAxis, getXScale, getYScale, requestRender, setHoveredIndex]);

  useEffect(() => {
    if (!ctx) return;

    const updateTooltipFromMouse = (mouseX: number, mouseY: number) => {
      const customIndex = getTooltipIndexFromMouse(mouseX, mouseY);
      const useCustomIndex = customIndex !== null;
      const closestPoint = useCustomIndex
        ? null
        : findClosestPointByX(pointsRef.current, mouseX);
      const activeIndex = useCustomIndex ? customIndex : (closestPoint?.index ?? null);
      hoveredPointRef.current = useCustomIndex ? null : closestPoint;

      if (activeIndex === null) {
        if (isVisibleRef.current) {
          isVisibleRef.current = false;
          tooltipDataRef.current = { active: false, payload: [] };
          setHoveredIndex(null);
          requestRender();
          forceUpdate({});
        }
        return null;
      }

      const rawPayload = getTooltipPayload(activeIndex);
      const filteredPayload = filterNull
        ? rawPayload.filter((item) => item.value !== null)
        : rawPayload;
      const sortedPayload = sortPayload(filteredPayload, itemSorter);

      const item = data[activeIndex] ?? {};
      const rawLabel = xAxis?.dataKey
        ? (typeof xAxis.dataKey === 'function'
          ? xAxis.dataKey(item, activeIndex)
          : item[xAxis.dataKey as string])
        : item?.name ?? resolveXValue(item, activeIndex, xAxis);

      tooltipDataRef.current = {
        active: true,
        payload: sortedPayload,
        label: typeof rawLabel === 'number' || typeof rawLabel === 'string'
          ? rawLabel
          : String(rawLabel),
      };

      const fixedX = position?.x;
      const fixedY = position?.y;
      const payloadAnchor = sortedPayload.find((item) => item.anchor)?.anchor;
      const anchorX = payloadAnchor?.x ?? closestPoint?.x ?? mouseX;
      const anchorY = payloadAnchor?.y ?? closestPoint?.y ?? mouseY;
      const nextX = fixedX
        ?? (reverse.x
          ? anchorX - offset - TOOLTIP_CONSTANTS.ESTIMATED_WIDTH
          : anchorX + offset);
      const nextY = fixedY
        ?? (reverse.y
          ? anchorY + offset
          : anchorY - offset - TOOLTIP_CONSTANTS.ESTIMATED_HEIGHT);

      tooltipPositionRef.current = {
        x: Math.max(0, Math.min(nextX, width - TOOLTIP_CONSTANTS.ESTIMATED_WIDTH)),
        y: Math.max(0, Math.min(nextY, height - TOOLTIP_CONSTANTS.ESTIMATED_HEIGHT)),
      };

      setHoveredIndex(activeIndex);
      requestRender();

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        forceUpdate({});
      } else {
        forceUpdate({});
      }

      return activeIndex;
    };

    const handleMouseMove = (mouseX: number, mouseY: number) => {
      if (sticky && isLockedRef.current) return;
      updateTooltipFromMouse(mouseX, mouseY);
    };

    const handleClick = (event: MouseEvent) => {
      if (!sticky) return;

      const canvas = ctx.canvas as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (isLockedRef.current) {
        isLockedRef.current = false;
        isVisibleRef.current = false;
        tooltipDataRef.current = { active: false, payload: [] };
        hoveredPointRef.current = null;
        setHoveredIndex(null);
        requestRender();
        forceUpdate({});
        return;
      }

      const activeIndex = updateTooltipFromMouse(mouseX, mouseY);
      if (activeIndex !== null) {
        isLockedRef.current = true;
      }
    };

    const handleMouseLeave = () => {
      if (sticky && isLockedRef.current) return;
      hoveredPointRef.current = null;
      tooltipDataRef.current = { active: false, payload: [] };
      isVisibleRef.current = false;
      setHoveredIndex(null);
      requestRender();
      forceUpdate({});
    };

    const unsubscribe = subscribeToMouse(handleMouseMove);
    const canvas = ctx.canvas as HTMLCanvasElement;
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!sticky) return;
      if (event.key !== 'Escape' || !isLockedRef.current) return;

      isLockedRef.current = false;
      isVisibleRef.current = false;
      tooltipDataRef.current = { active: false, payload: [] };
      hoveredPointRef.current = null;
      setHoveredIndex(null);
      requestRender();
      forceUpdate({});
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    ctx,
    data,
    filterNull,
    getTooltipPayload,
    getTooltipIndexFromMouse,
    height,
    itemSorter,
    offset,
    position?.x,
    position?.y,
    requestRender,
    reverse.x,
    reverse.y,
    setHoveredIndex,
    sticky,
    subscribeToMouse,
    width,
    xAxis,
  ]);

  useEffect(() => {
    if (!ctx) return;

    const render = () => {
      const point = hoveredPointRef.current;
      if (!point) return;

      try {
        ctx.save();
        drawCrosshair({
          ctx,
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
          ctx,
          point,
          radius: TOOLTIP_CONSTANTS.POINT_RADIUS,
          fill: '#fff',
          stroke: '#3b82f6',
          lineWidth: TOOLTIP_CONSTANTS.POINT_STROKE_WIDTH,
        });
        ctx.restore();
      } catch (error) {
        console.error('Tooltip render error:', error);
      }
    };

    return registerRender(render, { layer: TOOLTIP_CONSTANTS.RENDER_LAYER });
  }, [ctx, cursor, innerHeight, innerWidth, margin, registerRender]);

  const tooltipProps = tooltipDataRef.current;
  const activePayload = tooltipProps.payload ?? [];
  const a11yText = tooltipProps.active && isVisibleRef.current
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

  if (!isVisibleRef.current || !tooltipProps.active) {
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
        style={{
          position: 'absolute',
          left: tooltipPositionRef.current.x,
          top: tooltipPositionRef.current.y,
          pointerEvents: 'none',
          zIndex: TOOLTIP_CONSTANTS.Z_INDEX,
          ...wrapperStyle,
        }}
      >
        <div
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
