import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import s from './Form.module.css';

type InputBase = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>;

/** Figma: Checkbox - v2. 18px box; states Default, Rollover, Selected, Multi-select (indeterminate), Error, Disabled. */
export function Checkbox({ label, indeterminate = false, error = false, disabled, className, ...rest }: InputBase & { label?: ReactNode; indeterminate?: boolean; error?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className={[s.choice, className].filter(Boolean).join(' ')} data-disabled={!!disabled} data-error={error}>
      <input ref={ref} type="checkbox" disabled={disabled} aria-checked={indeterminate ? 'mixed' : undefined} aria-invalid={error || undefined} {...rest} />
      <span className={s.box} aria-hidden="true">
        <Icon name={indeterminate ? 'check-indeterminate-small' : 'check'} size={indeterminate ? 18 : 16} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

/** Figma: RadioButtons. 18px circle; Selected is a 5px Primary ring. Use inside `RadioGroup`. */
export function Radio({ label, error = false, disabled, className, ...rest }: InputBase & { label?: ReactNode; error?: boolean }) {
  return (
    <label className={[s.choice, className].filter(Boolean).join(' ')} data-disabled={!!disabled} data-error={error}>
      <input type="radio" disabled={disabled} {...rest} />
      <span className={s.radio} aria-hidden="true" />
      {label && <span>{label}</span>}
    </label>
  );
}

export function RadioGroup<T extends string>({ label, name, value, onChange, options, orientation = 'horizontal', disabled }: { label?: string; name?: string; value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; disabled?: boolean }[]; orientation?: 'horizontal' | 'vertical'; disabled?: boolean }) {
  const auto = useId();
  return (
    <fieldset className={s.radioGroup} data-orientation={orientation} role="radiogroup" aria-label={label}>
      {label && <legend className={s.srOnly}>{label}</legend>}
      {options.map((o) => (
        <Radio key={o.value} name={name ?? auto} value={o.value} label={o.label} checked={value === o.value} disabled={disabled || o.disabled} onChange={() => onChange(o.value)} />
      ))}
    </fieldset>
  );
}

export type ToggleColour = 'standard' | 'green' | 'purple' | 'red' | 'yellow';

/** Figma: ToggleSwitch - v2. 40×20 (Medium) or 32×16 (Small). `colour` matches the Figma Colour property. */
export function Toggle({ label, colour = 'standard', size = 'medium', disabled, className, ...rest }: InputBase & { label?: ReactNode; colour?: ToggleColour; size?: 'medium' | 'small' }) {
  return (
    <label className={[s.choice, colour !== 'standard' && s[colour], size === 'small' && s.toggleSmall, className].filter(Boolean).join(' ')} data-disabled={!!disabled}>
      <input type="checkbox" role="switch" disabled={disabled} {...rest} />
      <span className={s.track} aria-hidden="true" />
      {label && <span className={s.toggleLabel}>{label}</span>}
    </label>
  );
}
