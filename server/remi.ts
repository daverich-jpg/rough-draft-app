// Remi's server side: a tiny proxy that keeps the API key off the client and
// streams Claude's reply back as NDJSON events.
//
//   POST /api/remi  { messages: [{role, content}], context?: string }
//   → {"type":"text","text":"…"}*  then one of
//     {"type":"done"} | {"type":"refusal"} | {"type":"unavailable"} | {"type":"error"}
import Anthropic from '@anthropic-ai/sdk';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { REMI_SYSTEM } from './system-prompt';
import { screen } from '../src/ai/safety';

const MODEL = 'claude-opus-5-5';
const MAX_TURNS = 40; // keep requests bounded; older turns drop off the front
const MAX_CHARS = 4000; // per message

type Turn = { role: 'user' | 'assistant'; content: string };

/** Missing credentials surface as an untyped Error from the SDK, so check up front instead of parsing messages. */
export function hasCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE || existsSync(join(homedir(), '.config', 'anthropic')));
}

let client: Anthropic | null = null;
function getClient() {
  // Credentials resolve from ANTHROPIC_API_KEY (or an `ant auth login` profile).
  client ??= new Anthropic();
  return client;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 400_000) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sanitize(input: unknown): Turn[] | null {
  if (!Array.isArray(input)) return null;
  const turns = input
    .filter((t): t is Turn => (t?.role === 'user' || t?.role === 'assistant') && typeof t.content === 'string' && t.content.trim() !== '')
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_CHARS) }))
    .slice(-MAX_TURNS);
  // The API needs the conversation to start with a user turn and end with one.
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== 'user') return null;
  return turns;
}

export async function handleRemi(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end();
  }
  const send = (event: object) => res.write(JSON.stringify(event) + '\n');

  let body: { messages?: unknown; context?: unknown };
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    res.statusCode = 400;
    return res.end();
  }
  const turns = sanitize(body.messages);
  if (!turns) {
    res.statusCode = 400;
    return res.end();
  }

  res.writeHead(200, { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' });
  if (!hasCredentials()) {
    send({ type: 'unavailable' });
    return res.end();
  }

  // Per-request notes go in a mid-conversation system message *after* the last
  // user turn, so the frozen system prompt and the history stay a cacheable prefix.
  const notes: string[] = [];
  const risk = screen(turns[turns.length - 1].content);
  if (risk === 'crisis') notes.push('The safety screen flagged the latest message as a possible crisis. Follow "When things are serious". The app is already showing the person crisis support above this message.');
  if (risk === 'concern') notes.push('The safety screen flagged the latest message as possible distress. Check in gently about how serious things are.');
  if (typeof body.context === 'string' && body.context.trim()) notes.push(`Check-ins the person chose to share with you:\n${body.context.slice(0, 1500)}`);

  const messages: Anthropic.Beta.BetaMessageParam[] = [...turns];
  if (notes.length) messages.push({ role: 'system', content: notes.join('\n\n') } as unknown as Anthropic.Beta.BetaMessageParam);

  const abort = new AbortController();
  res.on('close', () => abort.abort());

  try {
    const stream = getClient().beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 2000,
        // Chat replies are short; medium keeps them thoughtful without long pauses.
        output_config: { effort: 'medium' },
        system: [{ type: 'text', text: REMI_SYSTEM }],
        cache_control: { type: 'ephemeral' }, // auto-caches the growing conversation prefix
        messages,
        // If a safety classifier declines, retry server-side on Anthropic's recommended model.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      },
      { signal: abort.signal },
    );
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') send({ type: 'text', text: event.delta.text });
    }
    const final = await stream.finalMessage();
    send({ type: final.stop_reason === 'refusal' ? 'refusal' : 'done' });
  } catch (err) {
    if (abort.signal.aborted) return res.end();
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      send({ type: 'unavailable' });
    } else if (err instanceof Anthropic.RateLimitError) {
      send({ type: 'error', reason: 'busy' });
    } else {
      console.error('[remi]', err);
      send({ type: 'error', reason: 'failed' });
    }
  }
  res.end();
}
