import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { Button } from '@ds/components/Button/Button';
import { Calendar } from '@ds/components/Calendar/Calendar';
import { Chip } from '@ds/components/Pills/Pills';
import { Toggle } from '@ds/components/Form/Choice';
import { Select } from '@ds/components/Form/Select';
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '@ds/components/Menu/Menu';
import { Panel, Popover, PopoverButton } from './Popover';
import { TIcon, type TIconName } from './TIcon';
import { Acronym } from './cells';
import type { FolderDef, TabDef } from './data';
import s from './header.module.css';

/** Ignore pointer-downs that start on a control, so header drags never steal clicks. */
export const isControl = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest('button, input, select, textarea, a, label, [role="menu"], [data-no-drag]');

/**
 * Figma: Grid Master Header, Type=Minimised. Title, the Tabs group pill and add button on the left,
 * Grid Filters on the right. 32px row with 12px below and 12px on the right.
 */
export function GridHeader({ title, context, brand, left, right, trailing, onTitlePointerDown, onHeaderPointerDown, onHeaderDoubleClick }: { title: string; context?: ReactNode; brand?: ReactNode; left?: ReactNode; right?: ReactNode; trailing?: ReactNode; onTitlePointerDown?: (e: RPointerEvent) => void; onHeaderPointerDown?: (e: RPointerEvent) => void; onHeaderDoubleClick?: () => void }) {
  return (
    <div
      className={s.header}
      onPointerDown={(e) => onHeaderPointerDown && !isControl(e.target) && !(e.target as HTMLElement).closest(`.${s.title}`) && onHeaderPointerDown(e)}
      onDoubleClick={(e) => onHeaderDoubleClick && !isControl(e.target) && onHeaderDoubleClick()}
    >
      <div className={s.left}>
        {brand}
        <div className={s.title} style={brand ? { marginLeft: 'calc(var(--br-scale-200) - var(--br-scale-400))' } : undefined} onPointerDown={(e) => onTitlePointerDown?.(e)} data-draggable={!!onTitlePointerDown || undefined} title={onTitlePointerDown ? 'Drag to move this panel into its own window' : undefined}>
          {onTitlePointerDown && !brand && (
            <span className={s.grip} aria-hidden="true">
              <TIcon name="drag-indicator" size={16} />
            </span>
          )}
          <span>{title}</span>
        </div>
        {context && <span className={s.context}>{context}</span>}
        {left}
      </div>
      <div className={s.right}>
        {right}
        {trailing}
      </div>
    </div>
  );
}

/* ---------- Tabs: folder groups of saved views ---------- */

export type TabsState = { tabs: TabDef<unknown>[]; folders: FolderDef[]; active: string };

/**
 * Figma: Tab Groups — "Tabs" label, a Surface/Default pill with the tab count acronym and the active view,
 * and an add_2 button. The dropdown lists tabs by folder; new tabs and folders can be created from it.
 */
export function TabGroups({ state, onChange }: { state: TabsState; onChange: (s: TabsState) => void }) {
  const pill = useRef<HTMLButtonElement>(null);
  const add = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<null | 'tab' | 'folder'>(null);
  const activeLabel = state.active === 'all' ? 'All Tabs' : (state.tabs.find((t) => t.id === state.active)?.label ?? 'All Tabs');

  return (
    <div className={s.tabGroups}>
      <span className={s.tabsLabel}>Tabs</span>
      <div className={s.tabsRow}>
        <button ref={pill} type="button" className={s.pill} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} title="Switch tab">
          <Acronym>{state.tabs.length}</Acronym>
          <span className={s.pillText}>{activeLabel}</span>
          <TIcon name={open ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={16} style={{ color: 'var(--br-icons-default)' }} />
        </button>
        <button ref={add} type="button" className={s.addBtn} aria-label="New tab" title="New tab" onClick={() => setForm(form ? null : 'tab')}>
          <TIcon name="add-2" size={20} />
        </button>
      </div>

      <Popover anchor={pill} open={open} onClose={() => setOpen(false)}>
        <Menu size="small" width={240} autoFocus onEscape={() => setOpen(false)} aria-label="Tabs">
          <MenuItem icon="tab-groups" checked={state.active === 'all'} onSelect={() => (onChange({ ...state, active: 'all' }), setOpen(false))}>
            All Tabs
          </MenuItem>
          {state.folders.map((f) => {
            const tabs = state.tabs.filter((t) => t.folder === f.id);
            return [
              <MenuLabel key={`l-${f.id}`}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <TIcon name="folder" size={14} />
                  {f.label}
                </span>
              </MenuLabel>,
              ...tabs.map((t) => (
                <MenuItem key={t.id} checked={state.active === t.id} onSelect={() => (onChange({ ...state, active: t.id }), setOpen(false))}>
                  {t.label}
                </MenuItem>
              )),
              tabs.length === 0 && (
                <MenuItem key={`e-${f.id}`} disabled>
                  No tabs yet
                </MenuItem>
              ),
            ];
          })}
          <MenuSeparator />
          <MenuItem icon="add-2" onSelect={() => (setOpen(false), setForm('tab'))}>
            New tab…
          </MenuItem>
          <MenuItem icon="folder" onSelect={() => (setOpen(false), setForm('folder'))}>
            New folder…
          </MenuItem>
        </Menu>
      </Popover>

      <Popover anchor={form === 'tab' ? add : pill} open={!!form} onClose={() => setForm(null)}>
        <NewItemForm
          kind={form ?? 'tab'}
          folders={state.folders}
          onCancel={() => setForm(null)}
          onCreate={(label, folder) => {
            if (form === 'folder') {
              const id = `f-${Date.now()}`;
              onChange({ ...state, folders: [...state.folders, { id, label }] });
            } else {
              const id = `t-${Date.now()}`;
              onChange({ ...state, tabs: [...state.tabs, { id, label, folder }], active: id });
            }
            setForm(null);
          }}
        />
      </Popover>
    </div>
  );
}

function NewItemForm({ kind, folders, onCreate, onCancel }: { kind: 'tab' | 'folder'; folders: FolderDef[]; onCreate: (label: string, folder: string) => void; onCancel: () => void }) {
  const [label, setLabel] = useState('');
  const [folder, setFolder] = useState(folders[0]?.id ?? '');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  const ok = label.trim().length > 0;
  return (
    <Panel
      width={280}
      title={kind === 'tab' ? 'New tab' : 'New folder'}
      footer={
        <>
          <Button variant="secondary" size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="small" disabled={!ok} onClick={() => ok && onCreate(label.trim(), folder)}>
            Create
          </Button>
        </>
      }
    >
      <label className={s.field}>
        <span>{kind === 'tab' ? 'Tab name' : 'Folder name'}</span>
        <input
          ref={input}
          className={s.input}
          value={label}
          placeholder={kind === 'tab' ? 'e.g. Large SELL orders' : 'e.g. Rates Desk'}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ok && onCreate(label.trim(), folder)}
        />
      </label>
      {kind === 'tab' && folders.length > 0 && (
        <Select label="Folder" size="small" value={folder} onChange={setFolder} options={folders.map((f) => ({ value: f.id, label: f.label, icon: 'folder' }))} />
      )}
      {kind === 'tab' && <span className={s.hint}>The new tab keeps the filters and search you have applied now.</span>}
    </Panel>
  );
}

/* ---------- Grid Filters ---------- */

/** Figma: Button - v2, Tertiary, icon-only, Medium (32px). Icons/Default, Icons/Hover on rollover. */
export function ToolButton({ icon, label, onClick, pressed, badge, refEl, secondary }: { icon: TIconName; label: string; onClick?: () => void; pressed?: boolean; badge?: number; refEl?: React.Ref<HTMLButtonElement>; secondary?: boolean }) {
  return (
    <button ref={refEl} type="button" className={`${s.tool} ${secondary ? s.secondary : ''}`} aria-label={label} title={label} aria-pressed={pressed} onClick={onClick}>
      <TIcon name={icon} size={24} />
      {!!badge && <span className={s.badge}>{badge}</span>}
    </button>
  );
}

const Sep = () => <span className={s.sep} aria-hidden="true" />;

export type FilterGroup = { id: string; label: string; options: { value: string; label: string }[] };
export type Filters = Record<string, string[]>;

export type GridFiltersProps = {
  shown: number;
  total: number;
  query: string;
  onQuery: (q: string) => void;
  groups: FilterGroup[];
  filters: Filters;
  onFilters: (f: Filters) => void;
  onExport: () => void;
  date: Date | null;
  onDate: (d: Date | null) => void;
  /** Bolt + toggle: live updates. Only on grids with a live feed. */
  live?: boolean;
  onLive?: (v: boolean) => void;
  paused?: boolean;
  onPause?: (v: boolean) => void;
  /** Figma `Filters=Minimised`: a bordered chevron + filter control that expands the full bar. */
  collapsible?: boolean;
};

export function GridFilters(p: GridFiltersProps) {
  const [expanded, setExpanded] = useState(!p.collapsible);
  const [searching, setSearching] = useState(!!p.query);
  const filterBtn = useRef<HTMLButtonElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const applied = Object.values(p.filters).reduce((n, v) => n + v.length, 0);
  const fmt = (n: number) => n.toLocaleString('en-GB');

  const filterPopover = (
    <Popover anchor={filterBtn} open={filterOpen} onClose={() => setFilterOpen(false)} placement="bottom-end">
      <FilterPanel groups={p.groups} filters={p.filters} onFilters={p.onFilters} onClose={() => setFilterOpen(false)} />
    </Popover>
  );

  if (p.collapsible && !expanded) {
    return (
      <div className={s.minimised}>
        <button type="button" className={s.chevron} aria-label="Show filter tools" title="Show filter tools" onClick={() => setExpanded(true)}>
          <TIcon name="chevron-back" size={24} />
        </button>
        <ToolButton refEl={filterBtn} icon="filter-alt" label={applied ? `Filters, ${applied} applied` : 'Filters'} pressed={filterOpen} badge={applied} onClick={() => setFilterOpen((o) => !o)} />
        {filterPopover}
      </div>
    );
  }

  return (
    <div className={s.filters} role="toolbar" aria-label="Grid tools">
      {searching ? (
        <div className={s.search}>
          <TIcon name="search" size={20} />
          <input
            autoFocus
            value={p.query}
            placeholder="Search instrument, ISIN, account"
            aria-label="Search rows"
            onChange={(e) => p.onQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                p.onQuery('');
                setSearching(false);
              }
            }}
            onBlur={() => !p.query && setSearching(false)}
          />
          {p.query && (
            <button type="button" aria-label="Clear search" onClick={() => (p.onQuery(''), setSearching(false))}>
              <TIcon name="close" size={16} />
            </button>
          )}
        </div>
      ) : (
        <ToolButton icon="search" label="Search" onClick={() => setSearching(true)} />
      )}
      <Sep />
      <span className={s.count} aria-live="polite">
        Showing {fmt(p.shown)} of {fmt(p.total)} rows
      </span>
      <Sep />
      <ToolButton refEl={filterBtn} icon="filter-alt" label={applied ? `Filters, ${applied} applied` : 'Filters'} pressed={filterOpen} badge={applied} onClick={() => setFilterOpen((o) => !o)} />
      {filterPopover}
      {p.onLive && (
        <>
          <Sep />
          <div className={s.liveGroup} title={p.live ? 'Live updates on' : 'Live updates off'}>
            <span className={s.boltIcon} data-on={p.live || undefined}>
              <TIcon name="bolt" size={24} />
            </span>
            <Toggle aria-label="Live updates" checked={!!p.live} onChange={(e) => p.onLive?.(e.target.checked)} />
          </div>
        </>
      )}
      <Sep />
      <ToolButton icon="export" label="Export to CSV" onClick={p.onExport} />
      <Sep />
      <DateControl date={p.date} onDate={p.onDate} />
      {p.onPause && (
        <>
          <Sep />
          <ToolButton secondary icon={p.paused ? 'play' : 'pause'} label={p.paused ? 'Resume feed' : 'Pause feed'} pressed={p.paused} onClick={() => p.onPause?.(!p.paused)} />
        </>
      )}
      {p.collapsible && (
        <button type="button" className={`${s.chevron} ${s.collapse}`} aria-label="Hide filter tools" title="Hide filter tools" onClick={() => setExpanded(false)}>
          <TIcon name="chevron-forward" size={24} />
        </button>
      )}
    </div>
  );
}

function DateControl({ date, onDate }: { date: Date | null; onDate: (d: Date | null) => void }) {
  const label = date ? `${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} GMT` : 'Today GMT';
  return (
    <div className={s.date}>
      <span className={s.dateLabel}>{label}</span>
      <PopoverButton placement="bottom-end" trigger={({ open, toggle, ref }) => <ToolButton refEl={ref} icon="calendar-today" label="Choose trade date" pressed={open} onClick={toggle} />}>
        {(close) => (
          <Panel
            footer={
              <Button variant="secondary" size="small" onClick={() => (onDate(null), close())}>
                Today
              </Button>
            }
          >
            <Calendar
              value={date ?? new Date()}
              max={new Date()}
              onChange={(d) => {
                const picked = d as Date;
                const today = new Date();
                onDate(picked.toDateString() === today.toDateString() ? null : picked);
                close();
              }}
            />
          </Panel>
        )}
      </PopoverButton>
    </div>
  );
}

/** Filter panel: chips per field (Figma Chip, Type=Filter). Applied chips are filled blue. */
function FilterPanel({ groups, filters, onFilters, onClose }: { groups: FilterGroup[]; filters: Filters; onFilters: (f: Filters) => void; onClose: () => void }) {
  const toggle = (g: string, v: string) => {
    const cur = filters[g] ?? [];
    onFilters({ ...filters, [g]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };
  const any = Object.values(filters).some((v) => v.length);
  return (
    <Panel
      width={360}
      title="Filters"
      footer={
        <>
          <Button variant="secondary" size="small" disabled={!any} onClick={() => onFilters({})}>
            Clear all
          </Button>
          <Button variant="primary" size="small" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      {groups.map((g) => (
        <div key={g.id} className={s.filterGroup}>
          <span className={s.filterLabel}>{g.label}</span>
          <div className={s.chips}>
            {g.options.map((o) => (
              <Chip key={o.value} compact pressed={(filters[g.id] ?? []).includes(o.value)} onClick={() => toggle(g.id, o.value)}>
                {o.label}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </Panel>
  );
}
