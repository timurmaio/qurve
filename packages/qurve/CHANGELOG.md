# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning while in preview (`0.x`).

## [Unreleased]

### Added
- New series primitives: `Bar` and `Area` with stacking support via `stackId`.
- New `Pie` primitive for pie/donut charts with tooltip hit-testing.
- New `Scatter` primitive with `xKey`/`yKey` mapping and tooltip/legend support.
- New `Brush` component for draggable x-range selection.
- `ResponsiveContainer` for auto-sizing charts to parent dimensions.
- `Legend` with click-to-toggle visibility for line/bar/area series.
- `MIGRATION.md` with upgrade guidance for time axis, tooltip, legend, and brush behaviors.

### Changed
- `Pie` now supports per-slice `colors` palettes, `labelMode`, optional `labelLine` connectors, and collision-aware `labelMinGap` label layout.
- Pie docs and demos now include dense outside-label configurations, and tests cover legend/label sync plus crowded label spacing.
- `Tooltip` now supports per-series formatter overrides, sticky lock mode, and optional screen-reader live region controls.
- `Tooltip` accessibility now supports optional aggregated summary announcements.
- `XAxis` and `YAxis` support custom `tickValues`, `interval`, and axis `padding`.
- `XAxis` now supports `type='time'` with automatic time ticks plus `locale`, `timeZone`, and `timeFormat` controls.
- `Bar` adds `maxBarSize`, `minPointSize`, and improved stacked-corner rounding.
- `Brush` adds wheel zoom, drag pan, touch pinch interactions, and quick reset.
- `Brush` now includes configurable mini-preview sparkline rendering.
- `Legend` now includes better accessibility metadata and explicit keyboard toggling.
- `Legend` now supports `selectionMode='single'` with click-again reset to all series.
- Composed charts now use deterministic series layering and tooltip payload order.

### Notes
- Release verification now includes `check:release` (`typecheck`, build, and pack).
- `0.2.0` is prepared as release-ready in docs and verification, without publishing in this cycle.
- CI workflow now runs `verify` and package release checks on PRs and main pushes.

## [0.1.0] - 2026-02-20

### Added
- Initial release of React canvas chart primitives.
- Core primitives: `Chart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`.
- ESM build output and TypeScript declaration files.
- Recharts-inspired composable API surface for early adopters.

### Notes
- Developer Preview release.
- API can evolve between `0.x` versions.
