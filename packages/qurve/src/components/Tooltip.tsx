import { cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import { useChartContext } from './chart/chartContext';
import { drawActiveDot } from './chart/core/drawLine';
import { drawCrosshair } from './chart/core/drawCrosshair';
import { findClosestPointByX, projectPoints, resolveXValue } from './chart/core/pointUtils';
import type { TooltipPayloadItem } from './chart/chartContext';
import { toTimeNumber } from './chart/core/timeUtils';

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

type TooltipLabel = string | number;

function formatDefaultLabel(label: TooltipLabel, axisType: 'number' | 'category' | 'band' | 'time' | undefined): React.ReactNode {
  if (axisType !== 'time') return label;

  const value = toTimeNumber(label);
  if (value === null) return label;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

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
  wrapperStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

interface TooltipPosition {
  x: number;
  y: number;
}

function sortPayload(payload: TooltipPayloadItem[], sorter?: TooltipProps['itemSorter']): TooltipPayloadItem[] {
  if (!sorter) return payload;

  const next = [...payload];
  if (typeof sorter === 'function') {
    next.sort(sorter);
    return next;
  }

  if (sorter === 'value') {
    next.sort((a, b) => (b.value ?? Number.NEGATIVE_INFINITY) - (a.value ?? Number.NEGATIVE_INFINITY));
    return next;
  }

  next.sort((a, b) => a.name.localeCompare(b.name));
  return next;
}

function toReverseConfig(reverseDirection: TooltipProps['reverseDirection']): { x: boolean; y: boolean } {
  if (typeof reverseDirection === 'boolean') {
    return { x: reverseDirection, y: reverseDirection };
  }
  return {
    x: reverseDirection?.x ?? false,
    y: reverseDirection?.y ?? false,
  };
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
  const [, forceUpdate] = useState({});

  const reverse = useMemo(() => toReverseConfig(reverseDirection), [reverseDirection]);

  useEffect(() => {
    if (!data.length) {
      pointsRef.current = [];
      isVisibleRef.current = false;
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

    const handleMouseMove = (mouseX: number, mouseY: number) => {
      const customIndex = getTooltipIndexFromMouse(mouseX, mouseY);
      const closestPoint = customIndex === null
        ? findClosestPointByX(pointsRef.current, mouseX)
        : pointsRef.current.find((point) => point.index === customIndex) ?? null;
      const activeIndex = customIndex ?? closestPoint?.index ?? null;
      hoveredPointRef.current = closestPoint;

      if (activeIndex === null) {
        if (isVisibleRef.current) {
          isVisibleRef.current = false;
          tooltipDataRef.current = { active: false, payload: [] };
          setHoveredIndex(null);
          requestRender();
          forceUpdate({});
        }
        return;
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
      const anchorX = closestPoint?.x ?? mouseX;
      const anchorY = closestPoint?.y ?? mouseY;
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
    };

    const handleMouseLeave = () => {
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

    return () => {
      unsubscribe();
      canvas.removeEventListener('mouseleave', handleMouseLeave);
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

    return registerRender(render);
  }, [ctx, cursor, innerHeight, innerWidth, margin, registerRender]);

  const tooltipProps = tooltipDataRef.current;
  if (!isVisibleRef.current || !tooltipProps.active) return null;

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
            {labelFormatter ? labelFormatter(tooltipProps.label) : formatDefaultLabel(tooltipProps.label, xAxis?.type)}
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
  );
}
