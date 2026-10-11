import type { CSSProperties } from 'react';
import { cx } from './cx';
import { Character, type CharacterKind, type Mood } from './Character';

export type AvatarProps = {
  /** Used for alt text and initials. */
  name: string;
  src?: string;
  /** Character avatar instead of a photo (default for new / anonymous users). */
  character?: CharacterKind;
  mood?: Mood;
  size?: number;
  shape?: 'circle' | 'blob';
  sticker?: boolean;
  /** Decorative when the name is already shown next to it. */
  decorative?: boolean;
  className?: string;
};

const BG = ['var(--rd-sunshine-300)', 'var(--rd-sunshine-100)', 'var(--rd-midnight-100)', 'var(--rd-paper-200)', 'var(--rd-sunshine-200)', 'var(--rd-midnight-200)'];
const hash = (s: string) => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);

export function Avatar({ name, src, character, mood = 'okay', size = 48, shape = 'circle', sticker, decorative, className }: AvatarProps) {
  const initials = name
    .replace(/^@/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  const style = { '--rd-size': `${size}px`, '--rd-avatar-bg': BG[hash(name) % BG.length] } as CSSProperties;
  const cls = cx('rd-avatar', character && 'rd-avatar--character', shape === 'blob' && 'rd-avatar--blob', sticker && 'rd-avatar--sticker', className);
  if (src)
    return (
      <span className={cls} style={style}>
        <img src={src} alt={decorative ? '' : name} />
      </span>
    );
  if (character)
    return (
      <span className={cls} style={style} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : name}>
        <Character kind={character} mood={mood} crop="bust" decorative dieCut={false} />
      </span>
    );
  return (
    <span className={cls} style={style} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : name} aria-hidden={decorative || undefined}>
      <span aria-hidden>{initials}</span>
    </span>
  );
}

export function AvatarStack({ people, max = 4, size = 36 }: { people: AvatarProps[]; max?: number; size?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="rd-avatar-stack" role="group" aria-label={`${people.length} people`}>
      {shown.map((p, i) => (
        <Avatar key={i} {...p} size={size} decorative />
      ))}
      {extra > 0 && (
        <span className="rd-avatar" style={{ '--rd-size': `${size}px`, '--rd-avatar-bg': 'var(--rd-paper-900)', color: 'var(--rd-paper-100)', fontSize: 12 } as CSSProperties} aria-hidden>
          +{extra}
        </span>
      )}
    </span>
  );
}
