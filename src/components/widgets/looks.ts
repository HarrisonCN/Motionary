/**
 * 17.11 looks: ready-made styles for the 17.11 widgets (and every other widget that reads the kit tokens).
 *
 * A look is a palette (its colors) combined with a treatment (its surfaces and effects: borders, shadows, glow,
 * frosted glass, type, picture filters, loop speed). Three families of seventeen treatments each, over forty palettes,
 * give 680 looks per family (17.11 shipped nine treatments over twelve palettes; 17.14 added eight of each; 17.15 and
 * 17.17 added ten palettes each; 17.17 gives every look a micro-interaction feel):
 *
 * - `ui` for page blocks: solid, outline, soft, glass, neon, brutal, paper, gradient, terminal, clay, neumorph, retro,
 *   pill, editorial, sketch, luxe, synth
 * - `parts` for interface parts: flat, elevated, outlined, frosted, cyber, blocky, pastel, window, console, tonal,
 *   acrylic, cupertino, compact, skeuo, inset, hairline, dusk
 * - `motion` for motion and depth: vivid, noir, sepia, duotone, glow, polaroid, film, blueprint, holo, charcoal,
 *   infrared, blockbuster, dreamy, matte, thermal, nightvision, comic
 *
 * Put `look="neon-ocean"` (or `data-mo-look="neon-ocean"`) on a widget or any ancestor after `adoptLooks()`, or call
 * `applyLook(el, 'neon-ocean')`, which adopts just that one rule. A look only sets `--mo-kit-*` tokens, the text color
 * and sometimes the font family, so any token can still be overridden next to it. See docs/looks-17-11.md.
 */
import { adoptStyles } from '../base';

export type LookFamily = 'ui' | 'parts' | 'motion';

/** Palette: ink, paper, accent, second accent. `DARK_PALETTES` lists the dark ones. */
export const LOOK_PALETTES = {
  indigo: ['#18181b', '#ffffff', '#4f46e5', '#a855f7'],
  ocean: ['#0c2a3e', '#f0f9ff', '#0369a1', '#22d3ee'],
  forest: ['#14281d', '#f3f8f2', '#15803d', '#a3e635'],
  sunset: ['#3b1d0e', '#fff7ed', '#c2410c', '#fb7185'],
  rose: ['#3f0d1f', '#fff1f5', '#be123c', '#f472b6'],
  grape: ['#2a1240', '#faf5ff', '#7c3aed', '#e879f9'],
  amber: ['#2f2104', '#fffbeb', '#b45309', '#facc15'],
  slate: ['#0f172a', '#f8fafc', '#475569', '#94a3b8'],
  mint: ['#062a24', '#f0fdfa', '#0f766e', '#34d399'],
  coral: ['#3a1410', '#fff5f2', '#c43d1c', '#ffb703'],
  midnight: ['#e2e8f0', '#0b1020', '#818cf8', '#22d3ee'],
  ember: ['#fef3c7', '#1c1210', '#fb923c', '#f87171'],
  // 17.14
  cherry: ['#3b0a0f', '#fff5f5', '#b91c1c', '#fca5a5'],
  olive: ['#1f2410', '#f9faf1', '#4d6b0f', '#bef264'],
  cobalt: ['#0b1640', '#f3f6ff', '#1d4ed8', '#60a5fa'],
  plum: ['#2b0b2a', '#fdf4fb', '#a21caf', '#f0abfc'],
  sand: ['#2b2418', '#fbf8f1', '#8a5a1f', '#e7c98b'],
  teal: ['#042f2e', '#effcfa', '#0e7490', '#5eead4'],
  aurora: ['#e0f2fe', '#06121f', '#a78bfa', '#34d399'],
  velvet: ['#fce7f3', '#1a0b16', '#f472b6', '#fbbf24'],
  // 17.15
  lavender: ['#1e1b3a', '#f7f5ff', '#6d28d9', '#c4b5fd'],
  moss: ['#18230f', '#f6f8ef', '#3f6212', '#d9f99d'],
  copper: ['#2a160c', '#fdf6f0', '#9a3412', '#fdba74'],
  lagoon: ['#062430', '#f0fbfc', '#155e75', '#67e8f9'],
  berry: ['#2a0a1f', '#fdf2f8', '#9d174d', '#f9a8d4'],
  sage: ['#1a2620', '#f4f7f4', '#3f6b56', '#a7c4b5'],
  espresso: ['#2b1d16', '#faf6f2', '#6f4e37', '#d6b48c'],
  navy: ['#0a1433', '#f5f7fc', '#1e3a8a', '#fbbf24'],
  obsidian: ['#e5e7eb', '#0a0a0c', '#a3e635', '#38bdf8'],
  abyss: ['#ccfbf1', '#03141a', '#2dd4bf', '#818cf8'],
  // 17.17
  jade: ['#052e1f', '#effdf6', '#047857', '#6ee7b7'],
  saffron: ['#2e1a02', '#fffaeb', '#a16207', '#fde047'],
  denim: ['#0f1b2d', '#f4f7fb', '#2f5d8a', '#93c5fd'],
  orchid: ['#2e0b33', '#fcf4ff', '#86198f', '#e9a8f5'],
  rust: ['#2b1206', '#fdf5f0', '#9a3b12', '#fbbf24'],
  spruce: ['#06211f', '#f0f8f7', '#115e59', '#5eead4'],
  flamingo: ['#3a0d1c', '#fff3f6', '#be185d', '#f9a8c9'],
  periwinkle: ['#16183a', '#f5f6ff', '#3f4bb8', '#b4bcfb'],
  onyx: ['#f4f4f5', '#0c0c0e', '#fda4af', '#fcd34d'],
  nebula: ['#ede9fe', '#0d0a1f', '#c084fc', '#67e8f9'],
} as const;

/** The palettes with a dark paper. */
export const DARK_PALETTES: readonly string[] = ['midnight', 'ember', 'aurora', 'velvet', 'obsidian', 'abyss', 'onyx', 'nebula'];

export type LookPalette = keyof typeof LOOK_PALETTES;

/** What a look sets. Colors that a reader has to read against (`ink`, `paper`, `bg`, `cta`) are plain hex where they can be. */
export interface LookSpec {
  ink: string;
  paper: string;
  accent: string;
  onAccent: string;
  /** The opaque color behind the widget that the look was tuned for (the paper, or the tint under frosted glass). */
  bg: string;
  dark: boolean;
  soft?: string;
  line?: string;
  radius?: string;
  shadow?: string;
  glow?: string;
  bw?: string;
  bs?: string;
  /** Dash pattern for drawn outlines (the elastic frame). */
  dash?: string;
  backdrop?: string;
  cta?: string;
  onCta?: string;
  ok?: string;
  bad?: string;
  mediaFilter?: string;
  mediaRadius?: string;
  frame?: string;
  speed?: string;
  beamA?: string;
  beamB?: string;
  font?: string;
  /** 17.17: the micro-interaction feel (a `MICRO_FEELS` name, or `default` for the springs as tuned), set as `--mo-feel`. */
  feel?: string;
}

export interface LookInfo extends LookSpec {
  name: string;
  family: LookFamily;
  treatment: string;
  palette: LookPalette;
}

/* ---------- color math (hex in, hex or rgb() out) ---------- */

const rgbOf = (hex: string): number[] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hexOf = (c: number[]): string => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

/** `a` mixed into `b`: `t` = 1 is all `a`. */
export function mixHex(a: string, t: number, b: string): string {
  const x = rgbOf(a);
  const y = rgbOf(b);
  return hexOf(x.map((v, i) => v * t + y[i] * (1 - t)));
}

/** A hex color with alpha, as `rgb(r g b / a)`. */
export const alpha = (hex: string, a: number): string => `rgb(${rgbOf(hex).join(' ')} / ${a})`;

/** Hue of a hex color in degrees (0–359). */
export function hueOf(hex: string): number {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (!d) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}

/** WCAG contrast ratio of two hex colors. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, b2] = rgbOf(hex).map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/* ---------- treatments ---------- */

interface Pal {
  ink: string;
  paper: string;
  accent: string;
  a2: string;
  on: string;
  dark: boolean;
}

type Treatment = (p: Pal) => Partial<LookSpec>;

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const NONE = '0 0 0 transparent';

/** A dark surface tinted by `tint`, with light ink and the bright accent: shared by neon, terminal, cyber, console. */
const darkSet = (p: Pal, base: string, tint: string, amount: number, ink: string): Partial<LookSpec> => {
  const paper = mixHex(tint, amount, base);
  return { dark: true, paper, bg: paper, ink, accent: p.a2, onAccent: paper, cta: p.a2, onCta: paper, ok: '#4ade80', bad: '#f87171' };
};

/** A light surface even for the dark palettes: deep ink and a deep accent. */
const lightSet = (p: Pal, paper: string): Partial<LookSpec> => {
  let accent = p.dark ? mixHex(p.accent, 0.62, '#111111') : p.accent;
  // a very bright accent (obsidian's lime) is still too light for white text after that mix: deepen it until it reads
  for (let t = 0.56; p.dark && t > 0.2 && contrastRatio('#ffffff', accent) < 4.5; t -= 0.06) accent = mixHex(p.accent, t, '#111111');
  return { dark: false, paper, bg: paper, ink: p.dark ? mixHex(p.accent, 0.22, '#14121a') : p.ink, accent, onAccent: '#ffffff' };
};

export const LOOK_TREATMENTS: Record<LookFamily, Record<string, Treatment>> = {
  ui: {
    solid: () => ({ radius: '14px', shadow: '0 18px 40px -22px rgb(0 0 0 / .45)' }),
    outline: (p) => ({ bw: '2px', line: p.accent, soft: p.paper, radius: '12px', shadow: NONE, cta: p.accent, onCta: p.on }),
    soft: (p) => ({ soft: mixHex(p.accent, 0.12, p.paper), line: 'transparent', radius: '18px', shadow: `0 10px 24px -18px ${alpha(p.accent, 0.6)}`, cta: p.accent, onCta: p.on }),
    glass: (p) => ({
      bg: mixHex(p.a2, 0.3, p.paper),
      paper: alpha(p.paper, 0.55),
      soft: alpha(p.paper, 0.35),
      line: p.dark ? 'rgb(255 255 255 / .16)' : 'rgb(255 255 255 / .6)',
      backdrop: 'blur(14px) saturate(1.5)',
      radius: '20px',
      shadow: `0 24px 48px -24px rgb(0 0 0 / .35), inset 0 1px 0 rgb(255 255 255 / ${p.dark ? 0.12 : 0.55})`,
    }),
    neon: (p) => {
      const d = darkSet(p, '#05050a', p.accent, 0.1, '#f5f5f7');
      return { ...d, soft: mixHex(p.a2, 0.12, d.paper!), line: alpha(p.a2, 0.55), glow: `0 0 18px ${alpha(p.a2, 0.45)}`, radius: '12px', shadow: NONE };
    },
    brutal: (p) => ({ radius: '0px', bw: '3px', line: p.ink, shadow: `5px 5px 0 ${p.ink}`, soft: mixHex(p.a2, 0.25, p.paper), cta: p.accent, onCta: p.on, font: MONO }),
    paper: (p) => ({
      ...lightSet(p, mixHex(p.accent, 0.04, '#fffdf5')),
      bs: 'dashed',
      bw: '1.5px',
      dash: '4 4',
      radius: '6px',
      font: 'Georgia, "Times New Roman", serif',
    }),
    gradient: (p) => ({
      soft: mixHex(p.accent, 0.08, p.paper),
      cta: `linear-gradient(135deg, ${p.accent}, ${mixHex(p.a2, 0.55, p.ink)})`,
      onCta: p.on,
      radius: '16px',
      glow: `0 12px 30px -14px ${alpha(p.accent, 0.55)}`,
    }),
    terminal: (p) => {
      const d = darkSet(p, '#070908', p.accent, 0.06, mixHex(p.a2, 0.25, '#e8f5e9'));
      return { ...d, soft: mixHex(p.a2, 0.08, d.paper!), line: alpha(p.a2, 0.4), radius: '4px', shadow: NONE, glow: `0 0 0 1px ${alpha(p.a2, 0.25)}`, font: MONO };
    },
    // 17.14
    clay: (p) => {
      const l = lightSet(p, mixHex(p.a2, 0.16, '#fbfaf8'));
      return { ...l, soft: mixHex(p.a2, 0.26, '#ffffff'), line: 'transparent', radius: '26px', shadow: `0 16px 28px -14px ${alpha(l.accent!, 0.45)}, inset 0 -6px 12px ${alpha(l.accent!, 0.12)}, inset 0 6px 10px rgb(255 255 255 / .7)`, cta: l.accent, onCta: '#ffffff' };
    },
    neumorph: (p) => {
      const base = p.dark ? mixHex(p.accent, 0.06, '#1b1d24') : mixHex(p.accent, 0.05, '#e9ecf2');
      const ink = p.dark ? '#e8eaf0' : p.ink;
      const accent = p.dark ? mixHex(p.accent, 0.8, '#ffffff') : mixHex(p.accent, 0.85, '#000000');
      return { dark: p.dark, paper: base, bg: base, ink, accent, onAccent: p.dark ? base : '#ffffff', soft: base, line: 'transparent', radius: '20px', shadow: p.dark ? '8px 8px 18px rgb(0 0 0 / .55), -6px -6px 14px rgb(255 255 255 / .05)' : '8px 8px 18px rgb(0 0 0 / .14), -8px -8px 18px rgb(255 255 255 / .9)', cta: accent, onCta: p.dark ? base : '#ffffff' };
    },
    retro: (p) => {
      const l = lightSet(p, '#c9c9c4');
      return { ...l, ink: '#111111', soft: '#dcdcd8', line: '#7a7a74', bw: '2px', bs: 'outset', radius: '0px', shadow: '1px 1px 0 #111111', accent: mixHex(l.accent!, 0.7, '#000000'), cta: '#000080', onCta: '#ffffff', font: 'Tahoma, Verdana, "MS Sans Serif", sans-serif' };
    },
    pill: (p) => ({ radius: '999px', bw: '1.5px', line: alpha(p.accent, 0.45), soft: mixHex(p.accent, 0.1, p.paper), shadow: `0 6px 16px -10px ${alpha(p.accent, 0.7)}`, cta: p.accent, onCta: p.on }),
    editorial: (p) => {
      const l = lightSet(p, '#fffffb');
      return { ...l, ink: '#111111', soft: '#f3f2ec', line: '#111111', bw: '1px', radius: '0px', shadow: NONE, cta: '#111111', onCta: '#fffffb', font: '"Playfair Display", Didot, "Bodoni MT", Georgia, serif' };
    },
    sketch: (p) => {
      const l = lightSet(p, '#fdfcf7');
      return { ...l, soft: mixHex(p.a2, 0.14, '#fdfcf7'), line: l.ink, bw: '2px', bs: 'solid', radius: '255px 15px 225px 15px / 15px 225px 15px 255px', shadow: `2px 3px 0 ${alpha(l.ink!, 0.85)}`, cta: l.accent, onCta: '#ffffff', font: '"Comic Neue", "Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive' };
    },
    luxe: (p) => {
      const d = darkSet(p, '#0d0b08', p.accent, 0.05, '#f3ead6');
      const gold = mixHex(p.a2, 0.25, '#d9b45a');
      return { ...d, accent: gold, onAccent: d.paper!, cta: gold, onCta: d.paper!, soft: mixHex(gold, 0.08, d.paper!), line: alpha(gold, 0.5), radius: '2px', shadow: '0 24px 50px -26px rgb(0 0 0 / .9)', glow: `0 0 0 1px ${alpha(gold, 0.3)}`, font: '"Cormorant Garamond", "Didot", Georgia, serif' };
    },
    synth: (p) => {
      const d = darkSet(p, '#12052a', p.accent, 0.12, '#fbe7ff');
      const pink = mixHex(p.a2, 0.35, '#ff4fd8');
      return { ...d, accent: pink, onAccent: d.paper!, cta: `linear-gradient(90deg, ${pink}, ${mixHex(p.a2, 0.4, '#38e1ff')})`, onCta: d.paper!, soft: mixHex(pink, 0.1, d.paper!), line: alpha(pink, 0.55), radius: '10px', shadow: NONE, glow: `0 0 20px ${alpha(pink, 0.5)}, 0 0 2px ${alpha('#38e1ff', 0.8)}` };
    },
  },
  parts: {
    flat: (p) => ({ shadow: NONE, line: alpha(p.ink, 0.1), soft: mixHex(p.ink, 0.05, p.paper), radius: '10px', cta: p.accent, onCta: p.on }),
    elevated: () => ({ line: 'transparent', radius: '16px', shadow: '0 28px 60px -28px rgb(0 0 0 / .45), 0 2px 8px -2px rgb(0 0 0 / .12)' }),
    outlined: (p) => ({ bw: '1.5px', line: mixHex(p.accent, 0.55, p.paper), soft: mixHex(p.accent, 0.06, p.paper), radius: '12px', shadow: NONE, cta: p.accent, onCta: p.on }),
    frosted: (p) => ({
      bg: mixHex(p.accent, 0.3, p.paper),
      paper: alpha(mixHex(p.accent, 0.06, p.paper), 0.6),
      soft: alpha(p.paper, 0.4),
      line: p.dark ? 'rgb(255 255 255 / .15)' : 'rgb(255 255 255 / .6)',
      backdrop: 'blur(20px) saturate(1.6)',
      radius: '18px',
      shadow: '0 30px 60px -30px rgb(0 0 0 / .4)',
    }),
    cyber: (p) => {
      const d = darkSet(p, '#06070d', p.a2, 0.08, '#e6f1ff');
      return { ...d, soft: mixHex(p.a2, 0.12, d.paper!), line: alpha(p.a2, 0.6), radius: '2px', shadow: NONE, glow: `0 0 0 1px ${alpha(p.a2, 0.35)}, 0 0 22px -4px ${alpha(p.a2, 0.55)}`, font: MONO };
    },
    blocky: (p) => ({ radius: '6px', bw: '2px', line: p.ink, shadow: `3px 3px 0 ${p.accent}`, soft: mixHex(p.a2, 0.2, p.paper), cta: p.accent, onCta: p.on }),
    pastel: (p) => {
      const l = lightSet(p, mixHex(p.accent, 0.07, '#ffffff'));
      return { ...l, soft: mixHex(p.a2, 0.18, '#ffffff'), line: mixHex(p.a2, 0.35, '#ffffff'), radius: '22px', shadow: `0 14px 30px -20px ${alpha(p.accent, 0.45)}`, cta: l.accent, onCta: '#ffffff' };
    },
    window: (p) => ({
      radius: '10px',
      soft: mixHex(p.ink, 0.07, p.paper),
      line: alpha(p.ink, 0.16),
      shadow: '0 22px 70px -20px rgb(0 0 0 / .5), 0 0 0 .5px rgb(0 0 0 / .2)',
      cta: p.accent,
      onCta: p.on,
      font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    }),
    console: (p) => {
      const d = darkSet(p, '#101216', p.accent, 0.05, '#e5e7eb');
      return { ...d, soft: mixHex('#ffffff', 0.06, d.paper!), line: 'rgb(255 255 255 / .12)', radius: '8px', shadow: '0 20px 40px -24px rgb(0 0 0 / .8)', font: MONO };
    },
    // 17.14
    tonal: (p) => ({ soft: mixHex(p.accent, 0.14, p.paper), line: 'transparent', radius: '16px', shadow: NONE, cta: p.accent, onCta: p.on }),
    acrylic: (p) => ({
      bg: mixHex(p.a2, p.dark ? 0.22 : 0.45, p.paper),
      paper: alpha(p.paper, 0.72),
      soft: alpha(mixHex(p.accent, 0.1, p.paper), 0.6),
      line: p.dark ? 'rgb(255 255 255 / .1)' : 'rgb(0 0 0 / .08)',
      backdrop: 'blur(30px) saturate(1.25) brightness(1.05)',
      radius: '8px',
      shadow: '0 8px 16px rgb(0 0 0 / .14)',
      cta: p.accent,
      onCta: p.on,
      font: '"Segoe UI Variable", "Segoe UI", system-ui, sans-serif',
    }),
    cupertino: (p) => ({ radius: '13px', bw: '.5px', line: alpha(p.ink, 0.18), soft: mixHex(p.ink, 0.04, p.paper), shadow: '0 1px 2px rgb(0 0 0 / .08), 0 8px 24px -12px rgb(0 0 0 / .2)', cta: p.accent, onCta: p.on, font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }),
    compact: (p) => ({ radius: '4px', bw: '1px', line: alpha(p.ink, 0.2), soft: mixHex(p.ink, 0.03, p.paper), shadow: NONE, cta: p.ink, onCta: p.paper, font: 'Inter, "Helvetica Neue", Arial, sans-serif' }),
    skeuo: (p) => ({
      radius: '10px',
      bw: '1px',
      line: alpha(p.ink, 0.28),
      soft: mixHex(p.ink, 0.06, p.paper),
      shadow: `inset 0 1px 0 rgb(255 255 255 / ${p.dark ? 0.12 : 0.8}), 0 1px 2px rgb(0 0 0 / .3), 0 6px 14px -6px rgb(0 0 0 / .35)`,
      cta: `linear-gradient(${mixHex(p.accent, 0.82, '#ffffff')}, ${mixHex(p.accent, 0.85, '#000000')})`,
      onCta: '#ffffff',
    }),
    inset: (p) => ({ radius: '12px', line: 'transparent', soft: mixHex(p.ink, 0.07, p.paper), shadow: `inset 0 2px 6px ${alpha('#000000', p.dark ? 0.6 : 0.16)}, inset 0 0 0 1px ${alpha(p.ink, 0.08)}`, cta: p.accent, onCta: p.on }),
    hairline: (p) => ({ radius: '0px', bw: '1px', line: alpha(p.ink, 0.32), soft: p.paper, shadow: NONE, cta: 'transparent', onCta: p.ink, dash: '1 3', glow: `0 0 0 1px ${alpha(p.accent, 0.18)}` }),
    dusk: (p) => {
      const d = darkSet(p, '#141826', p.accent, 0.1, '#e6e9f5');
      // the second accent lifted toward white, so accent text stays readable on the slate
      const lit = mixHex(p.a2, 0.55, '#ffffff');
      return { ...d, accent: lit, cta: lit, soft: mixHex('#ffffff', 0.07, d.paper!), line: 'rgb(255 255 255 / .1)', radius: '14px', shadow: '0 18px 36px -20px rgb(0 0 0 / .9)', glow: `0 1px 0 ${alpha(p.a2, 0.4)} inset` };
    },
  },
  motion: {
    vivid: (p) => ({ mediaFilter: 'saturate(1.35) contrast(1.06)', speed: '1.25', glow: `0 0 24px ${alpha(p.accent, 0.35)}` }),
    noir: (p) => ({
      dark: true,
      paper: '#0b0b0c',
      bg: '#0b0b0c',
      ink: '#f4f4f5',
      accent: mixHex(p.a2, 0.5, '#ffffff'),
      onAccent: '#0b0b0c',
      mediaFilter: 'grayscale(1) contrast(1.2) brightness(.95)',
      frame: '#18181b',
      beamA: '#ffffff',
      beamB: p.a2,
      speed: '.8',
    }),
    sepia: (p) => {
      const paper = mixHex(p.accent, 0.04, '#f6eedc');
      return { dark: false, paper, bg: paper, ink: '#3b2f20', accent: mixHex(p.accent, 0.35, '#6b3f17'), onAccent: '#ffffff', mediaFilter: 'sepia(.75) saturate(1.15) contrast(1.05)', frame: '#fbf6ea', beamA: mixHex(p.accent, 0.35, '#b0895a'), beamB: '#e9d5a8', speed: '.9' };
    },
    duotone: (p) => ({ mediaFilter: `grayscale(1) sepia(1) saturate(2.4) hue-rotate(${(hueOf(p.accent) - 38 + 360) % 360}deg) contrast(1.05)`, frame: mixHex(p.accent, 0.12, p.paper) }),
    glow: (p) => ({ mediaFilter: `brightness(1.06) drop-shadow(0 0 16px ${alpha(p.a2, 0.55)})`, glow: `0 0 32px ${alpha(p.a2, 0.5)}`, beamA: p.a2, beamB: p.accent }),
    polaroid: (p) => {
      const paper = mixHex(p.accent, 0.05, '#fafaf7');
      return { ...lightSet(p, paper), frame: '#ffffff', mediaRadius: '2px', mediaFilter: 'contrast(1.04) saturate(1.08)', shadow: '0 16px 28px -18px rgb(0 0 0 / .55)' };
    },
    film: () => ({ dark: true, paper: '#111111', bg: '#111111', ink: '#ececec', accent: '#f5c542', onAccent: '#111111', mediaFilter: 'contrast(1.12) saturate(.8) sepia(.18)', mediaRadius: '0px', frame: '#1c1c1c', speed: '.7' }),
    blueprint: (p) => {
      const paper = mixHex(p.accent, 0.35, '#0b1b3a');
      return { dark: true, paper, bg: paper, ink: '#e8f1ff', accent: '#e8f1ff', onAccent: paper, line: 'rgb(255 255 255 / .4)', bs: 'dashed', dash: '6 5', mediaFilter: 'grayscale(1) brightness(1.15) contrast(.95)', mediaRadius: '4px', frame: mixHex(p.accent, 0.3, '#0f2550'), beamA: '#e8f1ff', beamB: p.a2 };
    },
    holo: (p) => ({ mediaFilter: 'saturate(1.6) hue-rotate(18deg) contrast(1.05)', glow: `0 0 26px ${alpha(p.a2, 0.45)}`, beamA: p.a2, beamB: p.accent, speed: '1.5', mediaRadius: '22px' }),
    // 17.14
    charcoal: (p) => {
      const paper = '#f2f1ee';
      return { ...lightSet(p, paper), ink: '#1a1a1a', accent: '#1a1a1a', onAccent: paper, mediaFilter: 'grayscale(1) contrast(1.75) brightness(1.05)', mediaRadius: '0px', frame: '#fafaf8', beamA: '#1a1a1a', beamB: '#9ca3af', speed: '.85' };
    },
    infrared: (p) => ({ mediaFilter: 'invert(1) hue-rotate(180deg) saturate(1.8) contrast(1.1)', glow: `0 0 22px ${alpha('#ff3b6b', 0.4)}`, beamA: '#ff3b6b', beamB: p.a2, speed: '1.1' }),
    blockbuster: (p) => {
      const paper = mixHex(p.accent, 0.08, '#0d1416');
      return { dark: true, paper, bg: paper, ink: '#f1ede6', accent: '#ffb35c', onAccent: paper, mediaFilter: 'contrast(1.15) saturate(1.25) sepia(.2) hue-rotate(-12deg)', mediaRadius: '2px', frame: '#0a0f10', beamA: '#ffb35c', beamB: '#2dd4bf', speed: '.75' };
    },
    dreamy: (p) => ({ mediaFilter: 'blur(.6px) brightness(1.08) saturate(1.2) contrast(.92)', glow: `0 0 40px ${alpha(p.a2, 0.4)}`, mediaRadius: '28px', radius: '28px', speed: '.6', beamA: mixHex(p.a2, 0.5, '#ffffff'), beamB: p.a2 }),
    matte: (p) => ({ mediaFilter: 'contrast(.85) brightness(1.08) saturate(.78)', shadow: NONE, mediaRadius: '6px', frame: mixHex(p.ink, 0.05, p.paper), speed: '.9' }),
    thermal: (p) => {
      const paper = '#0a0612';
      return { dark: true, paper, bg: paper, ink: '#fdf2f8', accent: '#facc15', onAccent: paper, mediaFilter: 'grayscale(1) invert(.1) sepia(1) saturate(6) hue-rotate(-40deg) contrast(1.4)', glow: `0 0 26px ${alpha('#f97316', 0.5)}`, frame: '#1a0f24', beamA: '#facc15', beamB: mixHex(p.a2, 0.4, '#ef4444'), speed: '1.3' };
    },
    nightvision: () => {
      const paper = '#030a05';
      return { dark: true, paper, bg: paper, ink: '#c6f7c6', accent: '#4ade80', onAccent: paper, mediaFilter: 'grayscale(1) sepia(1) hue-rotate(70deg) saturate(3.2) brightness(1.15) contrast(1.2)', mediaRadius: '50% / 46%', frame: '#071a0c', glow: '0 0 30px rgb(74 222 128 / .35)', beamA: '#4ade80', beamB: '#bbf7d0', speed: '.95', font: MONO };
    },
    comic: (p) => ({ mediaFilter: 'contrast(1.45) saturate(1.7) brightness(1.03)', bw: '3px', line: p.ink, radius: '4px', mediaRadius: '0px', shadow: `5px 5px 0 ${p.ink}`, frame: '#ffffff', speed: '1.2', font: '"Bangers", "Comic Neue", "Comic Sans MS", cursive' }),
  },
};

/**
 * 17.17: how each treatment moves. Every look sets `--mo-feel`, which the spring core (`micro()`, the spring widgets)
 * reads, so a brutal look lands heavy, a clay look plays, a terminal look snaps: the motion matches the surface.
 */
export const LOOK_FEELS: Record<LookFamily, Record<string, string>> = {
  ui: {
    solid: 'default', outline: 'crisp', soft: 'calm', glass: 'smooth', neon: 'snappy', brutal: 'heavy', paper: 'calm', gradient: 'bouncy', terminal: 'crisp',
    clay: 'playful', neumorph: 'smooth', retro: 'snappy', pill: 'bouncy', editorial: 'calm', sketch: 'playful', luxe: 'heavy', synth: 'bouncy',
  },
  parts: {
    flat: 'default', elevated: 'smooth', outlined: 'crisp', frosted: 'smooth', cyber: 'snappy', blocky: 'heavy', pastel: 'playful', window: 'snappy', console: 'crisp',
    tonal: 'calm', acrylic: 'smooth', cupertino: 'bouncy', compact: 'crisp', skeuo: 'heavy', inset: 'calm', hairline: 'crisp', dusk: 'calm',
  },
  motion: {
    vivid: 'bouncy', noir: 'calm', sepia: 'calm', duotone: 'smooth', glow: 'smooth', polaroid: 'playful', film: 'heavy', blueprint: 'crisp', holo: 'playful',
    charcoal: 'heavy', infrared: 'snappy', blockbuster: 'heavy', dreamy: 'calm', matte: 'smooth', thermal: 'snappy', nightvision: 'crisp', comic: 'playful',
  },
};

export const LOOK_FAMILIES = /*#__PURE__*/ Object.keys(LOOK_TREATMENTS) as LookFamily[];

/* ---------- lookup ---------- */

let index: Map<string, LookInfo> | null = null;

function build(): Map<string, LookInfo> {
  const m = new Map<string, LookInfo>();
  for (const family of LOOK_FAMILIES) {
    for (const [treatment, make] of Object.entries(LOOK_TREATMENTS[family])) {
      for (const palette of Object.keys(LOOK_PALETTES) as LookPalette[]) {
        const [ink, paper, accent, a2] = LOOK_PALETTES[palette];
        const dark = DARK_PALETTES.includes(palette);
        const p: Pal = { ink, paper, accent, a2, on: dark ? paper : '#ffffff', dark };
        const name = `${treatment}-${palette}`;
        const t = { ink, paper, accent, onAccent: p.on, bg: paper, dark, beamA: accent, beamB: a2, ...make(p) } as LookSpec;
        // Every look sets every token, so a look inside another never inherits the outer one's surfaces.
        const solid = t.paper.startsWith('#') ? t.paper : t.bg;
        const spec: LookSpec = {
          soft: mixHex(t.ink, 0.06, solid),
          line: alpha(t.ink, 0.14),
          radius: '14px',
          shadow: t.dark ? '0 18px 40px -22px rgb(0 0 0 / .8)' : '0 18px 40px -22px rgb(0 0 0 / .45)',
          glow: NONE,
          bw: '1px',
          bs: 'solid',
          dash: 'none',
          backdrop: 'none',
          cta: t.ink,
          onCta: solid,
          ok: t.dark ? '#4ade80' : '#15803d',
          bad: t.dark ? '#f87171' : '#b91c1c',
          mediaFilter: 'none',
          mediaRadius: '14px',
          frame: '#ffffff',
          speed: '1',
          feel: LOOK_FEELS[family][treatment] ?? 'default',
          ...t,
        };
        m.set(name, { name, family, treatment, palette, ...spec });
      }
    }
  }
  return m;
}

const all = (): Map<string, LookInfo> => (index ??= build());

/** Every look name, or a family's, in treatment then palette order. */
export function lookNames(family?: LookFamily): string[] {
  return [...all().values()].filter((l) => !family || l.family === family).map((l) => l.name);
}

/** What a look sets, or null for an unknown name. */
export function lookInfo(name: string): LookInfo | null {
  return all().get(name) ?? null;
}

const TOKENS: [keyof LookSpec, string][] = [
  ['ink', 'ink'], ['paper', 'paper'], ['accent', 'accent'], ['onAccent', 'on-accent'], ['soft', 'soft'], ['line', 'line'],
  ['radius', 'radius'], ['shadow', 'shadow'], ['glow', 'glow'], ['bw', 'border-width'], ['bs', 'border-style'], ['dash', 'dash'],
  ['backdrop', 'backdrop'], ['cta', 'cta'], ['onCta', 'on-cta'], ['ok', 'ok'], ['bad', 'bad'], ['mediaFilter', 'media-filter'],
  ['mediaRadius', 'media-radius'], ['frame', 'frame'], ['speed', 'speed'], ['beamA', 'beam-a'], ['beamB', 'beam-b'],
];

/** A look's custom properties, as `{ '--mo-kit-ink': '#…', … }` (empty for an unknown name). */
export function lookTokens(name: string): Record<string, string> {
  const l = lookInfo(name);
  const out: Record<string, string> = {};
  if (!l) return out;
  for (const [key, token] of TOKENS) if (l[key] != null) out[`--mo-kit-${token}`] = String(l[key]);
  return out;
}

/** The CSS rule for one look (empty for an unknown name). */
export function lookRule(name: string): string {
  const l = lookInfo(name);
  if (!l) return '';
  const decl = Object.entries(lookTokens(name)).map(([k, v]) => `${k}:${v}`);
  decl.push('color:var(--mo-kit-ink)');
  if (l.font) decl.push(`font-family:${l.font}`);
  if (l.feel) decl.push(`--mo-feel:${l.feel}`);
  return `:where([look="${name}"],[data-mo-look="${name}"]){${decl.join(';')}}`;
}

/** The stylesheet for every look, or one family's. */
export function looksCss(family?: LookFamily): string {
  return lookNames(family).map(lookRule).join('\n');
}

/** Add the rules for every look (or one family's) to the document, once. */
export function adoptLooks(family?: LookFamily): void {
  adoptStyles(`mo-looks${family ? '-' + family : ''}`, looksCss(family));
}

/** Give `el` a look (adopting just that rule); null removes it. False for an unknown name. */
export function applyLook(el: Element | null, name: string | null): boolean {
  if (!el) return false;
  if (name == null) {
    el.removeAttribute('data-mo-look');
    return true;
  }
  if (!lookInfo(name)) return false;
  adoptStyles(`mo-look-${name}`, lookRule(name));
  el.setAttribute('data-mo-look', name);
  return true;
}
