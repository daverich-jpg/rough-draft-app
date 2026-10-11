import { useState } from 'react';
import { Button, Character, Checkbox, Field, Input, Select, Steps, Sticker, Toggle } from '@components';
import { useStore } from '../state/store';
import { HELPLINES, type Region } from '../state/helplines';

/**
 * 4 steps. Two pieces of deliberate friction, both protective:
 *  · step 1 states what the app is and isn't, and confirms 18+ (the product is scoped to adults)
 *  · step 2 introduces Remi as an AI *before* anyone talks to it
 * Everything else is skippable and changeable later.
 */
export function Onboarding() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [region, setRegion] = useState<Region>('uk');
  const [adult, setAdult] = useState(false);
  const [under18, setUnder18] = useState(false);
  const [share, setShare] = useState(false);
  const [nudge, setNudge] = useState(true);
  const [nudgeTime, setNudgeTime] = useState<'morning' | 'lunch' | 'evening'>('evening');

  const finish = () => dispatch({ type: 'onboard', settings: { name: name.trim(), region, adult: true, shareCheckins: share, nudge, nudgeTime, remiIntroSeen: true } });

  if (under18)
    return (
      <main className="app-onboard" aria-labelledby="u18">
        <Character kind="moss" mood="soft" width={110} decorative />
        <h1 id="u18" className="rd-heading-lg">
          Rough Draft is for 18–25s right now.
        </h1>
        <p className="rd-body">We can't look after younger people safely yet. You still deserve support:</p>
        <a className="rd-btn rd-btn--block" href="https://findahelpline.com" target="_blank" rel="noreferrer">
          Find youth support
        </a>
        <Button variant="ghost" onClick={() => setUnder18(false)}>
          go back
        </Button>
      </main>
    );

  if (step === 0)
    return (
      <main className="app-onboard app-onboard--hero" aria-labelledby="ob0">
        <div className="app-onboard__headline">
          <h1 id="ob0" className="rd-display rd-display-xl" style={{ color: 'var(--rd-text-on-hero)', fontSize: 'clamp(3rem, 14vw, 4.5rem)' }}>
            Hi. We're not here to fix you.
          </h1>
          <Sticker color="yellow" tilt={3}>
            promise.
          </Sticker>
        </div>
        <Character kind="sprout" mood="hyped" width={190} title="Sprout, waving hello" />
        <div className="app-onboard__footer">
          <p className="rd-body-lg" style={{ margin: 0 }}>
            check in. write it down. talk it out. at your pace.
          </p>
          <Button size="lg" block iconEnd="arrow-right" onClick={() => setStep(1)}>
            ok, i'm in
          </Button>
        </div>
      </main>
    );

  return (
    <main className="app-onboard" aria-labelledby={`ob${step}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="ghost" size="sm" icon="arrow-left" aria-label="back" onClick={() => setStep(step - 1)} />
        <div style={{ flex: 1 }}>
          <Steps total={3} current={step - 1} label="setup" />
        </div>
      </div>

      {step === 1 && (
        <>
          <h1 id="ob1" className="rd-display rd-display-lg">
            The honest bit
          </h1>
          <ul className="app-honest">
            <li>
              <strong>for:</strong> check-ins, journaling, quick tools and Remi (an AI).
            </li>
            <li>
              <strong>not:</strong> therapy, a diagnosis or emergency help.
            </li>
            <li>
              <strong>yours:</strong> private. export or delete anytime.
            </li>
          </ul>
          <Field label="what should we call you?" optional>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="a name, a nickname, a vibe" autoComplete="given-name" />
          </Field>
          <Field label="where are you?" hint="for your local crisis lines.">
            <Select value={region} onChange={(e) => setRegion(e.target.value as Region)}>
              {(Object.keys(HELPLINES) as Region[]).map((r) => (
                <option key={r} value={r}>
                  {HELPLINES[r].label}
                </option>
              ))}
            </Select>
          </Field>
          <Checkbox label="i'm 18 or older" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
          <div style={{ display: 'grid', gap: 8 }}>
            <Button size="lg" block disabled={!adult} onClick={() => setStep(2)} iconEnd="arrow-right">
              next
            </Button>
            <Button variant="ghost" onClick={() => setUnder18(true)}>
              i'm under 18
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 id="ob2" className="rd-display rd-display-lg">
            Meet Remi
          </h1>
          <div className="app-ai-intro">
            <span className="app-ai-mark" aria-hidden>
              R
            </span>
            <div>
              <p className="rd-body" style={{ margin: 0 }}>
                <strong>Remi is an AI</strong>, not a person or therapist. good for 2am thoughts, hard texts and "what am i even feeling?"
              </p>
            </div>
          </div>
          <ul className="app-honest">
            <li>can be wrong. you know you best.</li>
            <li>no diagnoses. no meds advice.</li>
            <li>serious stuff? it points you to real people.</li>
          </ul>
          <Toggle label="let Remi see my check-ins" description="this week’s moods + tags. never your notes." checked={share} onChange={setShare} />
          <Button size="lg" block onClick={() => setStep(3)} iconEnd="arrow-right">
            got it
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <h1 id="ob3" className="rd-display rd-display-lg">
            Want a nudge?
          </h1>
          <p className="rd-body rd-secondary" style={{ margin: 0 }}>
            one a day, max. no streaks, no guilt.
          </p>
          <Toggle label="daily nudge" description="a quiet ping, not an alarm" checked={nudge} onChange={setNudge} />
          {nudge && (
            <Field label="when?" hint="never between 10pm and 8am.">
              <Select value={nudgeTime} onChange={(e) => setNudgeTime(e.target.value as typeof nudgeTime)}>
                <option value="morning">morning-ish (9am)</option>
                <option value="lunch">lunch (1pm)</option>
                <option value="evening">evening (7pm)</option>
              </Select>
            </Field>
          )}
          <Button size="lg" block onClick={finish}>
            let's go
          </Button>
        </>
      )}
    </main>
  );
}
