import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { BroadridgeLogo } from './BroadridgeLogo';
import s from './Header.module.css';

export type HeaderLink = { id: string; label: string; icon: IconName; badge?: number };

export type GlobalHeaderProps = {
  /** Product name beside the logo, e.g. "Tensor". */
  product?: string;
  links?: HeaderLink[];
  activeLink?: string;
  onLink?: (id: string) => void;
  notifications?: number;
  onNotifications?: () => void;
  onSettings?: () => void;
  /** User initials for the Profile avatar. */
  initials?: string;
  onProfile?: () => void;
};

const DEFAULT_LINKS: HeaderLink[] = [
  { id: 'search', label: 'Search', icon: 'search-check-2' },
  { id: 'watchlist', label: 'Watchlist', icon: 'visibility' },
  { id: 'exceptions', label: 'Exceptions', icon: 'error' },
];

/** Figma: Header / HEADER (Logo and brand + Top header). The app-wide bar with links, alerts, settings and profile. */
export function GlobalHeader({ product = 'Tensor', links = DEFAULT_LINKS, activeLink, onLink, notifications = 0, onNotifications, onSettings, initials = 'JS', onProfile }: GlobalHeaderProps) {
  return (
    <header className={s.global}>
      <a className={s.brand} href="#" aria-label={`Broadridge ${product}, home`} onClick={(e) => e.preventDefault()}>
        <BroadridgeLogo />
        <span className={s.divider} />
        <span className={s.product}>{product}</span>
      </a>
      <div className={s.right}>
        <nav className={s.links} aria-label="Global">
          {links.map((l) => (
            <button key={l.id} type="button" className={`${s.link} ${s.iconLink}`} aria-current={activeLink === l.id ? 'page' : undefined} onClick={() => onLink?.(l.id)}>
              <Icon name={l.icon} size={24} />
              {l.label}
              {!!l.badge && <span className={s.badge} style={{ left: 14, right: 'auto' }}>{l.badge}</span>}
            </button>
          ))}
        </nav>
        <span className={s.divider} />
        <button type="button" className={`${s.link} ${s.iconLink}`} aria-label={`Notifications${notifications ? `, ${notifications} unread` : ''}`} onClick={onNotifications}>
          <Icon name="notification" size={24} />
          {notifications > 0 && <span className={s.badge}>{notifications > 9 ? '9+' : notifications}</span>}
        </button>
        <button type="button" className={s.link} aria-label="Settings" onClick={onSettings}>
          <Icon name="gear-settings" size={24} />
        </button>
        <button type="button" className={s.avatar} aria-label="Profile" onClick={onProfile}>
          {initials}
        </button>
      </div>
    </header>
  );
}

export type PanelHeaderProps = {
  title?: ReactNode;
  /** Figma variants: `right` (Expand + close on the right), `left` (Expand on the left), and floating or slide-out panels. */
  layout?: 'right' | 'left';
  floating?: boolean;
  expandLabel?: string;
  onExpand?: () => void;
  onClose?: () => void;
};

/** Figma: Header / Panel header. 40px bar for slide-out and floating panels. */
export function PanelHeader({ title, layout = 'right', floating = false, expandLabel = 'Expand', onExpand, onClose }: PanelHeaderProps) {
  const expand = onExpand && (
    <button type="button" className={s.expand} onClick={onExpand}>
      <Icon name="expand" size={20} />
      {expandLabel}
    </button>
  );
  return (
    <div className={s.panel} data-floating={floating}>
      {layout === 'left' && expand}
      <span className={s.panelTitle}>{title}</span>
      {layout === 'right' && expand}
      {layout === 'right' && expand && onClose && <span className={s.panelDivider} />}
      {onClose && (
        <button type="button" className={s.close} aria-label="Close panel" onClick={onClose}>
          <Icon name="close" size={24} />
        </button>
      )}
    </div>
  );
}
