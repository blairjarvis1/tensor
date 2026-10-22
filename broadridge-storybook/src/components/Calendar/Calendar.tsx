import { useMemo, useState, type ButtonHTMLAttributes } from 'react';
import { SquareIconButton } from '../Button/ActionButtons';
import { Icon } from '../Icon/Icon';
import s from './Calendar.module.css';

export type DayState = 'default' | 'active' | 'range' | 'outside' | 'hidden';

/** Figma: Calendar Button. One 40px day cell. States: Default, Hover, Active, Range, Disabled, Hidden. */
export function CalendarDay({ state = 'default', today = false, className, type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { state?: DayState; today?: boolean }) {
  return <button type={type} className={[s.day, className].filter(Boolean).join(' ')} data-state={state} data-today={today || undefined} {...rest} />;
}

export type DateRange = { start: Date; end?: Date };
export type CalendarProps = {
  /** Single selection, or a range when `mode="range"`. */
  mode?: 'single' | 'range';
  value?: Date | DateRange | null;
  onChange?: (value: Date | DateRange) => void;
  /** Month shown first. Defaults to the selected date or today. */
  defaultMonth?: Date;
  /** Dates before `min` or after `max` are disabled. */
  min?: Date;
  max?: Date;
  /** Week starts on Sunday, as in Figma. */
  weekStartsOn?: 0 | 1;
  /** Hide days from neighbouring months instead of greying them out. */
  hideOutsideDays?: boolean;
  /** Fixes "today" for stories and tests. */
  today?: Date;
  yearRange?: [number, number];
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const same = (a?: Date, b?: Date) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isRange = (v: unknown): v is DateRange => !!v && typeof v === 'object' && 'start' in (v as object);

/** Figma: Calendar. Month view with month/year pickers and paging, for single dates or ranges. */
export function Calendar({ mode = 'single', value, onChange, defaultMonth, min, max, weekStartsOn = 0, hideOutsideDays = false, today = new Date(), yearRange }: CalendarProps) {
  const anchor = defaultMonth ?? (isRange(value) ? value.start : value) ?? today;
  const [view, setView] = useState(() => new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const [hover, setHover] = useState<Date | null>(null);

  const years = useMemo(() => {
    const [a, b] = yearRange ?? [today.getFullYear() - 10, today.getFullYear() + 10];
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }, [yearRange, today]);

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const lead = (first.getDay() - weekStartsOn + 7) % 7;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - lead);
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const total = Math.ceil((lead + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [view, weekStartsOn]);

  const weekdays = [...WEEKDAYS.slice(weekStartsOn), ...WEEKDAYS.slice(0, weekStartsOn)];
  const range = isRange(value) ? value : null;
  const single = !isRange(value) ? (value ?? undefined) : undefined;
  const rangeEnd = range?.end ?? (range && hover && hover > range.start ? hover : undefined);

  function stateOf(d: Date): DayState {
    const outside = d.getMonth() !== view.getMonth();
    if (outside) return hideOutsideDays ? 'hidden' : 'outside';
    if (mode === 'single') return same(d, single) ? 'active' : 'default';
    if (!range) return 'default';
    if (same(d, range.start) || same(d, range.end)) return 'active';
    if (rangeEnd && d > range.start && d < rangeEnd) return 'range';
    return 'default';
  }

  function pick(d: Date) {
    const day = startOfDay(d);
    if (mode === 'single') return onChange?.(day);
    if (!range || range.end || day < range.start) return onChange?.({ start: day });
    onChange?.({ start: range.start, end: day });
  }

  const page = (delta: number) => setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  return (
    <div className={s.calendar} role="group" aria-label={`${MONTHS[view.getMonth()]} ${view.getFullYear()}`}>
      <div className={s.header}>
        <SquareIconButton icon="chevron-back" aria-label="Previous month" onClick={() => page(-1)} style={{ width: 32, height: 32, border: 0 }} />
        <div className={s.selects}>
          <label className={s.selectWrap}>
            <select className={`${s.select} ${s.month}`} aria-label="Month" value={view.getMonth()} onChange={(e) => setView(new Date(view.getFullYear(), Number(e.target.value), 1))}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <Icon name="keyboard-arrow-down" size={16} />
          </label>
          <label className={s.selectWrap}>
            <select className={`${s.select} ${s.year}`} aria-label="Year" value={view.getFullYear()} onChange={(e) => setView(new Date(Number(e.target.value), view.getMonth(), 1))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Icon name="keyboard-arrow-down" size={16} />
          </label>
        </div>
        <SquareIconButton icon="chevron-forward" aria-label="Next month" onClick={() => page(1)} style={{ width: 32, height: 32, border: 0 }} />
      </div>

      <div>
        <div className={`${s.grid} ${s.head}`} role="row">
          {weekdays.map((w) => (
            <span key={w} className={s.weekday} role="columnheader">
              {w}
            </span>
          ))}
        </div>
        <div className={s.grid} onMouseLeave={() => setHover(null)}>
          {cells.map((d) => {
            const st = stateOf(d);
            const disabled = (min && d < startOfDay(min)) || (max && d > startOfDay(max));
            return (
              <CalendarDay
                key={d.toISOString()}
                state={st}
                today={same(d, today)}
                disabled={!!disabled || st === 'hidden'}
                aria-pressed={st === 'active'}
                aria-label={d.toDateString()}
                onMouseEnter={() => setHover(d)}
                onClick={() => {
                  if (st === 'outside') setView(new Date(d.getFullYear(), d.getMonth(), 1));
                  pick(d);
                }}
              >
                {d.getDate()}
              </CalendarDay>
            );
          })}
        </div>
      </div>
    </div>
  );
}
