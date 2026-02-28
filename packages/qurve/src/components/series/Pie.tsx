import { useEffect, useMemo, useRef, useState } from 'react';
import { useChartContext } from '../chart/chartContext';
import type { DataKey, TooltipPayloadItem } from '../chart/chartContext';
import { drawPieSlices, type PieDrawSlice } from '../chart/core/drawPie';
import { resolveYValue } from '../chart/core/pointUtils';

const PIE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
];

const PIE_CONSTANTS = {
  DEFAULT_HOVER_OPACITY: 0.45,
  DEFAULT_PADDING_ANGLE: 0,
  DEFAULT_MIN_ANGLE: 0,
  RENDER_LAYER: 45,
  TOOLTIP_LAYER: 45,
};

type PieDataKey = DataKey;
type NameKey = string | ((data: Record<string, unknown>, index: number) => string);

export interface PieProps {
  dataKey: PieDataKey;
  nameKey?: NameKey;
  fill?: string;
  colors?: string[];
  stroke?: string;
  strokeWidth?: number;
  innerRadius?: number;
  outerRadius?: number;
  cx?: number;
  cy?: number;
  startAngle?: number;
  endAngle?: number;
  paddingAngle?: number;
  minAngle?: number;
  hoverOpacity?: number;
  label?: boolean | ((slice: { index: number; name: string; value: number; percent: number; color: string }) => React.ReactNode);
  labelFormatter?: (value: number, name: string, percent: number) => React.ReactNode;
  name?: string;
  tooltipName?: string;
  tooltipFormatter?: (value: number | null, name: string, item: TooltipPayloadItem) => React.ReactNode | [React.ReactNode, React.ReactNode];
}

interface PieSlice extends PieDrawSlice {
  midAngle: number;
}

function toNumber(value: number | undefined): number {
  if (value === undefined) return 0;
  return Number.isFinite(value) ? value : 0;
}

function normalizeHoverOpacity(opacity: number): number {
  if (!Number.isFinite(opacity)) return PIE_CONSTANTS.DEFAULT_HOVER_OPACITY;
  return Math.max(0, Math.min(1, opacity));
}

function normalizeName(item: Record<string, unknown>, index: number, nameKey?: NameKey): string {
  if (!nameKey) return `Slice ${index + 1}`;
  if (typeof nameKey === 'function') return String(nameKey(item, index));
  return String(item[nameKey] ?? `Slice ${index + 1}`);
}

function normalizeAngle(value: number): number {
  let angle = value % 360;
  if (angle < 0) angle += 360;
  return angle;
}

function isAngleInArc(angle: number, start: number, end: number): boolean {
  const normalizedAngle = normalizeAngle(angle);
  const normalizedStart = normalizeAngle(start);
  const normalizedEnd = normalizeAngle(end);

  if (normalizedStart <= normalizedEnd) {
    return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd;
  }

  return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
}

function pickColor(index: number, fill?: string, colors?: string[]): string {
  if (colors && colors.length > 0) {
    return colors[index % colors.length];
  }
  if (fill) return fill;
  return PIE_COLORS[index % PIE_COLORS.length];
}

export function Pie({
  dataKey,
  nameKey,
  fill,
  colors,
  stroke = '#ffffff',
  strokeWidth = 1,
  innerRadius,
  outerRadius,
  cx,
  cy,
  startAngle = 0,
  endAngle = 360,
  paddingAngle = PIE_CONSTANTS.DEFAULT_PADDING_ANGLE,
  minAngle = PIE_CONSTANTS.DEFAULT_MIN_ANGLE,
  hoverOpacity = PIE_CONSTANTS.DEFAULT_HOVER_OPACITY,
  label = false,
  labelFormatter,
  name,
  tooltipName,
  tooltipFormatter,
}: PieProps) {
  const {
    data,
    width,
    height,
    margin,
    registerRender,
    registerTooltipSeries,
    registerTooltipIndexResolver,
    registerLegendItem,
    isSeriesVisible,
    legendVersion,
    hoveredIndex,
    requestRender,
    ctx,
  } = useChartContext();

  const seriesId = useMemo(() => Symbol('pie-series'), []);
  const slicesRef = useRef<PieSlice[]>([]);
  const [labelSlices, setLabelSlices] = useState<PieSlice[]>([]);
  const hoverOpacityValue = normalizeHoverOpacity(hoverOpacity);
  const defaultSeriesName = tooltipName ?? name ?? (typeof dataKey === 'string' ? dataKey : 'Pie');
  const legendColor = colors?.[0] ?? fill ?? PIE_COLORS[0];

  useEffect(() => {
    return registerLegendItem({
      id: seriesId,
      name: defaultSeriesName,
      color: legendColor,
      type: 'pie',
    });
  }, [registerLegendItem, seriesId, defaultSeriesName, legendColor]);

  useEffect(() => {
    if (!ctx || !data.length) {
      slicesRef.current = [];
      setLabelSlices([]);
      requestRender();
      return;
    }

    const centerX = cx ?? margin.left + (width - margin.left - margin.right) / 2;
    const centerY = cy ?? margin.top + (height - margin.top - margin.bottom) / 2;
    const maxRadius = Math.max(1, Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2);
    const resolvedOuterRadius = toNumber(outerRadius) || maxRadius * 0.8;
    const resolvedInnerRadius = Math.max(0, Math.min(resolvedOuterRadius - 1, toNumber(innerRadius)));

    const values = data.map((item, index) => Math.max(0, resolveYValue(item, index, dataKey)));
    const total = values.reduce((sum, value) => sum + value, 0);
    const span = endAngle - startAngle;
    const absSpan = Math.abs(span);
    const direction = span >= 0 ? 1 : -1;
    const safePadding = Math.max(0, Math.min(Math.abs(paddingAngle), absSpan));
    const safeMinAngle = Math.max(0, Math.min(Math.abs(minAngle), absSpan));

    const activeCount = values.filter((value) => value > 0).length;
    const totalPadding = activeCount > 0 ? safePadding * activeCount : 0;
    const usableSpan = Math.max(0, absSpan - totalPadding);

    const slices: PieSlice[] = [];
    let cursor = startAngle;

    for (let index = 0; index < data.length; index++) {
      const value = values[index];
      if (value <= 0 || total <= 0) continue;

      const proportional = usableSpan * (value / total);
      const sliceSpan = Math.max(safeMinAngle, proportional);
      const sliceStart = cursor;
      const sliceEnd = sliceStart + sliceSpan * direction;
      const midAngle = sliceStart + (sliceSpan * direction) / 2;

      slices.push({
        index,
        value,
        name: normalizeName(data[index], index, nameKey),
        color: pickColor(index, fill, colors),
        startAngle: sliceStart,
        endAngle: sliceEnd,
        midAngle,
        cx: centerX,
        cy: centerY,
        innerRadius: resolvedInnerRadius,
        outerRadius: resolvedOuterRadius,
        stroke,
        strokeWidth,
      });

      cursor = sliceEnd + safePadding * direction;
    }

    slicesRef.current = slices;
    setLabelSlices(slices);
    requestRender();
  }, [
    ctx,
    data,
    dataKey,
    nameKey,
    fill,
    colors,
    stroke,
    strokeWidth,
    innerRadius,
    outerRadius,
    cx,
    cy,
    startAngle,
    endAngle,
    paddingAngle,
    minAngle,
    width,
    height,
    margin,
    requestRender,
  ]);

  useEffect(() => {
    return registerTooltipSeries((index) => {
      if (!isSeriesVisible(seriesId)) return null;
      const slice = slicesRef.current.find((item) => item.index === index);
      if (!slice) return null;

      return {
        dataKey: typeof dataKey === 'string' ? dataKey : 'value',
        name: slice.name,
        value: Number.isFinite(slice.value) ? slice.value : null,
        color: slice.color,
        formatter: tooltipFormatter,
      };
    }, { layer: PIE_CONSTANTS.TOOLTIP_LAYER });
  }, [registerTooltipSeries, dataKey, tooltipFormatter, isSeriesVisible, seriesId, legendVersion]);

  useEffect(() => {
    return registerTooltipIndexResolver((mouseX, mouseY) => {
      if (!isSeriesVisible(seriesId)) return null;

      const slices = slicesRef.current;
      if (slices.length === 0) return null;

      const { cx: centerX, cy: centerY } = slices[0];
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);

      for (const slice of slices) {
        if (distance < slice.innerRadius || distance > slice.outerRadius) continue;
        if (isAngleInArc(angle, slice.startAngle, slice.endAngle)) {
          return slice.index;
        }
      }

      return null;
    });
  }, [registerTooltipIndexResolver, isSeriesVisible, seriesId, legendVersion]);

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      if (!isSeriesVisible(seriesId)) return;
      const slices = slicesRef.current;
      if (slices.length === 0) return;

      drawPieSlices({
        ctx,
        slices,
        hoveredIndex,
        hoverOpacity: hoverOpacityValue,
      });
    };

    return registerRender(render, { layer: PIE_CONSTANTS.RENDER_LAYER });
  }, [ctx, data, registerRender, hoveredIndex, hoverOpacityValue, isSeriesVisible, seriesId, legendVersion]);

  if (!label || !isSeriesVisible(seriesId)) return null;

  const labelTotal = labelSlices.reduce((sum, item) => sum + item.value, 0) || 1;

  const labelNodes = labelSlices.map((slice) => {
    const mid = (slice.startAngle + slice.endAngle) / 2;
    const rad = (mid * Math.PI) / 180;
    const radius = slice.outerRadius + 12;
    const x = slice.cx + Math.cos(rad) * radius;
    const y = slice.cy + Math.sin(rad) * radius;
    const percent = slice.value / labelTotal;

    const customNode = typeof label === 'function'
      ? label({ index: slice.index, name: slice.name, value: slice.value, percent, color: slice.color })
      : null;
    const formatted = customNode
      ?? (labelFormatter
        ? labelFormatter(slice.value, slice.name, percent)
        : `${slice.name} ${(percent * 100).toFixed(0)}%`);

    return (
      <div
        key={`pie-label-${slice.index}`}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          fontSize: 11,
          color: '#334155',
          whiteSpace: 'nowrap',
        }}
      >
        {formatted}
      </div>
    );
  });

  return <>{labelNodes}</>;
}
