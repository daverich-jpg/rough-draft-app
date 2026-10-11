import { useEffect, useRef, useState } from 'react';
import { Button, Card, CharCount, EmptyState, Field, Icon, Input, Modal, Textarea, useToast } from '@components';
import { useStore, uid, type Draft } from '../state/store';
import { go } from '../state/router';
import { ScreenHeader } from '../ui/ScreenHeader';

const PROMPTS = [
  'what’s something you’re pretending not to care about?',
  'what did you need today that you didn’t get?',
  'write the text you won’t send.',
  'one small thing that didn’t suck.',
  'what would you say to a friend feeling exactly this?',
];

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toLowerCase();

export function Drafts({ id }: { id?: string }) {
  const { state } = useStore();
  if (id) {
    const draft = state.drafts.find((d) => d.id === id);
    return draft ? <Editor draft={draft} /> : <Missing />;
  }
  return <List />;
}

function List() {
  const { state, dispatch } = useStore();
  const create = (prompt?: string) => {
    const now = new Date().toISOString();
    const id = uid();
    dispatch({ type: 'draft:upsert', draft: { id, title: '', body: '', prompt, createdAt: now, updatedAt: now } });
    go(`/drafts/${id}`);
  };
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];
  return (
    <div className="app-screen">
      <ScreenHeader title="Drafts" kicker="private · only you" actions={<Button icon="plus" aria-label="new draft" onClick={() => create()} />} />
      <button type="button" className="rd-card rd-card--hero rd-card--interactive app-cta" onClick={() => create(prompt)}>
        <span>
          <span className="rd-caption" style={{ color: 'var(--rd-text-on-hero)', display: 'block' }}>
            today's prompt
          </span>
          <span className="rd-heading-md" style={{ color: 'var(--rd-text-on-hero)' }}>
            {prompt}
          </span>
        </span>
        <Icon name="journal" size={26} />
      </button>
      {state.drafts.length === 0 ? (
        <EmptyState title="Nothing here yet" body={<>your first draft can be one word. honestly, "ugh" counts.</>} actions={<Button iconStart="plus" onClick={() => create()}>start a draft</Button>} character="doze" />
      ) : (
        <ul className="app-group" aria-label="your drafts">
          {[...state.drafts]
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((d) => (
              <li key={d.id}>
                <a className="app-group__row" href={`#/drafts/${d.id}`}>
                  <span className="app-group__text">
                    <span className="rd-heading-md" style={{ fontSize: '1.0625rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.title || (d.body ? d.body.slice(0, 60) : 'untitled')}
                    </span>
                  </span>
                  <span className="app-group__meta">{fmt(d.updatedAt)}</span>
                </a>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function Editor({ draft }: { draft: Draft }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(draft.body);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [confirm, setConfirm] = useState(false);
  const first = useRef(true);

  // autosave: there is no "save" button to forget
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaved('saving');
    const t = setTimeout(() => {
      dispatch({ type: 'draft:upsert', draft: { ...draft, title, body, updatedAt: new Date().toISOString() } });
      setSaved('saved');
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);

  const leave = () => {
    // an untouched new draft shouldn't litter the list
    if (!title.trim() && !body.trim()) dispatch({ type: 'draft:delete', id: draft.id });
    go('/drafts');
  };

  return (
    <div className="app-screen">
      <ScreenHeader
        title={draft.title ? 'Edit draft' : 'New draft'}
        loud={false}
        back={leave}
        actions={<Button variant="ghost" size="sm" icon="trash" aria-label="delete draft" onClick={() => setConfirm(true)} />}
      />
      {draft.prompt && (
        <Card tone="hero" tape style={{ borderRadius: 'var(--rd-radius-lg)' }}>
          <span className="rd-caption" style={{ color: 'var(--rd-text-on-hero)' }}>
            prompt
          </span>
          <p className="rd-heading-md" style={{ margin: '4px 0 0', color: 'var(--rd-text-on-hero)' }}>
            {draft.prompt}
          </p>
        </Card>
      )}
      <Field label="title" optional>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="untitled (that's allowed)" />
      </Field>
      <Field label="the draft" hint="messy is fine. it's a draft." footer={<CharCount value={body} max={5000} />}>
        <Textarea lined rows={10} value={body} onChange={(e) => setBody(e.target.value)} placeholder="start anywhere…" autoFocus={!draft.body} />
      </Field>
      <p className="rd-body-sm rd-secondary" role="status" aria-live="polite" style={{ margin: 0, display: 'flex', gap: 6, alignItems: 'center' }}>
        {saved === 'saving' && 'saving…'}
        {saved === 'saved' && (
          <>
            <Icon name="check" size={16} /> saved · private
          </>
        )}
      </p>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete this draft?"
        description="gone for good. no trash folder."
        gentle
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              keep it
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch({ type: 'draft:delete', id: draft.id });
                toast({ title: 'draft deleted' });
                go('/drafts');
              }}
            >
              delete draft
            </Button>
          </>
        }
      />
    </div>
  );
}

function Missing() {
  return (
    <div className="app-screen">
      <EmptyState title="Can't find that draft" body="it might have been deleted." actions={<Button onClick={() => go('/drafts')}>back to drafts</Button>} character="static" mood="chaotic" />
    </div>
  );
}
