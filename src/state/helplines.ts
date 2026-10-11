/**
 * Crisis contacts by region. FLAGGED: every entry must be re-verified against
 * the official source before launch, and the list reviewed by a clinical or
 * safeguarding advisor. Remi never states numbers itself; it points here.
 */
export type Region = 'us' | 'uk' | 'other';

export const HELPLINES: Record<Region, { label: string; crisis: { name: string; call?: string; text?: string; textName?: string; textBody?: string; url?: string }; emergency: string | null }> = {
  us: { label: 'United States', crisis: { name: '988 Suicide & Crisis Lifeline', call: '988', text: '988' }, emergency: '911' },
  uk: { label: 'United Kingdom', crisis: { name: 'Samaritans', call: '116123', textName: 'Shout', text: '85258', textBody: 'SHOUT' }, emergency: '999' },
  other: { label: 'Somewhere else', crisis: { name: 'Find a helpline (free, worldwide directory)', url: 'https://findahelpline.com' }, emergency: null },
};

export const formatPhone = (n: string) => (n === '116123' ? '116 123' : n);
