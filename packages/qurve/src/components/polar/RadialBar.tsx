import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  buildRadialBarSectors,
  drawRadialBars,
  findRadialBarIndex,
  normalizeName,
  normalizeOpacity,
  pickColor,
  resolveYValue,
  toNumber,
  LayerOrder,
  type PieNameKey,
  type RadialBarSector,
} from '@qurve/core';
import { CELL_TYPE } from '../series/Cell';
import {
  useChartInteractionContext,
  useChartLayoutContext,
  useChartRenderContext,
  useChartSeriesContext,
} from '../chart/chartContext';
import type { DataKey, TooltipPayloadItem } from '../chart/chartContext';

const RADIAL_BAR_CONSTANTS = {
  DEFAULT_HOVER_OPACITY: 0.45,
  DEFAULT_START_ANGLE: 0,
  DEFAULT_END_ANGLE: 360,
};

export interface RadialBarProps {
  dataKey: DataKey;
  nameKey?: PieNameKey;
  fill?: string;
  colors?: string[];
  stroke?: string;
  strokeWidth?: number;
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  barSize?: number;
  background?: boolean | { fill?: string };
  hoverOpacity?: number;
  name?: string;
  tooltipName?: string;
  tooltipFormatter?: (
    value: number | null,
    name: string,
    item: TooltipPayloadItem,
  ) => React.ReactNode | [React.ReactNode, React.ReactNode];
  children?: ReactNode;
}

export function RadialBar({
  dataKey,
  nameKey,
  fill,
  colors,
  stroke,
  strokeWidth = 0,
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle = RADIAL_BAR_CONSTANTS.DEFAULT_START_ANGLE,
  endAngle = RADIAL_BAR_CONSTANTS.DEFAULT_END_ANGLE,
  barSize,
  background = false,
  hoverOpacity = RADIAL_BAR_CONSTANTS.DEFAULT_HOVER_OPACITY,
  name,
  tooltipName,
  tooltipFormatter,
  children,
}: RadialBarProps) {
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

  const seriesId = useMemo(() => Symbol('radial-bar-series'), []);
  const sectorsRef = useRef<RadialBarSector[]>([]);
  const seriesName = tooltipName ?? name ?? (typeof dataKey === 'string' ? dataKey : 'value');
  const payloadDataKey = typeof dataKey === 'string' ? dataKey : 'value';
  const hoverOpacityValue = normalizeOpacity(hoverOpacity, RADIAL_BAR_CONSTANTS.DEFAULT_HOVER_OPACITY);
  const legendColor = pickColor(0, fill, resolvedColors);

  useEffect(() => {
    return registerLegendItem({
      id: seriesId,
      name: seriesName,
      color: legendColor,
      type: 'radialBar',
    });
  }, [registerLegendItem, seriesId, seriesName, legendColor]);

  useEffect(() => {
    if (!ctx || !data.length) {
      sectorsRef.current = [];
      requestRender();
      return;
    }

    const centerX = cx ?? margin.left + (width - margin.left - margin.right) / 2;
    const centerY = cy ?? margin.top + (height - margin.top - margin.bottom) / 2;
    const maxRadius = Math.max(
      1,
      Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2,
    );
    const resolvedOuter = toNumber(outerRadius) || maxRadius * 0.8;
    const resolvedInner = Math.max(0, Math.min(resolvedOuter - 1, toNumber(innerRadius)));

    const values = data.map((item, index) => Math.max(0, resolveYValue(item, index, dataKey)));
    const names = data.map((item, index) => normalizeName(item, index, nameKey));
    const colorList = data.map((_, index) => pickColor(index, fill, resolvedColors));

    sectorsRef.current = buildRadialBarSectors({
      data,
      values,
      names,
      colors: colorList,
      cellOverrides: cellOverrides.length > 0 ? cellOverrides : undefined,
      cx: centerX,
      cy: centerY,
      innerRadius: resolvedInner,
      outerRadius: resolvedOuter,
      startAngle,
      endAngle,
      barSize,
      stroke,
      strokeWidth,
    });
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
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    barSize,
    width,
    height,
    margin,
    requestRender,
  ]);

  useEffect(() => {
    return registerTooltipIndexResolver((mouseX, mouseY) => {
      return findRadialBarIndex(sectorsRef.current, mouseX, mouseY);
    });
  }, [registerTooltipIndexResolver]);

  useEffect(() => {
    return registerTooltipSeries((index) => {
      if (!isSeriesVisible(seriesId)) return null;
      const sector = sectorsRef.current.find((s) => s.index === index);
      if (!sector) return null;
      const midAngle = (sector.startAngle + sector.endAngle) / 2;
      const midRadius = (sector.innerRadius + sector.outerRadius) / 2;
      const rad = (midAngle * Math.PI) / 180;
      return {
        dataKey: payloadDataKey,
        name: sector.name,
        value: Number.isFinite(sector.value) ? sector.value : null,
        color: sector.color,
        formatter: tooltipFormatter,
        anchor: {
          x: sector.cx + Math.cos(rad) * midRadius,
          y: sector.cy + Math.sin(rad) * midRadius,
        },
      };
    }, { layer: LayerOrder.radialBar });
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
      drawRadialBars({
        ctx,
        sectors: sectorsRef.current,
        hoveredIndex,
        hoverOpacity: hoverOpacityValue,
        background,
      });
    };

    return registerRender(render, { layer: LayerOrder.radialBar });
  }, [
    ctx,
    data,
    hoveredIndex,
    hoverOpacityValue,
    background,
    registerRender,
    isSeriesVisible,
    seriesId,
    legendVersion,
  ]);

  return null;
}
