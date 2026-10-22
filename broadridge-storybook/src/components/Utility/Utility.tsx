import { useId, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { cloneElement } from 'react';
import { Icon } from '../Icon/Icon';
import s from './Utility.module.css';

/* ---------------- Pagination ---------------- */

export type PaginationProps = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  /** Figma `Size`: large (12px dots, optional text) or small (8px dots, no text). */
  size?: 'large' | 'small';
  /** Optional caption under the dots, e.g. ["Weyland-Yutani", "Analysis 1 of 6"]. */
  caption?: ReactNode[];
  label?: string;
};

/** Figma: Pagination. Dot pager with previous / next chevrons; dots up to the current page are filled, as in Figma. */
export function Pagination({ page, pages, onChange, size = 'large', caption, label = 'Pages' }: PaginationProps) {
  return (
    <nav className={[s.pager, size === 'small' && s.small].filter(Boolean).join(' ')} aria-label={label}>
      <div className={s.pagerRow}>
        <button type="button" className={s.arrow} aria-label="Previous" disabled={page === 0} onClick={() => onChange(page - 1)}>
          <Icon name="chevron-back" size={size === 'small' ? 16 : 24} />
        </button>
        <div className={s.dots}>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" className={s.dot} data-on={i <= page} aria-label={`Page ${i + 1} of ${pages}`} aria-current={i === page ? 'page' : undefined} onClick={() => onChange(i)} />
          ))}
        </div>
        <button type="button" className={s.arrow} aria-label="Next" disabled={page === pages - 1} onClick={() => onChange(page + 1)}>
          <Icon name="chevron-forward" size={size === 'small' ? 16 : 24} />
        </button>
      </div>
      {caption && size === 'large' && (
        <div className={s.pagerText}>
          {caption.map((c, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <i aria-hidden="true" />}
              <span>{c}</span>
            </span>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ---------------- Tooltip ---------------- */

/** Figma: Tooltips / tooltip. Shows on hover and keyboard focus after a short delay; linked with aria-describedby. */
export function Tooltip({ content, placement = 'top', children }: { content: ReactNode; placement?: 'top' | 'bottom' | 'left' | 'right'; children: ReactElement<Record<string, unknown>> }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className={s.tipWrap} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      {cloneElement(children, { 'aria-describedby': id })}
      <span id={id} role="tooltip" className={`${s.tip} ${s[placement]}`} data-open={open}>
        {content}
      </span>
    </span>
  );
}

/* ---------------- UI ---------------- */

/** Figma: UI / Separators. Horizontal or vertical rule; `level` picks Border/Separator Level 1–5. */
export function Separator({ orientation = 'horizontal', level = 1 }: { orientation?: 'horizontal' | 'vertical'; level?: 1 | 2 | 3 | 4 | 5 }) {
  return <hr className={s.sep} data-o={orientation} aria-orientation={orientation} style={{ '--sep': `var(--br-border-separator-level-${level})` } as CSSProperties} />;
}

/** Figma: UI / Scroll bars. A scroll container styled with Surface/Scroll Bar tokens. */
export function ScrollArea({ children, maxHeight, style, label }: { children: ReactNode; maxHeight?: number | string; style?: CSSProperties; label?: string }) {
  return (
    <div className={s.scroll} style={{ maxHeight, ...style }} tabIndex={0} role="region" aria-label={label}>
      {children}
    </div>
  );
}

/** Figma: UI / Overlay fade. Fades the top or bottom edge of scrolling content into the surface behind it. */
export function OverlayFade({ children, edges = ['bottom'], height = 48, to }: { children: ReactNode; edges?: ('top' | 'bottom')[]; height?: number; /** Surface token to fade into; defaults to Surface/Global/Level 2. */ to?: string }) {
  return (
    <div className={s.fadeWrap} style={{ '--fade': `${height}px`, ...(to ? { '--fade-to': to } : {}) } as CSSProperties}>
      {children}
      {edges.map((e) => (
        <span key={e} className={s.fade} data-edge={e} aria-hidden="true" />
      ))}
    </div>
  );
}

/* ---------------- Status ---------------- */

export type ExecutionStatus = 'new' | 'working' | 'part-filled' | 'filled' | 'cancelled';
const STATUS_LABEL: Record<ExecutionStatus, string> = { new: 'New', working: 'Working', 'part-filled': 'Part Filled', filled: 'Filled', cancelled: 'Cancelled' };

/**
 * Figma: Status Bars / Status Pills. Execution status for grid cells. `fill` (0–1) shows how much of a part-filled order has executed.
 * `final` marks a terminal state (order closed): filled turns neutral, cancelled loses its border.
 */
export function StatusPill({ status, fill = 0.45, final = false, width }: { status: ExecutionStatus; fill?: number; final?: boolean; width?: number }) {
  return (
    <span className={s.status} data-s={status} data-final={final} style={width ? ({ '--w': `${width}px` } as CSSProperties) : undefined} aria-label={`${STATUS_LABEL[status]}${status === 'part-filled' ? `, ${Math.round(fill * 100)}%` : ''}${final ? ', final' : ''}`}>
      {status === 'part-filled' && <span className={s.statusFill} style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }} />}
      {final && status === 'filled' && <Icon name="check" size={14} />}
      <span>{STATUS_LABEL[status]}</span>
    </span>
  );
}
