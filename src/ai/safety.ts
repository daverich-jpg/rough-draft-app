/**
 * Deterministic risk screen. Runs on every user message, on the client (to show
 * help instantly, even offline or in demo mode) and again on the server (to
 * steer the model). Crisis handling never depends on the model alone.
 *
 * Deliberately over-inclusive: a false positive costs one calm card; a false
 * negative could cost much more. FLAGGED: the phrase list must be reviewed and
 * extended by a clinical/safeguarding advisor, and localised (slang, languages).
 */
export type Risk = 'none' | 'concern' | 'crisis';

const CRISIS: RegExp[] = [
  /\b(kill|killing|end|ending|take|taking)\s+(myself|my\s+(own\s+)?life)\b/i,
  /\bsuicid(e|al)\b/i,
  /\b(want|wanna|going|plan(ning)?)\s+to\s+die\b/i,
  /\b(don'?t|do\s+not)\s+want\s+to\s+(be\s+(alive|here)|live|exist|wake\s+up)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(live|living|going\s+on|being\s+alive)\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\b(hurt|harm|cut|cutting|burn|burning)\s+(myself|my\s+(arm|arms|leg|legs|wrist|wrists|skin))\b/i,
  /\bself[-\s]?harm(ing)?\b/i,
  /\boverdos(e|ed|ing)\b/i,
  /\b(hurt|kill)\s+(someone|somebody|him|her|them)\b/i,
  /\b(he|she|they)\s+(hits?|hurts?|beats?)\s+me\b/i,
  /\bunalive\b/i,
  /\bkms\b/i,
];

const CONCERN: RegExp[] = [
  /\bhopeless\b/i,
  /\bcan'?t\s+(do\s+this|go\s+on|cope|keep\s+going)\s*(anymore)?\b/i,
  /\bwhat'?s\s+the\s+point\b/i,
  /\bdisappear\b/i,
  /\bnobody\s+would\s+(care|notice)\b/i,
  /\bhaven'?t\s+eaten\s+in\s+days\b/i,
];

export function screen(text: string): Risk {
  if (CRISIS.some((r) => r.test(text))) return 'crisis';
  if (CONCERN.some((r) => r.test(text))) return 'concern';
  return 'none';
}
