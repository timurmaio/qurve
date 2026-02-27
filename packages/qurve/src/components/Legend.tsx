import { useMemo } from 'react';
import { useChartContext } from './chart/chartContext';

export interface LegendProps {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'bottom';
  iconSize?: number;
  wrapperStyle?: React.CSSProperties;
}

function justifyByAlign(align: LegendProps['align']): React.CSSProperties['justifyContent'] {
  if (align === 'left') return 'flex-start';
  if (align === 'right') return 'flex-end';
  return 'center';
}

export function Legend({
  align = 'center',
  verticalAlign = 'bottom',
  iconSize = 10,
  wrapperStyle,
}: LegendProps) {
  const { getLegendItems, legendVersion, isSeriesVisible, setSeriesVisible } = useChartContext();

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
    >
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {items.map((item) => {
          const visible = isSeriesVisible(item.id);

          return (
            <button
              key={item.id.toString()}
              type="button"
              onClick={() => setSeriesVisible(item.id, !visible)}
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
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: iconSize,
                  height: iconSize,
                  borderRadius: item.type === 'line' || item.type === 'pie' ? '999px' : '2px',
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
