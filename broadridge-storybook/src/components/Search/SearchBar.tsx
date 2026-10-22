import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import { Chip } from '../Pills/Pills';
import s from './Search.module.css';

export type SearchItem = { id: string; label: string; kind: string; description?: string; tags?: string[] };

export type SearchBarProps = {
  items: SearchItem[];
  /** Chosen search values, shown as removable chips inside the bar (Figma "Value" state). */
  values: SearchItem[];
  onValuesChange: (v: SearchItem[]) => void;
  /** Kinds offered in the "Filter by" row, e.g. Trades, Clients, Tickets. */
  kinds?: string[];
  placeholder?: string;
  /** Shows a preview card for the highlighted result (Figma Phase 3). */
  preview?: boolean;
  width?: number | string;
};

function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className={s.hl}>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * Figma: Search / Main search bar (Global Search v.2). Type to search trades, clients, tickets and alerts;
 * pick results to add them as chips, filter by kind, and use the "+" operator to add another term.
 * Keyboard: ↑ ↓ move, Enter adds, Backspace on empty input removes the last chip, Esc closes.
 */
export function SearchBar({ items, values, onValuesChange, kinds = [], placeholder = 'Search for trades, clients, tickets, alerts, etc', preview = false, width }: SearchBarProps) {
  const id = useId();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [kind, setKind] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => items.filter((it) => !values.some((v) => v.id === it.id) && (!kind || it.kind === kind) && (!q || `${it.label} ${it.description ?? ''}`.toLowerCase().includes(q.toLowerCase()))).slice(0, 12),
    [items, values, kind, q],
  );

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [open]);
  useEffect(() => setActive(0), [q, kind]);

  const add = (it?: SearchItem) => {
    if (!it) return;
    onValuesChange([...values, it]);
    setQ('');
    input.current?.focus();
  };
  const current = results[active];

  return (
    <div ref={root} className={s.root} data-open={open} style={width ? { ['--w' as string]: typeof width === 'number' ? `${width}px` : width } : undefined}>
      <div className={s.bar} onClick={() => input.current?.focus()}>
        <div className={s.tokens}>
          {values.map((v, i) => (
            <span key={v.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <span className="br-text-bdy-xxsm-med" style={{ color: 'var(--br-text-information-low)' }}>AND</span>}
              <Chip filled compact onRemove={() => onValuesChange(values.filter((x) => x.id !== v.id))}>
                {v.label}
              </Chip>
            </span>
          ))}
          {values.length > 0 && (
            <button type="button" className={s.operator} aria-label="Add another search term" onClick={() => { input.current?.focus(); setOpen(true); }}>
              <Icon name="add-2" size={16} />
            </button>
          )}
          <input
            ref={input}
            className={s.input}
            value={q}
            placeholder={values.length ? '' : placeholder}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={open && current ? `${id}-${current.id}` : undefined}
            aria-label="Search"
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(results.length - 1, a + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
              if (e.key === 'Enter') { e.preventDefault(); add(current); }
              if (e.key === 'Escape') setOpen(false);
              if (e.key === 'Backspace' && !q && values.length) onValuesChange(values.slice(0, -1));
            }}
          />
        </div>
        <button type="button" className={s.searchBtn} aria-label="Search" onClick={() => add(current)}>
          <Icon name="search-check-2" size={20} />
        </button>
      </div>

      {open && (
        <div className={s.panel}>
          {kinds.length > 0 && (
            <div className={s.filters} role="group" aria-label="Filter by">
              <span>Filter by</span>
              {kinds.map((k) => (
                <Chip key={k} compact pressed={kind === k} onClick={() => setKind(kind === k ? null : k)}>
                  {k}
                </Chip>
              ))}
            </div>
          )}
          <div className={s.results} data-preview={preview && !!current}>
            <ul id={`${id}-list`} role="listbox" className={s.list} aria-label="Results">
              {results.map((it, i) => (
                <li key={it.id} id={`${id}-${it.id}`} role="option" aria-selected={i === active} className={s.option} data-active={i === active} onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => add(it)}>
                  <span>{highlight(it.label, q)}</span>
                  <span className={s.optionKind}>{it.kind}</span>
                </li>
              ))}
              {results.length === 0 && <li className={s.none}>No matches for “{q}”.</li>}
            </ul>
            {preview && current && (
              <div className={s.preview} aria-live="polite">
                <div className={s.previewHead}>
                  <span className={s.logo} aria-hidden="true">{current.label.split(/\s+/).map((w) => w[0]).slice(0, 2).join('')}</span>
                  {current.label}
                </div>
                {current.description && <p style={{ margin: 0 }}>{current.description}</p>}
                {current.tags && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {current.tags.map((t) => (
                      <Chip key={t} compact>
                        {t}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
