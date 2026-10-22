import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Figma `Type`. */
  variant?: ButtonVariant;
  /** Figma `Size`: Small 24px, Medium 32px, Large 36px. */
  size?: ButtonSize;
  /** Figma `Destructive?`. Uses the Error action tokens. */
  destructive?: boolean;
  /** Visible label. Leave empty for an icon-only button (Figma `Label=No`) and pass `aria-label`. */
  children?: ReactNode;
  iconStart?: IconName;
  iconEnd?: IconName;
};

const ICON_SIZE: Record<ButtonSize, number> = { small: 16, medium: 24, large: 24 };

/** Figma: Buttons / Button - v2. */
export function Button({ variant = 'primary', size = 'medium', destructive = false, iconStart, iconEnd, children, className, type = 'button', ...rest }: ButtonProps) {
  const iconOnly = !children;
  const cls = [styles.button, styles[variant], styles[size], destructive && styles.destructive, iconOnly && styles.iconOnly, className].filter(Boolean).join(' ');
  const icon = (name?: IconName) =>
    name ? (
      <span className={styles.icon}>
        <Icon name={name} size={ICON_SIZE[size]} />
      </span>
    ) : null;
  return (
    <button type={type} className={cls} {...rest}>
      {icon(iconStart)}
      {children && <span className={styles.label}>{children}</span>}
      {icon(iconEnd)}
    </button>
  );
}
