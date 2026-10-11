import type { ReactNode } from 'react';
import { Character, type CharacterKind, type Mood } from './Character';

/**
 * Empty states are an invitation, not a scolding. Title = what's here (or not),
 * body = why that's fine, action = the one next thing.
 */
export function EmptyState({
  title,
  body,
  actions,
  character = 'doze',
  mood = 'okay',
  headingLevel = 2,
}: {
  title: string;
  body?: ReactNode;
  actions?: ReactNode;
  character?: CharacterKind;
  mood?: Mood;
  headingLevel?: 2 | 3 | 4;
}) {
  const H = `h${headingLevel}` as 'h2';
  return (
    <div className="rd-empty">
      <Character kind={character} mood={mood} className="rd-empty__art" decorative />
      <H className="rd-display rd-display-md">{title}</H>
      {body && <p className="rd-empty__body">{body}</p>}
      {actions && <div className="rd-empty__actions">{actions}</div>}
    </div>
  );
}
