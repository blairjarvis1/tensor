import type { ReactNode } from 'react';
import { Stepper } from '../Button/ActionButtons';
import s from './Form.module.css';

type Base = { min?: number; max?: number; step?: number; disabled?: boolean; label?: string; width?: number | string };
const pct = (v: number, min: number, max: number) => ((v - min) / (max - min)) * 100;

/**
 * Figma: ValueSlider (+ ValueSliderDragCircle). A 2px track with a 12px knob between −/+ steppers.
 * Used for algo parameters such as Urgency or Target Participation.
 */
export function ValueSlider({ value, onChange, min = 0, max = 100, step = 1, disabled = false, label, width, steppers = true, showValue = false, format = String }: Base & { value: number; onChange: (v: number) => void; steppers?: boolean; showValue?: boolean; format?: (v: number) => ReactNode }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className={`${s.slider} ${s.single}`} data-disabled={disabled} style={{ width }}>
      {steppers && <Stepper action="remove" aria-label={`Decrease ${label ?? ''}`.trim()} disabled={disabled || value <= min} onClick={() => onChange(clamp(value - step))} />}
      <div className={s.rail}>
        <span className={s.fill} style={{ left: 0, width: `${pct(value, min, max)}%` }} />
        <input className={s.range} type="range" min={min} max={max} step={step} value={value} disabled={disabled} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} />
      </div>
      {steppers && <Stepper action="add" aria-label={`Increase ${label ?? ''}`.trim()} disabled={disabled || value >= max} onClick={() => onChange(clamp(value + step))} />}
      {showValue && <span className={s.sliderValue}>{format(value)}</span>}
    </div>
  );
}

/** Figma: RangeSlider (+ RangeSliderDragCircle). Two 16px Primary knobs; the selected span is Primary, the rest grey. */
export function RangeSlider({ value, onChange, min = 0, max = 100, step = 1, disabled = false, label = 'Range', width, minGap = 0 }: Base & { value: [number, number]; onChange: (v: [number, number]) => void; minGap?: number }) {
  const [lo, hi] = value;
  return (
    <div className={`${s.slider} ${s.dual}`} data-disabled={disabled} style={{ width }}>
      <div className={s.rail}>
        <span className={s.fill} style={{ left: `${pct(lo, min, max)}%`, width: `${pct(hi, min, max) - pct(lo, min, max)}%` }} />
        <input className={s.range} type="range" min={min} max={max} step={step} value={lo} disabled={disabled} aria-label={`${label} minimum`} onChange={(e) => onChange([Math.min(Number(e.target.value), hi - minGap), hi])} />
        <input className={s.range} type="range" min={min} max={max} step={step} value={hi} disabled={disabled} aria-label={`${label} maximum`} onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + minGap)])} />
      </div>
    </div>
  );
}
