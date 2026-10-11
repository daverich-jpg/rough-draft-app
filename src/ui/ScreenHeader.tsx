import type { ReactNode } from 'react';
import { Button } from '@components';

export function ScreenHeader({ title, kicker, back, actions, loud = true }: { title: ReactNode; kicker?: ReactNode; back?: () => void; actions?: ReactNode; loud?: boolean }) {
  return (
    <header className="app-header">
      {back && <Button variant="ghost" size="sm" icon="arrow-left" aria-label="back" onClick={back} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        {kicker && <span className="rd-caption">{kicker}</span>}
        <h1 className={loud ? 'rd-display rd-display-lg' : 'rd-heading-lg'} style={{ margin: 0 }}>
          {title}
        </h1>
      </div>
      {actions && <div className="app-header__actions">{actions}</div>}
    </header>
  );
}
