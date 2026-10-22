import { useEffect, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { SCREEN } from '../wm/store';
import { rectToStage } from '../wm/WindowManager';

/** Element inside the scaled desktop that popovers render into, so they escape scrolling grids and windows. */
export const layerRef: { current: HTMLDivElement | null } = { current: null };

type Placement = 'bottom-start' | 'bottom-end';

/**
 * Anchored popover for menus, filters and pickers. Closes on outside press and Esc, and keeps itself
 * inside the desktop, above the taskbar.
 */
export function Popover({ anchor, open, onClose, placement = 'bottom-start', children, offset = 4 }: { anchor: RefObject<HTMLElement | null>; open: boolean; onClose: () => void; placement?: Placement; children: ReactNode; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor.current) return setPos(null);
    const place = () => {
      if (!anchor.current || !ref.current) return;
      const a = rectToStage(anchor.current.getBoundingClientRect());
      const w = ref.current.offsetWidth;
      const h = ref.current.offsetHeight;
      let x = placement === 'bottom-end' ? a.x + a.w - w : a.x;
      let y = a.y + a.h + offset;
      x = Math.min(Math.max(8, x), SCREEN.w - w - 8);
      if (y + h > SCREEN.h - SCREEN.taskbar - 8) y = Math.max(8, a.y - h - offset);
      setPos({ x, y });
    };
    place();
    const id = requestAnimationFrame(place);
    return () => cancelAnimationFrame(id);
  }, [open, anchor, placement, offset]);

  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchor.current?.contains(t)) return;
      onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && (onClose(), anchor.current?.focus());
    document.addEventListener('pointerdown', off, true);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', off, true);
      document.removeEventListener('keydown', esc);
    };
  }, [open, onClose, anchor]);

  if (!open || !layerRef.current) return null;
  return createPortal(
    <div ref={ref} style={{ position: 'absolute', left: pos?.x ?? -9999, top: pos?.y ?? -9999, zIndex: 10000, visibility: pos ? 'visible' : 'hidden' }} onPointerDown={(e) => e.stopPropagation()}>
      {children}
    </div>,
    layerRef.current,
  );
}

/** Trigger + popover pair with its own open state. */
export function PopoverButton({ trigger, children, placement }: { trigger: (p: { open: boolean; toggle: () => void; ref: RefObject<HTMLButtonElement | null> }) => ReactElement; children: (close: () => void) => ReactNode; placement?: Placement }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  return (
    <>
      {trigger({ open, toggle: () => setOpen((o) => !o), ref })}
      <Popover anchor={ref} open={open} onClose={close} placement={placement}>
        {children(close)}
      </Popover>
    </>
  );
}

/** Popover surface matching Figma Menu - v2 (Surface/Menu/Default, 8px radius, Menu Modal shadow). */
export function Panel({ children, width, title, footer }: { children: ReactNode; width?: number; title?: ReactNode; footer?: ReactNode }) {
  return (
    <div
      style={{
        width,
        padding: 'var(--br-scale-300)',
        borderRadius: 'var(--br-radius-xlg)',
        background: 'var(--br-surface-menu-default)',
        boxShadow: 'var(--br-shadow-menu-modal)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--br-scale-300)',
        fontFamily: 'var(--br-font-family-body-and-sub)',
        color: 'var(--br-text-body)',
      }}
    >
      {title && <div className="br-text-bdy-md-med" style={{ color: 'var(--br-text-headings)' }}>{title}</div>}
      {children}
      {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--br-scale-200)', paddingTop: 'var(--br-scale-100)' }}>{footer}</div>}
    </div>
  );
}
