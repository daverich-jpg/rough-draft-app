import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export type TabItem = { id: string; label: ReactNode; content: ReactNode };

/**
 * WAI-ARIA tabs with automatic activation: one tab stop, ←/→ move,
 * Home/End jump. Styled as folder dividers ("the drafts folder").
 */
export function Tabs({ items, label, defaultTab, onChange }: { items: TabItem[]; label: string; defaultTab?: string; onChange?: (id: string) => void }) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
    refs.current[id]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const i = items.findIndex((t) => t.id === active);
    const go = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 }[e.key];
    if (go === undefined) return;
    e.preventDefault();
    select(items[(go + items.length) % items.length].id);
  };
  return (
    <div className="rd-tabs">
      <div role="tablist" aria-label={label} className="rd-tabs__list" onKeyDown={onKey}>
        {items.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${t.id}`}
            aria-controls={`${base}-panel-${t.id}`}
            aria-selected={active === t.id}
            tabIndex={active === t.id ? 0 : -1}
            className="rd-tab"
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={active !== t.id}
          tabIndex={0}
          className="rd-tabs__panel"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
