import { Icon } from '@components';
import { useStore } from '../state/store';
import { HELPLINES, formatPhone } from '../state/helplines';
import { go } from '../state/router';

/**
 * Tone 5. Plain sentence case, no stickers, no tilt, no motion. Real contact
 * options first, in one tap. Shown by the deterministic safety screen, never
 * left to the model.
 */
export function CrisisCard({ headingLevel = 3, intro }: { headingLevel?: 2 | 3; intro?: string }) {
  const { state } = useStore();
  const h = HELPLINES[state.settings.region];
  const H = `h${headingLevel}` as 'h3';
  return (
    <section className="app-crisis" aria-labelledby="crisis-title" role="region">
      <H id="crisis-title" className="rd-heading-md" style={{ color: 'inherit', margin: 0 }}>
        You don't have to handle this alone.
      </H>
      <p className="rd-body" style={{ margin: 0 }}>
        {intro ?? 'A real person can help right now. Free and confidential.'}
      </p>
      <div className="app-crisis__actions">
        {h.crisis.call && (
          <a className="rd-btn rd-btn--block" href={`tel:${h.crisis.call}`}>
            <Icon name="phone" size={20} /> Call {h.crisis.name} · {formatPhone(h.crisis.call)}
          </a>
        )}
        {h.crisis.text && (
          <a className="rd-btn rd-btn--secondary rd-btn--block" href={`sms:${h.crisis.text}${h.crisis.textBody ? `?&body=${h.crisis.textBody}` : ''}`}>
            <Icon name="message" size={20} /> {h.crisis.textBody ? `Text ${h.crisis.textBody} to ${h.crisis.text}` : `Text ${h.crisis.textName ?? h.crisis.name} · ${h.crisis.text}`}
          </a>
        )}
        {h.crisis.url && (
          <a className="rd-btn rd-btn--block" href={h.crisis.url} target="_blank" rel="noreferrer">
            <Icon name="search" size={20} /> {h.crisis.name}
          </a>
        )}
      </div>
      <p className="rd-body-sm" style={{ margin: 0 }}>
        <strong>If you're in immediate danger,</strong> call {h.emergency ? <a href={`tel:${h.emergency}`}>{h.emergency}</a> : 'your local emergency number'} now.
      </p>
      <button type="button" className="app-link" onClick={() => go('/help/plan')}>
        Open my safety plan
      </button>
    </section>
  );
}
