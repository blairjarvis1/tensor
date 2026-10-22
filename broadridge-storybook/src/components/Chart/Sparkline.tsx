import s from './Chart.module.css';

export type SparkColor = 'orange' | 'blue' | 'light-blue' | 'green';
const COLOR: Record<SparkColor, string> = {
  orange: 'var(--br-surface-charting-orange)',
  blue: 'var(--br-surface-charting-bue)',
  'light-blue': 'var(--br-brand-light-blue-default)',
  green: 'var(--br-surface-charting-mint-green)',
};

/**
 * Figma: Charts / Small Multiples ("Graphs"). A 70×24 bar sparkline with an optional trend line,
 * for grid cells and metric boxes.
 */
export function Sparkline({ values, line, color = 'green', width = 70, height = 24, label }: { values: number[]; line?: number[]; color?: SparkColor; width?: number; height?: number; label?: string }) {
  const max = Math.max(1, ...values, ...(line ?? []));
  const step = width / values.length;
  const bw = Math.max(1.5, step * 0.45);
  const y = (v: number) => height - 1 - (v / max) * (height - 3);
  const pts = line?.map((v, i) => `${i ? 'L' : 'M'}${(i * step + step / 2).toFixed(1)},${y(v).toFixed(1)}`).join('');
  return (
    <svg className={s.spark} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label ?? 'Trend'}>
      <line x1={0} x2={width} y1={height - 0.5} y2={height - 0.5} stroke={COLOR[color]} strokeDasharray="1 2" opacity={0.6} />
      {values.map((v, i) => (
        <rect key={i} x={i * step + (step - bw) / 2} y={y(v)} width={bw} height={Math.max(0, height - 1 - y(v))} fill={COLOR[color]} />
      ))}
      {pts && <path d={pts} fill="none" stroke="var(--br-surface-graph-line)" strokeWidth={1} />}
    </svg>
  );
}
