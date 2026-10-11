import { useId, useState, type CSSProperties } from 'react';
import { Character, MOODS, type CharacterKind, type Mood } from './Character';
import { Chip } from './Chip';
import { Field, Textarea, CharCount } from './Field';
import { Button } from './Button';
import { Icon } from './Icon';

export const MOOD_CHARACTER: Record<Mood, CharacterKind> = {
  hyped: 'sprout',
  okay: 'sprout',
  soft: 'moss',
  tired: 'doze',
  chaotic: 'static',
  heavy: 'moss', // Moss is the calm one. Never Sprout on a heavy day.
};

const TILT: Record<Mood, number> = { hyped: -3, okay: 2, soft: -1, tired: 3, chaotic: -2, heavy: 0 };

export const CONTEXT_TAGS = ['school / work', 'people', 'my body', 'sleep', 'money', 'the news', 'nothing specific', 'literally everything'];

export type CheckIn = { mood: Mood; tags: string[]; note: string };

/**
 * The core wellness interaction. Expressive, not clinical:
 *  · no 1–10 scale, no score, no "how would you rate"
 *  · pick a face → optionally say what's in it → optionally write
 *  · every step after the first is skippable
 *  · choosing "heavy" switches to gentle mode: no jokes, support surfaces
 *    *before* submit, never after a wall of form.
 */
export function MoodCheckIn({
  onSubmit,
  onSkip,
  supportHref = 'https://findahelpline.com',
  greeting = "how's the weather in there?",
  maxNote = 500,
}: {
  onSubmit?: (c: CheckIn) => void;
  onSkip?: () => void;
  /** Localise per market. Defaults to an international helpline directory. */
  supportHref?: string;
  greeting?: string;
  maxNote?: number;
}) {
  const [mood, setMood] = useState<Mood>();
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const name = useId();
  const gentle = mood === 'heavy';

  if (saved && mood)
    return (
      <div className="rd-checkin rd-reveal" role="status">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Character kind={MOOD_CHARACTER[mood]} mood={gentle ? 'soft' : mood === 'hyped' ? 'hyped' : 'soft'} width={92} decorative />
          <div>
            <h3 className={gentle ? 'rd-heading-lg' : 'rd-display rd-display-md'}>{gentle ? 'Saved. Thank you for telling us.' : 'logged. that counts.'}</h3>
            <p className="rd-body rd-secondary" style={{ margin: '6px 0 0' }}>
              {gentle ? 'Only you can see it. Come back anytime.' : 'only you can see it.'}
            </p>
          </div>
        </div>
        {gentle && (
          <p className="rd-body" style={{ margin: 0 }}>
            <a href={supportHref} target="_blank" rel="noreferrer">
              talk to someone now
            </a>
          </p>
        )}
      </div>
    );

  return (
    <form
      className="rd-checkin"
      onSubmit={(e) => {
        e.preventDefault();
        if (!mood || note.length > maxNote) return;
        setSaved(true);
        onSubmit?.({ mood, tags, note });
      }}
    >
      <fieldset className="rd-fieldset" style={{ gap: 12 }}>
        <legend className="rd-checkin__q">
          <span className="rd-display rd-display-md" style={{ display: 'block' }}>
            {greeting}
          </span>
          <span className="rd-body rd-secondary">closest one wins. no wrong answers.</span>
        </legend>
        <div className="rd-moods">
          {(Object.keys(MOODS) as Mood[]).map((m) => (
            <label key={m} className="rd-mood" style={{ '--rd-mood-bg': MOODS[m].color, '--rd-rot': `${TILT[m]}deg` } as CSSProperties}>
              <input type="radio" name={name} value={m} checked={mood === m} onChange={() => setMood(m)} aria-label={MOODS[m].alt} />
              <span className="rd-mood__card" aria-hidden>
                <span className="rd-mood__art">
                  <Character kind={MOOD_CHARACTER[m]} mood={m} crop="bust" decorative dieCut={false} />
                </span>
                <span className="rd-mood__word">{MOODS[m].word}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {mood && (
        <div className="rd-reveal" style={{ display: 'grid', gap: 24 }} key={gentle ? 'g' : 'n'}>
          {gentle && (
            <div className="rd-gentle" role="note">
              <p className="rd-heading-md" style={{ color: 'inherit' }}>
                heavy days are real. you don't have to fix this one.
              </p>
              <p className="rd-body">If it's too much, you can talk to someone today. Free and confidential.</p>
              <p className="rd-body" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="phone" size={20} />
                <a href={supportHref} target="_blank" rel="noreferrer">
                  find a helpline near you
                </a>
              </p>
            </div>
          )}
          <fieldset className="rd-fieldset" style={{ gap: 10 }}>
            <legend className="rd-field__label">
              {gentle ? 'Want to name what it’s about?' : "what's in it?"}
              <span className="rd-field__optional">(optional)</span>
            </legend>
            <div className="rd-chips">
              {CONTEXT_TAGS.map((t) => (
                <Chip
                  key={t}
                  selected={tags.includes(t)}
                  color={MOODS[mood].color}
                  onToggle={(on) => setTags((xs) => (on ? [...xs, t] : xs.filter((x) => x !== t)))}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Field
            label={gentle ? 'Anything you want to get out of your head?' : 'say more? (or don’t)'}
            optional
            hint="only you can see this."
            error={note.length > maxNote ? `${note.length - maxNote} over. trim a little to save.` : undefined}
            footer={<CharCount value={note} max={maxNote} />}
          >
            <Textarea lined rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder={gentle ? 'whatever comes. it doesn’t have to make sense.' : 'today i…'} />
          </Field>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button type="submit" size="lg" disabled={!mood} iconEnd={gentle ? undefined : 'arrow-right'}>
          {gentle ? 'save it' : 'log it'}
        </Button>
        {onSkip && (
          <Button variant="ghost" onClick={onSkip}>
            not today
          </Button>
        )}
      </div>
    </form>
  );
}
