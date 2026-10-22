import type { CSSProperties, ReactNode } from 'react';
import { TIcon } from '../tensor/TIcon';
import { visibleRect, type Win } from './store';
import { useWM } from './WindowManager';
import s from './wm.module.css';

const EDGES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

/** Figma: Windows Framework. Outer window frame with resize handles; content is the header and module panels. */
export function AppWindow({ win, children, label }: { win: Win; children: ReactNode; label: string }) {
  const { state, dispatch, beginResize } = useWM();
  const r = visibleRect(win);
  const focused = state.focused === win.id;
  const style = { left: r.x, top: r.y, width: r.w, height: r.h, zIndex: win.z } as CSSProperties;
  return (
    <section
      className={s.window}
      style={style}
      data-mode={win.mode}
      data-focused={focused}
      data-snapped={win.snapped}
      aria-label={label}
      aria-hidden={win.mode === 'min' || undefined}
      onPointerDownCapture={() => !focused && dispatch({ type: 'focus', id: win.id })}
    >
      {children}
      {win.mode === 'normal' && EDGES.map((edge) => <div key={edge} className={s.edge} data-edge={edge} onPointerDown={(e) => beginResize(e, win.id, edge)} />)}
    </section>
  );
}

/** Figma: "Windows Browser Controls" — minimize, magnify_fullscreen and close at 20px, 8px apart. */
export function WindowControls({ win, padLeft = true }: { win: Win; padLeft?: boolean }) {
  const { dispatch } = useWM();
  const max = win.mode === 'max' || win.snapped;
  return (
    <div className={s.controls} style={padLeft ? undefined : { paddingLeft: 0 }} onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      <button type="button" className={s.control} aria-label="Minimise" title="Minimise" onClick={() => dispatch({ type: 'minimize', id: win.id })}>
        <TIcon name="win-minimize" size={20} />
      </button>
      <button type="button" className={s.control} aria-label={max ? 'Restore down' : 'Maximise'} title={max ? 'Restore down' : 'Maximise'} onClick={() => (win.snapped ? dispatch({ type: 'unsnap', id: win.id, rect: win.restore ?? win.rect }) : dispatch({ type: 'toggleMax', id: win.id }))}>
        <TIcon name={max ? 'win-restore' : 'win-maximize'} size={20} />
      </button>
      <button type="button" className={`${s.control} ${s.close}`} aria-label="Close" title="Close" onClick={() => dispatch({ type: 'close', id: win.id })}>
        <TIcon name="win-close" size={20} />
      </button>
    </div>
  );
}
