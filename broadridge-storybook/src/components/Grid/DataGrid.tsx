import { Fragment, useMemo, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { Checkbox } from '../Form/Choice';
import { Icon } from '../Icon/Icon';
import s from './Grid.module.css';

export type Column<T> = {
  key: string;
  header: ReactNode;
  /** Grouping label shown above / before the heading (Figma `Grouping`, cyan bold). */
  grouping?: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  /** Enables the sort control in the header (Figma `Sort Left` / `Sort Right`). */
  sortable?: boolean;
  /** Value used for sorting; defaults to `row[key]`. */
  sortValue?: (row: T) => string | number;
  render?: (row: T) => ReactNode;
};

export type SortState = { key: string; dir: 'asc' | 'desc' } | null;

export type DataGridProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Leading expand chevron (Figma `Type=Expand`); `renderDetail` fills the expanded row. */
  renderDetail?: (row: T) => ReactNode;
  /** Leading checkbox column (Figma `Type=Checkbox`). */
  checkboxes?: boolean;
  /** Trailing ⋮ menu column (Figma `Type=Menu`). */
  onRowMenu?: (row: T, e: MouseEvent) => void;
  /** `depth` uses the Depth Cell surface (Surface/Grid/Level 5) for order-book ladders. */
  variant?: 'default' | 'depth';
  /** Controlled selection. Click selects one row; Cmd/Ctrl-click and Shift-click multi-select. */
  selected?: string[];
  onSelectedChange?: (keys: string[]) => void;
  defaultSort?: SortState;
  maxHeight?: number | string;
  'aria-label'?: string;
};

/**
 * Figma: Grid / Grid Cell + Depth Cell. A dense 26px-row data grid with sticky 32px header,
 * row rollover, cell highlight, single and multi-select, expandable rows, sorting and keyboard focus (↑ ↓, Space, Enter).
 */
export function DataGrid<T>({ columns, rows, rowKey, renderDetail, checkboxes = false, onRowMenu, variant = 'default', selected: selectedProp, onSelectedChange, defaultSort = null, maxHeight, ...aria }: DataGridProps<T>) {
  const [sort, setSort] = useState<SortState>(defaultSort);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [selInternal, setSelInternal] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<string | null>(null);
  const selected = selectedProp ?? selInternal;
  const setSelected = (k: string[]) => (onSelectedChange ? onSelectedChange(k) : setSelInternal(k));

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = col?.sortValue ?? ((r: T) => (r as Record<string, unknown>)[sort.key] as string | number);
    return [...rows].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      const d = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
      return sort.dir === 'asc' ? d : -d;
    });
  }, [rows, sort, columns]);
  const keys = sorted.map(rowKey);

  function select(key: string, e: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }) {
    if (e.shiftKey && anchor) {
      const [a, b] = [keys.indexOf(anchor), keys.indexOf(key)].sort((m, n) => m - n);
      setSelected(keys.slice(a, b + 1));
    } else if (e.metaKey || e.ctrlKey || checkboxes) {
      setSelected(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
      setAnchor(key);
    } else {
      setSelected(selected.length === 1 && selected[0] === key ? [] : [key]);
      setAnchor(key);
    }
  }

  function onRowKey(e: KeyboardEvent<HTMLTableRowElement>, key: string) {
    const i = keys.indexOf(key);
    const move = (d: number) => {
      const next = (e.currentTarget.parentElement?.querySelectorAll<HTMLTableRowElement>('tr[data-row]') ?? [])[Math.min(keys.length - 1, Math.max(0, i + d))];
      next?.focus();
      if (e.shiftKey && next?.dataset.row) select(next.dataset.row, { metaKey: false, ctrlKey: false, shiftKey: true });
    };
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    if (e.key === ' ') { e.preventDefault(); select(key, { metaKey: e.metaKey, ctrlKey: e.ctrlKey, shiftKey: false }); }
    if (e.key === 'Enter' && renderDetail) toggle(key);
  }

  const toggle = (key: string) => setOpen((o) => { const n = new Set(o); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  const multi = selected.length > 1;
  const span = columns.length + (renderDetail || !checkboxes ? 1 : 0) + (checkboxes ? 1 : 0) + (onRowMenu ? 1 : 0);
  const allChecked = selected.length > 0 && selected.length === keys.length;

  return (
    <div className={[s.wrap, variant === 'depth' && s.depth].filter(Boolean).join(' ')} style={{ maxHeight }}>
      <table className={s.table} role="grid" aria-multiselectable aria-label={aria['aria-label']}>
        <thead>
          <tr>
            {(renderDetail || !checkboxes) && <th className={`${s.th} ${s.utility}`} aria-label="Expand" />}
            {checkboxes && (
              <th className={`${s.th} ${s.utility}`}>
                <Checkbox aria-label="Select all rows" checked={allChecked} indeterminate={selected.length > 0 && !allChecked} onChange={() => setSelected(allChecked ? [] : keys)} />
              </th>
            )}
            {columns.map((c) => {
              const dir = sort?.key === c.key ? sort.dir : null;
              const label = (
                <>
                  {c.grouping && <span className={s.grouping}>{c.grouping}</span>}
                  {c.header}
                </>
              );
              return (
                <th key={c.key} className={s.th} data-align={c.align} style={{ width: c.width, minWidth: c.width }} aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}>
                  <span className={s.thInner}>
                    {c.sortable ? (
                      <button type="button" className={s.sortBtn} onClick={() => setSort(dir === 'asc' ? { key: c.key, dir: 'desc' } : dir === 'desc' ? null : { key: c.key, dir: 'asc' })}>
                        {label}
                        <span className={s.sortIcon}>
                          <Icon name={dir === 'desc' ? 'sorting-down' : dir === 'asc' ? 'sorting-up' : 'keyboard-arrow-down'} size={20} />
                        </span>
                      </button>
                    ) : (
                      label
                    )}
                  </span>
                </th>
              );
            })}
            {onRowMenu && <th className={`${s.th} ${s.utility} ${s.menuCell}`} aria-label="Row actions" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const key = rowKey(row);
            const isSel = selected.includes(key);
            const isOpen = open.has(key);
            return (
              <Fragment key={key}>
                <tr
                  className={s.row}
                  data-row={key}
                  tabIndex={0}
                  aria-selected={isSel}
                  aria-expanded={renderDetail ? isOpen : undefined}
                  data-multi={isSel && multi}
                  onMouseDown={(e) => e.shiftKey && e.preventDefault()}
                  onClick={(e) => select(key, e)}
                  onKeyDown={(e) => onRowKey(e, key)}
                >
                  {(renderDetail || !checkboxes) && (
                    <td className={`${s.td} ${s.utility} ${s.lead}`}>
                      {renderDetail && (
                        <button type="button" tabIndex={-1} className={s.expandBtn} aria-label={isOpen ? 'Collapse row' : 'Expand row'} aria-expanded={isOpen} onClick={(e) => { e.stopPropagation(); toggle(key); }}>
                          <Icon name="chevron-forward" size={20} />
                        </button>
                      )}
                    </td>
                  )}
                  {checkboxes && (
                    <td className={`${s.td} ${s.utility} ${s.lead}`} onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label="Select row" tabIndex={-1} checked={isSel} onChange={() => select(key, { metaKey: true, ctrlKey: false, shiftKey: false })} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={s.td} data-align={c.align}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                    </td>
                  ))}
                  {onRowMenu && (
                    <td className={`${s.td} ${s.utility} ${s.menuCell}`}>
                      <button type="button" tabIndex={-1} className={s.menuBtn} aria-label="Row actions" onClick={(e) => { e.stopPropagation(); onRowMenu(row, e); }}>
                        <Icon name="more-horiz" size={20} style={{ transform: 'rotate(90deg)' }} />
                      </button>
                    </td>
                  )}
                </tr>
                {renderDetail && isOpen && (
                  <tr className={s.detail}>
                    <td className={s.td} colSpan={span}>
                      {renderDetail(row)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Figma: grid `acronym` tag, e.g. "IS" beside a value. */
export function Acronym({ children }: { children: ReactNode }) {
  return <span className={s.acronym}>{children}</span>;
}

/** Price-change value with the Figma up/down arrow and Text/Price Increase / Decrease colour. */
export function PriceChange({ value, format = (v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)) }: { value: number; format?: (v: number) => string }) {
  const up = value >= 0;
  return (
    <span className={`${s.change} ${up ? s.up : s.down}`}>
      <Icon name={up ? 'arrow-upward-alt' : 'arrow-downward-alt'} size={16} />
      {format(value)}
    </span>
  );
}

/** Bid / ask coloured value (Text/Bid, Text/Ask). */
export function SideValue({ side, children }: { side: 'bid' | 'ask'; children: ReactNode }) {
  return <span className={side === 'bid' ? s.bid : s.ask}>{children}</span>;
}
