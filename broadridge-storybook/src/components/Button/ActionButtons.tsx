import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import s from './ActionButtons.module.css';

type Base = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

/** Figma: Icon Button Primary / Icon Button Secondary. A tall tile with an icon above its label, e.g. "Send Price". */
export function IconTileButton({ variant = 'primary', icon, children, className, type = 'button', ...rest }: Base & { variant?: 'primary' | 'secondary'; icon: IconName; children: ReactNode }) {
  return (
    <button type={type} className={cx(s.tile, s.focusable, variant === 'primary' ? s.tilePrimary : s.tileSecondary, className)} {...rest}>
      <span className={s.tileIcon}>
        <Icon name={icon} size={variant === 'primary' ? 40 : 24} />
      </span>
      <span>{children}</span>
    </button>
  );
}

/** Figma: Square icon Button - v1. 28px, used for compact toolbar actions and calendar paging. */
export function SquareIconButton({ variant = 'secondary', icon, className, type = 'button', ...rest }: Base & { variant?: 'primary' | 'secondary'; icon: IconName; 'aria-label': string }) {
  return (
    <button type={type} className={cx(s.square, s.focusable, variant === 'primary' ? s.squarePrimary : s.squareSecondary, className)} {...rest}>
      <Icon name={icon} size={20} />
    </button>
  );
}

/** Figma: Circle Button. A 128px circular drop target, e.g. "Add from columns below to add". */
export function CircleButton({ icon = 'add-2', children, className, type = 'button', ...rest }: Base & { icon?: IconName; children: ReactNode }) {
  return (
    <button type={type} className={cx(s.circle, s.focusable, className)} {...rest}>
      <span className={s.circleIcon}>
        <Icon name={icon} size={24} />
      </span>
      <span>{children}</span>
    </button>
  );
}

/** Figma: Stepper. A 16px circular add or remove control. */
export function Stepper({ action = 'add', className, type = 'button', ...rest }: Base & { action?: 'add' | 'remove' }) {
  return (
    <button type={type} aria-label={rest['aria-label'] ?? (action === 'add' ? 'Increase' : 'Decrease')} className={cx(s.stepper, className)} {...rest}>
      <Icon name={action === 'add' ? 'add-2' : 'check-indeterminate-small'} size={18} />
    </button>
  );
}
