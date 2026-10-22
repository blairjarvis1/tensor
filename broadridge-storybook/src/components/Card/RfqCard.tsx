import type { HTMLAttributes } from 'react';
import { Icon } from '../Icon/Icon';
import { DirectionLozenge, IssueLozenge } from '../Lozenge/Lozenge';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import s from './Card.module.css';

export type RfqStatus = 'new' | 'quote-sent' | 'expired';
export type RfqIssue = 'none' | 'size' | 'limit';

export type Rfq = {
  instrument: string;
  isin: string;
  side: 'bid' | 'ask';
  /** e.g. "Switch", "Outright". */
  type: string;
  price: string;
  yield: string;
  /** Full amount for the detailed card ("250M"), short for compact ("12M"). */
  amount: string;
  client: string;
};

export type RfqCardProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  rfq: Rfq;
  /** Figma `Size`: Large = Detailed card (300px), Small = Compact card (222px). */
  size?: 'detailed' | 'compact';
  status?: RfqStatus;
  /** Figma `Issue`: 1 = Size Warning (red), 2 = Limit Breach (purple). */
  issue?: RfqIssue;
  /** Name of the trader who claimed the RFQ. Claimed and expired cards use the disabled surface. */
  claimedBy?: string;
  /** Seconds left on the RFQ timer, and the full window it counts down from. */
  secondsLeft?: number;
  totalSeconds?: number;
  pinned?: boolean;
};

const STATUS_LABEL: Record<RfqStatus, string> = { new: 'New', 'quote-sent': 'Quote Sent', expired: 'Expired' };

/** Figma: Cards / RFQ Cards (Card Detailed). Hover and keyboard focus are live. */
export function RfqCard({ rfq, size = 'detailed', status = 'new', issue = 'none', claimedBy, secondsLeft = 20, totalSeconds = 60, pinned = false, className, ...rest }: RfqCardProps) {
  const detailed = size === 'detailed';
  const disabled = status === 'expired' || !!claimedBy;
  const running = status !== 'expired';
  const lozSize = detailed ? 'medium' : 'small';

  const right = claimedBy ? (
    <span className={s.claimed}>
      <span>Claimed</span>
      <span>{claimedBy}</span>
    </span>
  ) : issue === 'size' ? (
    <IssueLozenge kind="issue-2" size={lozSize}>{detailed ? 'Size Warning' : 'Size'}</IssueLozenge>
  ) : issue === 'limit' ? (
    <IssueLozenge kind="issue-1" size={lozSize}>{detailed ? 'Limit Breach' : 'Limit'}</IssueLozenge>
  ) : status === 'new' ? (
    <IssueLozenge kind="text" size={lozSize}>Requesting</IssueLozenge>
  ) : null;

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label={`${STATUS_LABEL[status]} RFQ, ${rfq.side} ${rfq.amount} ${rfq.instrument}`}
      className={[s.rfq, detailed ? s.large : s.small, className].filter(Boolean).join(' ')}
      data-disabled={disabled}
      data-pinned={pinned}
      {...rest}
    >
      {pinned && <span className={s.pin} aria-label="Pinned" />}
      <div className={s.header}>
        <div className={s.top}>
          <span className={s.status}>
            <span className={s.statusIcon}>
              <Icon name="ticket" size={detailed ? 18 : 16} />
            </span>
            {STATUS_LABEL[status]}
          </span>
          {right}
        </div>
        <div className={s.timer}>
          {running ? (
            <>
              <ProgressBar value={secondsLeft / totalSeconds} label="Time left to quote" />
              <span className={s.seconds}>{secondsLeft}s</span>
            </>
          ) : (
            <span className={s.expiredRule} />
          )}
        </div>
      </div>

      {detailed ? (
        <div className={s.rows}>
          <hr className={s.rule} />
          <Row label="Price" value={rfq.price} strong />
          <Row label="Instrument" value={rfq.instrument} strong />
          <div className={s.row}>
            <span className={s.rowLabel}>Type</span>
            <span className={s.inline}>
              <DirectionLozenge side={rfq.side} disabled={disabled} />
              <span className={s.rowValue}>{rfq.type}</span>
            </span>
          </div>
          <Row label="Yield" value={rfq.yield} />
          <Row label="Amount" value={rfq.amount} />
          <Row label="Client" value={rfq.client} />
          <Row label="ISIN" value={rfq.isin} />
        </div>
      ) : (
        <div className={s.compactBody}>
          <span>{rfq.instrument}</span>
          <span className={s.inline}>
            <DirectionLozenge side={rfq.side} disabled={disabled} />
            <span>{rfq.amount}</span>
            <span>{rfq.type}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={s.row}>
      <span className={s.rowLabel}>{label}</span>
      <span className={[s.rowValue, strong && s.strong].filter(Boolean).join(' ')}>{value}</span>
    </div>
  );
}
