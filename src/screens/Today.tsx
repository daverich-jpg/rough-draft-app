import { useState } from 'react';
import { Avatar, Card, Character, Icon, MOODS, MoodTrail, type TrailDay } from '@components';
import { useStore, isToday, dayLabel, uid } from '../state/store';
import { go } from '../state/router';
import { MOOD_CHARACTER } from '@components/MoodCheckIn';
import { TOOLS, ToolSheet, type ToolId } from '../ui/Tools';

/**
 * Home answers three questions, in this order:
 *  1. how am i doing today? (check in, or what i said)
 *  2. what could help right now? (one-tap tools)
 *  3. where do i go for more? (Remi, then real humans)
 * No stats, no streaks. The week is faces.
 */
export function Today() {
  const { state, dispatch } = useStore();
  const [tool, setTool] = useState<ToolId | null>(null);
  const today = state.checkins.filter((c) => isToday(c.at)).at(-1);
  const hour = new Date().getHours();
  const hello = hour < 5 ? 'still up' : hour < 12 ? 'morning' : hour < 18 ? 'hey' : 'evening';
  const name = state.settings.name;

  const week: TrailDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const c = state.checkins.filter((x) => new Date(x.at).toDateString() === d.toDateString()).at(-1);
    return { day: dayLabel(d), mood: c?.mood, kind: c ? MOOD_CHARACTER[c.mood] : undefined, today: i === 6 };
  });

  const startUnsent = () => {
    const now = new Date().toISOString();
    const id = uid();
    dispatch({ type: 'draft:upsert', draft: { id, title: '', body: '', prompt: 'write the text you won’t send.', createdAt: now, updatedAt: now } });
    go(`/drafts/${id}`);
  };

  return (
    <div className="app-screen">
      <header className="app-header">
        <div style={{ flex: 1 }}>
          <span className="rd-caption">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          <h1 className="rd-heading-lg" style={{ margin: 0 }}>
            {hello}
            {name ? `, ${name.toLowerCase()}` : ''}.
          </h1>
        </div>
        <button type="button" className="app-avatar-btn" onClick={() => go('/you')} aria-label="you: settings and privacy">
          <Avatar name={name || 'you'} character="moss" mood="okay" size={44} decorative />
        </button>
      </header>

      {today ? (
        <Card tone="hero" className="app-cta app-cta--tile">
          <span className="app-face" style={{ background: MOODS[today.mood].color }}>
            <Character kind={MOOD_CHARACTER[today.mood]} mood={today.mood} crop="bust" decorative dieCut={false} />
          </span>
          <div style={{ flex: 1 }}>
            <span className="rd-caption" style={{ color: 'var(--rd-text-on-hero)' }}>
              today you said
            </span>
            <p className="rd-display rd-display-sm" style={{ margin: '2px 0 4px' }}>
              {MOODS[today.mood].word}
            </p>
            <button type="button" className="app-link" onClick={() => go('/checkin')}>
              check in again
            </button>
          </div>
        </Card>
      ) : (
        <button type="button" className="rd-card rd-card--hero rd-card--interactive app-cta" onClick={() => go('/checkin')}>
          <span>
            <span className="rd-display rd-display-md" style={{ display: 'block' }}>
              How's the weather in there?
            </span>
            <span className="rd-body" style={{ color: 'var(--rd-text-on-hero)' }}>
              10 seconds. no numbers.
            </span>
          </span>
          <Icon name="arrow-right" size={28} />
        </button>
      )}

      <section aria-labelledby="week-h" className="app-section">
        <h2 id="week-h" className="rd-label rd-secondary" style={{ margin: 0 }}>
          this week, in faces
        </h2>
        <MoodTrail days={week} />
      </section>

      <section aria-labelledby="now-h" className="app-section">
        <h2 id="now-h" className="rd-label rd-secondary" style={{ margin: 0 }}>
          for right now
        </h2>
        <ul className="app-group">
          {TOOLS.map((t) => (
            <li key={t.id}>
              <button type="button" className="app-group__row" onClick={() => (t.id === 'unsent' ? startUnsent() : setTool(t.id))}>
                <span className="app-group__text">
                  <span className="rd-heading-md" style={{ fontSize: '1.0625rem' }}>
                    {t.title}
                  </span>
                  <span className="rd-body-sm rd-secondary">{t.blurb}</span>
                </span>
                <span className="app-group__meta">{t.time}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <ul className="app-group">
        <li>
          <button type="button" className="app-group__row" onClick={() => go('/talk')}>
            <span className="app-ai-mark" aria-hidden>
              R
            </span>
            <span className="app-group__text">
              <span className="rd-heading-md" style={{ fontSize: '1.0625rem' }}>
                talk it out with Remi
              </span>
              <span className="rd-body-sm rd-secondary">AI · not a therapist</span>
            </span>
            <Icon name="arrow-right" size={20} />
          </button>
        </li>
      </ul>

      <p className="rd-body-sm" style={{ margin: 0, textAlign: 'center' }}>
        more than a bad day?{' '}
        <button type="button" className="app-link" onClick={() => go('/help')}>
          talk to a real person
        </button>
      </p>

      <ToolSheet tool={tool} onClose={() => setTool(null)} />
    </div>
  );
}
