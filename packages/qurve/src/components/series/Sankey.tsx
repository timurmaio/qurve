import { createContext, use, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  drawSankey,
  findSankeyIndex,
  layoutSankey,
  normalizeOpacity,
  pickColor,
  LayerOrder,
  type SankeyData,
  type SankeyLinkLayout,
  type SankeyNodeLayout,
} from '@qurve/core';
import { CELL_TYPE } from '../series/Cell';
import {
  useChartInteractionContext,
  useChartLayoutContext,
  useChartRenderContext,
  useChartSeriesContext,
} from '../chart/chartContext';
import type { TooltipPayloadItem } from '../chart/chartContext';

const SANKEY_CONSTANTS = {
  DEFAULT_HOVER_OPACITY: 0.35,
  DEFAULT_LINK_OPACITY: 0.4,
};

export const SankeyDataContext = createContext<SankeyData | null>(null);

export interface SankeyProps {
  /** Override data from SankeyChart context when composing manually. */
  data?: SankeyData;
  fill?: string;
  colors?: string[];
  nodeWidth?: number;
  nodePadding?: number;
  linkOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
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

export function Sankey({
  data: dataProp,
  fill,
  colors,
  nodeWidth = 14,
  nodePadding = 12,
  linkOpacity = SANKEY_CONSTANTS.DEFAULT_LINK_OPACITY,
  stroke,
  strokeWidth = 0,
  hoverOpacity = SANKEY_CONSTANTS.DEFAULT_HOVER_OPACITY,
  label = false,
  name,
  tooltipName,
  tooltipFormatter,
  children,
}: SankeyProps) {
  const contextData = use(SankeyDataContext);
  const sankeyData = dataProp ?? contextData;
  const { width, height, margin, colors: chartColors } = useChartLayoutContext();
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

  const seriesId = useMemo(() => Symbol('sankey-series'), []);
  const nodesRef = useRef<SankeyNodeLayout[]>([]);
  const linksRef = useRef<SankeyLinkLayout[]>([]);
  const [labelItems, setLabelItems] = useState<SankeyNodeLayout[]>([]);
  const seriesName = tooltipName ?? name ?? 'Sankey';
  const hoverOpacityValue = normalizeOpacity(
    hoverOpacity,
    SANKEY_CONSTANTS.DEFAULT_HOVER_OPACITY,
  );
  const legendColor = pickColor(0, fill, resolvedColors);

  useEffect(() => {
    return registerLegendItem({
      id: seriesId,
      name: seriesName,
      color: legendColor,
      type: 'sankey',
    });
  }, [registerLegendItem, seriesId, seriesName, legendColor]);

  useEffect(() => {
    if (!ctx || !sankeyData || sankeyData.nodes.length === 0) {
      nodesRef.current = [];
      linksRef.current = [];
      setLabelItems([]);
      requestRender();
      return;
    }

    const plotX = margin.left;
    const plotY = margin.top;
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const plotHeight = Math.max(0, height - margin.top - margin.bottom);
    const colorList = sankeyData.nodes.map((_, index) =>
      pickColor(index, fill, resolvedColors),
    );

    const layout = layoutSankey({
      data: sankeyData,
      colors: colorList,
      cellOverrides: cellOverrides.length > 0 ? cellOverrides : undefined,
      plotX,
      plotY,
      plotWidth,
      plotHeight,
      nodeWidth,
      nodePadding,
      nodeStroke: stroke,
      nodeStrokeWidth: strokeWidth,
    });

    nodesRef.current = layout.nodes;
    linksRef.current = layout.links;
    setLabelItems(label ? layout.nodes.filter((n) => n.height > 0) : []);
    requestRender();
  }, [
    ctx,
    sankeyData,
    fill,
    resolvedColors,
    cellOverrides,
    stroke,
    strokeWidth,
    nodeWidth,
    nodePadding,
    label,
    width,
    height,
    margin,
    requestRender,
  ]);

  useEffect(() => {
    return registerTooltipIndexResolver((mouseX, mouseY) => {
      return findSankeyIndex(nodesRef.current, mouseX, mouseY);
    });
  }, [registerTooltipIndexResolver]);

  useEffect(() => {
    return registerTooltipSeries(
      (index) => {
        if (!isSeriesVisible(seriesId)) return null;
        const node = nodesRef.current.find((n) => n.index === index);
        if (!node) return null;
        return {
          dataKey: 'value',
          name: node.name,
          value: Number.isFinite(node.value) ? node.value : null,
          color: node.color,
          formatter: tooltipFormatter,
          anchor: {
            x: node.x + node.width / 2,
            y: node.y + node.height / 2,
          },
        };
      },
      { layer: LayerOrder.sankey },
    );
  }, [
    registerTooltipSeries,
    tooltipFormatter,
    isSeriesVisible,
    seriesId,
    legendVersion,
  ]);

  useEffect(() => {
    if (!ctx || !sankeyData?.nodes.length) return;

    const render = () => {
      if (!isSeriesVisible(seriesId)) return;
      drawSankey({
        ctx,
        nodes: nodesRef.current,
        links: linksRef.current,
        hoveredIndex,
        hoverOpacity: hoverOpacityValue,
        linkOpacity,
      });
    };

    return registerRender(render, { layer: LayerOrder.sankey });
  }, [
    ctx,
    sankeyData,
    hoveredIndex,
    hoverOpacityValue,
    linkOpacity,
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
      {labelItems.map((node) => (
        <div
          key={`sankey-label-${node.index}`}
          style={{
            position: 'absolute',
            left: node.x + node.width + 6,
            top: node.y + node.height / 2,
            transform: 'translateY(-50%)',
            fontSize: 11,
            color: '#374151',
            whiteSpace: 'nowrap',
          }}
        >
          {node.name}
        </div>
      ))}
    </div>
  );
}
