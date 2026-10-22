import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Icon, type IconName } from '../Icon/Icon';
import s from './Messaging.module.css';

export type Tone = 'error' | 'warning' | 'success' | 'info';
const TONE_ICON: Record<Tone, IconName> = { error: 'error', warning: 'error', success: 'success', info: 'info' };

/** Figma: Messaging / GlobalBanner. A one-line app-wide message, e.g. a connection or system error. */
export function GlobalBanner({ tone = 'error', children, action, onDismiss }: { tone?: Tone; children: ReactNode; action?: { label: string; onClick: () => void }; onDismiss?: () => void }) {
  return (
    <div className={s.banner} data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={TONE_ICON[tone]} size={20} />
      <span className={s.bannerText}>{children}</span>
      {action && (
        <button type="button" className={s.bannerLink} onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button type="button" className={s.bannerAction} aria-label="Dismiss" onClick={onDismiss}>
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}

/** Figma: Messaging / NotificationToast. Title, message and a stacked Proceed / Cancel column. */
export function Toast({ tone = 'error', title, children, onProceed, proceedLabel = 'Proceed', onCancel, cancelLabel = 'Cancel' }: { tone?: Tone; title: ReactNode; children?: ReactNode; onProceed?: () => void; proceedLabel?: string; onCancel?: () => void; cancelLabel?: string }) {
  return (
    <div className={s.toast} data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      <div className={s.toastBody}>
        <span className={s.toastIcon}>
          <Icon name={TONE_ICON[tone]} size={20} />
        </span>
        <div>
          <div className={s.toastTitle}>{title}</div>
          {children && <div className={s.toastMsg}>{children}</div>}
        </div>
      </div>
      {(onProceed || onCancel) && (
        <div className={s.toastActions}>
          {onProceed && (
            <button type="button" className={s.toastBtn} data-primary="true" onClick={onProceed}>
              {proceedLabel}
            </button>
          )}
          {onCancel && (
            <button type="button" className={s.toastBtn} onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Figma: Messaging / Toast "Price Sent" / "Error Toast". A compact confirmation that appears after an action. */
export function StatusToast({ tone = 'success', children }: { tone?: 'success' | 'error'; children: ReactNode }) {
  return (
    <div className={s.mini} data-tone={tone} role="status">
      <Icon name={tone === 'success' ? 'success' : 'error'} size={32} />
      {children}
    </div>
  );
}

/** Fixed bottom-right stack for toasts. */
export function ToastStack({ children }: { children: ReactNode }) {
  return <div className={s.toastStack}>{children}</div>;
}

export type ConfirmDialogProps = {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  tone?: 'error' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Render the scrim inside the nearest positioned parent instead of the whole viewport (useful in stories). */
  inline?: boolean;
};

/** Figma: Messaging / ConfirmationModal - v2. A modal confirmation over a scrim (Surface/Global/Overlay Level 1). Esc cancels; focus starts on Cancel. */
export function ConfirmDialog({ open, title, children, tone = 'error', confirmLabel = 'Proceed', cancelLabel = 'Cancel', onConfirm, onCancel, inline = false }: ConfirmDialogProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => prev?.focus?.();
  }, [open]);
  if (!open) return null;
  return (
    <div className={[s.scrim, inline && s.scrimInline].filter(Boolean).join(' ')} onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        ref={ref}
        className={s.dialog}
        data-tone={tone}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
          if (e.key === 'Tab') {
            const btns = [...(ref.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
            const i = btns.indexOf(document.activeElement as HTMLButtonElement);
            e.preventDefault();
            btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length]?.focus();
          }
        }}
      >
        <span className={s.dialogIcon}>
          <Icon name={tone === 'error' ? 'error' : 'info'} size={32} />
        </span>
        <h2 id={`${id}-t`} className={s.dialogTitle}>
          {title}
        </h2>
        <div id={`${id}-d`} className={s.dialogBody}>
          {children}
        </div>
        <div className={s.dialogActions}>
          <Button variant="secondary" size="large" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button size="large" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Figma: Messaging / Icon text placeholder. Empty and issue states for panels and grids. */
export function EmptyState({ icon = 'ticket', children, hint, tone = 'empty' }: { icon?: IconName; children: ReactNode; hint?: ReactNode; tone?: 'empty' | 'issue' }) {
  return (
    <div className={s.empty} data-tone={tone}>
      <Icon name={tone === 'issue' ? 'error' : icon} size={40} />
      <span className={s.emptyText}>{children}</span>
      {hint && <span className={s.emptyHint}>{hint}</span>}
    </div>
  );
}
