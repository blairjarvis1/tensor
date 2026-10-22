/*
 * Window manager state for the simulated Windows 11 desktop.
 *
 * Every window follows the Figma "Windows Framework" component: an outer frame that holds up to two
 * module panels (Single Panel, 50/50 Stacked or 50/50 Horizontal). The main window also carries the
 * Tensor header. A module can be dragged out into its own window and dropped back onto another
 * window to group them into a set.
 */

export type ModuleId = 'orders' | 'child';
export type Rect = { x: number; y: number; w: number; h: number };
export type Layout = 'stacked' | 'horizontal';
export type WinMode = 'normal' | 'max' | 'min';
export type DockZone = 'top' | 'bottom' | 'left' | 'right';

export type Win = {
  id: string;
  kind: 'main' | 'module';
  modules: ModuleId[];
  layout: Layout;
  /** Share of the space given to the first module, 0–1. */
  split: number;
  rect: Rect;
  mode: WinMode;
  /** Mode to return to when restored from the taskbar. */
  beforeMin: Exclude<WinMode, 'min'>;
  /** Rect to return to after maximise or edge snap. */
  restore: Rect | null;
  snapped: boolean;
  /** Main window only: the Tensor header is folded into the first panel's bar (Figma Main Header = false). */
  headerMin: boolean;
  z: number;
};

export type WMState = { windows: Win[]; focused: string | null; z: number };

/**
 * The simulated monitor is always 1080 tall with the Windows 11 taskbar (59px) along the bottom.
 * Its width follows the browser (never less than 1920), so the desktop reaches the browser edges.
 * `w` is updated by measureScreen() in WindowManager.
 */
export const SCREEN = { w: 1920, h: 1080, taskbar: 59 };
export const workArea = (): Rect => ({ x: 0, y: 0, w: SCREEN.w, h: SCREEN.h - SCREEN.taskbar });
export const MODULE_TITLES: Record<ModuleId, string> = { orders: 'Order Book', child: 'Order Book Child' };
export const MIN_SIZE = { main: { w: 960, h: 560 }, module: { w: 640, h: 320 } };

let seq = 0;
export const newWinId = () => `win-${++seq}`;

export function initialState(): WMState {
  return {
    windows: [
      {
        id: 'main',
        kind: 'main',
        modules: ['orders', 'child'],
        layout: 'stacked',
        split: 0.5,
        // Size of the Windows Framework instance on the Figma frame, centred on the screen as it is there.
        rect: { x: Math.round((SCREEN.w - 1765) / 2), y: 46, w: 1765, h: 925 },
        mode: 'normal',
        beforeMin: 'normal',
        restore: null,
        snapped: false,
        headerMin: false,
        z: 1,
      },
    ],
    focused: 'main',
    z: 1,
  };
}

export type Action =
  | { type: 'launch' }
  | { type: 'focus'; id: string | null }
  | { type: 'setRect'; id: string; rect: Rect; keepSnap?: boolean }
  | { type: 'unsnap'; id: string; rect: Rect }
  | { type: 'minimize'; id: string }
  | { type: 'minimizeAll' }
  | { type: 'restoreAll' }
  | { type: 'toggleMax'; id: string }
  | { type: 'snap'; id: string; to: 'max' | 'left' | 'right' }
  | { type: 'close'; id: string }
  | { type: 'detach'; from: string; module: ModuleId; newId: string; rect: Rect }
  | { type: 'dock'; src: string; target: string; zone: DockZone }
  | { type: 'setSplit'; id: string; split: number }
  | { type: 'setLayout'; id: string; layout: Layout }
  | { type: 'swap'; id: string }
  | { type: 'toggleHeader'; id: string }
  | { type: 'reopen'; module: ModuleId };

const map = (s: WMState, id: string, f: (w: Win) => Win): WMState => ({ ...s, windows: s.windows.map((w) => (w.id === id ? f(w) : w)) });
const raise = (s: WMState, id: string): WMState => {
  const z = s.z + 1;
  return { ...map(s, id, (w) => ({ ...w, z })), z, focused: id };
};

export function snapRect(to: 'max' | 'left' | 'right'): Rect {
  const { w, h } = workArea();
  if (to === 'left') return { x: 0, y: 0, w: w / 2, h };
  if (to === 'right') return { x: w / 2, y: 0, w: w / 2, h };
  return workArea();
}

export function reducer(s: WMState, a: Action): WMState {
  switch (a.type) {
    case 'launch':
      return initialState();
    case 'focus':
      return a.id ? raise(s, a.id) : { ...s, focused: null };
    case 'setRect':
      return map(s, a.id, (w) => ({ ...w, rect: a.rect, snapped: a.keepSnap ? w.snapped : false }));
    case 'unsnap':
      return map(s, a.id, (w) => ({ ...w, rect: a.rect, mode: 'normal', snapped: false, restore: null }));
    case 'minimize': {
      const next = map(s, a.id, (w) => ({ ...w, mode: 'min', beforeMin: w.mode === 'min' ? w.beforeMin : w.mode }));
      const top = [...next.windows].filter((w) => w.mode !== 'min').sort((x, y) => y.z - x.z)[0];
      return { ...next, focused: top?.id ?? null };
    }
    case 'minimizeAll':
      return { ...s, focused: null, windows: s.windows.map((w) => (w.mode === 'min' ? w : { ...w, mode: 'min', beforeMin: w.mode })) };
    case 'restoreAll': {
      const restored = { ...s, windows: s.windows.map((w) => (w.mode === 'min' ? { ...w, mode: w.beforeMin } : w)) };
      const top = [...restored.windows].sort((x, y) => y.z - x.z)[0];
      return top ? raise(restored, top.id) : restored;
    }
    case 'toggleMax':
      return raise(
        map(s, a.id, (w) =>
          w.mode === 'max'
            ? { ...w, mode: 'normal', rect: w.restore ?? w.rect, restore: null }
            : { ...w, mode: 'max', restore: w.snapped ? w.restore : w.rect, snapped: false },
        ),
        a.id,
      );
    case 'snap':
      return raise(
        map(s, a.id, (w) => {
          const restore = w.snapped || w.mode === 'max' ? w.restore : w.rect;
          return a.to === 'max' ? { ...w, mode: 'max', restore, snapped: false } : { ...w, mode: 'normal', rect: snapRect(a.to), restore, snapped: true };
        }),
        a.id,
      );
    case 'close': {
      const win = s.windows.find((w) => w.id === a.id);
      // Closing the main window quits Tensor; closing a module window closes just that module.
      const windows = win?.kind === 'main' ? [] : s.windows.filter((w) => w.id !== a.id);
      const top = [...windows].filter((w) => w.mode !== 'min').sort((x, y) => y.z - x.z)[0];
      return { ...s, windows, focused: top?.id ?? null };
    }
    case 'detach': {
      const from = s.windows.find((w) => w.id === a.from);
      if (!from) return s;
      const z = s.z + 1;
      const win: Win = { id: a.newId, kind: 'module', modules: [a.module], layout: 'stacked', split: 0.5, rect: a.rect, mode: 'normal', beforeMin: 'normal', restore: null, snapped: false, headerMin: false, z };
      const windows = s.windows.map((w) => (w.id === a.from ? { ...w, modules: w.modules.filter((m) => m !== a.module), split: 0.5 } : w));
      return { windows: [...windows, win], z, focused: a.newId };
    }
    case 'dock': {
      const src = s.windows.find((w) => w.id === a.src);
      const target = s.windows.find((w) => w.id === a.target);
      if (!src || !target || target.modules.length + src.modules.length > 2) return s;
      const first = a.zone === 'top' || a.zone === 'left';
      const modules = first ? [...src.modules, ...target.modules] : [...target.modules, ...src.modules];
      const layout: Layout = a.zone === 'left' || a.zone === 'right' ? 'horizontal' : 'stacked';
      const next = { ...s, windows: s.windows.filter((w) => w.id !== a.src).map((w) => (w.id === a.target ? { ...w, modules, layout, split: 0.5 } : w)) };
      return raise(next, a.target);
    }
    case 'setSplit':
      return map(s, a.id, (w) => ({ ...w, split: a.split }));
    case 'setLayout':
      return map(s, a.id, (w) => ({ ...w, layout: a.layout, split: 0.5 }));
    case 'swap':
      return map(s, a.id, (w) => ({ ...w, modules: [...w.modules].reverse() }));
    case 'toggleHeader':
      return map(s, a.id, (w) => ({ ...w, headerMin: !w.headerMin }));
    case 'reopen': {
      if (s.windows.some((w) => w.modules.includes(a.module))) return s;
      const main = s.windows.find((w) => w.kind === 'main' && w.modules.length < 2);
      if (main) {
        const modules = a.module === 'orders' ? [a.module, ...main.modules] : [...main.modules, a.module];
        return raise(map(s, main.id, (w) => ({ ...w, modules, split: 0.5 })), main.id);
      }
      const z = s.z + 1;
      const id = newWinId();
      const win: Win = { id, kind: 'module', modules: [a.module], layout: 'stacked', split: 0.5, rect: { x: Math.round((SCREEN.w - 1280) / 2), y: 160, w: 1280, h: 560 }, mode: 'normal', beforeMin: 'normal', restore: null, snapped: false, headerMin: false, z };
      return { windows: [...s.windows, win], z, focused: id };
    }
  }
}

/** Visible rect for a window, taking maximise into account. */
export const visibleRect = (w: Win): Rect => (w.mode === 'max' ? workArea() : w.rect);
