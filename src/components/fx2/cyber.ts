/**
 * 8.4 — Cyber / sci-fi pack (`motionary/fx/cyber`, also `motionary/components/fx-cyber`):
 *
 * - `hud-frame` (enter) — corner brackets draw in around the element and a
 *   scan bar sweeps across it, like a HUD locking on (`color`).
 * - `scanline-sweep` (attention) — a bright horizontal scanline runs down
 *   the element (`color`, `passes`).
 * - `hologram` (loop) — a flickering, translucent cyan hologram look with
 *   drifting scan bands; the cleanup restores the element (`color`).
 * - `data-decode` (enter) — the text resolves from random glyphs to the real
 *   characters, left to right (`speed`).
 *
 * Reduced motion: hud-frame / data-decode just show, scanline-sweep does
 * nothing, hologram is skipped. Overlays are `aria-hidden` and removed.
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { registerEffects } from '../fx/registry';

const GLYPHS = '01<>/\\[]{}#$%&*+=ABCDEFXYZ';
/** The `k`-th frame of decoding `text` over `n` frames: resolved prefix + random glyphs (8.4). */
export function decodeFrame(text: string, k: number, n: number, rnd: () => number = Math.random): string {
  const done = Math.floor((Math.min(n, Math.max(0, k)) / n) * text.length);
  let out = text.slice(0, done);
  for (let i = done; i < text.length; i++) out += /\s/.test(text[i]) ? text[i] : GLYPHS[Math.floor(rnd() * GLYPHS.length)];
  return out;
}

const overlay = (el: HTMLElement, ctx: EffectContext) => {
  if (getComputedStyle(el).position === 'static') {
    const prev = el.style.position;
    el.style.position = 'relative';
    ctx.onCleanup(() => (el.style.position = prev));
  }
  const o = document.createElement('span');
  o.setAttribute('aria-hidden', 'true');
  Object.assign(o.style, { position: 'absolute', inset: '0', pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' });
  el.appendChild(o);
  ctx.onCleanup(() => o.remove());
  return o;
};
const bar = (o: HTMLElement, color: string, h = '2px') => {
  const b = document.createElement('span');
  Object.assign(b.style, { position: 'absolute', left: '0', right: '0', top: '0', height: h, background: color, boxShadow: `0 0 10px 2px ${color}` });
  o.appendChild(b);
  return b;
};

export const CYBER_FX: EffectDefinition[] = [
  {
    name: 'hud-frame',
    kind: 'enter',
    description: 'Corner brackets draw in around the element and a scan bar sweeps across it, like a HUD locking on (`color`).',
    defaults: { color: '#22d3ee', duration: 900 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const ov = overlay(el, ctx);
      ov.style.overflow = 'visible';
      const runs: (Promise<unknown> | undefined)[] = [];
      ['0 0', '100% 0', '0 100%', '100% 100%'].forEach((pos, i) => {
        const c = document.createElement('span');
        const [x, y] = pos.split(' ');
        Object.assign(c.style, { position: 'absolute', width: '14px', height: '14px', left: x === '0' ? '-4px' : 'calc(100% - 10px)', top: y === '0' ? '-4px' : 'calc(100% - 10px)', borderColor: o.color, borderStyle: 'solid', borderWidth: `${y === '0' ? 2 : 0}px ${x !== '0' ? 2 : 0}px ${y !== '0' ? 2 : 0}px ${x === '0' ? 2 : 0}px` });
        ov.appendChild(c);
        const dx = x === '0' ? -14 : 14;
        const dy = y === '0' ? -14 : 14;
        runs.push(ctx.animate(c, [{ transform: `translate(${dx}px,${dy}px)`, opacity: 0 }, { transform: 'none', opacity: 1, offset: 0.5 }, { transform: 'none', opacity: 1, offset: 0.85 }, { transform: 'none', opacity: 0 }], { duration: o.duration + 500, delay: i * 60, easing: 'ease-out', fill: 'backwards' })?.finished.catch(() => undefined));
      });
      const b = bar(ov, o.color);
      runs.push(ctx.animate(b, [{ transform: 'translateY(0)', opacity: 0 }, { opacity: 1, offset: 0.1 }, { transform: `translateY(${el.clientHeight || 80}px)`, opacity: 0 }], { duration: o.duration, delay: 250, easing: 'ease-in-out', fill: 'backwards' })?.finished.catch(() => undefined));
      runs.push(ctx.animate(el, [{ opacity: 0, filter: 'brightness(2) saturate(0)' }, { opacity: 1, filter: 'none' }], { duration: o.duration, easing: 'steps(6, end)', fill: 'backwards' })?.finished.catch(() => undefined));
      return Promise.all(runs).then(() => ov.remove());
    },
  },
  {
    name: 'scanline-sweep',
    kind: 'attention',
    description: 'A bright horizontal scanline runs down the element (`color`, `passes`).',
    defaults: { color: 'rgba(34,211,238,.9)', passes: 1, duration: 800 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const ov = overlay(el, ctx);
      const b = bar(ov, o.color, '3px');
      const a = ctx.animate(b, [{ transform: 'translateY(-4px)' }, { transform: `translateY(${(el.clientHeight || 80) + 4}px)` }], { duration: o.duration, iterations: Math.max(1, Math.min(5, Number(o.passes) || 1)), easing: 'linear' });
      const end = () => ov.remove();
      return a ? a.finished.then(end, end) : (end(), undefined);
    },
  },
  {
    name: 'hologram',
    kind: 'loop',
    description: 'A flickering, translucent hologram look with drifting scan bands until the cleanup runs (`color`).',
    defaults: { color: '#22d3ee', duration: 2400 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      const ov = overlay(el, ctx);
      ov.style.background = `repeating-linear-gradient(0deg, transparent 0 3px, ${o.color}33 3px 4px)`;
      ov.style.mixBlendMode = 'screen';
      const prev = el.style.filter;
      el.style.filter = `drop-shadow(0 0 6px ${o.color}) saturate(1.4)`;
      const a = ctx.animate(el, [{ opacity: 0.85 }, { opacity: 0.6, offset: 0.08 }, { opacity: 0.9, offset: 0.12 }, { opacity: 0.8, offset: 0.5 }, { opacity: 0.55, offset: 0.52 }, { opacity: 0.85 }], { duration: o.duration, iterations: Infinity });
      const b = ctx.animate(ov, [{ backgroundPosition: '0 0' }, { backgroundPosition: '0 40px' }], { duration: 1600, iterations: Infinity, easing: 'linear' });
      return () => {
        a?.cancel();
        b?.cancel();
        ov.remove();
        el.style.filter = prev;
      };
    },
  },
  {
    name: 'data-decode',
    kind: 'enter',
    description: 'The text resolves from random glyphs to the real characters, left to right (`speed` ms per frame).',
    defaults: { speed: 40, frames: 16 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const text = el.textContent || '';
      if (!text.trim() || el.children.length) return;
      const n = Math.max(4, Math.min(60, Number(o.frames) || 16));
      el.setAttribute('aria-label', text);
      let k = 0;
      let timer = 0 as unknown as ReturnType<typeof setTimeout>;
      const restore = () => {
        clearTimeout(timer);
        el.textContent = text;
        el.removeAttribute('aria-label');
      };
      ctx.onCleanup(restore);
      return new Promise<void>((resolve) => {
        const step = () => {
          if (k > n) {
            restore();
            return resolve();
          }
          el.textContent = decodeFrame(text, k++, n);
          timer = setTimeout(step, Math.max(10, Number(o.speed) || 40));
        };
        step();
      });
    },
  },
];

/** Register hud-frame, scanline-sweep, hologram and data-decode (8.4). */
export function registerCyberPack(): void {
  registerEffects(CYBER_FX);
}
