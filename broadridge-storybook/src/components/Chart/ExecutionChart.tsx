import { useEffect, useRef, useState } from 'react';
import s from './Chart.module.css';

export type ExecutionPoint = {
  /** X-axis label, e.g. "08:30". */
  time: string;
  /** Our trade quantity for the interval (right axis). */
  qty: number;
  /** Remaining inventory (left axis), plotted as the inventory path with completion markers. */
  inventory?: number;
  /** Compare mode: pre-trade estimate and predicted quantity for the same interval. */
  preTrade?: number;
  predicted?: number;
  /** Compare mode: predicted inventory path (orange line). */
  predictedInventory?: number;
};

export type ExecutionChartProps = {
  data: ExecutionPoint[];
  title?: string;
  venue?: string;
  /** `single` = trade bars + inventory path. `compare` = pre-trade / trading now / predicted bars with show-hide toggles. */
  mode?: 'single' | 'compare';
  /** Index range for the Start / End markers. */
  window?: [number, number];
  /** Upper edge of the shaded probability band, per point (left-axis units). */
  band?: number[];
  inventoryDomain?: [number, number];
  qtyDomain?: [number, number];
  height?: number;
  /** Smaller type and markers, for Compare x2 / x3 and floating panels. */
  compact?: boolean;
};

const PAD = { top: 10, right: 34, bottom: 24, left: 30 };

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Figma: Charts / Graph ("Urgency & Impact"). Execution path for an algo order: trade quantity bars, inventory path and probability band. */
export function ExecutionChart({ data, title = 'Urgency & Impact', venue = 'ES Main', mode = 'single', window, band, inventoryDomain = [-8, 100], qtyDomain = [-15, 25], height = 313, compact = false }: ExecutionChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [show, setShow] = useState({ pre: true, now: true, predicted: false });
  const W = width;
  const H = height;
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const n = data.length;
  const band_ = iw / n;
  const x = (i: number) => PAD.left + band_ * i + band_ / 2;
  const yL = (v: number) => PAD.top + ih - ((v - inventoryDomain[0]) / (inventoryDomain[1] - inventoryDomain[0])) * ih;
  // The right axis shares the left axis's zero line (as in Figma): 0→max maps to 0→inventory max, min→0 maps to inventory min→0.
  const yR = (v: number) => yL(v >= 0 ? (v / qtyDomain[1]) * inventoryDomain[1] : (v / qtyDomain[0]) * inventoryDomain[0]);
  const ticksL = [inventoryDomain[0], 0, 20, 40, 60, 80, 100].filter((t) => t >= inventoryDomain[0] && t <= inventoryDomain[1]);
  const ticksR = [qtyDomain[0], 0, 5, 10, 15, 20, 25].filter((t) => t >= qtyDomain[0] && t <= qtyDomain[1]);
  const fs = compact ? 10 : 12;
  const r = compact ? 3 : 4.5;

  const bars: { key: keyof typeof show; get: (p: ExecutionPoint) => number | undefined; color: string }[] =
    mode === 'single'
      ? [{ key: 'now', get: (p) => p.qty, color: 'var(--br-surface-graph-trading-now-default)' }]
      : [
          { key: 'pre', get: (p) => p.preTrade, color: 'var(--br-surface-graph-pre-trade-now-default)' },
          { key: 'now', get: (p) => p.qty, color: 'var(--br-surface-graph-trading-now-default)' },
          { key: 'predicted', get: (p) => p.predicted, color: 'var(--br-surface-graph-predictive-trading-default)' },
        ];
  const visible = bars.filter((b) => show[b.key]);
  const barW = Math.min(mode === 'single' ? 40 : 20, (band_ * 0.62) / Math.max(1, visible.length));

  const path = (pts: [number, number][]) => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join('');
  const inv = data.map((p, i) => (p.inventory === undefined ? null : ([x(i), yL(p.inventory)] as [number, number]))).filter(Boolean) as [number, number][];
  const pinv = data.map((p, i) => (p.predictedInventory === undefined ? null : ([x(i), yL(p.predictedInventory)] as [number, number]))).filter(Boolean) as [number, number][];
  const bandPath = band ? `${path(band.map((v, i) => [x(i), yL(v)]))}L${x(n - 1)},${yL(0)}L${x(0)},${yL(0)}Z` : null;

  const marker = (i: number, label: string, align: 'start' | 'end') => {
    const tx = x(i);
    const w = label.length * (fs * 0.56) + 16;
    const bx = align === 'start' ? tx - 8 : tx - w + 8;
    return (
      <g key={label}>
        <line x1={tx} x2={tx} y1={PAD.top + 22} y2={yL(0)} stroke="var(--br-surface-graph-line)" strokeDasharray="2.5 2.5" strokeWidth={1} />
        <rect x={bx} y={PAD.top} width={w} height={22} rx={4} fill="var(--br-surface-tooltip-background)" />
        <text x={bx + w / 2} y={PAD.top + 15} textAnchor="middle" fontSize={fs - 1} fill="var(--br-text-action-on-secondary-default)">
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className={[s.chart, compact && s.compact].filter(Boolean).join(' ')} ref={ref}>
      <div className={s.head}>
        <h3 className={s.title}>{title}</h3>
        <div className={s.legend}>
          <span className={s.venue}>{venue}</span>
          <span className={s.key}>
            <span className={s.swatchLine} />
            Inventory path
          </span>
          {mode === 'single' && (
            <span className={s.key}>
              <span className={s.swatchBar} style={{ background: 'var(--br-surface-graph-trading-now-default)' }} />
              Our trade qty
            </span>
          )}
          <span className={s.key}>
            <span className={s.swatchDot} />
            Completion marker
          </span>
          {mode === 'compare' && (
            <span className={s.toggles}>
              Show/hide
              {bars.map((b) => (
                <button key={b.key} type="button" className={s.toggle} aria-pressed={show[b.key]} onClick={() => setShow((v) => ({ ...v, [b.key]: !v[b.key] }))}>
                  <span className={s.swatchBar} style={{ background: b.color }} />
                  {b.key === 'pre' ? 'Pre-trade' : b.key === 'now' ? 'Trading now' : 'Predicted trading'}
                </button>
              ))}
            </span>
          )}
        </div>
      </div>
      <div className={s.axisTitles}>
        <span>Inventory</span>
        <span>Our trade quantity</span>
      </div>
      <svg className={s.svg} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: trade quantity and inventory path from ${data[0]?.time} to ${data[n - 1]?.time}`}>
        {bandPath && <path d={bandPath} fill="var(--br-surface-graph-probability-scale)" />}
        <rect x={PAD.left} y={PAD.top} width={iw} height={ih} fill="none" stroke="var(--br-border-separator-level-2)" />
        {ticksL.map((t) => (
          <g key={`l${t}`}>
            {t !== inventoryDomain[0] && <line x1={PAD.left} x2={PAD.left + iw} y1={yL(t)} y2={yL(t)} stroke={t === 0 ? 'var(--br-border-separator-level-5)' : 'var(--br-border-separator-level-2)'} />}
            <text x={PAD.left - 6} y={yL(t) + 4} textAnchor="end" fontSize={fs - 1} fill="var(--br-text-body-off)">
              {t}
            </text>
          </g>
        ))}
        {ticksR.map((t) => (
          <text key={`r${t}`} x={PAD.left + iw + 6} y={yR(t) + 4} fontSize={fs - 1} fill="var(--br-text-body-off)">
            {t}
          </text>
        ))}
        {data.map((p, i) => (
          <g key={p.time + i}>
            {visible.map((b, j) => {
              const v = b.get(p);
              if (v === undefined) return null;
              const bx = x(i) - (visible.length * barW + (visible.length - 1) * 2) / 2 + j * (barW + 2);
              const y0 = yR(0);
              const y1 = yR(v);
              return <rect key={b.key} x={bx} y={Math.min(y0, y1)} width={barW} height={Math.abs(y1 - y0)} fill={b.color} />;
            })}
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize={fs - 2} fill="var(--br-text-body-off)">
              {p.time}
            </text>
          </g>
        ))}
        {pinv.length > 1 && <path d={path(pinv)} fill="none" stroke="var(--br-brand-chart-orange-400)" strokeWidth={1.5} />}
        {pinv.map(([a, b], i) => (
          <circle key={`p${i}`} cx={a} cy={b} r={r + 1} fill="var(--br-surface-global-level-1)" stroke="var(--br-brand-chart-orange-400)" strokeWidth={1.5} />
        ))}
        {inv.length > 1 && <path d={path(inv)} fill="none" stroke="var(--br-surface-graph-line)" strokeWidth={1} />}
        {inv.map(([a, b], i) => (
          <circle key={`i${i}`} cx={a} cy={b} r={r} fill="var(--br-surface-global-level-1)" stroke="var(--br-surface-graph-line)" strokeWidth={1} />
        ))}
        {window && marker(window[0], `Start ${data[window[0]]?.time}`, 'start')}
        {window && marker(window[1], `End ${data[window[1]]?.time}`, 'end')}
      </svg>
    </div>
  );
}
