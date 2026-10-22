import { IssueLozenge, type IssueKind } from '../Lozenge/Lozenge';
import { Icon } from '../Icon/Icon';
import s from './Card.module.css';

export type NotificationCardProps = {
  issue: { kind: IssueKind; label: string };
  /** Relative time, e.g. "Just now". */
  when: string;
  /** Label/value pairs shown in the inset panel. */
  details: { label: string; value: string }[];
  /** Footer status on the left, e.g. "Escalated". */
  escalation?: string;
  owner?: string;
  timestamp?: string;
  /** Figma `Stacked`: shows two cards peeking out underneath for grouped notifications. */
  stacked?: boolean;
};

/** Figma: Cards / Card Compact - vX (?). The notification card used in the notification panel and toasts. */
export function NotificationCard({ issue, when, details, escalation, owner, timestamp, stacked = false }: NotificationCardProps) {
  return (
    <div className={s.stack} data-stacked={stacked}>
      {stacked && (
        <>
          <span className={s.stackLayer} aria-hidden="true" />
          <span className={s.stackLayer} aria-hidden="true" />
        </>
      )}
      <article className={s.notification}>
        <div className={s.nTop}>
          <IssueLozenge kind={issue.kind}>{issue.label}</IssueLozenge>
          <span className={s.when}>{when}</span>
        </div>
        <div className={s.details}>
          {details.map((d) => (
            <div key={d.label} className={s.detail}>
              <span className={s.detailLabel}>{d.label}</span>
              <span className={s.detailValue}>{d.value}</span>
            </div>
          ))}
        </div>
        {(escalation || owner || timestamp) && (
          <div className={s.nFoot}>
            {escalation ? (
              <span className={s.escalation}>
                <Icon name="alerts" size={16} />
                {escalation}
              </span>
            ) : (
              <span />
            )}
            <span className={s.owner}>
              {owner && <div>{owner}</div>}
              {timestamp && <div>{timestamp}</div>}
            </span>
          </div>
        )}
      </article>
    </div>
  );
}
