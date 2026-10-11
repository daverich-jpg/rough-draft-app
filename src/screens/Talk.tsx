import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button, Chip, Icon, Modal, Sheet, Toggle, useToast } from '@components';
import { useStore, uid, type ChatMsg } from '../state/store';
import { askRemi, type Turn } from '../ai/remi';
import { screen } from '../ai/safety';
import { go } from '../state/router';
import { CrisisCard } from '../ui/CrisisCard';

const STARTERS = ["i can't switch my brain off", 'help me word a hard text', "i don't know what i'm feeling", 'i just need to vent'];
const MAX = 4000;

/**
 * Remi. Key decisions (see DESIGN.md):
 *  · labelled as AI everywhere it speaks; a help button is always in the header
 *  · the deterministic safety screen shows crisis support *before* the AI replies
 *  · the person controls memory: check-in sharing is opt-in, chats can be saved or deleted
 *  · streaming can be stopped; failures keep the message and offer retry
 */
export function Talk() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [announce, setAnnounce] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chat = state.chat;
  const usedDemo = chat.some((m) => m.demo);

  // keep the newest message in view, unless the person has scrolled up to read
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [chat]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const context = () => {
    if (!state.settings.shareCheckins) return undefined;
    const week = Date.now() - 7 * 864e5;
    const rows = state.checkins
      .filter((c) => new Date(c.at).getTime() > week)
      .map((c) => `${new Date(c.at).toLocaleDateString('en-GB', { weekday: 'short' })}: ${c.mood}${c.tags.length ? ` (${c.tags.join(', ')})` : ''}`);
    return rows.length ? rows.join('\n') : undefined;
  };

  async function run(history: Turn[]) {
    const id = uid();
    dispatch({ type: 'chat:push', msg: { id, role: 'assistant', text: '', status: 'streaming' } });
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let full = '';
    try {
      for await (const ev of askRemi(history, context(), ctrl.signal)) {
        if (ev.type === 'text') {
          full += ev.text;
          dispatch({ type: 'chat:patch', id, patch: {}, append: ev.text });
        } else {
          dispatch({ type: 'chat:patch', id, patch: { status: ev.status, demo: ev.demo } });
          setAnnounce(ev.status === 'done' ? `Remi: ${full}` : ev.status === 'refusal' ? 'Remi couldn’t help with that one.' : 'That didn’t go through.');
        }
      }
      if (ctrl.signal.aborted) dispatch({ type: 'chat:patch', id, patch: { status: 'stopped' } });
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  const turnsFrom = (msgs: ChatMsg[]): Turn[] =>
    msgs.filter((m) => m.text.trim() && (m.role === 'user' || m.status === 'done' || m.status === 'stopped')).map((m) => ({ role: m.role, content: m.text }));

  const send = (content: string) => {
    const t = content.trim();
    if (!t || busy || t.length > MAX) return;
    const msg: ChatMsg = { id: uid(), role: 'user', text: t, risk: screen(t) };
    dispatch({ type: 'chat:push', msg });
    setText('');
    stick.current = true;
    void run(turnsFrom([...chat, msg]));
  };

  const retry = (failed: ChatMsg) => {
    dispatch({ type: 'chat:remove', id: failed.id });
    void run(turnsFrom(chat.filter((m) => m.id !== failed.id)));
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && matchMedia('(pointer: fine)').matches) {
      e.preventDefault();
      send(text);
    }
  };

  const saveToDrafts = () => {
    const now = new Date().toISOString();
    const body = chat.filter((m) => m.text).map((m) => `${m.role === 'user' ? 'me' : 'remi (AI)'}: ${m.text}`).join('\n\n');
    dispatch({ type: 'draft:upsert', draft: { id: uid(), title: `talking with remi · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, body, createdAt: now, updatedAt: now } });
    setMenu(false);
    toast({ tone: 'success', title: 'saved to your drafts', body: 'only you can see it.' });
  };

  return (
    <div className="app-talk">
      <header className="app-header app-header--talk">
        <span className="app-ai-mark" aria-hidden>
          R
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="rd-heading-lg" style={{ margin: 0 }}>
            Remi
          </h1>
          <span className="rd-body-sm rd-secondary">AI · not a therapist</span>
        </div>
        <Button size="sm" iconStart="phone" onClick={() => go('/help')}>
          help
        </Button>
        <Button variant="ghost" size="sm" icon="more" aria-label="chat options" onClick={() => setMenu(true)} />
      </header>

      <div
        ref={scrollRef}
        className="app-thread"
        role="log"
        aria-label="conversation with Remi"
        aria-live="off"
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        {usedDemo && (
          <p className="app-demo" role="note">
            <strong>demo mode</strong> · scripted replies, not AI.
          </p>
        )}
        {chat.length === 0 && (
          <div className="app-talk-empty">
            <p className="rd-body-lg" style={{ margin: 0 }}>
              hey, i'm Remi. an AI to think out loud with. i can be wrong. for a real person, tap <strong>help</strong>.
            </p>
            <p className="rd-body-sm rd-secondary" style={{ margin: 0 }}>
              {state.settings.shareCheckins ? 'i can see this week’s moods (not your notes).' : 'i can’t see your check-ins. change that in ⋯'}
            </p>
            <div className="rd-chips" role="group" aria-label="ways to start">
              {STARTERS.map((s) => (
                <Chip key={s} onToggle={() => send(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>
        )}
        {chat.map((m, i) => (
          <MessageRow key={m.id} m={m} first={m.role === 'assistant' && chat[i - 1]?.role !== 'assistant'} onRetry={() => retry(m)} />
        ))}
      </div>

      <form
        className="app-composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <label htmlFor="talk-input" className="rd-sr-only">
          message Remi
        </label>
        <textarea
          id="talk-input"
          ref={inputRef}
          className="rd-textarea app-composer__input"
          rows={1}
          value={text}
          maxLength={MAX + 200}
          placeholder="say anything…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          aria-describedby={text.length > MAX - 200 ? 'talk-count' : undefined}
        />
        {busy ? (
          <Button variant="soft" icon="close" aria-label="stop Remi’s reply" onClick={() => abortRef.current?.abort()} />
        ) : (
          <Button type="submit" icon="arrow-right" aria-label="send" disabled={!text.trim() || text.length > MAX} />
        )}
        {text.length > MAX - 200 && (
          <span id="talk-count" className="rd-field__count app-composer__count" aria-live="polite">
            {text.length > MAX ? `${text.length - MAX} over. trim a little?` : `${MAX - text.length} left`}
          </span>
        )}
      </form>
      <p className="rd-sr-only" aria-live="polite">
        {announce}
      </p>

      <Sheet open={menu} onClose={() => setMenu(false)} title="Chat options" gentle>
        <Toggle
          label="let Remi see my check-ins"
          description="this week’s moods + tags. never your notes."
          checked={state.settings.shareCheckins}
          onChange={(v) => dispatch({ type: 'settings', patch: { shareCheckins: v } })}
        />
        <div style={{ display: 'grid', gap: 10 }}>
          <Button variant="soft" block iconStart="journal" disabled={!chat.length} onClick={saveToDrafts}>
            save to drafts
          </Button>
          <Button
            variant="soft"
            block
            iconStart="plus"
            disabled={!chat.length || busy}
            onClick={() => {
              dispatch({ type: 'chat:clear' });
              setMenu(false);
            }}
          >
            start over
          </Button>
          <Button variant="danger" block iconStart="trash" disabled={!chat.length || busy} onClick={() => (setMenu(false), setConfirmDelete(true))}>
            delete this chat
          </Button>
        </div>
        <details className="app-details">
          <summary>what Remi is (and isn't)</summary>
          <p className="rd-body-sm">
            An AI (Claude, by Anthropic). Doesn't remember past chats, can't contact anyone, can be wrong. No diagnoses or meds advice. Chats stay on this device; messages go to the AI only to write replies.
          </p>
        </details>
      </Sheet>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this chat?"
        description="gone for good. save to drafts first if you want it."
        gentle
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              keep it
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch({ type: 'chat:clear' });
                setConfirmDelete(false);
                toast({ title: 'chat deleted' });
              }}
            >
              delete chat
            </Button>
          </>
        }
      />
    </div>
  );
}

function MessageRow({ m, first, onRetry }: { m: ChatMsg; first: boolean; onRetry: () => void }) {
  if (m.role === 'user')
    return (
      <>
        <div className="app-msg app-msg--me">
          <span className="rd-sr-only">you said: </span>
          {m.text}
        </div>
        {m.risk === 'crisis' && <CrisisCard />}
        {m.risk === 'concern' && (
          <p className="app-concern">
            More than a rough patch? Real people can help today.{' '}
            <button type="button" className="app-link" onClick={() => go('/help')}>
              talk to someone
            </button>
          </p>
        )}
      </>
    );
  return (
    <div className="app-msg app-msg--ai" aria-busy={m.status === 'streaming'}>
      {first && (
        <span className="app-msg__who" aria-hidden>
          remi · AI
        </span>
      )}
      <span className="rd-sr-only">Remi said: </span>
      {m.text}
      {m.status === 'streaming' && !m.text && (
        <span className="app-typing" aria-label="Remi is writing">
          <i />
          <i />
          <i />
        </span>
      )}
      {m.status === 'streaming' && m.text && <span className="app-caret" aria-hidden />}
      {m.status === 'stopped' && <span className="rd-caption" style={{ display: 'block' }}>stopped</span>}
      {(m.status === 'error' || m.status === 'busy') && (
        <span className="app-msg__fail">
          <Icon name="alert" size={18} />
          <span>{m.status === 'busy' ? 'Remi’s busy. try again in a minute.' : 'didn’t send. your message is safe.'}</span>
          <Button size="sm" variant="soft" onClick={onRetry}>
            try again
          </Button>
        </span>
      )}
      {m.status === 'refusal' && (
        <span className="app-msg__fail">
          <span>
            Remi can't help with that one. If you're struggling,{' '}
            <button type="button" className="app-link" onClick={() => go('/help')}>
              real people can
            </button>
            .
          </span>
        </span>
      )}
    </div>
  );
}
