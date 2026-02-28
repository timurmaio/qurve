# Migration Guide

This guide covers migration from early `0.1.x` usage patterns to the `0.2-ready` API surface.

## Breaking changes

There are no intentional breaking API removals in this cycle.

## Key upgrades

### Time axis formatting

You can now configure locale/timezone-aware formatting directly on `XAxis`:

```tsx
<XAxis
  dataKey="ts"
  type="time"
  locale="en-US"
  timeZone="UTC"
  timeFormat="date"
/>
```

`timeFormat` accepts presets (`auto`, `time`, `date`, `month`, `year`) or raw `Intl.DateTimeFormatOptions`.

### Tooltip sticky and accessibility

Use `sticky` to lock tooltip on click/tap.

```tsx
<Tooltip sticky />
```

For screen readers:

```tsx
<Tooltip
  ariaLive="polite"
  a11yLabelFormatter={(label, payload) => `${label}: ${payload.map((p) => `${p.name} ${p.value}`).join(', ')}`}
/>
```

### Legend single-select mode

Focus on a single series while keeping a quick reset path:

```tsx
<Legend selectionMode="single" />
```

In `single` mode, clicking the active series again restores all series.

### Brush interactions

`Brush` now supports:

- drag pan
- wheel zoom
- touch drag + pinch zoom
- optional sparkline preview (`showPreview`, `previewDataKey`)

```tsx
<Brush previewDataKey="close" />
```

## Composed charts behavior

Composed series now use deterministic rendering and tooltip order:

`Area -> Bar -> Line -> Scatter`

This makes layering and tooltip payload order stable across renders.
