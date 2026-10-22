import { useRef, useState, type ReactNode } from 'react';
import { BroadridgeLogo } from '@ds/components/Header/BroadridgeLogo';
import { Icon } from '@ds/components/Icon/Icon';
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '@ds/components/Menu/Menu';
import { WindowControls } from '../wm/AppWindow';
import { MODULE_TITLES, type ModuleId, type Win } from '../wm/store';
import { useWM } from '../wm/WindowManager';
import { INSTRUMENTS, fmtNum } from './data';
import { isControl } from './GridHeader';
import { Panel, Popover } from './Popover';
import { TIcon } from './TIcon';
import { useTensor } from './TensorState';
import s from './mainHeader.module.css';

/**
 * Figma: Header / HEADER inside the Windows Framework (Main Header = true).
 * Logo and brand (Large) on the left; Top header (Search, Watchlist, notifications, settings, profile)
 * and the Windows Browser Controls on the right. 32px tall.
 */
export function MainHeader({ win }: { win: Win }) {
  const { dispatch, beginMove } = useWM();
  return (
    <header className={s.header} onPointerDown={(e) => !isControl(e.target) && beginMove(e, win.id)} onDoubleClick={(e) => !isControl(e.target) && dispatch({ type: 'toggleMax', id: win.id })}>
      <div className={s.brand}>
        <BroadridgeLogo height={25} />
        <span className={s.divider} />
        <span className={s.product}>Tensor</span>
        {/* Figma: icons / 24 / sorting Up, rotated (▾) — folds the header into the first panel's bar. */}
        <button type="button" className={s.caret} aria-label="Minimise header" aria-expanded="true" title="Minimise header" onClick={() => dispatch({ type: 'toggleHeader', id: win.id })}>
          <Caret dir="down" />
        </button>
      </div>
      <div className={s.right}>
        <SearchLink />
        <WatchlistLink />
        <span className={s.vr} />
        <NotificationsLink />
        <SettingsLink win={win} />
        <ProfileLink />
        <WindowControls win={win} />
      </div>
    </header>
  );
}

/** Figma: icons / 24 / sorting Up — a 6.7 × 3.3 triangle in Icons/Default. */
function Caret({ dir }: { dir: 'up' | 'down' }) {
  return (
    <svg width="7" height="4" viewBox="0 0 6.667 3.333" aria-hidden="true" style={{ display: 'block', transform: dir === 'down' ? 'rotate(180deg)' : undefined }}>
      <path d="M0 3.333 3.333 0l3.334 3.333z" fill="currentColor" />
    </svg>
  );
}

/** Broadridge mark on its own (Figma .Broadridge_Financial_Solutions_Logo, Property 1=Icon only), 19 × 21, Text/Headings. */
function BroadridgeMark() {
  return (
    <svg width="19" height="21" viewBox="0 0 20 22" aria-hidden="true" style={{ display: 'block', flex: 'none', color: 'var(--br-text-headings)' }}>
      <path
        fill="currentColor"
        d="M0 0V22H20V0H0ZM19.1371 0.825V11H0.83205V2.59722H0.862866C0.893682 2.59722 4.6225 2.50556 7.08783 4.85833C8.04314 5.775 8.72111 6.96667 9.06009 8.40278C8.07396 7.30278 6.25578 6.325 3.17411 6.325V7.15C9.18336 7.15 9.36826 10.9389 9.36826 10.9694H10.6626C10.6626 8.34167 11.6795 6.50833 13.6826 5.46944C15.1926 4.70556 16.7026 4.675 16.8875 4.675V3.39167C16.6718 3.39167 14.8844 3.42222 13.0971 4.33889C12.0493 4.88889 10.8783 5.80556 10.1387 7.33333C9.70724 5.98889 8.99846 4.82778 8.01233 3.88056C5.20801 1.22222 1.26348 1.25278 0.893683 1.25278V0.763889C0.83205 0.825 19.1371 0.825 19.1371 0.825ZM19.1371 20.6861C18.7673 20.6861 14.792 20.7472 12.0185 18.0583C11.0324 17.1111 10.3236 15.9806 9.89214 14.6056C9.15254 16.1639 7.98151 17.0806 6.93374 17.6C5.14638 18.5167 3.35901 18.5472 3.1433 18.5472V17.2639C3.29738 17.2639 4.83821 17.2333 6.34823 16.4694C8.35131 15.4306 9.36826 13.5972 9.36826 10.9694H10.6626C10.6626 11 10.8166 14.7889 16.8567 14.7889V15.6139C13.7442 15.6139 11.9569 14.6361 10.9707 13.5361C11.3097 14.9722 11.9877 16.1639 12.943 17.0806C15.4083 19.4639 19.1371 19.3417 19.1679 19.3417H19.1988C19.1371 19.4333 19.1371 20.6861 19.1371 20.6861Z"
      />
    </svg>
  );
}

/**
 * Figma: Logo and brand, Title=Logo only — shown at the start of the first panel's bar (top, or left when
 * side by side) when the Tensor header is minimised: the mark, the ▴ arrow that reopens the header, and a
 * Separator Level 1 divider.
 */
export function FoldedBrand({ win }: { win: Win }) {
  const { dispatch } = useWM();
  return (
    <span className={s.folded}>
      <span className={s.foldedLogo}>
        <BroadridgeMark />
        <button type="button" className={s.caretUp} aria-label="Show header" aria-expanded="false" title="Show header" onClick={() => dispatch({ type: 'toggleHeader', id: win.id })}>
          <Caret dir="up" />
        </button>
      </span>
      <span className={s.foldedDivider} />
    </span>
  );
}

function HeaderButton({ children, label, onClick, open, refEl, text }: { children: ReactNode; label: string; onClick: () => void; open: boolean; refEl: React.Ref<HTMLButtonElement>; text?: string }) {
  return (
    <button ref={refEl} type="button" className={s.link} aria-label={text ? undefined : label} aria-expanded={open} aria-haspopup="dialog" title={label} onClick={onClick}>
      {children}
      {text && <span>{text}</span>}
    </button>
  );
}

function SearchLink() {
  const t = useTensor();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(t.globalQuery);
  const results = INSTRUMENTS.filter((i) => !q || i.code.toLowerCase().includes(q.toLowerCase()) || i.isin.includes(q));
  const choose = (code: string) => {
    t.setGlobalQuery(code);
    setOpen(false);
  };
  return (
    <>
      <HeaderButton refEl={ref} label="Search instruments" text="Search" open={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="search-check-2" size={24} />
      </HeaderButton>
      <Popover anchor={ref} open={open} onClose={() => setOpen(false)} placement="bottom-end">
        <Panel width={360}>
          <div className={s.searchBox}>
            <TIcon name="search" size={20} />
            <input autoFocus value={q} placeholder="Search instruments or ISIN" aria-label="Search instruments" onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && results[0] && choose(results[0].code)} />
          </div>
          <Menu size="small" aria-label="Instruments">
            <MenuLabel>Instruments</MenuLabel>
            {results.map((i) => (
              <MenuItem key={i.code} shortcut={i.isin} onSelect={() => choose(i.code)}>
                {i.code}
              </MenuItem>
            ))}
            {results.length === 0 && <MenuItem disabled>No matches</MenuItem>}
          </Menu>
          <span className={s.hint}>Picking an instrument filters the Order Book.</span>
        </Panel>
      </Popover>
    </>
  );
}

function WatchlistLink() {
  const t = useTensor();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <HeaderButton refEl={ref} label="Watchlist" text="Watchlist" open={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="visibility" size={24} />
      </HeaderButton>
      <Popover anchor={ref} open={open} onClose={() => setOpen(false)} placement="bottom-end">
        <Menu size="small" width={300} autoFocus onEscape={() => setOpen(false)} aria-label="Watchlist">
          <MenuLabel>Watchlist</MenuLabel>
          {INSTRUMENTS.map((i, n) => (
            <MenuItem key={i.code} shortcut={`${fmtNum(i.px, i.px < 200 ? 3 : 2)}  ${n % 2 ? '▼' : '▲'}`} onSelect={() => (t.setGlobalQuery(i.code), setOpen(false))}>
              {i.code}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </>
  );
}

function NotificationsLink() {
  const t = useTensor();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(1);
  const first = t.orders.find((o) => o.status === 'part-filled');
  return (
    <>
      <button ref={ref} type="button" className={s.link} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} title="Notifications" aria-expanded={open} onClick={() => (setOpen((o) => !o), setUnread(0))}>
        <Icon name="notification" size={24} />
        {unread > 0 && <span className={s.badge}>{unread}</span>}
      </button>
      <Popover anchor={ref} open={open} onClose={() => setOpen(false)} placement="bottom-end">
        <Panel width={320} title="Notifications">
          {first ? (
            <button type="button" className={s.notice} onClick={() => (t.selectOrder(first.id), setOpen(false))}>
              <span className={s.noticeDot} />
              <span>
                <b>{first.instrument} {first.side}</b> is {Math.round(first.fill * 100)}% filled
                <small>{first.id} · {first.lastAction} · Show in Order Book</small>
              </span>
            </button>
          ) : (
            <span className={s.hint}>You're all caught up.</span>
          )}
        </Panel>
      </Popover>
    </>
  );
}

function SettingsLink({ win }: { win: Win }) {
  const { state, dispatch } = useWM();
  const t = useTensor();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const missing = (['orders', 'child'] as ModuleId[]).filter((m) => !state.windows.some((w) => w.modules.includes(m)));
  return (
    <>
      <HeaderButton refEl={ref} label="Settings" open={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="gear-settings" size={24} />
      </HeaderButton>
      <Popover anchor={ref} open={open} onClose={close} placement="bottom-end">
        <Menu size="small" width={260} autoFocus onEscape={close} aria-label="Settings">
          <MenuLabel>Layout</MenuLabel>
          <MenuItem checked={win.layout === 'stacked'} onSelect={() => (dispatch({ type: 'setLayout', id: win.id, layout: 'stacked' }), close())}>
            50/50 Stacked
          </MenuItem>
          <MenuItem checked={win.layout === 'horizontal'} onSelect={() => (dispatch({ type: 'setLayout', id: win.id, layout: 'horizontal' }), close())}>
            50/50 Horizontal
          </MenuItem>
          <MenuItem icon="reorder" disabled={win.modules.length < 2} onSelect={() => (dispatch({ type: 'swap', id: win.id }), close())}>
            Swap panels
          </MenuItem>
          {missing.map((m) => (
            <MenuItem key={m} icon="add-2" onSelect={() => (dispatch({ type: 'reopen', module: m }), close())}>
              Reopen {MODULE_TITLES[m]}
            </MenuItem>
          ))}
          <MenuItem icon="refresh" onSelect={() => (dispatch({ type: 'launch' }), close())}>
            Reset layout
          </MenuItem>
          <MenuSeparator />
          <MenuLabel>Appearance</MenuLabel>
          <MenuItem checked={t.theme === 'light'} onSelect={() => (t.setTheme('light'), close())}>
            Light
          </MenuItem>
          <MenuItem checked={t.theme === 'dark'} onSelect={() => (t.setTheme('dark'), close())}>
            Dark
          </MenuItem>
        </Menu>
      </Popover>
    </>
  );
}

function ProfileLink() {
  const t = useTensor();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button ref={ref} type="button" className={s.avatar} aria-label="Account" title="Account" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        JC
      </button>
      <Popover anchor={ref} open={open} onClose={close} placement="bottom-end">
        <Menu size="small" width={240} autoFocus onEscape={close} aria-label="Account">
          <MenuLabel>Jamie Carter · Rates Trading, Toronto</MenuLabel>
          <MenuItem icon="general" onSelect={() => (t.toast('Account settings opened'), close())}>
            Account settings
          </MenuItem>
          <MenuItem icon="preferences" onSelect={() => (t.toast('Preferences opened'), close())}>
            Preferences
          </MenuItem>
          <MenuItem icon="help" onSelect={() => (t.toast('Help centre opened'), close())}>
            Help
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon="logout" onSelect={() => (t.toast('Signed out (prototype)'), close())}>
            Sign out
          </MenuItem>
        </Menu>
      </Popover>
    </>
  );
}
