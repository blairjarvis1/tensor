import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import { DirectionLozenge } from '../Lozenge/Lozenge';
import s from './Panels.module.css';

export type AnalysisPanelProps = {
  /** Order side: SELL renders the red Ask lozenge, BUY the green Bid lozenge. */
  side: 'buy' | 'sell';
  /** e.g. "500 - CGBM26 @ 120.21 CAD". */
  title: string;
  /** Right of the title, e.g. a status Select. */
  status?: ReactNode;
  onMenu?: () => void;
  /** `floating` (shadow, rounded, over the grid) or `docked` (full height on the right). */
  mode?: 'floating' | 'docked';
  width?: number;
  onExpand?: () => void;
  onClose?: () => void;
  children: ReactNode;
};

/**
 * Figma: Panels / Analysis. The pre/intra/post-trade analysis panel that floats over or docks beside the order grid.
 * Children are the panel body (tabs, metric boxes, charts, parameters); use `PanelSection` and `PanelInset` to space them.
 */
export function AnalysisPanel({ side, title, status, onMenu, mode = 'floating', width = 556, onExpand, onClose, children }: AnalysisPanelProps) {
  return (
    <aside className={s.analysis} data-mode={mode} style={{ ['--w' as string]: `${width}px` }} aria-label={`Analysis: ${title}`}>
      {(onExpand || onClose) && (
        <div className={s.aHeader}>
          {onExpand && (
            <button type="button" className={s.aHeaderBtn} onClick={onExpand}>
              <Icon name="expand" size={20} />
              Expand to tab
            </button>
          )}
          {onExpand && onClose && <span className={s.vr} />}
          {onClose && (
            <button type="button" className={s.aHeaderBtn} aria-label="Close panel" onClick={onClose}>
              <Icon name="close" size={24} />
            </button>
          )}
        </div>
      )}
      <div className={s.aBody}>
        <div className={s.aTitleRow}>
          <DirectionLozenge side={side === 'sell' ? 'ask' : 'bid'} size="large" label={side.toUpperCase()} />
          <h2 className={s.aTitle}>{title}</h2>
          {status}
          {onMenu && (
            <button type="button" className={s.iconBtn} aria-label="More actions" onClick={onMenu}>
              <Icon name="more-horiz" size={24} style={{ transform: 'rotate(90deg)' }} />
            </button>
          )}
        </div>
        {children}
      </div>
    </aside>
  );
}

/** A full-width section separated by a top rule (e.g. the chart under the metric boxes). */
export function PanelSection({ children }: { children: ReactNode }) {
  return <section className={s.section}>{children}</section>;
}

/** A bordered inset block (e.g. Order parameters at the bottom of the analysis panel). */
export function PanelInset({ children }: { children: ReactNode }) {
  return <div className={s.inset}>{children}</div>;
}
