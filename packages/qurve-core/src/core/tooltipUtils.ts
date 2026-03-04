import { formatTimeTick, toTimeNumber, type TimeFormatMode } from './timeUtils';
import type { TooltipPayloadItem } from '../types';

export type TooltipLabel = string | number;

type TimeAxisConfig = {
  type?: 'number' | 'category' | 'band' | 'time';
  locale?: string;
  timeZone?: string;
  timeFormat?: TimeFormatMode;
} | null;

export function formatTooltipLabel(label: TooltipLabel, axis: TimeAxisConfig): string {
  if (axis?.type !== 'time') return String(label);

  const value = toTimeNumber(label);
  if (value === null) return String(label);

  const day = 24 * 60 * 60 * 1000;
  const domain: [number, number] = [value - day, value + day];
  return formatTimeTick(value, domain, {
    locale: axis.locale,
    timeZone: axis.timeZone,
    timeFormat: axis.timeFormat,
  });
}

/**
 * Extract text from formatter output - framework-agnostic.
 * Handles primitives, arrays, and React-like/Vue-like element objects.
 */
export function nodeToText(node: unknown): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join(' ');
  // React-like: { type, props: { children } } or Vue-like VNode
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: unknown } }).props;
    return nodeToText(props?.children);
  }
  return '';
}

export function payloadToA11yText(
  payload: TooltipPayloadItem[],
  formatter?: (value: number | null, name: string, item: TooltipPayloadItem) => unknown,
): string {
  return payload
    .map((item) => {
      const valueFormatter = item.formatter ?? formatter;
      const formatted = valueFormatter ? valueFormatter(item.value, item.name, item) : null;
      const valueNode = Array.isArray(formatted)
        ? formatted[0]
        : formatted ?? (item.value == null || !Number.isFinite(item.value) ? '-' : item.value.toFixed(2));
      const nameNode = Array.isArray(formatted) ? formatted[1] : item.name;

      const nameText = nodeToText(nameNode) || item.name;
      const valueText = nodeToText(valueNode) || (item.value == null || !Number.isFinite(item.value) ? '-' : item.value.toFixed(2));
      return `${nameText}: ${valueText}`;
    })
    .join('. ');
}

export type TooltipSorter = 'value' | 'name' | ((a: TooltipPayloadItem, b: TooltipPayloadItem) => number) | undefined;

export function sortPayload(payload: TooltipPayloadItem[], sorter: TooltipSorter): TooltipPayloadItem[] {
  if (!sorter) return payload;

  const next = [...payload];
  if (typeof sorter === 'function') {
    next.sort(sorter);
    return next;
  }

  if (sorter === 'value') {
    next.sort((a, b) => (b.value ?? Number.NEGATIVE_INFINITY) - (a.value ?? Number.NEGATIVE_INFINITY));
    return next;
  }

  next.sort((a, b) => a.name.localeCompare(b.name));
  return next;
}

export function toReverseConfig(reverseDirection: boolean | { x?: boolean; y?: boolean } | undefined): { x: boolean; y: boolean } {
  if (typeof reverseDirection === 'boolean') {
    return { x: reverseDirection, y: reverseDirection };
  }
  return {
    x: reverseDirection?.x ?? false,
    y: reverseDirection?.y ?? false,
  };
}
