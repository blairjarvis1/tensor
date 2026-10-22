import { useRef, type KeyboardEvent } from 'react';
import { Button } from '@ds/components/Button/Button';
import { WindowControls } from '../wm/AppWindow';
import { MODULE_TITLES, type ModuleId, type Win } from '../wm/store';
import { useWM } from '../wm/WindowManager';
import { FoldedBrand } from './MainHeader';
import { ChildModule, OrdersModule, type Chrome } from './modules';
import s from './panel.module.css';

const ALL: ModuleId[] = ['orders', 'child'];

/**
 * The module area of a Windows Framework: one panel, or two panels split 50/50 (Stacked or Horizontal)
 * with a draggable 16px gap between them. Resizing one panel resizes the other.
 */
export function ModuleGroup({ win }: { win: Win }) {
  const { state, dispatch, beginMove, beginDetach, beginSplit } = useWM();
  const box = useRef<HTMLDivElement>(null);
  const panels = useRef<Record<string, HTMLDivElement | null>>({});
  const horizontal = win.layout === 'horizontal';
  const two = win.modules.length === 2;
  const missing = ALL.filter((m) => !state.windows.some((w) => w.modules.includes(m)));

  const chromeFor = (m: ModuleId, i: number): Chrome => {
    const ownWindow = win.kind === 'module';
    // Main window with its header minimised: the panel bars become the title bar (Figma Main Header = false).
    const folded = win.kind === 'main' && win.headerMin;
    const barRole = ownWindow || folded;
    // The top-right panel carries the window controls.
    const titleBar = barRole && (horizontal ? i === win.modules.length - 1 : i === 0);
    const detachable = win.kind === 'main' || two;
    const controls = folded ? (
      <WindowControls win={win} padLeft={false} />
    ) : (
      <div className={s.autoChrome} data-visible={state.focused === win.id || undefined}>
        <WindowControls win={win} />
      </div>
    );
    return {
      onTitlePointerDown: (e) => (detachable ? beginDetach(e, win.id, m, panels.current[m]!) : beginMove(e, win.id)),
      onHeaderPointerDown: barRole && (i === 0 || horizontal) ? (e) => beginMove(e, win.id) : undefined,
      onHeaderDoubleClick: barRole ? () => dispatch({ type: 'toggleMax', id: win.id }) : undefined,
      trailing: titleBar ? controls : undefined,
      // Only the first panel (top, or left when side by side) carries the folded header.
      brand: folded && i === 0 ? <FoldedBrand win={win} /> : undefined,
    };
  };

  const onSplitKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const back = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const fwd = horizontal ? 'ArrowRight' : 'ArrowDown';
    if (e.key === back || e.key === fwd) {
      e.preventDefault();
      dispatch({ type: 'setSplit', id: win.id, split: Math.min(0.85, Math.max(0.15, win.split + (e.key === fwd ? step : -step))) });
    } else if (e.key === 'Home' || e.key === 'Enter') dispatch({ type: 'setSplit', id: win.id, split: 0.5 });
  };

  const size = (i: number) => (two ? `calc((100% - 16px) * ${i === 0 ? win.split : 1 - win.split})` : '100%');

  return (
    <div ref={box} className={s.group} data-layout={win.layout}>
      {win.modules.length === 0 && (
        <div className={s.emptySlot}>
          <span>Drag a panel here, or reopen one.</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {missing.map((m) => (
              <Button key={m} variant="secondary" size="small" iconStart="add-2" onClick={() => dispatch({ type: 'reopen', module: m })}>
                {MODULE_TITLES[m]}
              </Button>
            ))}
          </div>
        </div>
      )}
      {win.modules.map((m, i) => (
        <div key={m} style={{ display: 'contents' }}>
          {i === 1 && (
            <div
              className={s.splitter}
              role="separator"
              aria-orientation={horizontal ? 'vertical' : 'horizontal'}
              aria-label="Resize panels"
              aria-valuenow={Math.round(win.split * 100)}
              aria-valuemin={15}
              aria-valuemax={85}
              tabIndex={0}
              title="Drag to resize · double-click to reset"
              onPointerDown={(e) => box.current && beginSplit(e, win.id, box.current)}
              onDoubleClick={() => dispatch({ type: 'setSplit', id: win.id, split: 0.5 })}
              onKeyDown={onSplitKey}
            >
              <span />
            </div>
          )}
          <div ref={(el) => void (panels.current[m] = el)} className={s.panel} style={horizontal ? { width: size(i) } : { height: size(i) }} data-module={m}>
            {m === 'orders' ? <OrdersModule chrome={chromeFor(m, i)} /> : <ChildModule chrome={chromeFor(m, i)} />}
            <div className={s.fade} aria-hidden="true" />
          </div>
        </div>
      ))}
    </div>
  );
}
