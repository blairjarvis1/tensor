import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { MIN_SIZE, SCREEN, initialState, workArea, newWinId, reducer, snapRect, visibleRect, type Action, type DockZone, type ModuleId, type Rect, type WMState, type Win } from './store';

/* ---------- Stage coordinates ----------
 * The desktop is laid out at 1080px tall and scaled with a CSS transform to fit the browser height;
 * its width stretches to the browser edges. Pointer positions are converted back into stage pixels
 * before they touch window geometry. */
export const stage = { scale: 1, left: 0, top: 0 };

/** Fit the simulated monitor to the browser: scale to the height, widen to fill (min 1920 wide). */
export function measureScreen() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // A hidden or collapsed browser pane reports 0×0; keep the last good fit instead of dividing by zero.
  if (vw <= 0 || vh <= 0) return;
  const k = Math.min(vw / 1920, vh / SCREEN.h);
  SCREEN.w = Math.max(1920, Math.round(vw / k));
  Object.assign(stage, { scale: k, left: (vw - SCREEN.w * k) / 2, top: (vh - SCREEN.h * k) / 2 });
}
measureScreen();
export const toStage = (clientX: number, clientY: number) => ({ x: (clientX - stage.left) / stage.scale, y: (clientY - stage.top) / stage.scale });
export const rectToStage = (r: DOMRect): Rect => {
  const p = toStage(r.left, r.top);
  return { x: p.x, y: p.y, w: r.width / stage.scale, h: r.height / stage.scale };
};

export type Preview = { kind: 'snap'; rect: Rect } | { kind: 'dock'; target: string; zone: DockZone; rect: Rect } | null;

type Ctx = {
  state: WMState;
  dispatch: (a: Action) => void;
  preview: Preview;
  /** Move a window with the pointer. Handles restore-from-max, edge snapping and docking into other windows. */
  beginMove: (e: React.PointerEvent, id: string) => void;
  /** Tear a module out of its window once the pointer has moved far enough, then keep dragging the new window. */
  beginDetach: (e: React.PointerEvent, from: string, module: ModuleId, panel: HTMLElement) => void;
  beginResize: (e: React.PointerEvent, id: string, edge: string) => void;
  /** Drag the gap between two modules. */
  beginSplit: (e: React.PointerEvent, id: string, container: HTMLElement) => void;
};

const WMContext = createContext<Ctx | null>(null);
export const useWM = () => {
  const c = useContext(WMContext);
  if (!c) throw new Error('useWM outside WindowManager');
  return c;
};

/** Pointer session on window, so it survives the dragged element unmounting (e.g. after a detach). */
function track(e: React.PointerEvent, onMove: (p: { x: number; y: number }, ev: PointerEvent) => void, onEnd: (p: { x: number; y: number }) => void) {
  e.preventDefault();
  const move = (ev: PointerEvent) => onMove(toStage(ev.clientX, ev.clientY), ev);
  const up = (ev: PointerEvent) => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    onEnd(toStage(ev.clientX, ev.clientY));
  };
  document.body.style.userSelect = 'none';
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

const EDGE = 4;

export function WindowManager({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [preview, setPreview] = useState<Preview>(null);
  const ref = useRef(state);
  ref.current = state;
  const get = (id: string) => ref.current.windows.find((w) => w.id === id);

  /** Which window and zone a dragged module window would dock into. */
  const dockTarget = useCallback((srcId: string, p: { x: number; y: number }): Preview => {
    const src = ref.current.windows.find((w) => w.id === srcId);
    if (!src || src.kind !== 'module') return null;
    const candidates = ref.current.windows
      .filter((w) => w.id !== srcId && w.mode !== 'min' && w.modules.length + src.modules.length <= 2)
      .sort((a, b) => b.z - a.z);
    for (const w of candidates) {
      const r = visibleRect(w);
      if (p.x < r.x || p.x > r.x + r.w || p.y < r.y || p.y > r.y + r.h) continue;
      // Body of the window: below the Tensor header on the main window.
      const top = r.y + (w.kind === 'main' ? 64 : 16);
      const body: Rect = { x: r.x + 20, y: top, w: r.w - 40, h: r.y + r.h - 16 - top };
      const rx = (p.x - body.x) / body.w;
      const ry = (p.y - body.y) / body.h;
      // The zone is the window edge nearest the pointer (the body splits into four triangles), so it never
      // depends on the layout the window had before. Dropping near the top or bottom stacks the panels;
      // near the left or right puts them side by side.
      const zone: DockZone = Math.abs(rx - 0.5) > Math.abs(ry - 0.5) ? (rx < 0.5 ? 'left' : 'right') : ry < 0.5 ? 'top' : 'bottom';
      const half =
        w.modules.length === 0
          ? body
          : zone === 'top'
            ? { ...body, h: body.h / 2 - 8 }
            : zone === 'bottom'
              ? { ...body, y: body.y + body.h / 2 + 8, h: body.h / 2 - 8 }
              : zone === 'left'
                ? { ...body, w: body.w / 2 - 8 }
                : { ...body, x: body.x + body.w / 2 + 8, w: body.w / 2 - 8 };
      return { kind: 'dock', target: w.id, zone, rect: half };
    }
    return null;
  }, []);

  const snapTarget = (p: { x: number; y: number }): Preview => {
    if (p.y <= EDGE) return { kind: 'snap', rect: snapRect('max') };
    if (p.x <= EDGE) return { kind: 'snap', rect: snapRect('left') };
    if (p.x >= SCREEN.w - EDGE) return { kind: 'snap', rect: snapRect('right') };
    return null;
  };

  /** Shared move loop used by both a plain window drag and a freshly detached module. */
  const moveLoop = useCallback(
    (e: React.PointerEvent, id: string, start: { x: number; y: number }, startRect: Rect, restoreOnMove: boolean) => {
      let rect = startRect;
      let restored = !restoreOnMove;
      let current: Preview = null;
      document.body.style.cursor = 'default';
      track(
        e,
        (p) => {
          const w = get(id);
          if (!w) return;
          if (!restored && Math.hypot(p.x - start.x, p.y - start.y) > 6) {
            // Dragging a maximised or snapped window restores its size under the pointer, as Windows does.
            const back = w.restore ?? w.rect;
            const ratio = (start.x - startRect.x) / startRect.w;
            rect = { x: p.x - back.w * ratio, y: Math.max(0, start.y - 12), w: back.w, h: back.h };
            start = { ...p };
            restored = true;
            dispatch({ type: 'unsnap', id, rect });
          }
          if (!restored) return;
          // Keep at least 120px of the window on screen, as Windows does.
          const x = Math.min(Math.max(rect.x + (p.x - start.x), 120 - rect.w), SCREEN.w - 120);
          const next = { ...rect, x, y: Math.min(Math.max(0, rect.y + (p.y - start.y)), workArea().h - 40) };
          dispatch({ type: 'setRect', id, rect: next });
          current = dockTarget(id, p) ?? snapTarget(p);
          setPreview(current);
        },
        () => {
          setPreview(null);
          if (current?.kind === 'dock') dispatch({ type: 'dock', src: id, target: current.target, zone: current.zone });
          else if (current?.kind === 'snap') {
            const r = current.rect;
            dispatch({ type: 'snap', id, to: r.w === workArea().w ? 'max' : r.x === 0 ? 'left' : 'right' });
          }
        },
      );
    },
    [dockTarget],
  );

  const beginMove = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (e.button !== 0) return;
      const w = get(id);
      if (!w) return;
      dispatch({ type: 'focus', id });
      moveLoop(e, id, toStage(e.clientX, e.clientY), visibleRect(w), w.mode === 'max' || w.snapped);
    },
    [moveLoop],
  );

  const beginDetach = useCallback(
    (e: React.PointerEvent, from: string, module: ModuleId, panel: HTMLElement) => {
      if (e.button !== 0) return;
      const start = toStage(e.clientX, e.clientY);
      const panelRect = rectToStage(panel.getBoundingClientRect());
      dispatch({ type: 'focus', id: from });
      let detached = false;
      track(
        e,
        (p, ev) => {
          if (detached || Math.hypot(p.x - start.x, p.y - start.y) < 16) return;
          detached = true;
          const newId = newWinId();
          // The new window wraps the panel in the Windows Framework padding (16 / 20).
          const min = MIN_SIZE.module;
          const rect = {
            x: panelRect.x - 20 + (p.x - start.x),
            y: Math.max(0, panelRect.y - 16 + (p.y - start.y)),
            w: Math.max(min.w, Math.min(panelRect.w + 40, 1400)),
            h: Math.max(min.h, Math.min(panelRect.h + 32, 720)),
          };
          dispatch({ type: 'detach', from, module, newId, rect });
          window.dispatchEvent(new PointerEvent('pointerup', { clientX: ev.clientX, clientY: ev.clientY }));
          moveLoop({ ...e, clientX: ev.clientX, clientY: ev.clientY, preventDefault: () => {} } as React.PointerEvent, newId, p, rect, false);
        },
        () => {},
      );
    },
    [moveLoop],
  );

  const beginResize = useCallback((e: React.PointerEvent, id: string, edge: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const w = get(id);
    if (!w || w.mode === 'max') return;
    dispatch({ type: 'focus', id });
    const start = toStage(e.clientX, e.clientY);
    const r0 = w.rect;
    const min = MIN_SIZE[w.kind];
    document.body.style.cursor = getComputedStyle(e.currentTarget).cursor;
    track(
      e,
      (p) => {
        const dx = p.x - start.x;
        const dy = p.y - start.y;
        let { x, y, w: width, h } = r0;
        if (edge.includes('e')) width = Math.max(min.w, r0.w + dx);
        if (edge.includes('s')) h = Math.max(min.h, Math.min(r0.h + dy, workArea().h - r0.y));
        if (edge.includes('w')) {
          width = Math.max(min.w, r0.w - dx);
          x = r0.x + r0.w - width;
        }
        if (edge.includes('n')) {
          h = Math.max(min.h, r0.h - dy);
          y = Math.max(0, r0.y + r0.h - h);
          h = r0.y + r0.h - y;
        }
        dispatch({ type: 'setRect', id, rect: { x, y, w: width, h } });
      },
      () => {},
    );
  }, []);

  const beginSplit = useCallback((e: React.PointerEvent, id: string, container: HTMLElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const w = get(id);
    if (!w) return;
    const box = rectToStage(container.getBoundingClientRect());
    const horizontal = w.layout === 'horizontal';
    document.body.style.cursor = horizontal ? 'col-resize' : 'row-resize';
    const GAP = 16;
    const MIN = horizontal ? 360 : 140;
    track(
      e,
      (p) => {
        const total = (horizontal ? box.w : box.h) - GAP;
        const pos = (horizontal ? p.x - box.x : p.y - box.y) - GAP / 2;
        const split = Math.min(Math.max(pos, MIN), total - MIN) / total;
        dispatch({ type: 'setSplit', id, split });
      },
      () => {},
    );
  }, []);

  const value = useMemo(() => ({ state, dispatch, preview, beginMove, beginDetach, beginResize, beginSplit }), [state, preview, beginMove, beginDetach, beginResize, beginSplit]);
  return <WMContext.Provider value={value}>{children}</WMContext.Provider>;
}

export type { Win };
