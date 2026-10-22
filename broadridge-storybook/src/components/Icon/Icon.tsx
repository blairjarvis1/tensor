import type { CSSProperties, SVGProps } from 'react';
import { icons, type IconName } from './icons';

export type { IconName };
export const iconNames = Object.keys(icons) as IconName[];

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  /** Icon key, from the Figma icon component name (e.g. `close`, `chevron-forward`). */
  name: IconName;
  /** Rendered size in px. Figma icons are drawn on a 24px grid. */
  size?: number;
  /** Accessible label. Omit for decorative icons (they're hidden from screen readers). */
  label?: string;
};

/**
 * Broadridge icon, exported from the Figma `icons / 24 / *` components.
 * Neutral fills inherit `currentColor`, so set colour with an `--br-icons-*` token on the parent.
 */
export function Icon({ name, size = 24, label, style, ...rest }: IconProps) {
  const icon = icons[name];
  if (!icon) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      style={{ flex: 'none', display: 'block', ...(style as CSSProperties) }}
      dangerouslySetInnerHTML={{ __html: icon.body }}
      {...rest}
    />
  );
}
