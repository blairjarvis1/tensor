import type { CSSProperties } from 'react';

/**
 * Figma: Status Bars / ProgressBar/active/1–5 (4px) and "large" (6px).
 * Used for RFQ countdowns: the orange foreground is Surface/Progress/Bg Foreground (RFQ).
 */
export function ProgressBar({ value, size = 'small', hover = false, muted = false, label, style }: { value: number; size?: 'small' | 'large'; hover?: boolean; /** Figma "Greyed out": RFQ fill when the request is no longer live. */ muted?: boolean; label?: string; style?: CSSProperties }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const h = size === 'small' ? 4 : 6;
  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      style={{ position: 'relative', display: 'block', flex: 1, minWidth: 0, height: h, borderRadius: 9999, background: hover ? 'var(--br-surface-progress-bg-hover)' : 'var(--br-surface-progress-bg)', overflow: 'hidden', ...style }}
    >
      <span style={{ position: 'absolute', inset: 0, width: `${pct}%`, borderRadius: 'var(--br-radius-lg)', background: muted ? 'var(--br-surface-progress-bg-foreground-2)' : 'var(--br-surface-progress-bg-foreground)', transition: 'width 300ms linear' }} />
    </span>
  );
}
