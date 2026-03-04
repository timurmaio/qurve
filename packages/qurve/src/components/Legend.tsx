import { useMemo, useState } from 'react';
import { justifyByAlign } from '@qurve/core';
import { useChartContext } from './chart/chartContext';

export interface LegendProps {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'bottom';
  iconSize?: number;
  wrapperStyle?: React.CSSProperties;
  ariaLabel?: string;
  selectionMode?: 'multiple' | 'single';
}

export function Legend({
  align = 'center',
  verticalAlign = 'bottom',
  iconSize = 10,
  wrapperStyle,
  ariaLabel = 'Chart legend',
  selectionMode = 'multiple',
}: LegendProps) {
  const { getLegendItems, legendVersion, isSeriesVisible, setSeriesVisible } = useChartContext();
  const [focusedSeriesId, setFocusedSeriesId] = useState<symbol | null>(null);

  const items = useMemo(() => getLegendItems(), [getLegendItems, legendVersion]);
  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        [verticalAlign]: 0,
        display: 'flex',
        justifyContent: justifyByAlign(align),
        pointerEvents: 'auto',
        padding: '6px 8px',
        ...wrapperStyle,
      }}
      role="group"
      aria-label={ariaLabel}
    >
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {items.map((item, index) => {
          const visible = isSeriesVisible(item.id);
          const isFocused = focusedSeriesId === item.id;

          const toggleSeries = () => {
            if (selectionMode === 'single') {
              const currentlyOnlyVisible = visible && items.every((entry) => {
                if (entry.id === item.id) return true;
                return !isSeriesVisible(entry.id);
              });

              if (currentlyOnlyVisible) {
                for (const entry of items) {
                  setSeriesVisible(entry.id, true);
                }
                return;
              }

              for (const entry of items) {
                setSeriesVisible(entry.id, entry.id === item.id);
              }
              return;
            }

            setSeriesVisible(item.id, !visible);
          };

          return (
            <button
              key={`${item.name}-${index}`}
              type="button"
              onClick={toggleSeries}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleSeries();
                }
              }}
              onFocus={() => setFocusedSeriesId(item.id)}
              onBlur={() => setFocusedSeriesId((current) => (current === item.id ? null : current))}
              aria-pressed={visible}
              aria-label={`${item.name}, ${visible ? 'visible' : 'hidden'}`}
              style={{
                appearance: 'none',
                border: '1px solid #d6d6d6',
                background: visible ? '#ffffff' : '#f5f5f5',
                color: visible ? '#222' : '#888',
                borderRadius: '999px',
                padding: '3px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.45)' : 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: iconSize,
                  height: iconSize,
                  borderRadius: item.type === 'line' || item.type === 'pie' || item.type === 'scatter' ? '999px' : '2px',
                  background: item.color,
                  opacity: visible ? 1 : 0.35,
                }}
              />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
