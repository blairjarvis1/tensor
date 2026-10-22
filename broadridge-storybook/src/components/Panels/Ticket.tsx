import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { IconTileButton, Stepper } from '../Button/ActionButtons';
import { Toggle } from '../Form/Choice';
import { Icon } from '../Icon/Icon';
import { DirectionLozenge } from '../Lozenge/Lozenge';
import { Chip } from '../Pills/Pills';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import s from './Panels.module.css';

/** Figma: Panels / ticket top bar. Request type + instrument, competition and RFQ countdown, refresh. */
export function TicketTopBar({ requestType, instrument, competition = 'Non Comp', secondsLeft, totalSeconds, onRefresh }: { requestType: string; instrument: string; competition?: string; secondsLeft: number; totalSeconds: number; onRefresh?: () => void }) {
  return (
    <div className={s.topBar}>
      <div className={s.topBlock} style={{ flex: '1 1 auto' }}>
        <span className={s.topLabel}>{requestType}</span>
        <span className={s.topTitle}>{instrument}</span>
      </div>
      <span className={s.topDivider} />
      <div className={s.topBlock}>
        <span className={s.topLabel}>{competition}</span>
        <div className={s.timerRow}>
          <ProgressBar size="large" value={secondsLeft / totalSeconds} label="Time left to quote" style={{ minWidth: 160 }} />
          <span className={s.timerSecs}>{secondsLeft}s</span>
        </div>
      </div>
      <span className={s.topDivider} />
      <button type="button" className={s.iconBtn} aria-label="Refresh" onClick={onRefresh}>
        <Icon name="refresh" size={24} />
      </button>
    </div>
  );
}

/**
 * Figma: Panels / U Shape Top. The side-coloured frame (Ask red / Bid green) around the quote fields,
 * with settlement date, side + size and instrument in a tab notched into the top edge.
 */
export function TicketFrame({ side, settlement, size, instrument, children }: { side: 'bid' | 'ask'; settlement: string; size: string; instrument: string; children: ReactNode }) {
  return (
    <section className={s.frame} data-side={side} aria-label={`${side === 'ask' ? 'Ask' : 'Bid'} ${size} ${instrument}`}>
      <div className={s.notch}>
        <span className={s.notchDate}>
          <Icon name="clock-loader-40" size={14} />
          {settlement}
        </span>
        <span className={s.notchSize}>
          <DirectionLozenge side={side} size="large" />
          <span className={side === 'ask' ? s.askText : s.bidText}>{size}</span>
        </span>
        <span className={s.notchInstr}>{instrument}</span>
      </div>
      {children}
    </section>
  );
}

/** Figma: Panels / composite interval. Labelled chip fields (Composite / Internal / Tier) with removable values. */
export function CompositeInterval({ fields, onRemove }: { fields: { label: string; values: string[] }[]; onRemove?: (field: string, value: string) => void }) {
  return (
    <div className={s.triple}>
      {fields.map((f) => (
        <div key={f.label} className={s.chipField}>
          <span className={s.chipLabel}>{f.label}</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {f.values.map((v) => (
              <Chip key={v} type="filter" compact onRemove={onRemove ? () => onRemove(f.label, v) : undefined}>
                {v}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export type TicketSidebarProps = {
  onTheWire: number;
  onOnTheWireChange: (v: number) => void;
  quoteStatus?: string;
  autoHedge: boolean;
  onAutoHedgeChange: (v: boolean) => void;
  netDv01: number;
  onDefer?: () => void;
  onRelease?: () => void;
  onReject?: () => void;
  onSend?: () => void;
  sendDisabled?: boolean;
};

/** Figma: Panels / right. The ticket's action column: on-the-wire time, quote status, auto hedge, net DV01, then Defer / Release / Reject / Send Price. */
export function TicketSidebar({ onTheWire, onOnTheWireChange, quoteStatus = 'No Quote', autoHedge, onAutoHedgeChange, netDv01, onDefer, onRelease, onReject, onSend, sendDisabled }: TicketSidebarProps) {
  return (
    <div className={s.side}>
      <div className={s.sideRow}>
        <span>On The Wire</span>
        <span className={s.wire}>
          <Stepper action="remove" aria-label="Shorter time on the wire" disabled={onTheWire <= 1} onClick={() => onOnTheWireChange(onTheWire - 1)} />
          <span style={{ minWidth: 22, textAlign: 'center' }}>{onTheWire}s</span>
          <Stepper action="add" aria-label="Longer time on the wire" onClick={() => onOnTheWireChange(onTheWire + 1)} />
        </span>
      </div>
      <div className={s.sideRow}>
        <span>{quoteStatus}</span>
      </div>
      <div className={s.sideRow}>
        <Toggle label="Auto Hedge" checked={autoHedge} onChange={(e) => onAutoHedgeChange(e.target.checked)} />
      </div>
      <div className={s.sideRow}>
        <span>Net DV01</span>
        <span className={s.dv01} data-positive={netDv01 >= 0}>
          {netDv01.toLocaleString('en-GB')}
        </span>
      </div>
      <div className={s.spacer} />
      <div className={s.actions}>
        <Button variant="secondary" size="large" iconEnd="keyboard-arrow-down" onClick={onDefer}>
          Defer
        </Button>
        <Button variant="secondary" size="large" onClick={onRelease}>
          Release
        </Button>
        <Button className={s.full} variant="secondary" size="large" onClick={onReject}>
          Reject
        </Button>
        <IconTileButton className={s.full} icon="send-32" onClick={onSend} disabled={sendDisabled}>
          Send Price
        </IconTileButton>
      </div>
    </div>
  );
}

export { s as ticketStyles };
