import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { Icon } from './Icon';
import { Avatar, type AvatarProps } from './Avatar';

export type CardTone = 'default' | 'hero' | 'warm' | 'inverse';

export function Card({
  tone = 'default',
  flat,
  zine,
  tape,
  grain,
  tilt = 0,
  as: As = 'div',
  className,
  style,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  tone?: CardTone;
  flat?: boolean;
  /** Sharp corners: editorial / poster content. */
  zine?: boolean;
  tape?: boolean | 'yellow';
  grain?: boolean;
  tilt?: -3 | -2 | -1 | 0 | 1 | 2 | 3;
  as?: 'div' | 'article' | 'section' | 'li';
}) {
  return (
    <As
      className={cx(
        'rd-card',
        tone !== 'default' && `rd-card--${tone}`,
        flat && 'rd-card--flat',
        zine && 'rd-card--zine',
        tape && 'rd-tape',
        typeof tape === 'string' && `rd-tape--${tape}`,
        grain && 'rd-grain',
        className,
      )}
      style={{ rotate: tilt ? `${tilt}deg` : undefined, ...style }}
      {...rest}
    >
      {children}
    </As>
  );
}

// ── Screenshot card ──────────────────────────────────────────────────────────
export type ShotPost = {
  name: string;
  handle: string;
  time: string;
  avatar?: AvatarProps;
  replyingTo?: string;
  body: string;
  media?: ReactNode;
  counts?: { replies?: number; reposts?: number; likes?: number };
};

const fmt = (n?: number) => (n === undefined ? '' : n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`.replace('.0k', 'k') : String(n));

/**
 * A post framed as a saved screenshot. Meme + screenshot culture is legit
 * brand content. Always credit the original poster and get consent for real people.
 */
export function ScreenshotCard({ posts, theme = 'dark', tape = true, tilt = 0, className }: { posts: ShotPost[]; theme?: 'dark' | 'light'; tape?: boolean; tilt?: number; className?: string }) {
  return (
    <figure
      className={cx('rd-shot', theme === 'light' && 'rd-shot--light', tape && 'rd-tape', className)}
      style={{ rotate: tilt ? `${tilt}deg` : undefined, margin: 0, '--rd-tape-rot': '3deg', '--rd-tape-x': '78%' } as CSSProperties}
      aria-label={`Screenshot of a post by ${posts[0]?.name}`}
    >
      {posts.map((p, i) => (
        <article className="rd-shot__post" key={i}>
          <Avatar size={44} {...(p.avatar ?? { name: p.name })} />
          <div>
            <div className="rd-shot__meta">
              <span className="rd-shot__name">{p.name}</span>
              <span>{p.handle}</span>
              <span aria-hidden>·</span>
              <span>{p.time}</span>
            </div>
            {p.replyingTo && (
              <p className="rd-shot__reply">
                Replying to <b>{p.replyingTo}</b>
              </p>
            )}
            <p className="rd-shot__body">{p.body}</p>
            {p.media && <div className="rd-shot__media">{p.media}</div>}
            {p.counts && (
              <ul className="rd-shot__actions" aria-label="post stats">
                <li>
                  <Icon name="message" size={16} /> <span className="rd-sr-only">replies</span>
                  {fmt(p.counts.replies)}
                </li>
                <li>
                  <Icon name="repost" size={16} /> <span className="rd-sr-only">reposts</span>
                  {fmt(p.counts.reposts)}
                </li>
                <li>
                  <Icon name="heart" size={16} /> <span className="rd-sr-only">likes</span>
                  {fmt(p.counts.likes)}
                </li>
                <li>
                  <Icon name="share" size={16} />
                </li>
              </ul>
            )}
          </div>
        </article>
      ))}
    </figure>
  );
}

// ── Quote / zine card ────────────────────────────────────────────────────────
export function ZineCard({
  quote,
  body,
  by,
  color = 'yellow',
  voice = 'display',
  tilt = 0,
  tape,
  halftone,
  grain = true,
  className,
}: {
  quote: string;
  body?: string;
  by?: string;
  color?: 'yellow' | 'cream' | 'navy' | 'white' | 'ink';
  voice?: 'display' | 'brush';
  tilt?: -3 | -2 | -1 | 0 | 1 | 2 | 3;
  tape?: boolean;
  halftone?: boolean;
  grain?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cx('rd-zine', color !== 'yellow' && `rd-zine--${color}`, tape && 'rd-tape', grain && 'rd-grain', halftone && 'rd-halftone', className)}
      style={{ '--rd-rot': `${tilt}deg`, margin: 0, ...(halftone ? { '--rd-halftone-bg': 'var(--rd-zine-bg, var(--rd-sunshine-400))' } : {}) } as CSSProperties}
    >
      <blockquote style={{ margin: 0 }}>
        <p className={cx('rd-zine__quote', voice === 'brush' && 'rd-zine__quote--brush')}>{quote}</p>
        {body && <p className="rd-zine__body">{body}</p>}
      </blockquote>
      {by && <figcaption className="rd-zine__by">— {by}</figcaption>}
    </figure>
  );
}
