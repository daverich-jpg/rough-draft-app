import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'sticker' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  /** Text read to screen readers while loading, e.g. "posting…" */
  loadingLabel?: string;
  iconStart?: IconName;
  iconEnd?: IconName;
  /** Icon-only button. Requires aria-label. */
  icon?: IconName;
  children?: ReactNode;
};

/**
 * Buttons say what happens, lowercase-friendly, 1–3 words: "post it", "save draft", "not now".
 * Sticker variant = marketing + delight only, max one per screen.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, loading, loadingLabel = 'working on it', iconStart, iconEnd, icon, className, children, disabled, type = 'button', onClick, ...rest },
  ref,
) {
  if (import.meta.env.DEV && icon && !rest['aria-label']) console.warn('[rough-draft] icon-only <Button> needs an aria-label');
  return (
    <button
      ref={ref}
      type={type}
      className={cx('rd-btn', variant !== 'primary' && `rd-btn--${variant}`, size !== 'md' && `rd-btn--${size}`, block && 'rd-btn--block', icon && 'rd-btn--icon', className)}
      disabled={disabled}
      aria-busy={loading || undefined}
      // keep focus + tab order while loading; just block the action
      aria-disabled={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {loading ? (
        <>
          <svg className="rd-btn__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" aria-hidden>
            <path d="M12 3.5c4.8.1 8.4 3.8 8.5 8.4" />
          </svg>
          <span className="rd-sr-only">{loadingLabel}</span>
          {!icon && <span aria-hidden>{children}</span>}
        </>
      ) : icon ? (
        <Icon name={icon} />
      ) : (
        <>
          {iconStart && <Icon name={iconStart} size={20} />}
          {children}
          {iconEnd && <Icon name={iconEnd} size={20} />}
        </>
      )}
    </button>
  );
});
