import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '@ds/components/Icon/Icon';
import { STATUS_LABEL, type ExecStatus } from './data';
import s from './cells.module.css';

/**
 * Figma: Grid Cell Type=Order Status → Status Pills (101 × 20 inside the 26px row).
 * Part Filled shows progress as a Surface/Progress/Blue Part Filled bar behind the label.
 */
export function StatusCell({ status, fill, final }: { status: ExecStatus; fill: number; final: boolean }) {
  return (
    <span className={s.status} data-s={status} data-final={final || undefined} aria-label={`${STATUS_LABEL[status]}${status === 'part-filled' ? `, ${Math.round(fill * 100)}% filled` : ''}`}>
      {status === 'part-filled' && <span className={s.fill} style={{ width: `${Math.round(fill * 100)}%` }} />}
      <span className={s.statusText}>{STATUS_LABEL[status]}</span>
    </span>
  );
}

/** Figma: acronym — 14 × 13 tag on Surface/Table Header, 2px radius, 9px text (e.g. "IS" for indicative source). */
export function Acronym({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span className={s.acronym} title={title}>
      {children}
    </span>
  );
}

/** Text with acronym: tag on the left, value aligned to the column. */
export function WithAcronym({ tag = 'IS', children, align = 'right' }: { tag?: string; children: ReactNode; align?: 'left' | 'right' }) {
  return (
    <span className={s.withAcr} data-align={align}>
      <Acronym title="Indicative source">{tag}</Acronym>
      <span>{children}</span>
    </span>
  );
}

/** Figma: Grid Cell Type=Data Text with arrow_upward_alt / arrow_downward_alt (B/A spread). */
export function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={s.change}>
      <Acronym title="Indicative source">IS</Acronym>
      <span className={up ? s.up : s.down} style={{ display: 'inline-flex' }}>
        <Icon name={up ? 'arrow-upward-alt' : 'arrow-downward-alt'} size={16} />
      </span>
      <span>{up ? `+${value.toFixed(2)}` : value.toFixed(2)}</span>
    </span>
  );
}

/** Figma: Grid Cell Type=Graph → Graphs small multiple (58 × 20 green bars with a trend line). */
export function Spark({ values, line }: { values: number[]; line: number[] }) {
  const W = 58;
  const H = 20;
  const max = Math.max(...values, ...line);
  const step = W / values.length;
  const bw = Math.max(1.5, step * 0.42);
  const y = (v: number) => H - 1 - (v / max) * (H - 3);
  const path = line.map((v, i) => `${i ? 'L' : 'M'}${(i * step + step / 2).toFixed(1)},${y(v).toFixed(1)}`).join('');
  return (
    <svg className={s.spark} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Execution profile">
      <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} className={s.sparkBase} />
      {values.map((v, i) => (
        <rect key={i} x={i * step + (step - bw) / 2} y={y(v)} width={bw} height={H - 1 - y(v)} className={s.sparkBar} />
      ))}
      <path d={path} className={s.sparkLine} />
    </svg>
  );
}

/** Label / value pairs for an expanded row (Figma Label and Metric, compact). */
export function DetailList({ items, style }: { items: [string, ReactNode][]; style?: CSSProperties }) {
  return (
    <dl className={s.detail} style={style}>
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
