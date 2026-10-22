import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import s from './Pills.module.css';

export type ChipProps = {
  children: ReactNode;
  /** Figma `Type`: Filter (blue) or Grouping (cyan). */
  type?: 'filter' | 'grouping';
  /** Figma `Context=Playback` is filled; Available / in-panel chips are outlined. */
  filled?: boolean;
  /** Smaller label used for chips inside panels. */
  compact?: boolean;
  count?: number;
  disabled?: boolean;
  /** Makes the whole chip a toggle button. */
  onClick?: () => void;
  pressed?: boolean;
  /** Shows the × remove control (Figma "rollover x"). */
  onRemove?: () => void;
};

/** Figma: Pills / Chip. Filter and grouping chips for grid toolbars and the column panel. */
export function Chip({ children, type = 'filter', filled = false, compact, count, disabled, onClick, pressed, onRemove }: ChipProps) {
  const cls = [s.chip, type === 'grouping' && s.grouping, (filled || pressed) && s.filled, compact && s.compact].filter(Boolean).join(' ');
  const body = (
    <>
      {children}
      {count !== undefined && <span className={s.count}>{count}</span>}
      {onRemove && !disabled && (
        <button
          type="button"
          className={s.remove}
          aria-label={`Remove ${typeof children === 'string' ? children : ''}`.trim()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </>
  );
  return onClick ? (
    <button type="button" className={cls} aria-pressed={pressed} disabled={disabled} data-disabled={disabled || undefined} onClick={onClick}>
      {body}
    </button>
  ) : (
    <span className={cls} data-disabled={disabled || undefined}>
      {body}
    </span>
  );
}

/** Figma: Pills / Roundels. 22px price-direction indicator: green (Surface/Price Increase), red (Surface/Price Decrease) or neutral (Surface/Ticker). */
export function Roundel({ tone = 'neutral', direction = 'up', label }: { tone?: 'up' | 'down' | 'neutral'; direction?: 'up' | 'down' | 'flat'; label?: string }) {
  const rotate = direction === 'up' ? 45 : direction === 'down' ? 135 : 90;
  return (
    <span className={s.roundel} data-tone={tone} role="img" aria-label={label ?? `Price ${direction === 'flat' ? 'unchanged' : direction}`}>
      <Icon name="arrow-upward-alt" size={16} style={{ transform: `rotate(${rotate}deg)` }} />
    </span>
  );
}

export type ScenarioTone = 'actual' | 1 | 2 | 3 | 4;
const TONE: Record<string, string> = { actual: s.actual, '1': s.s1, '2': s.s2, '3': s.s3, '4': s.s4 };

/** Figma: Pills / metric scenario. A tinted value chip with a caption, used to compare Actual with Scenarios 1–4. */
export function ScenarioPill({ value, caption, tone = 'actual' }: { value: ReactNode; caption?: ReactNode; tone?: ScenarioTone }) {
  return (
    <span className={s.scenario}>
      <span className={`${s.scenarioValue} ${TONE[String(tone)]}`}>{value}</span>
      {caption && <span className={s.scenarioCaption}>{caption}</span>}
    </span>
  );
}
