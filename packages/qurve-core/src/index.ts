// Types
export type {
  ChartData,
  DataKey,
  AxisConfig,
  TooltipPayloadItem,
  BarSeriesRegistration,
  AreaSeriesRegistration,
  LegendItemRegistration,
  PolarAngleAxisConfig,
  PolarRadiusAxisConfig,
  ZAxisConfig,
  ProjectedPoint,
  FormatterResult,
  TimeFormatMode,
} from './types';

// Core drawing functions
export { drawLinePath, drawLineDots, drawActiveDot } from './core/drawLine';
export type { CurveType } from './core/curvePath';
export { appendCurve } from './core/curvePath';
export { ticks, tickStep, tickIncrement, niceDomain } from './core/ticks';
export { scaleLinear, createLinearScale, type LinearScale } from './core/scaleLinear';
export { drawBars, type BarRect, type CellOverride } from './core/drawBar';
export { drawArea, type AreaPoint } from './core/drawArea';
export { drawPieSlices, type PieSliceGeometry, type PieDrawSlice } from './core/drawPie';
export { drawScatterPoints, type ScatterPoint } from './core/drawScatter';
export { drawXAxis, drawYAxis } from './core/drawAxis';
export { drawGrid } from './core/drawGrid';
export { drawCrosshair, type CursorConfig } from './core/drawCrosshair';
export { drawReferenceLine } from './core/drawReferenceLine';
export { drawReferenceDot } from './core/drawReferenceDot';
export { drawReferenceArea } from './core/drawReferenceArea';
export { drawErrorBars } from './core/drawErrorBar';
export {
  drawLabelList,
  drawChartLabel,
  resolveLabelAnchor,
  type LabelListPosition,
  type LabelListItem,
  type LabelAnchor,
  type ChartLabelPosition,
} from './core/drawLabelList';
export {
  drawPolarGrid,
  drawPolarAngleAxis,
  drawPolarRadiusAxis,
  drawRadarPolygon,
} from './core/drawPolar';
export {
  drawRadialBars,
  buildRadialBarSectors,
  findRadialBarIndex,
  type RadialBarSector,
} from './core/drawRadialBar';
export {
  drawFunnel,
  buildFunnelTrapezoids,
  findFunnelIndex,
  type FunnelTrapezoid,
} from './core/drawFunnel';
export {
  drawTreemap,
  buildTreemapRects,
  findTreemapIndex,
  resolveTreemapValue,
  squarify,
  type TreemapInputNode,
  type TreemapRect,
} from './core/drawTreemap';
export {
  drawSankey,
  layoutSankey,
  findSankeyIndex,
  type SankeyData,
  type SankeyNodeInput,
  type SankeyLinkInput,
  type SankeyNodeLayout,
  type SankeyLinkLayout,
} from './core/drawSankey';
export {
  degToRad,
  polarToCartesian,
  cartesianToPolarAngle,
  getPolarLayout,
  getAngleTicks,
  createRadiusTicks,
  resolveRadiusDomain,
  scaleRadius,
  projectRadarPoints,
  findClosestRadarIndex,
  resolveAngleLabel,
  type PolarLayout,
  type PolarPoint,
} from './core/polarMath';

// Math & utilities
export * from './core/chartMath';
export * from './core/pointUtils';
export * from './core/timeUtils';
export {
  toNumber,
  normalizeName,
  normalizeAngle,
  isAngleInArc,
  formatValue,
  formatDefaultLabel,
  distributeLabels,
  pickColor,
  PIE_COLORS,
  type PieNameKey,
  type PieLabelMode,
  type PieLabelContext,
  type PieLabelLayoutItem,
} from './core/pieMath';
export * from './core/legendUtils';
export * from './core/brushUtils';
export * from './core/responsiveUtils';
export { getRelativePosition } from './core/canvasUtils';
export { LayerOrder } from './core/layerOrder';
export {
  formatTooltipLabel,
  nodeToText,
  payloadToA11yText,
  sortPayload,
  toReverseConfig,
  type TooltipLabel,
  type TooltipSorter,
} from './core/tooltipUtils';
