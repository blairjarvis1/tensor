import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import s from './Lozenge.module.css';

export type IssueKind = 'issue-1' | 'issue-2' | 'issue-3' | 'system' | 'text';
const ISSUE_CLASS: Record<IssueKind, string> = { 'issue-1': s.issue1, 'issue-2': s.issue2, 'issue-3': s.issue3, system: s.system, text: s.text };

/**
 * Figma: Pills / Issue Lozenge.
 * Issue severities use the Issue colour roles: `issue-1` purple (e.g. Limit Breach, Liquidity), `issue-2` red (Size Warning), `issue-3` magenta (Client).
 * `system` is the blue System notification, and `text` is a plain status label such as "Requesting".
 */
export function IssueLozenge({ kind = 'issue-2', size = 'medium', children }: { kind?: IssueKind; size?: 'medium' | 'small'; children: ReactNode }) {
  return (
    <span className={[s.issue, s[size], ISSUE_CLASS[kind]].join(' ')}>
      {kind !== 'text' && <Icon name="emergency-home-20" size={16} />}
      {children}
    </span>
  );
}

/** Figma: Pills / Direction. Bid is green and Ask is red; `disabled` uses the Off surfaces. */
export function DirectionLozenge({ side, size = 'small', disabled = false, label }: { side: 'bid' | 'ask'; size?: 'small' | 'large'; disabled?: boolean; /** Overrides the text, e.g. "BUY" / "SELL" on order panels. */ label?: string }) {
  return <span className={[s.direction, s[side], size === 'small' ? s.dirSmall : s.dirLarge, disabled && s.off].filter(Boolean).join(' ')}>{label ?? (side === 'bid' ? 'Bid' : 'Ask')}</span>;
}
