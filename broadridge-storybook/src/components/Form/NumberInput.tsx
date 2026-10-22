import { useEffect, useId, useState, type ReactNode } from 'react';
import { Stepper } from '../Button/ActionButtons';
import { Field } from './Field';
import s from './Form.module.css';

export type NumberInputProps = {
  value: number;
  onChange: (v: number) => void;
  label?: ReactNode;
  aside?: ReactNode;
  onAside?: () => void;
  message?: ReactNode;
  /** Pip (increment) choices shown as a segmented selector, e.g. [0.1, 0.01, 0.001]. Omit for Figma `Pips?=No`. */
  pips?: number[];
  /** Increment when there are no pips. */
  step?: number;
  min?: number;
  max?: number;
  /** Decimal places shown. Defaults to the finest pip or step. */
  precision?: number;
  error?: boolean;
  disabled?: boolean;
  width?: number | string;
};

const decimals = (n: number) => (String(n).split('.')[1] ?? '').length;

/** Figma: NumberInput - v2 / Field and Input with controls. A price or size field with −/+ steppers and optional pip selector. */
export function NumberInput({ value, onChange, label, aside, onAside, message, pips, step = 1, min = -Infinity, max = Infinity, precision, error = false, disabled = false, width = 151 }: NumberInputProps) {
  const id = useId();
  const [pip, setPip] = useState(pips?.[0] ?? step);
  const dp = precision ?? Math.max(decimals(pip), ...(pips ?? [step]).map(decimals));
  const [draft, setDraft] = useState(value.toFixed(dp));
  useEffect(() => setDraft(value.toFixed(dp)), [value, dp]);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const nudge = (d: number) => onChange(clamp(Number((value + d * pip).toFixed(dp))));
  const commit = () => {
    const n = Number(draft.replace(/,/g, ''));
    if (Number.isFinite(n)) onChange(clamp(Number(n.toFixed(dp))));
    else setDraft(value.toFixed(dp));
  };

  return (
    <Field label={label} aside={aside} onAside={onAside} message={message} error={error} disabled={disabled} htmlFor={id}>
      <div className={`${s.control} ${s.number}`} data-error={error} data-disabled={disabled} style={{ width }}>
        {pips && (
          <div className={s.pips} role="group" aria-label="Increment">
            {pips.map((p) => (
              <button key={p} type="button" className={s.pip} aria-pressed={pip === p} disabled={disabled} onClick={() => setPip(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
        <div className={s.numberRow}>
          <Stepper action="remove" aria-label={`Decrease by ${pip}`} disabled={disabled || value <= min} onClick={() => nudge(-1)} />
          <input
            id={id}
            inputMode="decimal"
            value={draft}
            disabled={disabled}
            aria-invalid={error || undefined}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                nudge(1);
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                nudge(-1);
              }
            }}
          />
          <Stepper action="add" aria-label={`Increase by ${pip}`} disabled={disabled || value >= max} onClick={() => nudge(1)} />
        </div>
      </div>
    </Field>
  );
}
