import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { Icon } from './Icon';

/** Toggleable chip (aria-pressed). Use in groups for multi-select filters/tags. */
export function Chip({
  selected,
  onToggle,
  children,
  color,
  className,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'> & { selected?: boolean; onToggle?: (next: boolean) => void; color?: string }) {
  return (
    <button
      type="button"
      aria-pressed={Boolean(selected)}
      className={cx('rd-chip', className)}
      style={color ? ({ '--rd-chip-on': color, '--rd-chip-fg': 'var(--rd-text-on-mood)' } as CSSProperties) : undefined}
      onClick={() => onToggle?.(!selected)}
      {...rest}
    >
      {selected && <Icon name="check" size={18} strokeWidth={2.6} className="rd-chip__check" />}
      {children}
    </button>
  );
}

/** Static label. Removable if onRemove is given (button gets a real name). */
export function Tag({ children, onRemove, color, className }: { children: ReactNode; onRemove?: () => void; color?: string; className?: string }) {
  return (
    <span className={cx('rd-tag', className)} style={color ? ({ '--rd-tag-bg': color } as CSSProperties) : undefined}>
      {children}
      {onRemove && (
        <button type="button" className="rd-tag__remove" onClick={onRemove} aria-label={`remove ${typeof children === 'string' ? children : 'tag'}`}>
          <Icon name="close" size={14} strokeWidth={2.6} />
        </button>
      )}
    </span>
  );
}

/** Small count/status pill. Pass `label` when the number alone is ambiguous. */
export function Badge({ children, tone = 'accent', label, className }: { children: ReactNode; tone?: 'accent' | 'hero' | 'ink' | 'error'; label?: string; className?: string }) {
  return (
    <span className={cx('rd-badge', tone !== 'accent' && `rd-badge--${tone}`, className)} aria-label={label}>
      {children}
    </span>
  );
}

export type StickerColor = 'yellow' | 'navy' | 'cream' | 'white';
/**
 * Die-cut sticker. Brush voice, 1–6 words. Decorative by default (aria-hidden)
 * because stickers usually repeat what's nearby; pass `announce` if it's the only place the info lives.
 */
export function Sticker({
  children,
  color = 'yellow',
  shape = 'tag',
  tilt = -3,
  announce,
  className,
  style,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { color?: StickerColor; shape?: 'tag' | 'round' | 'burst'; tilt?: -3 | -2 | -1 | 0 | 1 | 2 | 3; announce?: boolean }) {
  return (
    <span
      className={cx('rd-sticker', color !== 'yellow' && `rd-sticker--${color}`, shape !== 'tag' && `rd-sticker--${shape}`, className)}
      style={{ '--rd-rot': `${tilt}deg`, ...style } as CSSProperties}
      aria-hidden={announce ? undefined : true}
      {...rest}
    >
      {children}
    </span>
  );
}
