import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { drawBars, projectPoints, resolveYValue, LayerOrder } from '@qurve/core';
import type { BarRect, CellOverride } from '@qurve/core';
import { CELL_TYPE } from './Cell';
import {
  useChartInteractionContext,
  useChartLayoutContext,
  useChartRenderContext,
  useChartScaleContext,
  useChartSeriesContext,
} from '../chart/chartContext';
import type { DataKey, TooltipPayloadItem } from '../chart/chartContext';
import {
  getBaseValue,
  clamp,
  normalizeHoverOpacity,
  stackKey,
  isStacked,
  resolveRadius,
  hasSameSign,
  resolveStackedRadius,
} from '@qurve/core';

const BAR_CONSTANTS = {
  DEFAULT_STROKE_WIDTH: 0,
  DEFAULT_HOVER_OPACITY: 0.5,
  DEFAULT_BAND_RATIO: 0.72,
  DEFAULT_SLOT_PADDING_RATIO: 0.12,
  DEFAULT_SINGLE_BAR_RATIO: 0.62,
};

export interface BarProps {
  dataKey: DataKey;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  barSize?: number;
  maxBarSize?: number;
  minPointSize?: number;
  stackId?: string | number;
  radius?: number | [number, number, number, number];
  hoverOpacity?: number;
  name?: string;
  tooltipName?: string;
  tooltipFormatter?: (value: number | null, name: string, item: TooltipPayloadItem) => React.ReactNode | [React.ReactNode, React.ReactNode];
  children?: ReactNode;
}

interface BarGeometry extends BarRect {
  value: number;
  index: number;
}

interface Slot {
  key: string;
  stackId?: string | number;
}

export function Bar({
  dataKey,
  fill: fillProp,
  stroke,
  strokeWidth = BAR_CONSTANTS.DEFAULT_STROKE_WIDTH,
  barSize,
  maxBarSize,
  minPointSize,
  stackId,
  radius,
  hoverOpacity = BAR_CONSTANTS.DEFAULT_HOVER_OPACITY,
  name,
  tooltipName,
  tooltipFormatter,
  children,
}: BarProps) {
  const { data, margin, innerWidth, getSeriesColor } = useChartLayoutContext();
  const { getXScale, getYScale, xAxis } = useChartScaleContext();
  const { registerRender, ctx, requestRender } = useChartRenderContext();
  const { registerTooltipSeries, hoveredIndex } = useChartInteractionContext();
  const {
    registerBarSeries,
    getBarSeriesRegistrations,
    barSeriesVersion,
    registerLegendItem,
    isSeriesVisible,
    legendVersion,
  } = useChartSeriesContext();
  const fill = fillProp ?? getSeriesColor();

  const cellOverrides = useMemo((): CellOverride[] => {
    const items: CellOverride[] = [];
    if (!children) return items;
    const arr = Array.isArray(children) ? children : [children];
    for (const child of arr) {
      if (child && typeof child === 'object' && 'type' in child) {
        const c = child as { type?: { [CELL_TYPE]?: boolean }; props?: CellOverride };
        if ((c.type as { [CELL_TYPE]?: boolean })?.[CELL_TYPE] && c.props) {
          items.push({
            fill: c.props.fill,
            stroke: c.props.stroke,
            strokeWidth: c.props.strokeWidth,
          });
        }
      }
    }
    return items;
  }, [children]);

  const seriesId = useMemo(() => Symbol('bar-series'), []);
  const barsRef = useRef<BarGeometry[]>([]);
  const hoveredIndexRef = useRef<number | null>(null);
  const seriesName = tooltipName ?? name ?? (typeof dataKey === 'string' ? dataKey : 'value');
  const payloadDataKey = typeof dataKey === 'string' ? dataKey : 'value';
  const normalizedHoverOpacity = normalizeHoverOpacity(hoverOpacity);

  useEffect(() => {
    return registerLegendItem({
      id: seriesId,
      name: seriesName,
      color: fill,
      type: 'bar',
    });
  }, [registerLegendItem, seriesId, seriesName, fill]);

  useEffect(() => {
    const getValue = (item: Record<string, unknown>, index: number): number => {
      return resolveYValue(item, index, dataKey);
    };

    return registerBarSeries({
      id: seriesId,
      stackId,
      getValue,
    });
  }, [registerBarSeries, seriesId, stackId, dataKey]);

  useEffect(() => {
    if (!ctx || !data.length || innerWidth <= 0) {
      barsRef.current = [];
      requestRender();
      return;
    }

    const points = projectPoints({
      data,
      margin,
      xAxis,
      dataKey,
      getXScale,
      getYScale,
    });

    if (points.length === 0) {
      barsRef.current = [];
      requestRender();
      return;
    }

    const registrations = getBarSeriesRegistrations();
    const ownIndex = registrations.findIndex((item) => item.id === seriesId);
    if (ownIndex < 0) {
      barsRef.current = [];
      requestRender();
      return;
    }

    const slots: Slot[] = [];
    const seenSlots = new Set<string>();

    for (const registration of registrations) {
      const key = isStacked(registration.stackId)
        ? stackKey(registration.stackId)
        : `single:${String(registration.id)}`;

      if (seenSlots.has(key)) continue;
      seenSlots.add(key);
      slots.push({ key, stackId: registration.stackId });
    }

    const ownSlotKey = isStacked(stackId)
      ? stackKey(stackId)
      : `single:${String(seriesId)}`;
    const ownSlotIndex = Math.max(0, slots.findIndex((slot) => slot.key === ownSlotKey));
    const slotCount = Math.max(1, slots.length);

    const yScale = getYScale(dataKey);
    const scaleDomain = (yScale as { domain?: () => [number, number] }).domain?.();
    const domain: [number, number] = scaleDomain ?? [0, 100];
    const baseValue = getBaseValue(domain);
    const baseY = margin.top + yScale(baseValue);

    let spacing = innerWidth;
    if (points.length > 1) {
      let minDelta = Infinity;
      for (let index = 1; index < points.length; index++) {
        const delta = Math.abs(points[index].x - points[index - 1].x);
        if (delta > 0 && delta < minDelta) {
          minDelta = delta;
        }
      }

      if (Number.isFinite(minDelta)) spacing = minDelta;
    }

    const baseBandWidth = points.length > 1
      ? spacing * BAR_CONSTANTS.DEFAULT_BAND_RATIO
      : innerWidth * BAR_CONSTANTS.DEFAULT_SINGLE_BAR_RATIO;
    const slotWidth = baseBandWidth / slotCount;
    const autoBarWidth = slotWidth * (1 - BAR_CONSTANTS.DEFAULT_SLOT_PADDING_RATIO);
    const maxAllowedWidth = Number.isFinite(maxBarSize)
      ? Math.max(1, Math.min(slotWidth, maxBarSize as number))
      : slotWidth;
    const width = Math.max(1, Math.min(maxAllowedWidth, barSize ?? autoBarWidth));
    const minVisibleHeight = Number.isFinite(minPointSize)
      ? Math.max(0, minPointSize as number)
      : 0;

    const leftBound = margin.left;
    const rightBound = margin.left + innerWidth;

    const stackPredecessors = isStacked(stackId)
      ? registrations
          .slice(0, ownIndex)
          .filter((registration) => registration.stackId === stackId)
      : [];

    const stackFollowers = isStacked(stackId)
      ? registrations
          .slice(ownIndex + 1)
          .filter((registration) => registration.stackId === stackId)
      : [];

    const nextBars: BarGeometry[] = points.map((point, index) => {
      const item = data[index] ?? {};
      const value = resolveYValue(item, index, dataKey);

      let start = baseValue;
      let end = value;
      let isOuterSegment = true;

      if (isStacked(stackId)) {
        let positiveStart = baseValue;
        let negativeStart = baseValue;

        for (const predecessor of stackPredecessors) {
          const previousValue = predecessor.getValue(item, index);
          if (previousValue >= 0) {
            positiveStart += previousValue;
          } else {
            negativeStart += previousValue;
          }
        }

        if (value >= 0) {
          start = positiveStart;
          end = positiveStart + value;
        } else {
          start = negativeStart;
          end = negativeStart + value;
        }

        const sign: 'positive' | 'negative' = value >= 0 ? 'positive' : 'negative';
        isOuterSegment = !stackFollowers.some((follower) => {
          const followerValue = follower.getValue(item, index);
          return hasSameSign(followerValue, sign);
        });
      }

      const startY = margin.top + yScale(start);
      const endY = isStacked(stackId) ? margin.top + yScale(end) : point.y;
      const rawHeight = Math.abs(endY - startY);
      const targetHeight = value !== 0 && minVisibleHeight > 0
        ? Math.max(rawHeight, minVisibleHeight)
        : rawHeight;
      const adjustedEndY = endY <= startY ? startY - targetHeight : startY + targetHeight;
      const height = Math.max(1, targetHeight);

      const bandStart = point.x - baseBandWidth / 2;
      const slotStart = bandStart + ownSlotIndex * slotWidth;
      const x = clamp(slotStart + (slotWidth - width) / 2, leftBound, rightBound - width);

      return {
        x,
        y: Math.min(startY, adjustedEndY),
        width,
        height,
        radius: isStacked(stackId)
          ? resolveStackedRadius(radius, value, isOuterSegment)
          : resolveRadius(radius, adjustedEndY <= startY),
        value,
        index,
      };
    });

    barsRef.current = nextBars;
    requestRender();
  }, [
    ctx,
    data,
    margin,
    innerWidth,
    xAxis,
    dataKey,
    getXScale,
    getYScale,
    barSize,
    maxBarSize,
    minPointSize,
    stackId,
    radius,
    getBarSeriesRegistrations,
    barSeriesVersion,
    seriesId,
    requestRender,
  ]);

  useEffect(() => {
    return registerTooltipSeries((index) => {
      if (!isSeriesVisible(seriesId)) return null;
      const bar = barsRef.current[index];
      if (!bar) return null;

      return {
        dataKey: payloadDataKey,
        name: seriesName,
        value: Number.isFinite(bar.value) ? bar.value : null,
        color: fill,
        formatter: tooltipFormatter,
        anchor: { x: bar.x + bar.width / 2, y: bar.y },
      };
    }, { layer: LayerOrder.bar });
  }, [registerTooltipSeries, payloadDataKey, seriesName, fill, tooltipFormatter, isSeriesVisible, seriesId, legendVersion]);

  useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
    requestRender();
  }, [hoveredIndex, requestRender]);

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      const bars = barsRef.current;
      if (bars.length === 0) return;

      try {
        if (!isSeriesVisible(seriesId)) return;
        drawBars({
          ctx,
          bars,
          fill,
          stroke,
          strokeWidth,
          hoveredIndex: hoveredIndexRef.current,
          hoverOpacity: normalizedHoverOpacity,
          cellOverrides: cellOverrides.length > 0 ? cellOverrides : undefined,
        });
      } catch (error) {
        console.error('Bar render error:', error);
      }
    };

    return registerRender(render, { layer: LayerOrder.bar });
  }, [ctx, data, fill, stroke, strokeWidth, normalizedHoverOpacity, cellOverrides, registerRender, isSeriesVisible, seriesId, legendVersion]);

  return null;
}

