import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import s from './Form.module.css';

export type FieldSize = 'small' | 'medium' | 'large';
export const sizeClass = (size: FieldSize) => (size === 'small' ? s.sizeSmall : size === 'large' ? s.sizeLarge : '');

/**
 * Label row + control + message, shared by every input in this group.
 * Figma: the "Ask Yield … Reset" header on Dropdown Input cell, Field and Input and NumberInput.
 */
export function Field({ label, aside, onAside, message, error, disabled, block, htmlFor, children }: { label?: ReactNode; aside?: ReactNode; onAside?: () => void; message?: ReactNode; error?: boolean; disabled?: boolean; block?: boolean; htmlFor?: string; children: ReactNode }) {
  return (
    <div className={s.field} data-disabled={!!disabled} data-block={!!block}>
      {(label || aside) && (
        <div className={s.labelRow}>
          {label ? (
            <label className={s.label} htmlFor={htmlFor}>
              {label}
            </label>
          ) : (
            <span />
          )}
          {aside &&
            (onAside ? (
              <button type="button" className={s.aside} onClick={onAside} disabled={disabled}>
                {aside}
              </button>
            ) : (
              <span className={s.aside}>{aside}</span>
            ))}
        </div>
      )}
      {children}
      {message && (
        <span className={s.message} data-error={!!error} role={error ? 'alert' : undefined}>
          {message}
        </span>
      )}
    </div>
  );
}

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: ReactNode;
  aside?: ReactNode;
  message?: ReactNode;
  error?: boolean;
  size?: FieldSize;
  /** Leading icon, e.g. `calendar-today` for date fields. */
  icon?: IconName;
  /** Trailing unit, e.g. "bps" or "%". */
  unit?: string;
  align?: 'left' | 'right';
  width?: number | string;
};

/** Figma: Field and Input (text). Used for dates, times, amounts and free text. */
export function TextField({ label, aside, message, error = false, size = 'medium', icon, unit, align = 'left', width, disabled, id, ...rest }: TextFieldProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <Field label={label} aside={aside} message={message} error={error} disabled={disabled} htmlFor={inputId}>
      <div className={[s.control, sizeClass(size)].join(' ')} data-error={error} data-disabled={!!disabled} data-align={align} style={{ width }}>
        {icon && (
          <span className={s.adorn}>
            <Icon name={icon} size={16} />
          </span>
        )}
        <input id={inputId} disabled={disabled} aria-invalid={error || undefined} {...rest} />
        {unit && <span className={s.unit}>{unit}</span>}
      </div>
    </Field>
  );
}
