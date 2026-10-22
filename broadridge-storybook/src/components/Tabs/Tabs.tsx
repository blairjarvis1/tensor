import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import s from './Tabs.module.css';

type Item<T extends string> = { value: T; label: ReactNode; disabled?: boolean; icon?: IconName };

/** Arrow-key navigation shared by tabs and selectors (roving tabindex). */
function useRoving<T extends string>(items: Item<T>[], value: T, onChange: (v: T) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent) => {
    const enabled = items.filter((i) => !i.disabled);
    const i = enabled.findIndex((x) => x.value === value);
    let next: Item<T> | undefined;
    if (e.key === 'ArrowRight') next = enabled[(i + 1) % enabled.length];
    if (e.key === 'ArrowLeft') next = enabled[(i - 1 + enabled.length) % enabled.length];
    if (e.key === 'Home') next = enabled[0];
    if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next) {
      e.preventDefault();
      onChange(next.value);
      requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus());
    }
  };
  return { ref, onKeyDown };
}

export type TabsProps<T extends string> = {
  items: Item<T>[];
  value: T;
  onChange: (v: T) => void;
  /** Figma `Size`: Large (Bdy md, 3px bar) or Small (Bdy sm, 2px bar). */
  size?: 'large' | 'small';
  /** Extends the baseline to the full width (Figma `Status=Empty` cell). */
  fill?: boolean;
  'aria-label'?: string;
};

/** Figma: NavigationTab - v2 built from NavigationTabCell - v2. Selected, Default, Rollover, Disabled and Focus states. */
export function Tabs<T extends string>({ items, value, onChange, size = 'large', fill = true, ...aria }: TabsProps<T>) {
  const { ref, onKeyDown } = useRoving(items, value, onChange);
  return (
    <div ref={ref} role="tablist" aria-label={aria['aria-label']} className={`${s.tabs} ${size === 'large' ? s.large : s.small}`} data-fill={fill} onKeyDown={onKeyDown}>
      {items.map((t) => (
        <button key={t.value} type="button" role="tab" className={s.tab} aria-selected={t.value === value} tabIndex={t.value === value ? 0 : -1} disabled={t.disabled} onClick={() => onChange(t.value)}>
          <span className={s.label}>{t.label}</span>
          <span className={s.bar} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export type ButtonSelectorProps<T extends string> = {
  options: Item<T>[];
  value: T;
  onChange: (v: T) => void;
  /**
   * `navigation` = ButtonSelector-Navigation (32/28px segments),
   * `ticket` = ButtonSelector-Ticket (16px pills for trade tickets and pips),
   * `floating` = the operator selector inside a floating tooltip (And / Or / Not).
   */
  variant?: 'navigation' | 'ticket' | 'floating';
  size?: 'large' | 'small';
  /** Figma `Background`: Level 1 (default) or Level 2 for selectors on raised surfaces. */
  background?: 'level-1' | 'level-2';
  disabled?: boolean;
  'aria-label'?: string;
};

/** Figma: ButtonSelector-Navigation / ButtonSelector-Ticket. A single-choice segmented control (radiogroup semantics). */
export function ButtonSelector<T extends string>({ options, value, onChange, variant = 'navigation', size = 'large', background = 'level-1', disabled, ...aria }: ButtonSelectorProps<T>) {
  const { ref, onKeyDown } = useRoving(options, value, onChange);
  const cls = [s.selector, variant === 'ticket' ? s.ticket : variant === 'floating' ? s.floating : size === 'large' ? s.navLarge : s.navSmall, background === 'level-2' && s.level2].filter(Boolean).join(' ');
  return (
    <div ref={ref} role="radiogroup" aria-label={aria['aria-label']} className={cls} onKeyDown={onKeyDown}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" className={s.seg} aria-checked={o.value === value} tabIndex={o.value === value ? 0 : -1} disabled={disabled || o.disabled} onClick={() => onChange(o.value)}>
          {o.icon && <Icon name={o.icon} size={16} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
