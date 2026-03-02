export type LegendAlign = 'left' | 'center' | 'right' | undefined;

export function justifyByAlign(align: LegendAlign): React.CSSProperties['justifyContent'] {
  if (align === 'left') return 'flex-start';
  if (align === 'right') return 'flex-end';
  return 'center';
}
