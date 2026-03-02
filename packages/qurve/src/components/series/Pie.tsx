import { useEffect, useMemo, useRef, useState } from 'react';
import { useChartContext } from '../chart/chartContext';
import type { DataKey, TooltipPayloadItem } from '../chart/chartContext';
import { drawPieSlices, type PieDrawSlice } from '../chart/core/drawPie';
import { resolveYValue } from '../chart/core/pointUtils';
import {
  pickColor,
  toNumber,
  normalizeName,
  normalizeAngle,
  isAngleInArc,
  formatDefaultLabel,
  distributeLabels,
  type PieNameKey,
  type PieLabelMode,
  type PieLabelContext,
  type PieLabelLayoutItem,
} from '../chart/core/pieMath';

const PIE_CONSTANTS = {
  DEFAULT_HOVER_OPACITY: 0.45,
  DEFAULT_PADDING_ANGLE: 0,
  DEFAULT_MIN_ANGLE: 0,
  DEFAULT_LABEL_OFFSET: 18,
  DEFAULT_LABEL_MIN_GAP: 14,
  DEFAULT_LABEL_LINE_WIDTH: 1,
  RENDER_LAYER: 45,
  LABEL_LINE_LAYER: 46,
  TOOLTIP_LAYER: 45,
};

type PieDataKey = DataKey;

export interface PieProps {
  dataKey: PieDataKey;
  nameKey?: PieNameKey;
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
  label?: boolean | ((slice: PieLabelContext) => React.ReactNode);
  labelMode?: PieLabelMode;
  labelFormatter?: (value: number, name: string, percent: number) => React.ReactNode;
  labelLine?: boolean;
  labelLineColor?: string;
  labelLineWidth?: number;
  labelOffset?: number;
  labelMinGap?: number;
  name?: string;
  tooltipName?: string;
  tooltipFormatter?: (value: number | null, name: string, item: TooltipPayloadItem) => React.ReactNode | [React.ReactNode, React.ReactNode];
}

interface PieSlice extends PieDrawSlice {
  midAngle: number;
}

function normalizeHoverOpacity(opacity: number): number {
  if (!Number.isFinite(opacity)) return PIE_CONSTANTS.DEFAULT_HOVER_OPACITY;
  return Math.max(0, Math.min(1, opacity));
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
  labelMode = 'namePercent',
  labelFormatter,
  labelLine = false,
  labelLineColor,
  labelLineWidth = PIE_CONSTANTS.DEFAULT_LABEL_LINE_WIDTH,
  labelOffset = PIE_CONSTANTS.DEFAULT_LABEL_OFFSET,
  labelMinGap = PIE_CONSTANTS.DEFAULT_LABEL_MIN_GAP,
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
  const legendColor = pickColor(0, fill, colors);
  const labelLineStroke = labelLineColor ?? stroke ?? '#94a3b8';

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

      const midAngleRad = ((slice.startAngle + slice.endAngle) / 2 * Math.PI) / 180;
      const anchorRadius = (slice.innerRadius + slice.outerRadius) / 2;
      const anchorX = slice.cx + Math.cos(midAngleRad) * anchorRadius;
      const anchorY = slice.cy + Math.sin(midAngleRad) * anchorRadius;

      return {
        dataKey: typeof dataKey === 'string' ? dataKey : 'value',
        name: slice.name,
        value: Number.isFinite(slice.value) ? slice.value : null,
        color: slice.color,
        formatter: tooltipFormatter,
        anchor: { x: anchorX, y: anchorY },
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

  const labelLayout = useMemo<PieLabelLayoutItem[]>(() => {
    if (!label || !isSeriesVisible(seriesId) || labelSlices.length === 0) return [];

    const total = labelSlices.reduce((sum, item) => sum + item.value, 0) || 1;
    const minY = margin.top + 8;
    const maxY = height - margin.bottom - 8;
    const horizontalGap = 8;
    const sideGap = Math.max(0, labelOffset * 0.35);
    const minGap = Math.max(8, labelMinGap);

    const leftItems: PieLabelLayoutItem[] = [];
    const rightItems: PieLabelLayoutItem[] = [];

    for (const slice of labelSlices) {
      const rad = (slice.midAngle * Math.PI) / 180;
      const percent = slice.value / total;
      const context: PieLabelContext = {
        index: slice.index,
        name: slice.name,
        value: slice.value,
        percent,
        color: slice.color,
      };

      const customNode = typeof label === 'function' ? label(context) : null;
      const content = customNode
        ?? (labelFormatter
          ? labelFormatter(slice.value, slice.name, percent)
          : formatDefaultLabel(labelMode, context));

      const side = Math.cos(rad) >= 0 ? 'right' : 'left';
      const lineStartX = slice.cx + Math.cos(rad) * slice.outerRadius;
      const lineStartY = slice.cy + Math.sin(rad) * slice.outerRadius;
      const lineBendX = slice.cx + Math.cos(rad) * (slice.outerRadius + sideGap);
      const lineBendY = slice.cy + Math.sin(rad) * (slice.outerRadius + sideGap);
      const baseY = slice.cy + Math.sin(rad) * (slice.outerRadius + labelOffset);
      const baseX = slice.cx
        + Math.cos(rad) * (slice.outerRadius + labelOffset)
        + (side === 'right' ? horizontalGap : -horizontalGap);

      const item: PieLabelLayoutItem = {
        key: `pie-label-${slice.index}`,
        x: baseX,
        y: baseY,
        anchor: side,
        content,
        lineStartX,
        lineStartY,
        lineBendX,
        lineBendY,
        lineEndX: baseX + (side === 'right' ? -3 : 3),
        lineEndY: baseY,
      };

      if (side === 'right') {
        rightItems.push(item);
      } else {
        leftItems.push(item);
      }
    }

    const sortByY = (a: PieLabelLayoutItem, b: PieLabelLayoutItem) => a.y - b.y;
    leftItems.sort(sortByY);
    rightItems.sort(sortByY);

    const resolvedLeft = distributeLabels(leftItems, minY, maxY, minGap);
    const resolvedRight = distributeLabels(rightItems, minY, maxY, minGap);

    return [...resolvedLeft, ...resolvedRight];
  }, [
    label,
    labelFormatter,
    labelMode,
    labelSlices,
    labelOffset,
    labelMinGap,
    isSeriesVisible,
    seriesId,
    margin,
    height,
  ]);

  useEffect(() => {
    if (!ctx || !labelLine || !label || !isSeriesVisible(seriesId) || labelLayout.length === 0) return;

    const renderLabelLines = () => {
      if (!isSeriesVisible(seriesId)) return;
      if (labelLayout.length === 0) return;

      ctx.save();
      ctx.strokeStyle = labelLineStroke;
      ctx.lineWidth = Math.max(0.5, labelLineWidth);

      for (const item of labelLayout) {
        ctx.beginPath();
        ctx.moveTo(item.lineStartX, item.lineStartY);
        ctx.lineTo(item.lineBendX, item.lineBendY);
        ctx.lineTo(item.lineEndX, item.lineEndY);
        ctx.stroke();
      }

      ctx.restore();
    };

    return registerRender(renderLabelLines, { layer: PIE_CONSTANTS.LABEL_LINE_LAYER });
  }, [
    ctx,
    label,
    labelLine,
    labelLayout,
    labelLineStroke,
    labelLineWidth,
    registerRender,
    isSeriesVisible,
    seriesId,
    legendVersion,
  ]);

  if (!label || !isSeriesVisible(seriesId)) return null;

  const labelNodes = labelLayout.map((item) => (
    <div
      key={item.key}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        transform: item.anchor === 'right' ? 'translate(0, -50%)' : 'translate(-100%, -50%)',
        textAlign: item.anchor,
        pointerEvents: 'none',
        fontSize: 11,
        color: '#334155',
        whiteSpace: 'nowrap',
      }}
    >
      {item.content}
    </div>
  ));

  return <>{labelNodes}</>;
}
