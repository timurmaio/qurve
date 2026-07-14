# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning while in preview (`0.x`).

## [Unreleased]

### Added
- `PieChart`, `ScatterChart`, and `ComposedChart` convenience wrappers (Recharts-style aliases of `Chart`).

## [0.3.0] - 2026-07-14

### Added
- `TreemapChart` / `Treemap` — squarified treemap with nested children, Cell, labels, tooltip.
- `SankeyChart` / `Sankey` — node/link flow diagrams with ribbon links, Cell, labels, tooltip.

### Notes
- Completes the tracked Recharts chart-type parity checklist (Treemap + Sankey).
- Developer Preview (`0.x`). API may still evolve.
- Release verification: `check:release` (`typecheck`, build, pack).

## [0.2.0] - 2026-07-14

### Added
- `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis` for radar charts.
- `RadialBarChart` / `RadialBar` for concentric gauge arcs (background track, Cell, angles).
- `FunnelChart` / `Funnel` for conversion funnels (trapezoids, Cell, optional labels).
- `ZAxis` + Scatter `zKey` for bubble sizing (`range` maps values to pixel radius).
- `Label` for chart-level titles/captions (`position`, `offset`, `angle`, typography props).
- `LabelList` for per-point labels on Line/Bar/Area/Scatter (`position`, `valueKey`, `formatter`, `shape="point"|"bar"`).
- Series primitives: `Bar` and `Area` with stacking via `stackId`.
- `Pie` for pie/donut charts with tooltip hit-testing, labels, and connector lines.
- `Scatter` with `xKey`/`yKey` mapping and tooltip/legend support.
- `Brush` for draggable x-range selection with pan, wheel zoom, touch, and sparkline preview.
- `ResponsiveContainer` for auto-sizing charts to parent dimensions.
- `Legend` with click-to-toggle visibility and `selectionMode='single'`.
- Recharts-like wrappers: `LineChart`, `BarChart`, `AreaChart`.
- `ReferenceLine`, `ReferenceDot`, `ReferenceArea`, `ErrorBar`, `Customized`, `Cell`.
- `@qurve/core` framework-agnostic renderer extracted for portability.
- `MIGRATION.md` with upgrade guidance for time axis, tooltip, legend, and brush behaviors.

### Changed
- `Pie` supports per-slice `colors`, `labelMode`, optional `labelLine`, and collision-aware `labelMinGap`.
- `Tooltip` supports per-series formatters, sticky lock, and screen-reader live region controls.
- `XAxis` / `YAxis` support `tickValues`, `interval`, padding, and time formatting (`locale`, `timeZone`, `timeFormat`).
- `Bar` adds `maxBarSize`, `minPointSize`, and improved stacked-corner rounding.
- Composed charts use deterministic series layering and tooltip payload order.
- Two-canvas architecture (base + overlay) with centralized RAF-batched pointer handling.
- Theme via props and CSS variables (`--qurve-chart-bg`, `--qurve-grid-stroke`, etc.).

### Notes
- Developer Preview (`0.x`). API may still evolve.
- Release verification: `check:release` (`typecheck`, build, pack).
- CI runs `verify` and package release checks on PRs and main pushes.

## [0.1.0] - 2026-02-20

### Added
- Initial release of React canvas chart primitives.
- Core primitives: `Chart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`.
- ESM build output and TypeScript declaration files.
- Recharts-inspired composable API surface for early adopters.

### Notes
- Developer Preview release.
- API can evolve between `0.x` versions.
