import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './cx';
import { Icon, type IconName } from './Icon';
import { Button } from './Button';

export type ToastTone = 'plain' | 'success' | 'error' | 'info';
export type ToastInput = {
  title: string;
  body?: string;
  tone?: ToastTone;
  action?: { label: string; onClick: () => void };
  /** ms. Defaults to 5000, or no auto-dismiss when there's an action (WCAG 2.2.1). */
  duration?: number;
};
type ToastItem = ToastInput & { id: number; leaving?: boolean };

const ToastCtx = createContext<{ toast: (t: ToastInput) => void } | null>(null);
export const useToast = () => {
  const c = useContext(ToastCtx);
  if (!c) throw new Error('useToast must be used inside <ToastProvider>');
  return c.toast;
};

const ICON: Record<ToastTone, IconName> = { plain: 'sparkle', success: 'check', error: 'alert', info: 'info' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const dismiss = useCallback((id: number) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 200);
  }, []);
  const toast = useCallback((t: ToastInput) => {
    const id = ++seq.current;
    setItems((xs) => [...xs.slice(-2), { ...t, id }]);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {/* Two live regions: errors interrupt, everything else waits its turn. */}
      <ol className="rd-toasts" aria-live="polite" aria-label="notifications">
        {items.filter((t) => t.tone !== 'error').map((t) => (
          <ToastView key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </ol>
      <ol className="rd-toasts" role="alert" aria-label="errors" style={{ bottom: 'calc(96px + env(safe-area-inset-bottom))' }}>
        {items.filter((t) => t.tone === 'error').map((t) => (
          <ToastView key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </ol>
    </ToastCtx.Provider>
  );
}

function ToastView({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);
  const tone = item.tone ?? 'plain';
  const duration = item.duration ?? (item.action ? 0 : 5000);
  useEffect(() => {
    if (!duration || paused) return;
    const t = setTimeout(() => onDismiss(item.id), duration);
    return () => clearTimeout(t);
  }, [duration, paused, item.id, onDismiss]);
  return (
    <li
      className={cx('rd-toast', tone !== 'plain' && `rd-toast--${tone}`)}
      data-leaving={item.leaving || undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="rd-toast__icon" aria-hidden>
        <Icon name={ICON[tone]} size={18} strokeWidth={2.6} />
      </span>
      <div>
        <p className="rd-toast__title">{item.title}</p>
        {item.body && <p className="rd-toast__body">{item.body}</p>}
        {item.action && (
          <Button
            size="sm"
            variant="soft"
            className="rd-toast__action"
            onClick={() => {
              item.action!.onClick();
              onDismiss(item.id);
            }}
          >
            {item.action.label}
          </Button>
        )}
      </div>
      <Button variant="ghost" size="sm" icon="close" aria-label="dismiss" onClick={() => onDismiss(item.id)} />
    </li>
  );
}
