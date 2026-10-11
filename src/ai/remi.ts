// Client side of Remi. Streams from /api/remi; if there is no server (static
// hosting) or no API key, it falls back to clearly-labelled scripted demo replies.
import { screen } from './safety';

export type Turn = { role: 'user' | 'assistant'; content: string };
export type RemiChunk = { type: 'text'; text: string };
export type RemiEnd = { type: 'end'; status: 'done' | 'refusal' | 'error' | 'busy'; demo: boolean };

export async function* askRemi(turns: Turn[], context: string | undefined, signal: AbortSignal): AsyncGenerator<RemiChunk | RemiEnd> {
  let res: Response | null = null;
  try {
    res = await fetch('./api/remi', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: turns, context }),
      signal,
    });
  } catch (err) {
    if (signal.aborted) return;
    res = null; // offline / no server → demo
    void err;
  }
  const live = res?.ok && res.headers.get('content-type')?.includes('ndjson') && res.body;
  if (!live) {
    yield* demo(turns[turns.length - 1].content, signal);
    return;
  }

  const reader = res!.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buf = '';
  let ended = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      let nl: number;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        const ev = JSON.parse(line) as { type: string; text?: string; reason?: string };
        if (ev.type === 'text' && ev.text) yield { type: 'text', text: ev.text };
        else if (ev.type === 'unavailable') {
          yield* demo(turns[turns.length - 1].content, signal);
          return;
        } else if (ev.type === 'done' || ev.type === 'refusal') {
          ended = true;
          yield { type: 'end', status: ev.type, demo: false };
        } else if (ev.type === 'error') {
          ended = true;
          yield { type: 'end', status: ev.reason === 'busy' ? 'busy' : 'error', demo: false };
        }
      }
    }
  } catch (err) {
    if (signal.aborted) return;
    void err;
  }
  if (!ended && !signal.aborted) yield { type: 'end', status: 'error', demo: false };
}

// ── Demo mode ────────────────────────────────────────────────────────────────
// Hand-written replies in Remi's voice, picked by simple keywords. Never
// presented as AI: the chat shows a "demo" banner whenever one is used.
const DEMO: Array<[RegExp, string]> = [
  [/(sleep|switch (my )?brain off|can'?t sleep|awake|3am|2am)/i, "the 2am brain is so loud. you don't have to solve anything right now. want to try dumping everything that's looping into a draft, so it's out of your head and somewhere safe until morning?"],
  [/(text|message|reply|word (it|this))/i, "okay, let's write it together. who's it to, and what do you actually want them to know? we can make a version you send and a version you never send. both count."],
  [/(don'?t know what i'?m feeling|numb|empty|weird)/i, "not knowing is a real answer. sometimes it's a mix. if you had to pick a weather for it, would it be fog, storm, or kind of grey drizzle?"],
  [/(vent|rant|need to talk|annoyed|angry|pissed)/i, "go for it. no fixing, no advice unless you ask. i'm listening."],
  [/(anxious|anxiety|panic|overwhelm)/i, "that sounds like a lot is pressing on you at once. want to slow your body down for a minute first? there's a one-minute breathing thing on your home screen. or we can just talk it through."],
  [/(lonely|alone|no friends|nobody)/i, "feeling alone is so heavy, and it's really common, even when it feels like it's just you. is there one person, even a slightly-out-of-touch one, you'd feel okay sending a low-stakes message to?"],
];

async function* demo(text: string, signal: AbortSignal): AsyncGenerator<RemiChunk | RemiEnd> {
  const risk = screen(text);
  const reply =
    risk === 'crisis'
      ? "Thank you for telling me. I'm taking this seriously. Are you safe right now? If you might act on these thoughts, please contact your local emergency number now. The help button at the top of this chat connects you to a crisis line straight away. I'm still here."
      : risk === 'concern'
        ? "That sounds really hard, and I'm glad you said it. Can I ask how heavy it feels right now: a rough patch, or more than that? If it's more, the help tab has real people you can talk to today."
        : (DEMO.find(([r]) => r.test(text))?.[1] ?? "i hear you. tell me a bit more? what's the part that's sitting heaviest right now?");
  const words = reply.split(/(?<= )/);
  for (const w of words) {
    if (signal.aborted) return;
    await new Promise((r) => setTimeout(r, 28));
    yield { type: 'text', text: w };
  }
  yield { type: 'end', status: 'done', demo: true };
}
