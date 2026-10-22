import { useEffect, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import s from './Menu.module.css';

export type MenuItemProps = {
  children: ReactNode;
  icon?: IconName;
  /** Keyboard hint on the right, e.g. "Alt + A". */
  shortcut?: string;
  /** Shows a chevron for items that open a sub-menu. */
  submenu?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  /** Makes the row a checkable item (Figma Multi-select menu). */
  checked?: boolean;
  onSelect?: () => void;
};

/** Figma: MenuCell - v2. Default (36px) or Small (24px) via the parent Menu's `size`. */
export function MenuItem({ children, icon, shortcut, submenu, disabled, destructive, checked, onSelect }: MenuItemProps) {
  const checkable = checked !== undefined;
  return (
    <li
      role={checkable ? 'menuitemcheckbox' : 'menuitem'}
      aria-checked={checkable ? checked : undefined}
      aria-disabled={disabled || undefined}
      aria-haspopup={submenu || undefined}
      data-destructive={destructive || undefined}
      tabIndex={-1}
      className={s.item}
      onClick={() => !disabled && onSelect?.()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      {checkable && (
        <span className={s.check} aria-hidden="true">
          <Icon name="check" size={14} />
        </span>
      )}
      {icon && (
        <span className={s.icon}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <span className={s.text}>{children}</span>
      {shortcut && <span className={s.shortcut}>{shortcut}</span>}
      {submenu && (
        <span className={s.chevron}>
          <Icon name="chevron-forward" size={20} />
        </span>
      )}
    </li>
  );
}

export function MenuSeparator() {
  return <li role="separator" className={s.separator} />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <li role="presentation" className={s.label}>
      {children}
    </li>
  );
}

export type MenuProps = {
  children: ReactNode;
  size?: 'default' | 'small';
  /** Optional footer, e.g. Cancel / Done buttons (Figma "Master Menu container with slots"). */
  footer?: ReactNode;
  width?: number | string;
  'aria-label'?: string;
  autoFocus?: boolean;
  onEscape?: () => void;
};

/** Figma: Menu - v2. A menu surface with roving focus: ↑ ↓ Home End move, Enter/Space select, Esc closes. */
export function Menu({ children, size = 'default', footer, width, autoFocus, onEscape, ...aria }: MenuProps) {
  const ref = useRef<HTMLUListElement>(null);
  const items = () => [...(ref.current?.querySelectorAll<HTMLLIElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? [])];
  useEffect(() => {
    if (autoFocus) items()[0]?.focus();
  }, [autoFocus]);
  function onKey(e: KeyboardEvent) {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLLIElement);
    const go = (n: number) => { e.preventDefault(); list[(n + list.length) % list.length]?.focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(list.length - 1);
    else if (e.key === 'Escape') onEscape?.();
  }
  return (
    <div className={[s.menu, size === 'small' && s.small].filter(Boolean).join(' ')} style={{ width }}>
      <ul ref={ref} role="menu" aria-label={aria['aria-label']} className={s.list} onKeyDown={onKey}>
        {children}
      </ul>
      {footer && <div className={s.footer}>{footer}</div>}
    </div>
  );
}

/**
 * A trigger that opens a Menu below it. Pass the trigger as a function so it receives the open state and toggle handler.
 * Closes on outside click, Esc, or when an item calls `close`.
 */
export function MenuButton({ trigger, children, align = 'start', ...menu }: Omit<MenuProps, 'children' | 'autoFocus' | 'onEscape'> & { trigger: (p: { open: boolean; toggle: () => void }) => ReactElement; children: (close: () => void) => ReactNode; align?: 'start' | 'end' }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [open]);
  const close = () => setOpen(false);
  return (
    <div ref={root} className={s.anchor}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={s.popover} data-align={align}>
          <Menu {...menu} autoFocus onEscape={close}>
            {children(close)}
          </Menu>
        </div>
      )}
    </div>
  );
}
