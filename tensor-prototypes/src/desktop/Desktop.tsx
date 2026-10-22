import { useLayoutEffect, useRef, useState } from 'react';
import { StatusToast } from '@ds/components/Messaging/Messaging';
import { AppWindow } from '../wm/AppWindow';
import { MODULE_TITLES, SCREEN } from '../wm/store';
import { measureScreen, stage, useWM } from '../wm/WindowManager';
import { ModuleGroup } from '../tensor/ModuleGroup';
import { MainHeader } from '../tensor/MainHeader';
import { layerRef } from '../tensor/Popover';
import { TIcon } from '../tensor/TIcon';
import { useTensor } from '../tensor/TensorState';
import wm from '../wm/wm.module.css';
import s from './desktop.module.css';

/** Width of the Figma wallpaper export; the Tensor taskbar icon sits at x 1185 on it. */
const ART = 1920;

/**
 * The simulated Windows 11 monitor, built from the wallpaper and taskbar exported from the Figma frame.
 * It is laid out 1080px tall, scaled to the browser height, and widened to reach the browser edges:
 * the wallpaper extends by stretching its edge colours, and the taskbar bar stretches while its icons
 * stay centred and the tray stays on the right, both at their normal size.
 */
export function Desktop() {
  const { state, dispatch, preview } = useWM();
  const t = useTensor();
  const root = useRef<HTMLDivElement>(null);
  const [, setFit] = useState({ scale: stage.scale, w: SCREEN.w });

  useLayoutEffect(() => {
    const fit = () => {
      measureScreen();
      setFit({ scale: stage.scale, w: SCREEN.w });
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // Where the centred 1920px artwork starts, and how much plain wallpaper is needed either side.
  const offset = Math.round((SCREEN.w - ART) / 2);
  const edge = offset + 1;

  const running = state.windows.length > 0;
  const allMin = running && state.windows.every((w) => w.mode === 'min');
  const focused = running && !!state.focused;

  const onTaskbar = () => {
    if (!running) dispatch({ type: 'launch' });
    else if (allMin || !focused) dispatch({ type: 'restoreAll' });
    else dispatch({ type: 'minimizeAll' });
  };

  return (
    <div className={s.viewport}>
      <div
        ref={root}
        className={s.stage}
        style={{ width: SCREEN.w, transform: `translate(${stage.left}px, ${stage.top}px) scale(${stage.scale})` }}
        onPointerDown={(e) => e.target === e.currentTarget && dispatch({ type: 'focus', id: null })}
      >
        {/* Wallpaper: the Figma export in the middle, its outer pixel columns stretched to the edges. */}
        {offset > 0 && (
          <>
            <div className={s.wallEdge} style={{ left: 0, width: edge, backgroundSize: `${ART * edge}px ${SCREEN.h}px`, backgroundPosition: '0 0' }} />
            <div className={s.wallEdge} style={{ right: 0, width: edge, backgroundSize: `${ART * edge}px ${SCREEN.h}px`, backgroundPosition: '100% 0' }} />
          </>
        )}
        <div className={s.wallpaper} style={{ left: offset }} />

        {state.windows.map((w) => (
          <AppWindow key={w.id} win={w} label={w.kind === 'main' ? 'Tensor' : w.modules.map((m) => MODULE_TITLES[m]).join(' and ')}>
            {w.kind === 'main' && (
              // The header folds away into the first panel's bar; it stays when there are no panels to fold into.
              <div className={s.headerFold} data-folded={(w.headerMin && w.modules.length > 0) || undefined} inert={(w.headerMin && w.modules.length > 0) || undefined}>
                <MainHeader win={w} />
              </div>
            )}
            <ModuleGroup win={w} />
          </AppWindow>
        ))}

        {preview?.kind === 'snap' && <div className={wm.snapPreview} style={{ left: preview.rect.x + 8, top: preview.rect.y + 8, width: preview.rect.w - 16, height: preview.rect.h - 16 }} />}
        {preview?.kind === 'dock' && (
          <div className={wm.dockPreview} style={{ left: preview.rect.x, top: preview.rect.y, width: preview.rect.w, height: preview.rect.h }}>
            <span>Drop to group here</span>
          </div>
        )}

        {/* Taskbar, drawn above the windows as in Windows. The bar stretches to the full width; the pinned
            icons stay centred and the tray stays at the right edge, unscaled. */}
        <div className={s.taskbar} aria-hidden="true">
          <div className={s.taskbarBase} style={{ left: 0, backgroundSize: `${(ART * SCREEN.w) / 2}px ${SCREEN.h}px`, backgroundPosition: '0 100%' }} />
          <div className={s.taskbarBase} style={{ right: 0, backgroundSize: `${(ART * SCREEN.w) / 2}px ${SCREEN.h}px`, backgroundPosition: '100% 100%' }} />
          <div className={s.taskbarIcons} style={{ left: offset + 640 }} />
          <div className={s.taskbarTray} />
        </div>

        {/* Tensor in the taskbar, after the pinned Windows apps (Figma: B Logo at 1185, 1030). */}
        <button
          type="button"
          className={s.taskbarApp}
          style={{ left: offset + 1185 }}
          data-running={running || undefined}
          data-active={focused || undefined}
          aria-label={running ? (focused ? 'Tensor, minimise all windows' : 'Tensor, show windows') : 'Open Tensor'}
          title="Tensor"
          onClick={onTaskbar}
        >
          <img src="/tensor-icon.svg" alt="" width={20} height={22} />
          <span className={s.runDot} />
        </button>

        {/* Prototype-only: light / dark switch, tucked into the top-right corner of the desktop. */}
        <button
          type="button"
          className={s.themeToggle}
          aria-label={t.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={t.theme === 'light' ? 'Dark mode' : 'Light mode'}
          onClick={() => t.setTheme(t.theme === 'light' ? 'dark' : 'light')}
        >
          <TIcon name={t.theme === 'light' ? 'moon' : 'sun'} size={18} />
        </button>

        {!running && (
          <div className={s.closedHint}>
            Tensor is closed. Click the Tensor icon in the taskbar to open it again.
          </div>
        )}

        <div ref={(el) => void (layerRef.current = el)} className={s.layer} />

        <div className={s.toasts}>
          {t.toasts.map((m) => (
            <StatusToast key={m.id} tone={m.tone}>
              {m.text}
            </StatusToast>
          ))}
        </div>
      </div>
    </div>
  );
}
