import { useState } from 'react';
import { NotificationCard, type NotificationCardProps } from '../Card/NotificationCard';
import { Icon } from '../Icon/Icon';
import s from './Panels.module.css';

export type NotificationItem = NotificationCardProps & { id: string };
export type NotificationGroup = { id: string; title: string; items: NotificationItem[] };

export type NotificationPanelProps = {
  /** The newest notification, shown first as a stacked card when there are others behind it. */
  latest?: NotificationItem;
  groups: NotificationGroup[];
  onClose?: () => void;
  onClearGroup?: (groupId: string) => void;
  height?: number;
};

/** Figma: Panels / NotificationPanel. Header with unread count, the latest alert, then collapsible groups (e.g. "Limit breach"). */
export function NotificationPanel({ latest, groups, onClose, onClearGroup, height = 951 }: NotificationPanelProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const total = (latest ? 1 : 0) + groups.reduce((n, g) => n + g.items.length, 0);
  const toggle = (id: string) => setCollapsed((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return (
    <aside className={s.notif} style={{ ['--h' as string]: `${height}px` }} aria-label="Notifications">
      <div className={s.nHead}>
        <h2 className={s.nTitle}>Notifications</h2>
        <span className={s.count} aria-label={`${total} notifications`}>{total}</span>
        {onClose && (
          <button type="button" className={s.iconBtn} aria-label="Close notifications" onClick={onClose}>
            <Icon name="close" size={24} />
          </button>
        )}
      </div>
      <div className={s.nScroll}>
        {latest && <NotificationCard {...latest} stacked={groups.some((g) => g.items.length > 0)} />}
        {groups.map((g) => {
          const isCollapsed = collapsed.has(g.id);
          return (
            <section key={g.id} className={s.group} aria-label={g.title}>
              <div className={s.groupHead}>
                <span>{g.title}</span>
                <button type="button" className={s.link} aria-expanded={!isCollapsed} onClick={() => toggle(g.id)}>
                  {isCollapsed ? `Show ${g.items.length}` : 'Show less'}
                </button>
                {onClearGroup && (
                  <button type="button" className={s.link} onClick={() => onClearGroup(g.id)}>
                    Clear all
                  </button>
                )}
              </div>
              {!isCollapsed && g.items.map((n) => <NotificationCard key={n.id} {...n} />)}
            </section>
          );
        })}
        {total === 0 && <p className={s.empty}>You're all caught up.</p>}
      </div>
    </aside>
  );
}
