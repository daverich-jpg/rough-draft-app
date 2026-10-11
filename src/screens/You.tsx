import { useState } from 'react';
import { Button, Card, Field, Input, Modal, Select, Toggle } from '@components';
import { useStore } from '../state/store';
import { HELPLINES, type Region } from '../state/helplines';
import { go } from '../state/router';
import { ScreenHeader } from '../ui/ScreenHeader';

export function You() {
  const { state, dispatch } = useStore();
  const s = state.settings;
  const set = (patch: Partial<typeof s>) => dispatch({ type: 'settings', patch });
  const [confirm, setConfirm] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rough-draft-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="app-screen">
      <ScreenHeader title="You" back={() => go('/today')} />
      <Card flat style={{ display: 'grid', gap: 16 }}>
        <h2 className="rd-heading-md" style={{ margin: 0 }}>
          basics
        </h2>
        <Field label="name" optional>
          <Input value={s.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="where you are" hint="sets your local crisis lines.">
          <Select value={s.region} onChange={(e) => set({ region: e.target.value as Region })}>
            {(Object.keys(HELPLINES) as Region[]).map((r) => (
              <option key={r} value={r}>
                {HELPLINES[r].label}
              </option>
            ))}
          </Select>
        </Field>
      </Card>
      <Card flat style={{ display: 'grid', gap: 8 }}>
        <h2 className="rd-heading-md" style={{ margin: 0 }}>
          remi & privacy
        </h2>
        <Toggle label="let Remi see my check-ins" description="this week’s moods + tags. never your notes." checked={s.shareCheckins} onChange={(v) => set({ shareCheckins: v })} />
        <Toggle label="daily check-in nudge" description="prototype: notifications aren't wired up yet" checked={s.nudge} onChange={(v) => set({ nudge: v })} />
      </Card>
      <Card flat style={{ display: 'grid', gap: 10 }}>
        <h2 className="rd-heading-md" style={{ margin: 0 }}>
          your data
        </h2>
        <p className="rd-body-sm" style={{ margin: 0 }}>
          Everything stays on this device. Messages to Remi go to the AI only to write replies.
        </p>
        <Button variant="soft" iconStart="share" onClick={exportData}>
          export everything
        </Button>
        <Button variant="danger" iconStart="trash" onClick={() => setConfirm(true)}>
          delete everything
        </Button>
      </Card>
      <p className="rd-body-sm rd-secondary" style={{ margin: 0 }}>
        Self-help, not therapy or emergency care. Prototype v0.1.
      </p>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete everything?"
        description="check-ins, drafts, chats, plan and people. can’t be undone. export first?"
        gentle
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              keep it all
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch({ type: 'reset' });
                setConfirm(false);
                go('/today');
              }}
            >
              delete everything
            </Button>
          </>
        }
      />
    </div>
  );
}
