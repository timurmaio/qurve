import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  buildTreemapRects,
  drawTreemap,
  findTreemapIndex,
  normalizeOpacity,
  pickColor,
  LayerOrder,
  type TreemapInputNode,
  type TreemapRect,
} from '@qurve/core';
import { CELL_TYPE } from '../series/Cell';
import {
  useChartInteractionContext,
  useChartLayoutContext,
  useChartRenderContext,
  useChartSeriesContext,
} from '../chart/chartContext';
import type { DataKey, TooltipPayloadItem } from '../chart/chartContext';

const TREEMAP_CONSTANTS = {
  DEFAULT_HOVER_OPACITY: 0.45,
  MIN_LABEL_WIDTH: 36,
  MIN_LABEL_HEIGHT: 18,
};

export interface TreemapProps {
  dataKey?: DataKey;
  nameKey?: string;
  fill?: string;
  colors?: string[];
  stroke?: string;
  strokeWidth?: number;
  padding?: number;
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

export function Treemap({
  dataKey = 'value',
  nameKey = 'name',
  fill,
  colors,
  stroke = '#fff',
  strokeWidth = 1,
  padding = 1,
  hoverOpacity = TREEMAP_CONSTANTS.DEFAULT_HOVER_OPACITY,
  label = false,
  name,
  tooltipName,
  tooltipFormatter,
  children,
}: TreemapProps) {
  const { data, width, height, margin, colors: chartColors } = useChartLayoutContext();
  const { registerRender, ctx, requestRender } = useChartRenderContext();
  const { registerTooltipSeries, registerTooltipIndexResolver, hoveredIndex } =
    useChartInteractionContext();
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

  const seriesId = useMemo(() => Symbol('treemap-series'), []);
  const rectsRef = useRef<TreemapRect[]>([]);
  const [labelItems, setLabelItems] = useState<TreemapRect[]>([]);
  const seriesName = tooltipName ?? name ?? 'Treemap';
  const payloadDataKey = typeof dataKey === 'string' ? dataKey : 'value';
  const hoverOpacityValue = normalizeOpacity(
    hoverOpacity,
    TREEMAP_CONSTANTS.DEFAULT_HOVER_OPACITY,
  );
  const legendColor = pickColor(0, fill, resolvedColors);

  useEffect(() => {
    return registerLegendItem({
      id: seriesId,
      name: seriesName,
      color: legendColor,
      type: 'treemap',
    });
  }, [registerLegendItem, seriesId, seriesName, legendColor]);

  useEffect(() => {
    if (!ctx || !data.length) {
      rectsRef.current = [];
      setLabelItems([]);
      requestRender();
      return;
    }

    const plotX = margin.left;
    const plotY = margin.top;
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const plotHeight = Math.max(0, height - margin.top - margin.bottom);
    const key = typeof dataKey === 'string' ? dataKey : 'value';

    const colorList = Array.from({ length: Math.max(data.length * 4, 8) }, (_, index) =>
      pickColor(index, fill, resolvedColors),
    );

    const rects = buildTreemapRects({
      data: data as TreemapInputNode[],
      dataKey: key,
      nameKey,
      colors: colorList,
      cellOverrides: cellOverrides.length > 0 ? cellOverrides : undefined,
      plotX,
      plotY,
      plotWidth,
      plotHeight,
      stroke,
      strokeWidth,
      padding,
    });

    rectsRef.current = rects;
    setLabelItems(label ? rects : []);
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
    padding,
    label,
    width,
    height,
    margin,
    requestRender,
  ]);

  useEffect(() => {
    return registerTooltipIndexResolver((mouseX, mouseY) => {
      return findTreemapIndex(rectsRef.current, mouseX, mouseY);
    });
  }, [registerTooltipIndexResolver]);

  useEffect(() => {
    return registerTooltipSeries(
      (index) => {
        if (!isSeriesVisible(seriesId)) return null;
        const rect = rectsRef.current.find((r) => r.index === index);
        if (!rect) return null;
        return {
          dataKey: payloadDataKey,
          name: rect.name,
          value: Number.isFinite(rect.value) ? rect.value : null,
          color: rect.color,
          formatter: tooltipFormatter,
          anchor: {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          },
        };
      },
      { layer: LayerOrder.treemap },
    );
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
      drawTreemap({
        ctx,
        rects: rectsRef.current,
        hoveredIndex,
        hoverOpacity: hoverOpacityValue,
      });
    };

    return registerRender(render, { layer: LayerOrder.treemap });
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
      {labelItems.map((rect) => {
        if (
          rect.width < TREEMAP_CONSTANTS.MIN_LABEL_WIDTH ||
          rect.height < TREEMAP_CONSTANTS.MIN_LABEL_HEIGHT
        ) {
          return null;
        }
        return (
          <div
            key={`treemap-label-${rect.index}`}
            style={{
              position: 'absolute',
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: '#111827',
              textAlign: 'center',
              padding: 2,
              overflow: 'hidden',
              lineHeight: 1.2,
            }}
          >
            {rect.name}
          </div>
        );
      })}
    </div>
  );
}
