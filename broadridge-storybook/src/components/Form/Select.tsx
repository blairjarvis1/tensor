import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { Field, sizeClass, type FieldSize } from './Field';
import s from './Form.module.css';

export type SelectOption = { value: string; label: string; icon?: IconName; shortcut?: string; disabled?: boolean };
export type SelectType = 'primary' | 'secondary' | 'filter' | 'group';

type Common = {
  options: SelectOption[];
  label?: ReactNode;
  /** Text or action on the right of the label row, e.g. "Reset". */
  aside?: ReactNode;
  onAside?: () => void;
  message?: ReactNode;
  placeholder?: string;
  /** Figma `Type`: Primary (filled box), Secondary (borderless until hover), Overflow Filter (blue), Overflow Group (cyan). */
  type?: SelectType;
  size?: FieldSize;
  error?: boolean;
  disabled?: boolean;
  width?: number | string;
};
type Single = Common & { multiple?: false; value: string | null; onChange: (v: string) => void };
type Multi = Common & { multiple: true; value: string[]; onChange: (v: string[]) => void };
export type SelectProps = Single | Multi;

/**
 * Figma: Dropdown Input cell - v2, opening a Menu - v2 of MenuCell - v2 rows.
 * Keyboard: Enter/Space/↓ opens, ↑↓ move, Enter picks, Esc closes. Multi-select keeps the menu open and shows checkboxes.
 */
export function Select(props: SelectProps) {
  const { options, label, aside, onAside, message, placeholder = 'Select', type = 'primary', size = 'medium', error = false, disabled = false, width } = props;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected = props.multiple ? props.value : props.value ? [props.value] : [];
  const display = props.multiple
    ? selected.length === 0
      ? null
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label
        : `${selected.length} selected`
    : options.find((o) => o.value === props.value)?.label;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  function choose(o: SelectOption) {
    if (o.disabled) return;
    if (props.multiple) {
      const has = props.value.includes(o.value);
      props.onChange(has ? props.value.filter((v) => v !== o.value) : [...props.value, o.value]);
    } else {
      props.onChange(o.value);
      setOpen(false);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (disabled) return;
    const step = (d: number) => {
      let i = active;
      for (let n = 0; n < options.length; n++) {
        i = (i + d + options.length) % options.length;
        if (!options[i].disabled) break;
      }
      setActive(i);
    };
    if (!open && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      setActive(Math.max(0, options.findIndex((o) => o.value === selected[0])));
      setOpen(true);
    } else if (open && e.key === 'ArrowDown') {
      e.preventDefault();
      step(1);
    } else if (open && e.key === 'ArrowUp') {
      e.preventDefault();
      step(-1);
    } else if (open && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <Field label={label} aside={aside} onAside={onAside} message={message} error={error} disabled={disabled} htmlFor={`${id}-btn`}>
      <div ref={root} className={[s.control, s[type], sizeClass(size)].join(' ')} data-open={open} data-error={error} data-disabled={disabled} style={{ width }}>
        <button
          id={`${id}-btn`}
          type="button"
          className={s.trigger}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-activedescendant={open ? `${id}-o${active}` : undefined}
          aria-invalid={error || undefined}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKey}
        >
          <span className={[s.value, !display && s.placeholder].filter(Boolean).join(' ')}>{display ?? placeholder}</span>
          <span className={s.chev}>
            <Icon name="keyboard-arrow-down" size={size === 'small' ? 16 : 20} />
          </span>
        </button>
        {open && (
          <ul id={`${id}-list`} role="listbox" aria-multiselectable={props.multiple || undefined} className={[s.menu, size === 'small' && s.menuSmall].filter(Boolean).join(' ')}>
            {options.map((o, i) => {
              const isSel = selected.includes(o.value);
              return (
                <li
                  key={o.value}
                  id={`${id}-o${i}`}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled || undefined}
                  data-active={i === active}
                  className={s.option}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(o)}
                >
                  {props.multiple && (
                    <span className={s.menuBox} aria-hidden="true">
                      <Icon name="check" size={14} />
                    </span>
                  )}
                  {o.icon && (
                    <span className={s.optionIcon}>
                      <Icon name={o.icon} size={20} />
                    </span>
                  )}
                  <span className={s.optionLabel}>{o.label}</span>
                  {o.shortcut && <span className={s.shortcut}>{o.shortcut}</span>}
                  {!props.multiple && isSel && <Icon name="check" size={16} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Field>
  );
}
