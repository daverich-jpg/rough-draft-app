import { useState } from 'react';
import { Avatar, Button, Card, Field, Icon, Input, Textarea, useToast } from '@components';
import { useStore, uid, PLAN_STEPS, type SafetyPlan } from '../state/store';
import { go } from '../state/router';
import { ScreenHeader } from '../ui/ScreenHeader';
import { CrisisCard } from '../ui/CrisisCard';

/**
 * Help = real humans. Tone 5 throughout: sentence case, no stickers, no jokes.
 * Ordered by urgency: talk now → my plan → my people → longer-term support.
 */
export function Help({ sub }: { sub?: string }) {
  if (sub === 'plan') return <Plan />;
  if (sub === 'people') return <People />;
  return <HelpHome />;
}

function HelpHome() {
  const { state } = useStore();
  const planDone = PLAN_STEPS.filter(([k]) => state.plan[k].trim()).length;
  return (
    <div className="app-screen">
      <ScreenHeader title="Real people" loud={false} kicker="help" />
      <CrisisCard headingLevel={2} />
      <ul className="app-group">
        <li>
          <a className="app-group__row" href="#/help/plan">
            <Icon name="shield" size={24} />
            <span className="app-group__text">
              <span className="rd-heading-md" style={{ fontSize: '1.0625rem' }}>
                My safety plan
              </span>
              <span className="rd-body-sm rd-secondary">{planDone ? `${planDone} of ${PLAN_STEPS.length} parts filled in` : 'made on a calm day, for a hard one'}</span>
            </span>
            <Icon name="arrow-right" size={20} />
          </a>
        </li>
        <li>
          <a className="app-group__row" href="#/help/people">
            <Icon name="people" size={24} />
            <span className="app-group__text">
              <span className="rd-heading-md" style={{ fontSize: '1.0625rem' }}>
                My people
              </span>
              <span className="rd-body-sm rd-secondary">{state.contacts.length ? `${state.contacts.length} trusted ${state.contacts.length === 1 ? 'person' : 'people'}` : 'who you’d text when it’s bad'}</span>
            </span>
            <Icon name="arrow-right" size={20} />
          </a>
        </li>
      </ul>
      <Card flat style={{ display: 'grid', gap: 8 }}>
        <h2 className="rd-heading-md" style={{ margin: 0 }}>
          Talking to a professional
        </h2>
        <p className="rd-body-sm" style={{ margin: 0 }}>
          Heavy for more than two weeks? A GP, campus counselling or a therapist can help. No crisis needed.
        </p>
        <p className="rd-body-sm rd-secondary" style={{ margin: 0 }}>
          Not sure what to say? Practise with Remi first.
        </p>
        <Button variant="soft" iconStart="message" onClick={() => go('/talk')}>
          practise with Remi
        </Button>
      </Card>
    </div>
  );
}

/** Based on the Stanley–Brown Safety Planning Intervention structure. */
function Plan() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [plan, setPlan] = useState<SafetyPlan>(state.plan);
  const dirty = JSON.stringify(plan) !== JSON.stringify(state.plan);
  return (
    <div className="app-screen">
      <ScreenHeader title="My safety plan" loud={false} back={() => go('/help')} />
      <p className="rd-body" style={{ margin: 0 }}>
        Fill it in on a calm day. Short answers are fine. Skip anything.
      </p>
      {PLAN_STEPS.map(([k, label, hint], i) => (
        <Field key={k} label={`${i + 1}. ${label}`} hint={hint} optional>
          <Textarea rows={3} value={plan[k]} onChange={(e) => setPlan({ ...plan, [k]: e.target.value })} />
        </Field>
      ))}
      {dirty && (
        <div className="app-sticky-actions">
          <Button
            size="lg"
            block
            onClick={() => {
              dispatch({ type: 'plan', plan: { ...plan, updatedAt: new Date().toISOString() } });
              toast({ tone: 'success', title: 'plan saved', body: 'it’s here whenever you need it.' });
            }}
          >
            save my plan
          </Button>
        </div>
      )}
      {!dirty && state.plan.updatedAt && (
        <p className="rd-body-sm rd-secondary" style={{ margin: 0 }} role="status">
          saved {new Date(state.plan.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.
        </p>
      )}
    </div>
  );
}

function People() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const valid = name.trim() && phone.replace(/[^\d+]/g, '').length >= 6;
  const msg = encodeURIComponent('hey, having a rough time. could you check in on me when you can?');
  return (
    <div className="app-screen">
      <ScreenHeader title="My people" loud={false} back={() => go('/help')} />
      <p className="rd-body" style={{ margin: 0 }}>
        Who you'd want on a bad day. One tap writes the text; you hit send.
      </p>
      {state.contacts.length > 0 && (
        <ul className="app-list">
          {state.contacts.map((c) => (
            <li key={c.id} className="rd-card app-row">
              <Avatar name={c.name} size={44} decorative />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="rd-heading-md" style={{ display: 'block' }}>
                  {c.name}
                </span>
                <span className="rd-body-sm rd-secondary">{c.phone}</span>
              </span>
              <a className="rd-btn rd-btn--sm" href={`sms:${c.phone}?&body=${msg}`}>
                ask to check in
              </a>
              <Button variant="ghost" size="sm" icon="trash" aria-label={`remove ${c.name}`} onClick={() => dispatch({ type: 'contact:remove', id: c.id })} />
            </li>
          ))}
        </ul>
      )}
      <form
        className="rd-card rd-card--flat"
        style={{ display: 'grid', gap: 14 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          dispatch({ type: 'contact:add', contact: { id: uid(), name: name.trim(), phone: phone.trim() } });
          setName('');
          setPhone('');
        }}
      >
        <h2 className="rd-heading-md" style={{ margin: 0 }}>
          Add someone
        </h2>
        <Field label="name">
          <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </Field>
        <Field label="phone number" hint="stays on this device.">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="off" />
        </Field>
        <Button type="submit" disabled={!valid} iconStart="plus">
          add
        </Button>
      </form>
    </div>
  );
}
