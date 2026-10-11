import type { CSSProperties, ReactNode } from 'react';
import { Character, MOODS, type CharacterKind, type Mood } from './Character';

/**
 * Progress for *tasks* (uploading, a 5-prompt journal), never for the person.
 * Label in words: "3 of 5 prompts", not "60%".
 */
export function Progress({ value, max = 100, label, valueText }: { value: number; max?: number; label: ReactNode; valueText?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const text = valueText ?? `${value} of ${max}`;
  return (
    <div className="rd-progress">
      <div className="rd-progress__head">
        <span>{label}</span>
        <span aria-hidden>{text}</span>
      </div>
      <div className="rd-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={text} aria-label={typeof label === 'string' ? label : undefined}>
        <div className="rd-progress__fill" style={{ width: `${pct}%` }} data-complete={pct >= 100 || undefined} />
      </div>
    </div>
  );
}

/** Step dots for multi-step flows (onboarding, check-in). */
export function Steps({ total, current, label = 'progress' }: { total: number; current: number; label?: string }) {
  return (
    <ol className="rd-steps" aria-label={`${label}: step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <li key={i} data-done={i < current || undefined} aria-current={i === current ? 'step' : undefined}>
          <span className="rd-sr-only">
            step {i + 1}
            {i < current ? ', done' : i === current ? ', current' : ''}
          </span>
        </li>
      ))}
    </ol>
  );
}

export type TrailDay = { day: string; mood?: Mood; kind?: CharacterKind; today?: boolean };

/**
 * Mood trail: a week of check-ins as faces, not a chart. No scores, no
 * averages, no streak counter. Missed days are dashed outlines, not failures.
 */
export function MoodTrail({ days, label = 'this week' }: { days: TrailDay[]; label?: string }) {
  return (
    <ul className="rd-trail" aria-label={label}>
      {days.map((d) => (
        <li key={d.day} className="rd-trail__day" aria-current={d.today ? 'date' : undefined}>
          <span className="rd-trail__dot" data-empty={!d.mood || undefined} style={d.mood ? ({ '--rd-trail-bg': MOODS[d.mood].color } as CSSProperties) : undefined}>
            {d.mood && <Character kind={d.kind ?? 'sprout'} mood={d.mood} crop="bust" decorative dieCut={false} />}
          </span>
          <span>
            {d.day}
            <span className="rd-sr-only">: {d.mood ? MOODS[d.mood].word : 'no check-in'}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
