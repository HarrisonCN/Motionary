/**
 * 5.8 — theme packs: `neon`, `paper`, `glass`, `retro`, `brutalist`.
 *
 * A theme pack is design tokens (`--usa-theme-*` custom properties), motion
 * tokens (merged over the 3.x motion scale) and effect presets per role
 * (`enter`, `hover`, `click`, `attention`, `background`). Five theme effects
 * ship with them: `neon-flicker`, `paper-fold`, `glass-shine`,
 * `retro-scanlines`, `brutal-shift`.
 *
 * - `applyTheme(name, root?)` — on `<html>` (default) it also makes the motion
 *   tokens active for `motionToken()`; on any other element the tokens are
 *   only written as variables there. Returns an undo.
 * - `themePreset(name, role)`, `playThemeEffect(el, role)` (theme of the
 *   closest `[data-usa-theme]`).
 * - `<usa-theme name="neon">` — scopes a theme to its subtree and binds the
 *   presets to children with `data-theme-fx="click | hover | enter | attention"`.
 */
import type { EffectDefinition, EffectTrigger } from '../fx/registry';
import { bindEffect, playEffect } from '../fx/registry';
import { adoptStyles, defineElement, type UsaElement } from '../base';
import { applyMotionTokens, mergeMotionTokens, motionTokensToVars, type DeepPartialTokens } from '../tokens/index';
import { overlay } from './shared';

export const THEME_ROLES = ['enter', 'hover', 'click', 'attention', 'background'] as const;
export type ThemeRole = (typeof THEME_ROLES)[number];

export interface ThemePack {
  name: string;
  /** Design tokens, written as `--usa-theme-<key>`. */
  vars: Record<'bg' | 'fg' | 'accent' | 'accent-2' | 'surface' | 'border' | 'radius' | 'shadow' | 'font', string>;
  /** Motion tokens merged over the defaults. */
  motion: DeepPartialTokens;
  /** Effect preset per role. */
  presets: Record<ThemeRole, { effect: string; options?: Record<string, unknown> }>;
}

const P = (enter: string, hover: string, click: string, attention: string, background: string): ThemePack['presets'] => ({
  enter: { effect: enter },
  hover: { effect: hover },
  click: { effect: click },
  attention: { effect: attention },
  background: { effect: background },
});

export const THEMES: Record<string, ThemePack> = {
  neon: {
    name: 'neon',
    vars: { bg: '#07070c', fg: '#e8e8ff', accent: '#22d3ee', 'accent-2': '#ff2bd6', surface: '#11111c', border: '1px solid #22d3ee', radius: '10px', shadow: '0 0 18px #22d3ee66, inset 0 0 12px #ff2bd622', font: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
    motion: { duration: { fast: 120, normal: 220 }, easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)' } },
    presets: P('fade-up', 'neon-flicker', 'shockwave', 'neon-flicker', 'starfield'),
  },
  paper: {
    name: 'paper',
    vars: { bg: '#f6f1e7', fg: '#2b2721', accent: '#c2410c', 'accent-2': '#0f766e', surface: '#fffdf8', border: '1px solid #e3dccd', radius: '4px', shadow: '0 1px 0 #0000000d, 0 10px 24px -14px #00000040', font: 'Georgia, "Times New Roman", serif' },
    motion: { duration: { fast: 200, normal: 380, slow: 700 }, easing: { standard: 'cubic-bezier(0, 0, 0, 1)' } },
    presets: P('paper-fold', 'wiggle', 'ink-splash', 'nudge-hint', 'contours'),
  },
  glass: {
    name: 'glass',
    vars: { bg: 'linear-gradient(135deg, #1e1b4b, #0e7490)', fg: '#f8fafc', accent: '#a5f3fc', 'accent-2': '#c4b5fd', surface: '#ffffff1f', border: '1px solid #ffffff40', radius: '18px', shadow: '0 8px 32px #0000003d', font: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
    motion: { duration: { normal: 320 }, easing: { standard: 'cubic-bezier(0.22, 1, 0.36, 1)' } },
    presets: P('blur', 'glass-shine', 'ripple', 'focus-pulse', 'mesh-gradient'),
  },
  retro: {
    name: 'retro',
    vars: { bg: '#1d1135', fg: '#ffe9a8', accent: '#ff6b35', 'accent-2': '#2ec4b6', surface: '#2a1b4d', border: '3px solid #ffe9a8', radius: '0', shadow: '4px 4px 0 #ff6b35', font: '"Courier New", ui-monospace, monospace' },
    motion: { duration: { normal: 300 }, easing: { standard: 'steps(6, end)' } },
    presets: P('clip-up', 'rubber-band', 'star-burst', 'tada', 'retro-scanlines'),
  },
  brutalist: {
    name: 'brutalist',
    vars: { bg: '#ffffff', fg: '#000000', accent: '#ff3b00', 'accent-2': '#0047ff', surface: '#fff200', border: '3px solid #000000', radius: '0', shadow: '6px 6px 0 #000000', font: '"Arial Black", Arial, sans-serif' },
    motion: { duration: { fast: 80, normal: 160 }, easing: { standard: 'linear' } },
    presets: P('drop-bounce', 'jelly', 'brutal-shift', 'shake', 'voronoi'),
  },
};

export const THEME_NAMES = Object.keys(THEMES);

const BASE_CSS = `[data-usa-theme]{background:var(--usa-theme-bg);color:var(--usa-theme-fg);font-family:var(--usa-theme-font)}
[data-usa-theme] .usa-surface{background:var(--usa-theme-surface);border:var(--usa-theme-border);border-radius:var(--usa-theme-radius);box-shadow:var(--usa-theme-shadow)}
[data-usa-theme] .usa-accent{color:var(--usa-theme-accent)}
[data-usa-theme=glass] .usa-surface{-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}`;

const pack = (t: string | ThemePack): ThemePack => {
  const p = typeof t === 'string' ? THEMES[t] : t;
  if (!p) throw new Error(`[motionary] unknown theme "${String(t)}" — ${THEME_NAMES.join(', ')}`);
  return p;
};

/** The CSS custom properties of a theme (design + motion tokens). */
export function themeVars(t: string | ThemePack): Record<string, string> {
  const p = pack(t);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(p.vars)) out[`--usa-theme-${k}`] = v;
  return { ...out, ...motionTokensToVars(mergeMotionTokens(p.motion)) };
}

/** A theme as a CSS rule (`selector` default `[data-usa-theme=<name>]`) — for SSR / static CSS. */
export function themeCss(t: string | ThemePack, selector?: string): string {
  const p = pack(t);
  return `${selector || `[data-usa-theme=${p.name}]`}{${Object.entries(themeVars(p)).map(([k, v]) => `${k}:${v}`).join(';')}}`;
}

/** Apply a theme to `root` (default `<html>`). Returns an undo. */
export function applyTheme(t: string | ThemePack, root?: HTMLElement): () => void {
  const p = pack(t);
  const el = root || document.documentElement;
  adoptStyles('usa-theme', BASE_CSS);
  const prevAttr = el.getAttribute('data-usa-theme');
  el.setAttribute('data-usa-theme', p.name);
  const vars = Object.entries(p.vars).map(([k, v]) => [`--usa-theme-${k}`, v] as const);
  const old = vars.map(([k]) => [k, el.style.getPropertyValue(k)] as const);
  for (const [k, v] of vars) el.style.setProperty(k, v);
  let undoMotion: () => void;
  if (el === document.documentElement) undoMotion = applyMotionTokens(p.motion, el);
  else {
    const mv = Object.entries(motionTokensToVars(mergeMotionTokens(p.motion)));
    const mold = mv.map(([k]) => [k, el.style.getPropertyValue(k)] as const);
    for (const [k, v] of mv) el.style.setProperty(k, v);
    undoMotion = () => mold.forEach(([k, v]) => (v ? el.style.setProperty(k, v) : el.style.removeProperty(k)));
  }
  return () => {
    undoMotion();
    old.forEach(([k, v]) => (v ? el.style.setProperty(k, v) : el.style.removeProperty(k)));
    if (prevAttr === null) el.removeAttribute('data-usa-theme');
    else el.setAttribute('data-usa-theme', prevAttr);
  };
}

/** The effect preset of a theme for a role. */
export function themePreset(t: string | ThemePack, role: ThemeRole): { effect: string; options?: Record<string, unknown> } {
  return pack(t).presets[role];
}

/** Play the preset for `role` of the theme on the closest `[data-usa-theme]` (or `theme`). */
export function playThemeEffect(el: HTMLElement, role: ThemeRole, theme?: string): Promise<void> {
  const name = theme || el.closest('[data-usa-theme]')?.getAttribute('data-usa-theme') || 'neon';
  const pr = themePreset(name, role);
  return playEffect(el, pr.effect, pr.options);
}

export const THEME_FX: EffectDefinition[] = [
  {
    name: 'neon-flicker',
    kind: 'attention',
    description: 'A neon tube flickering on — dims (never blacks out) twice, well under 3 flashes per second.',
    defaults: { color: '#22d3ee' },
    run: (el, o: any, ctx) =>
      ctx.animate(el, [{ opacity: 1, filter: 'none' }, { opacity: 0.55, offset: 0.2 }, { opacity: 1, filter: `drop-shadow(0 0 6px ${o.color})`, offset: 0.35 }, { opacity: 0.7, offset: 0.6 }, { opacity: 1, filter: `drop-shadow(0 0 10px ${o.color})` }], { duration: 900, easing: 'linear' }),
  },
  {
    name: 'paper-fold',
    kind: 'enter',
    description: 'Unfolds like a sheet of paper hinged at the top.',
    defaults: { duration: 600 },
    run: (el, o: any, ctx) =>
      ctx.animate(el, [{ transform: 'perspective(800px) rotateX(-85deg)', transformOrigin: 'top', opacity: 0 }, { transform: 'perspective(800px) rotateX(12deg)', transformOrigin: 'top', opacity: 1, offset: 0.7 }, { transform: 'perspective(800px) rotateX(0)', transformOrigin: 'top', opacity: 1 }], { duration: o.duration, easing: 'ease-out', fill: 'backwards' }),
  },
  {
    name: 'glass-shine',
    kind: 'hover',
    description: 'A bright diagonal shine sweeps across frosted glass.',
    defaults: { duration: 700 },
    run: (el, o: any, ctx) => {
      const [s, remove] = overlay(el, 'overflow:hidden;background:linear-gradient(105deg,transparent 35%,#ffffff8c 50%,transparent 65%);background-size:250% 100%;background-position:120% 0');
      const a = ctx.animate(s, [{ backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0' }], { duration: o.duration, easing: 'ease-in-out' });
      return a ? a.finished.then(remove, remove) : void remove();
    },
  },
  {
    name: 'retro-scanlines',
    kind: 'background',
    description: 'CRT scanlines with a slow roll (static lines under reduced motion; persistent).',
    reduced: 'run',
    defaults: { opacity: 0.18 },
    run: (el, o: any, ctx) => {
      const [s, remove] = overlay(el, `opacity:${o.opacity};background:repeating-linear-gradient(0deg,#000 0 1px,transparent 1px 3px);mix-blend-mode:multiply`);
      const a = ctx.reduced ? null : ctx.animate(s, [{ backgroundPosition: '0 0' }, { backgroundPosition: '0 30px' }], { duration: 2400, iterations: Infinity, easing: 'linear' });
      return () => {
        a?.cancel();
        remove();
      };
    },
  },
  {
    name: 'brutal-shift',
    kind: 'click',
    description: 'Presses into its hard drop shadow and springs back (brutalist buttons).',
    defaults: { offset: 6 },
    run: (el, o: any, ctx) =>
      ctx.animate(el, [{ transform: 'translate(0,0)' }, { transform: `translate(${o.offset}px,${o.offset}px)`, boxShadow: '0 0 0 #000', offset: 0.3 }, { transform: 'translate(0,0)' }], { duration: 260, easing: 'ease-out' }),
  },
];

export interface UsaThemeElement extends UsaElement {
  readonly theme: string;
}

/** `<usa-theme name="neon | paper | glass | retro | brutalist">` — a themed subtree. */
export function defineTheme(tag = 'usa-theme'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaTheme extends Base {
        static get observedAttributes(): string[] {
          return ['name'];
        }
        get theme(): string {
          const n = this.str('name', 'neon');
          return THEMES[n] ? n : 'neon';
        }
        mount(): void {
          this.onCleanup(applyTheme(this.theme, this));
          this.querySelectorAll<HTMLElement>('[data-theme-fx]').forEach((el) => {
            const role = (el.dataset.themeFx || 'click') as ThemeRole;
            if (!THEME_ROLES.includes(role)) return;
            const pr = themePreset(this.theme, role);
            const trigger: EffectTrigger = role === 'attention' ? 'click' : role === 'background' ? 'load' : role;
            try {
              this.onCleanup(bindEffect(el, pr.effect, { ...(pr.options || {}), trigger }));
            } catch {
              /* effect not registered: call registerAllEffects() */
            }
          });
        }
      },
    { id: 'usa-theme-el', text: 'usa-theme{display:block}' }
  );
}
