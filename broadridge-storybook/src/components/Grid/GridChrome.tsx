import type { ReactNode } from 'react';
import { Toggle } from '../Form/Choice';
import { Icon, type IconName } from '../Icon/Icon';
import s from './Grid.module.css';

export type GridTab = { id: string; label: string; icon?: IconName };

/** Figma: Tab (grid tabs). Selected, Unselected, Rollover and Focus, with close and a "+" add tab. */
export function GridTabs({ tabs, value, onChange, onClose, onAdd }: { tabs: GridTab[]; value: string; onChange: (id: string) => void; onClose?: (id: string) => void; onAdd?: () => void }) {
  return (
    <div className={s.tabs} role="tablist">
      {tabs.map((t) => (
        <div key={t.id} role="tab" tabIndex={t.id === value ? 0 : -1} aria-selected={t.id === value} className={s.tab} onClick={() => onChange(t.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange(t.id)}>
          {t.icon && <Icon name={t.icon} size={16} />}
          <span>{t.label}</span>
          {onClose ? (
            <button
              type="button"
              className={s.tabClose}
              aria-label={`Close ${t.label}`}
              onClick={(e) => {
                e.stopPropagation();
                onClose(t.id);
              }}
            >
              <Icon name="close" size={20} />
            </button>
          ) : (
            <span style={{ width: 4 }} />
          )}
        </div>
      ))}
      {onAdd && (
        <button type="button" className={`${s.tab} ${s.addTab}`} aria-label="Add tab" onClick={onAdd}>
          <Icon name="add-2" size={20} />
        </button>
      )}
    </div>
  );
}

export function FilterChip({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className={s.chip}>
      {children}
      {onRemove && (
        <button type="button" aria-label={`Remove ${typeof children === 'string' ? children : 'filter'}`} onClick={onRemove}>
          <Icon name="close" size={16} />
        </button>
      )}
    </span>
  );
}

export function ToolButton({ icon, label, pressed, onClick }: { icon: IconName; label: string; pressed?: boolean; onClick?: () => void }) {
  return (
    <button type="button" className={s.iconBtn} title={label} aria-label={label} aria-pressed={pressed} onClick={onClick}>
      <Icon name={icon} size={24} />
    </button>
  );
}

export type GridToolsProps = {
  shown: number;
  total: number;
  filters: string[];
  onRemoveFilter?: (f: string) => void;
  onClearFilters?: () => void;
  quickFilters?: boolean;
  onQuickFiltersChange?: (on: boolean) => void;
  onAction?: (action: 'filter' | 'sort' | 'group' | 'columns' | 'download') => void;
};

/** Figma: Header / Grid Tools. Row count, applied filter chips, filter/sort/group/column tools, quick-filter toggle and download. */
export function GridTools({ shown, total, filters, onRemoveFilter, onClearFilters, quickFilters = false, onQuickFiltersChange, onAction }: GridToolsProps) {
  const fmt = (n: number) => n.toLocaleString('en-GB');
  return (
    <div className={s.tools} role="toolbar" aria-label="Grid tools">
      <span>
        Showing {fmt(shown)} of {fmt(total)} rows
      </span>
      {filters.length > 0 && (
        <>
          <span className={s.vr} />
          <div className={s.toolsGroup}>
            {onClearFilters ? (
              <button type="button" className={s.linkBtn} onClick={onClearFilters} title="Clear all filters">
                {filters.length} {filters.length === 1 ? 'filter' : 'filters'} applied
              </button>
            ) : (
              <span>
                {filters.length} {filters.length === 1 ? 'filter' : 'filters'} applied
              </span>
            )}
            {filters.map((f) => (
              <FilterChip key={f} onRemove={onRemoveFilter ? () => onRemoveFilter(f) : undefined}>
                {f}
              </FilterChip>
            ))}
          </div>
        </>
      )}
      <span className={s.vr} />
      <div className={s.toolIcons}>
        <ToolButton icon="filter-alt" label="Filter" onClick={() => onAction?.('filter')} />
        <ToolButton icon="list-arrow" label="Sort" onClick={() => onAction?.('sort')} />
        <ToolButton icon="rubric" label="Group" onClick={() => onAction?.('group')} />
        <ToolButton icon="columns" label="Columns" onClick={() => onAction?.('columns')} />
      </div>
      <span className={s.vr} />
      <div className={s.toolsGroup} style={{ gap: 0 }}>
        <span style={{ color: 'var(--br-icons-default)', display: 'inline-flex' }} title="Quick filters">
          <Icon name="quick-filters" size={24} />
        </span>
        <Toggle aria-label="Quick filters" checked={quickFilters} onChange={(e) => onQuickFiltersChange?.(e.target.checked)} />
      </div>
      <span className={s.vr} />
      <ToolButton icon="download" label="Download" onClick={() => onAction?.('download')} />
    </div>
  );
}
