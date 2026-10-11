import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from './cx';

export type NavItem = { id: string; label: string; icon: IconName; href?: string; badge?: ReactNode };

export function Wordmark({ href = '#', className }: { href?: string; className?: string }) {
  return (
    <a href={href} className={cx('rd-wordmark', className)} aria-label="Rough Draft, home">
      <span className="rd-wordmark__rough" aria-hidden>
        Rough
      </span>
      <span className="rd-wordmark__draft" aria-hidden>
        draft
      </span>
    </a>
  );
}

/** Desktop / tablet top bar. */
export function TopNav({ items, current, onNavigate, end }: { items: NavItem[]; current: string; onNavigate?: (id: string) => void; end?: ReactNode }) {
  return (
    <nav className="rd-topnav" aria-label="main">
      <Wordmark />
      <ul className="rd-topnav__links">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={it.href ?? `#${it.id}`}
              className="rd-topnav__link"
              aria-current={current === it.id ? 'page' : undefined}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(it.id);
                }
              }}
            >
              <Icon name={it.icon} size={20} />
              {it.label}
              {it.badge}
            </a>
          </li>
        ))}
      </ul>
      {end}
    </nav>
  );
}

/**
 * Mobile bottom tab bar. Exactly 5 slots; the middle one is the primary
 * action (check in) and gets the big accent button.
 */
export function TabBar({ items, current, primary, onNavigate }: { items: NavItem[]; current: string; primary: string; onNavigate?: (id: string) => void }) {
  return (
    <nav aria-label="main">
      <ul className="rd-tabbar">
        {items.map((it) => (
          <li key={it.id} style={{ display: 'contents' }}>
            <a
              href={it.href ?? `#${it.id}`}
              className={cx('rd-tabbar__item', it.id === primary && 'rd-tabbar__item--primary')}
              aria-current={current === it.id ? 'page' : undefined}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(it.id);
                }
              }}
            >
              <span className="rd-tabbar__icon">
                <Icon name={it.icon} size={it.id === primary ? 28 : 22} strokeWidth={it.id === primary ? 2.4 : 2} />
              </span>
              <span>{it.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
