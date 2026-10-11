import { useEffect, useState } from 'react';
import { Button, Sheet, Steps } from '@components';

export type ToolId = 'breathe' | 'ground';

export const TOOLS: Array<{ id: ToolId | 'unsent'; title: string; time: string; blurb: string }> = [
  { id: 'breathe', title: 'breathe for a minute', time: '1 min', blurb: 'in 4, out 6. slows things down.' },
  { id: 'ground', title: '5-4-3-2-1', time: '2 min', blurb: 'back in the room, one sense at a time.' },
  { id: 'unsent', title: 'the text you won’t send', time: '5 min', blurb: 'write it. nobody sees it.' },
];

export function ToolSheet({ tool, onClose }: { tool: ToolId | null; onClose: () => void }) {
  return (
    <Sheet
      open={tool !== null}
      onClose={onClose}
      title={tool === 'ground' ? '5-4-3-2-1' : 'Breathe with me'}
      description={tool === 'ground' ? 'Out loud or in your head.' : 'Follow the circle. Stop anytime.'}
      gentle
    >
      {tool === 'breathe' && <Breathe />}
      {tool === 'ground' && <Ground onDone={onClose} />}
    </Sheet>
  );
}

function Breathe() {
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [rounds, setRounds] = useState(0);
  useEffect(() => {
    const t = setTimeout(
      () => {
        setPhase((p) => (p === 'in' ? 'out' : 'in'));
        if (phase === 'out') setRounds((r) => r + 1);
      },
      phase === 'in' ? 4000 : 6000,
    );
    return () => clearTimeout(t);
  }, [phase]);
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 16, padding: '12px 0' }}>
      <div className={`app-breathe app-breathe--${phase}`} aria-hidden />
      <p className="rd-heading-lg" aria-live="polite" style={{ margin: 0 }}>
        {phase === 'in' ? 'Breathe in… 4' : 'And out… 6'}
      </p>
      <p className="rd-body-sm rd-secondary" style={{ margin: 0 }}>
        {rounds === 0 ? 'six rounds is about a minute.' : rounds >= 6 ? 'that’s a minute. keep going if it helps.' : `${rounds} of 6`}
      </p>
    </div>
  );
}

const SENSES = [
  ['5', 'things you can see'],
  ['4', 'things you can touch'],
  ['3', 'things you can hear'],
  ['2', 'things you can smell'],
  ['1', 'thing you can taste'],
] as const;

function Ground({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const done = i >= SENSES.length;
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <Steps total={SENSES.length} current={Math.min(i, SENSES.length - 1)} label="grounding" />
      {done ? (
        <p className="rd-heading-md" style={{ margin: 0 }} role="status">
          You're here. That's the whole exercise.
        </p>
      ) : (
        <p className="rd-heading-lg" style={{ margin: 0 }} aria-live="polite">
          <span className="rd-display rd-display-xl" style={{ display: 'block' }}>
            {SENSES[i][0]}
          </span>
          {SENSES[i][1]}
        </p>
      )}
      <Button size="lg" block onClick={() => (done ? onDone() : setI(i + 1))}>
        {done ? 'done' : i === SENSES.length - 1 ? 'got it' : 'next'}
      </Button>
    </div>
  );
}
