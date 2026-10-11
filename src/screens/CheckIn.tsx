import { useState } from 'react';
import { Button, MoodCheckIn, useToast, type CheckIn as CheckInData } from '@components';
import { useStore, uid } from '../state/store';
import { HELPLINES } from '../state/helplines';
import { go } from '../state/router';
import { ScreenHeader } from '../ui/ScreenHeader';
import { CrisisCard } from '../ui/CrisisCard';

/**
 * After a check-in, offer *one* optional next step instead of ending on a dead
 * "saved". Heavy check-ins get real-human support first and quieter options.
 */
export function CheckIn() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [saved, setSaved] = useState<CheckInData | null>(null);
  const help = HELPLINES[state.settings.region].crisis;

  const onSubmit = (c: CheckInData) => {
    dispatch({ type: 'checkin', rec: { id: uid(), at: new Date().toISOString(), mood: c.mood, tags: c.tags, note: c.note } });
    setSaved(c);
  };
  const writeAboutIt = () => {
    const now = new Date().toISOString();
    const id = uid();
    dispatch({ type: 'draft:upsert', draft: { id, title: '', body: saved?.note ?? '', prompt: 'what’s underneath today?', createdAt: now, updatedAt: now } });
    go(`/drafts/${id}`);
  };
  const heavy = saved?.mood === 'heavy';

  return (
    <div className="app-screen">
      <ScreenHeader title="Check in" loud={false} back={() => go('/today')} />
      <MoodCheckIn supportHref={help.url ?? (help.call ? `tel:${help.call}` : 'https://findahelpline.com')} onSubmit={onSubmit} onSkip={() => (toast({ title: 'no worries.', body: 'the door’s open whenever.' }), go('/today'))} />
      {saved && (
        <section className="app-section rd-reveal" aria-labelledby="next-h">
          <h2 id="next-h" className={heavy ? 'rd-heading-md' : 'rd-heading-md'} style={{ margin: 0 }}>
            {heavy ? 'If it would help:' : 'anything else?'}
          </h2>
          {heavy && <CrisisCard headingLevel={3} intro="Heavy days are real. If it’s more than that, you can talk to someone today." />}
          <div className="app-next">
            <Button variant="soft" block iconStart="journal" onClick={writeAboutIt}>
              {heavy ? 'Write it down' : 'write about it'}
            </Button>
            <Button variant="soft" block iconStart="message" onClick={() => go('/talk')}>
              {heavy ? 'Talk to Remi' : 'talk to Remi'}
            </Button>
            <Button variant="ghost" block onClick={() => go('/today')}>
              {heavy ? 'Nothing right now' : 'nope, i’m good'}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
