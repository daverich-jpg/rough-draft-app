import { useId } from 'react';
import { tokens } from '@tokens/tokens';

/**
 * The editors: Rough Draft's characters. Flat colour, ink linework, white
 * die-cut outline. They keep you company. They never coach.
 */
export type CharacterKind = 'sprout' | 'doze' | 'moss' | 'static';
export type Mood = 'hyped' | 'okay' | 'soft' | 'tired' | 'chaotic' | 'heavy';

export const CHARACTERS: Record<CharacterKind, { name: string; vibe: string; useFor: string; never: string }> = {
  sprout: {
    name: 'Sprout',
    vibe: 'Hyped, chaotic-good, first to the party. Yellow hoodie, too-big sneakers.',
    useFor: 'Onboarding hellos, wins, marketing, "you posted your first draft".',
    never: 'Sad or sensitive moments. Sprout is too loud for a bad day.',
  },
  doze: {
    name: 'Doze',
    vibe: 'Permanently tired, hood up, deeply unbothered. The 2am friend.',
    useFor: 'Night mode, rest prompts, low-energy days, "nothing here yet" states.',
    never: 'Urgent errors. Doze does not do urgency.',
  },
  moss: {
    name: 'Moss',
    vibe: 'Soft, a little shy, grows little yellow flowers when it feels safe.',
    useFor: 'Journaling, gentle check-ins, comfort, and the calm presence in sensitive states.',
    never: 'Jokes. Moss is the sincere one.',
  },
  static: {
    name: 'Static',
    vibe: 'Too many tabs open. Glitchy, fast, funny about it. Navy hoodie, yellow stripes.',
    useFor: 'Recoverable errors, "chaos" moods, offline, "we broke something".',
    never: 'Anything about the user\'s safety, health or money.',
  },
};

export const MOODS: Record<Mood, { word: string; alt: string; color: string }> = {
  hyped: { word: 'buzzing', alt: 'buzzing, lots of energy', color: 'var(--rd-mood-hyped)' },
  okay: { word: 'fine-ish', alt: 'fine-ish, kind of okay', color: 'var(--rd-mood-okay)' },
  soft: { word: 'soft', alt: 'soft, tender', color: 'var(--rd-mood-soft)' },
  tired: { word: 'running on fumes', alt: 'tired, running on fumes', color: 'var(--rd-mood-tired)' },
  chaotic: { word: 'chaos goblin', alt: 'chaotic, too much at once', color: 'var(--rd-mood-chaotic)' },
  heavy: { word: 'heavy', alt: 'heavy, low, sad', color: 'var(--rd-mood-heavy)' },
};

const c = (scale: keyof typeof tokens.scales, step: keyof (typeof tokens.scales)['sunshine']['steps']) =>
  tokens.scales[scale].steps[step].hex;
const INK = c('paper', '900');
/**
 * Illustration-only greens (D21). The characters keep their sprout skin from the
 * moodboard; green never appears in UI. Everything else they wear comes from
 * the two key colours (yellow + navy) and the paper neutrals.
 */
const GREEN = { light: '#C0FE60', base: '#B6F500', mid: '#8DD71E', deep: '#6CAE15' } as const;
const WHITE = '#FFFFFF';

const LOOK: Record<CharacterKind, { skin: string; skinShade: string; hoodie: string; jeans: string; jeansSeam: string; swoosh: string }> = {
  sprout: { skin: GREEN.base, skinShade: GREEN.mid, hoodie: c('sunshine', '400'), jeans: c('midnight', '300'), jeansSeam: c('midnight', '200'), swoosh: c('midnight', '500') },
  doze: { skin: GREEN.light, skinShade: GREEN.base, hoodie: c('midnight', '300'), jeans: c('paper', '700'), jeansSeam: c('paper', '500'), swoosh: c('midnight', '300') },
  moss: { skin: GREEN.mid, skinShade: GREEN.deep, hoodie: c('paper', '100'), jeans: c('midnight', '200'), jeansSeam: c('midnight', '100'), swoosh: c('sunshine', '500') },
  static: { skin: GREEN.base, skinShade: GREEN.deep, hoodie: c('midnight', '500'), jeans: c('paper', '800'), jeansSeam: c('paper', '600'), swoosh: c('sunshine', '400') },
};

const HEAD: Record<CharacterKind, string> = {
  sprout: 'M33 54 Q27 36 38 26 L33 8 L47 19 L55 1 L63 17 L77 4 L77 23 Q93 31 87 54 Q60 66 33 54Z',
  doze: 'M36 52 Q33 26 60 24 Q87 26 84 52 Q60 63 36 52Z',
  moss: 'M35 52 Q26 43 32 32 Q29 19 43 17 Q51 6 64 12 Q78 7 84 21 Q95 29 89 43 Q91 56 77 56 Q60 63 44 57 Q33 59 35 52Z',
  static: 'M34 54 L22 46 L32 40 L18 28 L35 28 L30 12 L44 21 L48 4 L57 18 L66 2 L70 19 L84 8 L82 25 L99 22 L88 36 L102 44 L86 48 Q60 66 34 54Z',
};

function Face({ mood, skin }: { mood: Mood; skin: string }) {
  const stroke = { stroke: INK, strokeWidth: 2.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const eye = (cx: number, rx = 6, ry = 7) => <ellipse cx={cx} cy={41} rx={rx} ry={ry} fill={WHITE} stroke={INK} strokeWidth={2.4} />;
  const blush = (
    <>
      <ellipse cx={44} cy={49} rx={4} ry={2.4} fill={c('sunshine', '500')} opacity={0.7} />
      <ellipse cx={76} cy={49} rx={4} ry={2.4} fill={c('sunshine', '500')} opacity={0.7} />
    </>
  );
  switch (mood) {
    case 'hyped':
      return (
        <g>
          {eye(50, 7, 8.5)}
          {eye(70, 7, 8.5)}
          <circle cx={51} cy={39} r={3.6} fill={INK} />
          <circle cx={71} cy={39} r={3.6} fill={INK} />
          <circle cx={52.4} cy={37.4} r={1.2} fill={WHITE} />
          <circle cx={72.4} cy={37.4} r={1.2} fill={WHITE} />
          <path d="M50 50 Q60 63 70 50 Z" fill={INK} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M55 55.5 Q60 59.5 65 55.5 Q60 53.5 55 55.5Z" fill={c('sunshine', '500')} />
        </g>
      );
    case 'okay':
      return (
        <g>
          {eye(51, 5.5, 6.5)}
          {eye(69, 5.5, 6.5)}
          <circle cx={51.5} cy={42} r={3} fill={INK} />
          <circle cx={69.5} cy={42} r={3} fill={INK} />
          <path d="M54 52 Q60 55.5 66 51.5" {...stroke} />
        </g>
      );
    case 'soft':
      return (
        <g>
          <path d="M45 42 Q50 37 55 42" {...stroke} />
          <path d="M65 42 Q70 37 75 42" {...stroke} />
          {blush}
          <path d="M56 51 Q60 54 64 51" {...stroke} />
        </g>
      );
    case 'tired':
      return (
        <g>
          {eye(51, 6, 6)}
          {eye(69, 6, 6)}
          <circle cx={51} cy={44} r={2.6} fill={INK} />
          <circle cx={69} cy={44} r={2.6} fill={INK} />
          {/* heavy lids */}
          <path d="M44 41.5 Q51 33 58 41.5 Z" fill={skin} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M62 41.5 Q69 33 76 41.5 Z" fill={skin} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M54 53 q3 -1.6 6 0 t6 0" {...stroke} />
          <text x={86} y={22} fontFamily="Archivo, sans-serif" fontWeight={800} fontSize={12} fill={INK}>z</text>
          <text x={93} y={13} fontFamily="Archivo, sans-serif" fontWeight={800} fontSize={9} fill={INK}>z</text>
        </g>
      );
    case 'chaotic':
      return (
        <g>
          {eye(49, 8, 9)}
          {eye(71, 4.5, 5)}
          <path d="M49 41 m-3.4 0 a3.4 3.4 0 1 1 3.4 3.4 a2 2 0 1 1 -2 -2" {...stroke} strokeWidth={1.8} />
          <circle cx={71} cy={41} r={2.2} fill={INK} />
          <path d="M49 53 l3.5 -3 3.5 3 3.5 -3 3.5 3 3.5 -3 3.5 3" {...stroke} />
        </g>
      );
    case 'heavy':
      return (
        <g>
          {eye(51, 5.5, 6.5)}
          {eye(69, 5.5, 6.5)}
          <circle cx={51} cy={44.5} r={2.8} fill={INK} />
          <circle cx={69} cy={44.5} r={2.8} fill={INK} />
          <path d="M45 31.5 Q50 31 55.5 33.8" {...stroke} />
          <path d="M75 31.5 Q70 31 64.5 33.8" {...stroke} />
          <path d="M55 55 Q60 51.5 65 55" {...stroke} />
          <path d="M44.5 49 q-2.2 3.4 0 4.6 q2.2 -1.2 0 -4.6Z" fill={c('midnight', '100')} stroke={INK} strokeWidth={1.4} />
        </g>
      );
  }
}

type CharacterProps = {
  kind?: CharacterKind;
  mood?: Mood;
  /** 'full' = whole body; 'bust' = head and shoulders (avatars, mood picker). */
  crop?: 'full' | 'bust';
  /** Accessible name. If omitted and not decorative, one is generated. */
  title?: string;
  decorative?: boolean;
  /** White die-cut outline. On by default. */
  dieCut?: boolean;
  className?: string;
  width?: number | string;
};

export function Character({ kind = 'sprout', mood = 'okay', crop = 'full', title, decorative, dieCut = true, className, width }: CharacterProps) {
  const id = useId().replace(/:/g, '');
  const L = LOOK[kind];
  const viewBox = crop === 'bust' ? '14 -4 92 92' : '0 -6 120 158';
  const name = title ?? `${CHARACTERS[kind].name}, feeling ${MOODS[mood].alt}`;
  const line = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  return (
    <svg
      viewBox={viewBox}
      className={className}
      width={width}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      style={{ overflow: 'visible' }}
    >
      {dieCut && (
        <defs>
          <filter id={`dc-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="3.5" result="grow" />
            <feFlood floodColor={WHITE} />
            <feComposite in2="grow" operator="in" result="outline" />
            <feOffset in="grow" dx="2.5" dy="3" result="shadowAlpha" />
            <feFlood floodColor={c('paper', '300')} />
            <feComposite in2="shadowAlpha" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={dieCut ? `url(#dc-${id})` : undefined}>
        {/* sneakers */}
        <path d="M13 139 Q12 128 27 127 H38 Q47 127 50 135 L51 140 Q52 146 45 146 H18 Q12 146 13 139Z" fill={WHITE} {...line} />
        <path d="M107 139 Q108 128 93 127 H82 Q73 127 70 135 L69 140 Q68 146 75 146 H102 Q108 146 107 139Z" fill={WHITE} {...line} />
        <path d="M21 135 Q31 138 42 131" stroke={L.swoosh} strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M99 135 Q89 138 78 131" stroke={L.swoosh} strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M14 141 H51 M106 141 H69" stroke={INK} strokeWidth={2} />
        {/* baggy denim */}
        <path d="M30 92 L23 129 Q37 134 51 129 L58 102 L62 102 L69 129 Q83 134 97 129 L90 92 Z" fill={L.jeans} {...line} />
        <path d="M60 98 V104 M38 104 Q36 116 32 126 M82 104 Q84 116 88 126" stroke={L.jeansSeam} strokeWidth={2} fill="none" strokeLinecap="round" strokeDasharray="3 3" />
        {/* sleeves */}
        <path d="M35 66 Q17 76 19 98 L31 98 Q30 84 41 75Z" fill={L.hoodie} {...line} />
        <path d="M85 66 Q103 76 101 98 L89 98 Q90 84 79 75Z" fill={L.hoodie} {...line} />
        {/* torso */}
        <path d="M34 63 Q60 54 86 63 L93 98 Q60 105 27 98 Z" fill={L.hoodie} {...line} />
        <path d="M44 86 Q60 90 76 86 L74 96 Q60 99 46 96Z" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <path d="M55 64 L54 76 M65 64 L66 76" stroke={INK} strokeWidth={2} strokeLinecap="round" />
        {kind === 'static' && <path d="M30 80 L90 80 M29 86 L91 86" stroke={c('sunshine', '400')} strokeWidth={3} />}
        {/* hands */}
        <circle cx={25} cy={100} r={6} fill={L.skin} {...line} />
        <circle cx={95} cy={100} r={6} fill={L.skin} {...line} />
        {/* hood behind head for doze */}
        {kind === 'doze' && <path d="M27 58 Q19 13 60 11 Q101 13 93 58 Q60 70 27 58Z" fill={L.hoodie} {...line} />}
        {/* head */}
        <path d={HEAD[kind]} fill={L.skin} {...line} />
        {kind === 'sprout' && <path d="M40 30 Q44 38 41 48" stroke={L.skinShade} strokeWidth={3} fill="none" strokeLinecap="round" />}
        {kind === 'doze' && (
          <>
            <path d="M60 24 Q52 8 34 14 Q46 17 53 26" fill={L.skinShade} {...line} />
            <path d="M33 55 Q36 30 60 28 Q84 30 87 55" fill="none" stroke={INK} strokeWidth={2} strokeDasharray="0" />
          </>
        )}
        {kind === 'moss' && (
          <>
            {[
              [42, 19],
              [81, 25],
            ].map(([x, y]) => (
              <g key={x} transform={`translate(${x} ${y})`}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx={0} cy={-5.5} rx={3.6} ry={5.5} transform={`rotate(${a})`} fill={c('sunshine', '400')} stroke={INK} strokeWidth={1.8} />
                ))}
                <circle r={2.6} fill={WHITE} stroke={INK} strokeWidth={1.6} />
              </g>
            ))}
          </>
        )}
        <Face mood={mood} skin={L.skin} />
      </g>
    </svg>
  );
}
