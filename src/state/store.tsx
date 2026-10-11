import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { Mood } from '@components';
import type { Risk } from '../ai/safety';
import type { Region } from './helplines';

export type CheckInRec = { id: string; at: string; mood: Mood; tags: string[]; note: string };
export type Draft = { id: string; title: string; body: string; prompt?: string; createdAt: string; updatedAt: string };
export type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  risk?: Risk;
  status?: 'streaming' | 'done' | 'error' | 'busy' | 'refusal' | 'stopped';
  demo?: boolean;
};
export type Contact = { id: string; name: string; phone: string };
export const PLAN_STEPS = [
  ['warningSigns', 'My warning signs', 'signs things are getting worse'],
  ['copingAlone', 'Things I can do on my own', 'stuff that takes the edge off'],
  ['distractions', 'People and places that help me reset', 'so i’m not alone with it'],
  ['people', 'People I can ask for help', 'who I could actually tell'],
  ['professionals', 'Professionals and services', 'GP, therapist, campus counselling, a crisis line'],
  ['safeSpace', 'Making my space safer', 'what to move or lock away'],
  ['reasons', 'Reasons to keep going', 'big or tiny. both count'],
] as const;
export type PlanKey = (typeof PLAN_STEPS)[number][0];
export type SafetyPlan = Record<PlanKey, string> & { updatedAt?: string };

export type Settings = {
  onboarded: boolean;
  adult: boolean;
  name: string;
  region: Region;
  shareCheckins: boolean;
  nudge: boolean;
  nudgeTime: 'morning' | 'lunch' | 'evening';
  remiIntroSeen: boolean;
};

export type State = { settings: Settings; checkins: CheckInRec[]; drafts: Draft[]; chat: ChatMsg[]; contacts: Contact[]; plan: SafetyPlan };

const emptyPlan = Object.fromEntries(PLAN_STEPS.map(([k]) => [k, ''])) as SafetyPlan;
export const initialState: State = {
  settings: { onboarded: false, adult: false, name: '', region: 'uk', shareCheckins: false, nudge: true, nudgeTime: 'evening', remiIntroSeen: false },
  checkins: [],
  drafts: [],
  chat: [],
  contacts: [],
  plan: emptyPlan,
};

export const uid = () => Math.random().toString(36).slice(2, 10);
const daysAgo = (n: number, h = 20) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 12, 0, 0);
  return d.toISOString();
};

/** A small, believable first week so the prototype doesn't open on empty screens. */
function sampleHistory(): Pick<State, 'checkins' | 'drafts'> {
  return {
    checkins: [
      { id: uid(), at: daysAgo(6), mood: 'tired', tags: ['sleep', 'school / work'], note: '' },
      { id: uid(), at: daysAgo(5), mood: 'okay', tags: ['people'], note: '' },
      { id: uid(), at: daysAgo(3), mood: 'chaotic', tags: ['school / work', 'money'], note: 'deadline week' },
      { id: uid(), at: daysAgo(2), mood: 'soft', tags: ['people'], note: '' },
      { id: uid(), at: daysAgo(1), mood: 'hyped', tags: ['my body'], note: 'went for a walk. small but it counted' },
    ],
    drafts: [
      {
        id: uid(),
        title: 'the text i won’t send',
        body: 'hey. i know i went quiet. it wasn’t you, my head just got really loud for a few weeks and replying felt like too much.',
        prompt: 'write the text you won’t send.',
        createdAt: daysAgo(3, 23),
        updatedAt: daysAgo(3, 23),
      },
    ],
  };
}

type Action =
  | { type: 'onboard'; settings: Partial<Settings> }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'checkin'; rec: CheckInRec }
  | { type: 'draft:upsert'; draft: Draft }
  | { type: 'draft:delete'; id: string }
  | { type: 'chat:push'; msg: ChatMsg }
  | { type: 'chat:patch'; id: string; patch: Partial<ChatMsg>; append?: string }
  | { type: 'chat:remove'; id: string }
  | { type: 'chat:clear' }
  | { type: 'contact:add'; contact: Contact }
  | { type: 'contact:remove'; id: string }
  | { type: 'plan'; plan: SafetyPlan }
  | { type: 'reset' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'onboard':
      return { ...s, ...sampleHistory(), settings: { ...s.settings, ...a.settings, onboarded: true } };
    case 'settings':
      return { ...s, settings: { ...s.settings, ...a.patch } };
    case 'checkin':
      return { ...s, checkins: [...s.checkins, a.rec] };
    case 'draft:upsert': {
      const exists = s.drafts.some((d) => d.id === a.draft.id);
      return { ...s, drafts: exists ? s.drafts.map((d) => (d.id === a.draft.id ? a.draft : d)) : [a.draft, ...s.drafts] };
    }
    case 'draft:delete':
      return { ...s, drafts: s.drafts.filter((d) => d.id !== a.id) };
    case 'chat:push':
      return { ...s, chat: [...s.chat, a.msg] };
    case 'chat:patch':
      return { ...s, chat: s.chat.map((m) => (m.id === a.id ? { ...m, ...a.patch, text: a.append ? m.text + a.append : (a.patch.text ?? m.text) } : m)) };
    case 'chat:remove':
      return { ...s, chat: s.chat.filter((m) => m.id !== a.id) };
    case 'chat:clear':
      return { ...s, chat: [] };
    case 'contact:add':
      return { ...s, contacts: [...s.contacts, a.contact] };
    case 'contact:remove':
      return { ...s, contacts: s.contacts.filter((c) => c.id !== a.id) };
    case 'plan':
      return { ...s, plan: a.plan };
    case 'reset':
      return initialState;
  }
}

const KEY = 'rd-app:v1';
function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as State;
    // a reply interrupted by a reload can't resume; mark it stopped
    parsed.chat = parsed.chat.map((m) => (m.status === 'streaming' ? { ...m, status: 'stopped' } : m));
    return { ...initialState, ...parsed, settings: { ...initialState.settings, ...parsed.settings } };
  } catch {
    return initialState;
  }
}

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode / quota: the app still works for this session */
    }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore outside StoreProvider');
  return c;
}

export const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
export const dayLabel = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short' }).toLowerCase();
