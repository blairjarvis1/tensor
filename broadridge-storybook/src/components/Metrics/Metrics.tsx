import { useState, type CSSProperties, type ReactNode } from 'react';
import { Pagination } from '../Utility/Utility';
import { ScenarioPill, type ScenarioTone } from '../Pills/Pills';
import s from './Metrics.module.css';

export type MetricLevel = 'low' | 'mid' | 'high';
const LEVEL_POS: Record<MetricLevel, number> = { high: 8, mid: 50, low: 92 };
/** Dot colours for scenario tracks (Figma v2.0 uses the scenario tint colours). */
const SCENARIO_DOT: Record<string, string> = {
  actual: 'var(--br-brand-chart-blue-275)',
  '1': 'var(--br-brand-chart-mint-green-default)',
  '2': 'var(--br-brand-chart-purple-300)',
  '3': 'var(--br-brand-chart-pink-400)',
  '4': 'var(--br-brand-chart-yellow-default)',
};

export type MetricScenario = { tone: ScenarioTone; value: ReactNode; caption?: ReactNode; /** 0 (low) – 1 (high) position on the track. */ position?: number };

export type MetricBoxProps = {
  label: ReactNode;
  /** v1.0: a single large value. Omit when passing `scenarios`. */
  value?: ReactNode;
  caption?: ReactNode;
  /** v1.0: where the value sits on its scale (dot at top, middle or bottom of the rail). */
  level?: MetricLevel;
  /** v2.0: one tinted pill per scenario, with a matching dot on the rail. */
  scenarios?: MetricScenario[];
  /** Shows the empty state ("–") when data isn't available yet. */
  empty?: boolean;
  style?: CSSProperties;
};

/** Figma: Metric boxes v1.0 (value + level) and v2.0 (scenario comparison). Used in the analysis panel. */
export function MetricBox({ label, value, caption, level = 'mid', scenarios, empty = false, style }: MetricBoxProps) {
  const dots = empty
    ? []
    : scenarios
      ? scenarios.map((sc) => ({ top: 92 - (sc.position ?? 0.5) * 84, color: SCENARIO_DOT[String(sc.tone)] }))
      : [{ top: LEVEL_POS[level], color: 'var(--br-text-headings)' }];
  return (
    <div className={s.box} data-empty={empty} style={style}>
      <span className={s.track} aria-hidden="true">
        {dots.map((d, i) => (
          <span key={i} className={s.dot} style={{ top: `${d.top}%`, background: d.color }} />
        ))}
      </span>
      <div className={s.body}>
        <span className={s.label}>{label}</span>
        {empty ? (
          <span className={s.value}>–</span>
        ) : scenarios ? (
          <div className={s.scenarios}>
            {scenarios.map((sc, i) => (
              <ScenarioPill key={i} tone={sc.tone} value={sc.value} caption={sc.caption} />
            ))}
          </div>
        ) : (
          <>
            <span className={s.value}>{value}</span>
            {caption && <span className={s.caption}>{caption}</span>}
          </>
        )}
      </div>
    </div>
  );
}

/** A grid of metric boxes with the Figma carousel pager (chevrons + dots) when there are more than `perPage`. */
export function MetricGrid({ children, columns = 3, perPage = 6, label = 'Metrics' }: { children: ReactNode[]; columns?: number; perPage?: number; label?: string }) {
  const pages = Math.max(1, Math.ceil(children.length / perPage));
  const [page, setPage] = useState(0);
  return (
    <section aria-label={label} aria-roledescription="carousel">
      <div className={s.grid} style={{ '--cols': columns } as CSSProperties} aria-live="polite">
        {children.slice(page * perPage, page * perPage + perPage)}
      </div>
      {pages > 1 && (
        <div className={s.pager}>
          <Pagination size="small" page={page} pages={pages} onChange={setPage} label={`${label} pages`} />
        </div>
      )}
    </section>
  );
}

export type LabelMetricItem = { label: ReactNode; value: ReactNode };

/**
 * Figma: Label and Metric. `layout="left-to-right"` puts right-aligned labels beside values in 1–3 columns;
 * `layout="top-down"` stacks each label above its value (e.g. Client / Trader on the ticket).
 */
export function LabelMetric({ items, columns = 1, layout = 'left-to-right' }: { items: LabelMetricItem[]; columns?: 1 | 2 | 3; layout?: 'left-to-right' | 'top-down' }) {
  if (layout === 'top-down') {
    return (
      <dl className={s.stacked}>
        {items.map((it, i) => (
          <div key={i}>
            <dt>{it.label}</dt>
            <dd>{it.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  const per = Math.ceil(items.length / columns);
  const cols = Array.from({ length: columns }, (_, c) => items.slice(c * per, c * per + per));
  return (
    <div className={s.lm} style={{ '--cols': columns } as CSSProperties}>
      {cols.map((col, c) => (
        <dl key={c} className={s.lmCol}>
          {col.map((it, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <dt>{it.label}</dt>
              <dd>{it.value}</dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
  );
}

/** Execution status chip used in Label and Metric (e.g. "Part Filled"). */
export function StatusValue({ children }: { children: ReactNode }) {
  return <span className={s.statusPill}>{children}</span>;
}
