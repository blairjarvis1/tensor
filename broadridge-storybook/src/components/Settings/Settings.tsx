import { useState, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Icon, type IconName } from '../Icon/Icon';
import { Chip } from '../Pills/Pills';
import { Tabs } from '../Tabs/Tabs';
import s from './Settings.module.css';

/* ---------------- Settings dialog ---------------- */

export type SettingsNavItem = { id: string; label: string; icon: IconName };
export type SettingsNavGroup = { title?: string; items: SettingsNavItem[] };

export type SettingsDialogProps = {
  user: { name: string; account: string; initials: string };
  nav: SettingsNavGroup[];
  active: string;
  onNavigate: (id: string) => void;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  width?: number;
  children: ReactNode;
};

/** Figma: Settings / Config Panel + side bar left. "Settings & preferences" with grouped navigation (General, Analytics, Data Grids…). */
export function SettingsDialog({ user, nav, active, onNavigate, title = 'Settings & preferences', subtitle, onClose, width = 630, children }: SettingsDialogProps) {
  return (
    <div className={s.dialog} role="dialog" aria-label={title} style={{ ['--w' as string]: `${width}px` }}>
      <nav className={s.side} aria-label="Settings sections">
        <div className={s.profile}>
          <div>
            <div className={s.profileName}>{user.name}</div>
            <div className={s.profileSub}>{user.account}</div>
          </div>
          <span className={s.avatar} aria-hidden="true">{user.initials}</span>
        </div>
        {nav.map((g, gi) => (
          <div key={gi} role="group" aria-label={g.title}>
            {g.title && <div className={s.navGroup}>{g.title}</div>}
            {g.items.map((it) => (
              <button key={it.id} type="button" className={s.navItem} aria-current={active === it.id ? 'page' : undefined} onClick={() => onNavigate(it.id)}>
                <Icon name={it.icon} size={16} />
                {it.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className={s.main}>
        <div className={s.head}>
          <div className={s.titleBlock}>
            <h2 className={s.title}>{title}</h2>
            {subtitle && <div className={s.subtitle}>{subtitle}</div>}
          </div>
          {onClose && (
            <button type="button" className={s.close} aria-label="Close settings" onClick={onClose}>
              <Icon name="close" size={20} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function SettingsSection({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--br-scale-200)' }}>
      {label && <h3 className={s.sectionLabel}>{label}</h3>}
      {children}
    </section>
  );
}

/** A bordered group of settings rows. */
export function SettingsCard({ children }: { children: ReactNode }) {
  return <div className={s.card}>{children}</div>;
}

/** One label + control row inside a SettingsCard. */
export function SettingsRow({ label, children }: { label: ReactNode; children?: ReactNode }) {
  return (
    <div className={s.row}>
      <span>{label}</span>
      <span className={s.rowValue}>{children}</span>
    </div>
  );
}

/* ---------------- Column configuration ---------------- */

export type ColumnConfigProps = {
  columns: string[];
  onChange: (cols: string[]) => void;
  onReset?: () => void;
  /** Rendered under the list, e.g. an "Add column(s)" Select. */
  footer?: ReactNode;
};

/**
 * Figma: Settings / Drag column + "Selected columns". Drag chips to reorder, or focus a row and use Alt + ↑ / ↓.
 * × removes a column.
 */
export function ColumnConfig({ columns, onChange, onReset, footer }: ColumnConfigProps) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= columns.length || from === to) return;
    const next = [...columns];
    const [c] = next.splice(from, 1);
    next.splice(to, 0, c);
    onChange(next);
  };
  return (
    <div className={s.cols}>
      <div className={s.colsHead}>
        <span>Selected columns ({columns.length})</span>
        {onReset && (
          <button type="button" className={s.linkBtn} onClick={onReset}>
            Reset to default
          </button>
        )}
      </div>
      <div className={s.hint}>
        <Icon name="drag-indicator" size={14} />
        Drag selected columns to reorder (or Alt + ↑ ↓)
      </div>
      <ul className={s.colList} aria-label="Selected columns">
        {columns.map((c, i) => (
          <li
            key={c}
            className={s.colItem}
            tabIndex={0}
            draggable
            data-dragging={drag === i}
            data-over={over === i && drag !== null && drag !== i}
            aria-label={`${c}, position ${i + 1} of ${columns.length}`}
            onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = 'move'; }}
            onDragOver={(e) => { e.preventDefault(); setOver(i); }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); if (drag !== null) move(drag, i); setDrag(null); setOver(null); }}
            onDragEnd={() => { setDrag(null); setOver(null); }}
            onKeyDown={(e) => {
              if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); move(i, i - 1); requestAnimationFrame(() => (e.currentTarget.parentElement?.children[i - 1] as HTMLElement | undefined)?.focus()); }
              if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); move(i, i + 1); requestAnimationFrame(() => (e.currentTarget.parentElement?.children[i + 1] as HTMLElement | undefined)?.focus()); }
            }}
          >
            <span className={s.handle} aria-hidden="true">
              <Icon name="drag-indicator" size={16} />
            </span>
            <Chip filled compact onRemove={() => onChange(columns.filter((x) => x !== c))}>
              {c}
            </Chip>
          </li>
        ))}
      </ul>
      {footer}
    </div>
  );
}

/* ---------------- Grid settings panel ---------------- */

export type GridSettingsTab = 'filter' | 'sort' | 'group' | 'columns';

/** Figma: Settings / Grid Settings. Filter, Sort, Group and Columns tabs with a Close / Apply footer. */
export function GridSettingsPanel({ tab, onTabChange, children, onClose, onApply, width = 330 }: { tab: GridSettingsTab; onTabChange: (t: GridSettingsTab) => void; children: ReactNode; onClose?: () => void; onApply?: () => void; width?: number }) {
  return (
    <div className={s.gridPanel} role="dialog" aria-label="Grid settings" style={{ ['--w' as string]: `${width}px` }}>
      <div className={s.gridTop}>
        <Tabs<GridSettingsTab> aria-label="Grid settings" size="small" items={[{ value: 'filter', label: 'Filter' }, { value: 'sort', label: 'Sort' }, { value: 'group', label: 'Group' }, { value: 'columns', label: 'Columns' }]} value={tab} onChange={onTabChange} />
        <button type="button" className={s.iconBtn} aria-label="More options" style={{ marginBottom: 6 }}>
          <Icon name="more-horiz" size={20} style={{ transform: 'rotate(90deg)' }} />
        </button>
      </div>
      <div className={s.gridBody}>{children}</div>
      <div className={s.gridFoot}>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onApply}>Apply</Button>
      </div>
    </div>
  );
}

/** Figma: Grid Settings → Group. A chain of grouping chips joined by "Contains" connectors. */
export function GroupingChain({ groups, onRemove, onAdd }: { groups: string[]; onRemove: (g: string) => void; onAdd?: () => void }) {
  return (
    <div className={s.chain}>
      <span className={s.chainHead}>{groups.length} {groups.length === 1 ? 'group' : 'groups'} selected</span>
      {groups.map((g, i) => (
        <div key={g} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {i > 0 && (
            <>
              <span className={s.link} />
              <span className={s.connector}>Contains <Icon name="keyboard-arrow-down" size={12} /></span>
              <span className={s.link} />
            </>
          )}
          <Chip type="grouping" filled compact onRemove={() => onRemove(g)}>
            {g}
          </Chip>
        </div>
      ))}
      {onAdd && (
        <button type="button" className={s.add} aria-label="Add group" onClick={onAdd}>
          <Icon name="add-2" size={20} />
        </button>
      )}
    </div>
  );
}

export { s as settingsStyles };
