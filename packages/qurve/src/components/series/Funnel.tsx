import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  buildFunnelTrapezoids,
  drawFunnel,
  findFunnelIndex,
  normalizeName,
  normalizeOpacity,
  pickColor,
  resolveYValue,
  LayerOrder,
  type FunnelTrapezoid,
  type PieNameKey,
} from '@qurve/core';
import { CELL_TYPE } from '../series/Cell';
import {
  useChartInteractionContext,
  useChartLayoutContext,
  useChartRenderContext,
  useChartSeriesContext,
} from '../chart/chartContext';
import type { DataKey, TooltipPayloadItem } from '../chart/chartContext';

const FUNNEL_CONSTANTS = {
  DEFAULT_HOVER_OPACITY: 0.45,
};

export interface FunnelProps {
  dataKey: DataKey;
  nameKey?: PieNameKey;
  fill?: string;
  colors?: string[];
  stroke?: string;
  strokeWidth?: number;
  lastShape?: 'trapezoid' | 'rectangle';
  hoverOpacity?: number;
  label?: boolean;
  name?: string;
  tooltipName?: string;
  tooltipFormatter?: (
    value: number | null,
    name: string,
    item: TooltipPayloadItem,
  ) => React.ReactNode | [React.ReactNode, React.ReactNode];
  children?: ReactNode;
}

export function Funnel({
  dataKey,
  nameKey,
  fill,
  colors,
  stroke,
  strokeWidth = 0,
  lastShape = 'trapezoid',
  hoverOpacity = FUNNEL_CONSTANTS.DEFAULT_HOVER_OPACITY,
  label = false,
  name,
  tooltipName,
  tooltipFormatter,
  children,
}: FunnelProps) {
  const { data, width, height, margin, colors: chartColors } = useChartLayoutContext();
  const { registerRender, ctx, requestRender } = useChartRenderContext();
  const { registerTooltipSeries, registerTooltipIndexResolver, hoveredIndex } = useChartInteractionContext();
  const { registerLegendItem, isSeriesVisible, legendVersion } = useChartSeriesContext();
  const resolvedColors = colors ?? chartColors;

  const cellOverrides = useMemo(() => {
    const items: Array<{ fill?: string; stroke?: string; strokeWidth?: number }> = [];
    if (!children) return items;
    const arr = Array.isArray(children) ? children : [children];
    for (const child of arr) {
      if (child && typeof child === 'object' && 'type' in child) {
        const c = child as {
          type?: { [CELL_TYPE]?: boolean };
          props?: { fill?: string; stroke?: string; strokeWidth?: number };
        };
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

  const seriesId = useMemo(() => Symbol('funnel-series'), []);
  const trapsRef = useRef<FunnelTrapezoid[]>([]);
  const [labelItems, setLabelItems] = useState<FunnelTrapezoid[]>([]);
  const seriesName = tooltipName ?? name ?? (typeof dataKey === 'string' ? dataKey : 'Funnel');
  const payloadDataKey = typeof dataKey === 'string' ? dataKey : 'value';
  const hoverOpacityValue = normalizeOpacity(hoverOpacity, FUNNEL_CONSTANTS.DEFAULT_HOVER_OPACITY);
  const legendColor = pickColor(0, fill, resolvedColors);

  useEffect(() => {
    return registerLegendItem({
      id: seriesId,
      name: seriesName,
      color: legendColor,
      type: 'funnel',
    });
  }, [registerLegendItem, seriesId, seriesName, legendColor]);

  useEffect(() => {
    if (!ctx || !data.length) {
      trapsRef.current = [];
      setLabelItems([]);
      requestRender();
      return;
    }

    const plotX = margin.left;
    const plotY = margin.top;
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const plotHeight = Math.max(0, height - margin.top - margin.bottom);

    const values = data.map((item, index) => Math.max(0, resolveYValue(item, index, dataKey)));
    const names = data.map((item, index) => normalizeName(item, index, nameKey));
    const colorList = data.map((_, index) => pickColor(index, fill, resolvedColors));

    const traps = buildFunnelTrapezoids({
      data,
      values,
      names,
      colors: colorList,
      cellOverrides: cellOverrides.length > 0 ? cellOverrides : undefined,
      plotX,
      plotY,
      plotWidth,
      plotHeight,
      stroke,
      strokeWidth,
      lastShape,
    });

    trapsRef.current = traps;
    setLabelItems(label ? traps : []);
    requestRender();
  }, [
    ctx,
    data,
    dataKey,
    nameKey,
    fill,
    resolvedColors,
    cellOverrides,
    stroke,
    strokeWidth,
    lastShape,
    label,
    width,
    height,
    margin,
    requestRender,
  ]);

  useEffect(() => {
    return registerTooltipIndexResolver((_mouseX, mouseY) => {
      return findFunnelIndex(trapsRef.current, mouseY);
    });
  }, [registerTooltipIndexResolver]);

  useEffect(() => {
    return registerTooltipSeries((index) => {
      if (!isSeriesVisible(seriesId)) return null;
      const trap = trapsRef.current.find((t) => t.index === index);
      if (!trap) return null;
      return {
        dataKey: payloadDataKey,
        name: trap.name,
        value: Number.isFinite(trap.value) ? trap.value : null,
        color: trap.color,
        formatter: tooltipFormatter,
        anchor: {
          x: trap.x + trap.topWidth / 2,
          y: trap.y + trap.height / 2,
        },
      };
    }, { layer: LayerOrder.funnel });
  }, [
    registerTooltipSeries,
    payloadDataKey,
    tooltipFormatter,
    isSeriesVisible,
    seriesId,
    legendVersion,
  ]);

  useEffect(() => {
    if (!ctx || !data.length) return;

    const render = () => {
      if (!isSeriesVisible(seriesId)) return;
      drawFunnel({
        ctx,
        trapezoids: trapsRef.current,
        hoveredIndex,
        hoverOpacity: hoverOpacityValue,
      });
    };

    return registerRender(render, { layer: LayerOrder.funnel });
  }, [
    ctx,
    data,
    hoveredIndex,
    hoverOpacityValue,
    registerRender,
    isSeriesVisible,
    seriesId,
    legendVersion,
  ]);

  if (!label || labelItems.length === 0 || !isSeriesVisible(seriesId)) {
    return null;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {labelItems.map((trap) => {
        const centerX = trap.x + trap.topWidth / 2;
        const halfMax = Math.max(trap.topWidth, trap.bottomWidth) / 2;
        return (
          <div
            key={`funnel-label-${trap.index}`}
            style={{
              position: 'absolute',
              left: centerX + halfMax + 8,
              top: trap.y + trap.height / 2,
              transform: 'translateY(-50%)',
              fontSize: 12,
              color: '#374151',
              whiteSpace: 'nowrap',
            }}
          >
            {trap.name}: {trap.value}
          </div>
        );
      })}
    </div>
  );
}
