import { Fragment, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from '@ds/components/Icon/Icon';
import { Menu, MenuItem, MenuSeparator } from '@ds/components/Menu/Menu';
import { Popover } from './Popover';
import s from './grid.module.css';

export type GridColumn<T> = {
  key: string;
  header: string;
  /** Column width from the Figma frame. */
  width: number;
  /** Figma cell alignment: MIN = left, MAX = right, CENTER. */
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  /** Text colour token for the whole column (e.g. Bid / Ask sides). */
  tone?: 'bid' | 'ask';
};

export type RowAction<T> = { label: string; icon?: Parameters<typeof MenuItem>[0]['icon']; destructive?: boolean; onSelect: (row: T) => void } | 'separator';

type Props<T> = {
  columns: GridColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** `single`: click selects one row (parent grid). `multi`: Cmd/Ctrl and Shift extend the selection (child grid). */
  selection: 'single' | 'multi';
  selected: string[];
  onSelect: (keys: string[]) => void;
  renderDetail?: (row: T) => ReactNode;
  rowActions?: RowAction<T>[];
  /** Cells that just changed on the live feed: rowKey → columnKey → direction. */
  flash?: Record<string, Record<string, 'up' | 'down'>>;
  loading?: boolean;
  empty?: ReactNode;
  label: string;
};

type Sort = { key: string; dir: 'asc' | 'desc' } | null;

/**
 * Figma: Grid / Grid Cell (Data Text, Text with acronym, Order Status, Graph, Expand, Menu).
 * 32px header on Surface/Grid/Column Row, 26px rows on Surface/Grid/Level 2, 1px Border/Separator Level 3 dividers,
 * Bdy xsm Reg (11/16) text. Sticky header and row-action column, sortable headings, expandable rows, keyboard focus.
 */
export function TensorGrid<T>({ columns, rows, rowKey, selection, selected, onSelect, renderDetail, rowActions, flash, loading, empty, label }: Props<T>) {
  const [sort, setSort] = useState<Sort>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ key: string; row: T } | null>(null);
  const menuAnchor = useRef<HTMLElement | null>(null);
  const body = useRef<HTMLTableSectionElement>(null);

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
    if (selection === 'multi' && e.shiftKey && anchor) {
      const [a, b] = [keys.indexOf(anchor), keys.indexOf(key)].sort((m, n) => m - n);
      onSelect(keys.slice(a, b + 1));
      return;
    }
    if (selection === 'multi' && (e.metaKey || e.ctrlKey)) onSelect(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
    else onSelect([key]);
    setAnchor(key);
  }

  const toggle = (key: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  function onRowKey(e: KeyboardEvent<HTMLTableRowElement>, key: string) {
    const i = keys.indexOf(key);
    const go = (d: number) => {
      e.preventDefault();
      const list = body.current?.querySelectorAll<HTMLTableRowElement>('tr[data-row]');
      const next = list?.[Math.min(keys.length - 1, Math.max(0, i + d))];
      next?.focus();
      if (next?.dataset.row) select(next.dataset.row, { metaKey: false, ctrlKey: false, shiftKey: e.shiftKey });
    };
    if (e.key === 'ArrowDown') go(1);
    else if (e.key === 'ArrowUp') go(-1);
    else if (e.key === ' ') {
      e.preventDefault();
      select(key, { metaKey: true, ctrlKey: e.ctrlKey, shiftKey: false });
    } else if (e.key === 'Enter' && renderDetail) toggle(key);
  }

  const multi = selection === 'multi' && selected.length > 1;
  const span = columns.length + 2 + (rowActions ? 1 : 0);

  return (
    <div className={`${s.wrap} br-scroll`} data-loading={loading || undefined}>
      <table className={s.table} role="grid" aria-label={label} aria-multiselectable={selection === 'multi'} aria-busy={loading || undefined}>
        <colgroup>
          <col style={{ width: 24 }} />
          {columns.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
          <col />
          {rowActions && <col style={{ width: 25 }} />}
        </colgroup>
        <thead>
          <tr>
            <th className={`${s.th} ${s.lead}`}>
              {renderDetail && (
                <button
                  type="button"
                  className={s.expandBtn}
                  aria-label={open.size ? 'Collapse all rows' : 'Expand all rows'}
                  title={open.size ? 'Collapse all' : 'Expand all'}
                  aria-expanded={open.size > 0}
                  onClick={() => setOpen(open.size ? new Set() : new Set(keys.slice(0, 50)))}
                >
                  <Icon name="chevron-forward" size={20} />
                </button>
              )}
            </th>
            {columns.map((c) => {
              const dir = sort?.key === c.key ? sort.dir : null;
              return (
                <th key={c.key} className={s.th} data-align={c.align} aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}>
                  <button
                    type="button"
                    className={s.sortBtn}
                    title={`Sort by ${c.header}`}
                    onClick={() => setSort(dir === 'asc' ? { key: c.key, dir: 'desc' } : dir === 'desc' ? null : { key: c.key, dir: 'asc' })}
                  >
                    <span className={s.thText}>{c.header}</span>
                    {dir && <Icon name={dir === 'asc' ? 'sorting-up' : 'sorting-down'} size={16} />}
                  </button>
                </th>
              );
            })}
            <th className={s.th} aria-hidden="true" />
            {rowActions && <th className={`${s.th} ${s.menuCell}`} aria-label="Row actions" />}
          </tr>
        </thead>
        <tbody ref={body}>
          {sorted.map((row) => {
            const key = rowKey(row);
            const isSel = selected.includes(key);
            const isOpen = open.has(key);
            const f = flash?.[key];
            return (
              <Fragment key={key}>
                <tr
                  className={s.row}
                  data-row={key}
                  tabIndex={0}
                  aria-selected={isSel}
                  aria-expanded={renderDetail ? isOpen : undefined}
                  data-multi={(isSel && multi) || undefined}
                  onMouseDown={(e) => e.shiftKey && e.preventDefault()}
                  onClick={(e) => select(key, e)}
                  onKeyDown={(e) => onRowKey(e, key)}
                >
                  <td className={`${s.td} ${s.lead}`}>
                    {renderDetail && (
                      <button
                        type="button"
                        tabIndex={-1}
                        className={s.expandBtn}
                        aria-label={isOpen ? 'Collapse row' : 'Expand row'}
                        aria-expanded={isOpen}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(key);
                        }}
                      >
                        <Icon name="chevron-forward" size={20} />
                      </button>
                    )}
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className={s.td} data-align={c.align} data-tone={c.tone} data-flash={f?.[c.key]}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                    </td>
                  ))}
                  <td className={s.td} />
                  {rowActions && (
                    <td className={`${s.td} ${s.menuCell}`}>
                      <button
                        type="button"
                        tabIndex={-1}
                        className={s.menuBtn}
                        aria-label="Row actions"
                        aria-haspopup="menu"
                        aria-expanded={menu?.key === key}
                        onClick={(e) => {
                          e.stopPropagation();
                          menuAnchor.current = e.currentTarget;
                          setMenu(menu?.key === key ? null : { key, row });
                        }}
                      >
                        <Icon name="more-horiz" size={20} />
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
      {!loading && sorted.length === 0 && <div className={s.empty}>{empty ?? 'No rows match'}</div>}
      {rowActions && (
        <Popover anchor={menuAnchor} open={!!menu} onClose={() => setMenu(null)} placement="bottom-end">
          <Menu size="small" width={200} autoFocus onEscape={() => setMenu(null)} aria-label="Row actions">
            {rowActions.map((a, i) =>
              a === 'separator' ? (
                <MenuSeparator key={i} />
              ) : (
                <MenuItem
                  key={a.label}
                  icon={a.icon}
                  destructive={a.destructive}
                  onSelect={() => {
                    if (menu) a.onSelect(menu.row);
                    setMenu(null);
                  }}
                >
                  {a.label}
                </MenuItem>
              ),
            )}
          </Menu>
        </Popover>
      )}
    </div>
  );
}
