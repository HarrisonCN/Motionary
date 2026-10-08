/**
 * 5.3 — page-wide effects, registered through `registerEffect()`.
 * Transitions (cover → `onCovered()` → reveal): `curtain`, `iris`,
 * `pixel-dissolve`, `blinds`. Persistent page effects: `velocity-skew`,
 * `spotlight`, `edge-glow`.
 *
 * ```ts
 * await playEffect(document.body, 'iris', { onCovered: () => router.go('/next') });
 * ```
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { origin } from './shared';

/** A full-viewport, aria-hidden, pointer-blocking (while covering) transition layer. */
function screen(css = ''): HTMLElement {
  const s = document.createElement('div');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('data-usa-page-fx', '');
  s.style.cssText = `position:fixed;inset:0;z-index:2147483001;pointer-events:auto;${css}`;
  document.body.appendChild(s);
  return s;
}

const wait = (a: Animation | null) => (a ? a.finished.catch(() => undefined) : Promise.resolve());
const call = async (fn: unknown) => {
  if (typeof fn === 'function') await fn();
};

/** Reduced-motion version of every transition: a quick cross-fade through the cover colour. */
async function crossFade(o: any, ctx: EffectContext): Promise<void> {
  const s = screen(`background:${o.color};opacity:0`);
  await wait(ctx.animate(s, [{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: 'forwards' }));
  await call(o.onCovered);
  await wait(ctx.animate(s, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }));
  s.remove();
}

/** Build a transition from a cover layer and cover / reveal animations of its parts. */
function transition(build: (s: HTMLElement, o: any, ctx: EffectContext, el: HTMLElement) => { parts: HTMLElement[]; cover: Keyframe[] | ((i: number) => Keyframe[]); delay?: (i: number) => number }): EffectDefinition['run'] {
  return async (el, o: any, ctx) => {
    if (ctx.reduced) return crossFade(o, ctx);
    const s = screen('pointer-events:auto');
    const { parts, cover, delay } = build(s, o, ctx, el);
    const frames = (i: number) => (typeof cover === 'function' ? cover(i) : cover);
    const half = o.duration / 2;
    await Promise.all(parts.map((p, i) => wait(ctx.animate(p, frames(i), { duration: half, delay: delay?.(i) ?? 0, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' }))));
    await call(o.onCovered);
    if (o.hold) await new Promise((r) => setTimeout(r, o.hold));
    await Promise.all(parts.map((p, i) => wait(ctx.animate(p, [...frames(i)].reverse(), { duration: half, delay: delay?.(i) ?? 0, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' }))));
    s.remove();
  };
}

const part = (s: HTMLElement, css: string) => {
  const p = document.createElement('div');
  p.style.cssText = `position:absolute;${css}`;
  s.appendChild(p);
  return p;
};

const TRANSITION_DEFAULTS = { color: '#0f0f1a', duration: 1000, hold: 0, onCovered: undefined as undefined | (() => unknown) };

export const PAGE_FX: EffectDefinition[] = [
  {
    name: 'curtain',
    kind: 'page',
    description: 'Two curtain panels close from the sides, call onCovered(), then open.',
    reduced: 'run',
    defaults: TRANSITION_DEFAULTS,
    run: transition((s, o) => ({
      parts: [part(s, `top:0;bottom:0;left:0;width:50.5%;background:${o.color}`), part(s, `top:0;bottom:0;right:0;width:50.5%;background:${o.color}`)],
      cover: (i) => [{ transform: `translateX(${i ? 100 : -100}%)` }, { transform: 'translateX(0)' }],
    })),
  },
  {
    name: 'iris',
    kind: 'page',
    description: 'A circle closes on the click point (or the element’s center), calls onCovered(), then opens.',
    reduced: 'run',
    defaults: TRANSITION_DEFAULTS,
    run: transition((s, o, ctx, el) => {
      const { x, y } = origin(el, ctx);
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 2;
      // a huge box-shadow ring around a hole: the hole shrinks to 0 to cover
      const p = part(s, `left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;box-shadow:0 0 0 ${Math.ceil(r)}px ${o.color}`);
      s.style.background = 'transparent';
      return { parts: [p], cover: [{ width: `${r * 2}px`, height: `${r * 2}px`, margin: `${-r}px 0 0 ${-r}px` }, { width: '0px', height: '0px', margin: '0px 0 0 0px' }] };
    }),
  },
  {
    name: 'pixel-dissolve',
    kind: 'page',
    description: 'The screen fills with pixels in random order, calls onCovered(), then dissolves (`cols` × `rows`).',
    reduced: 'run',
    defaults: { ...TRANSITION_DEFAULTS, cols: 16, rows: 10 },
    run: transition((s, o) => {
      const n = o.cols * o.rows;
      const order = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
      const parts = Array.from({ length: n }, (_, i) => part(s, `left:${((i % o.cols) * 100) / o.cols}%;top:${(Math.floor(i / o.cols) * 100) / o.rows}%;width:${100 / o.cols + 0.2}%;height:${100 / o.rows + 0.2}%;background:${o.color};opacity:0`));
      return { parts, cover: [{ opacity: 0 }, { opacity: 1 }], delay: (i) => (order[i] / n) * (o.duration / 2) * 0.6 };
    }),
  },
  {
    name: 'blinds',
    kind: 'page',
    description: 'Horizontal slats rotate shut like venetian blinds, call onCovered(), then open (`slats`).',
    reduced: 'run',
    defaults: { ...TRANSITION_DEFAULTS, slats: 8 },
    run: transition((s, o) => ({
      parts: Array.from({ length: o.slats }, (_, i) => part(s, `left:0;right:0;top:${(i * 100) / o.slats}%;height:${100 / o.slats + 0.3}%;background:${o.color};transform-origin:top`)),
      cover: [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
      delay: (i) => i * 30,
    })),
  },
  {
    name: 'velocity-skew',
    kind: 'scroll',
    description: 'Skews the element with scroll velocity and eases back when scrolling stops (persistent).',
    defaults: { max: 8, factor: 0.25 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      let last = scrollY;
      let skew = 0;
      let raf = 0;
      const tick = () => {
        const y = scrollY;
        const target = Math.max(-o.max, Math.min(o.max, (y - last) * o.factor));
        last = y;
        skew += (target - skew) * 0.2;
        el.style.transform = `skewY(${skew.toFixed(3)}deg)`;
        raf = Math.abs(skew) > 0.01 || Math.abs(target) > 0.01 ? requestAnimationFrame(tick) : 0;
        if (!raf) el.style.transform = '';
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };
      addEventListener('scroll', onScroll, { passive: true });
      return () => {
        removeEventListener('scroll', onScroll);
        cancelAnimationFrame(raf);
        el.style.transform = '';
      };
    },
  },
  {
    name: 'spotlight',
    kind: 'cursor',
    description: 'Dims the page except a soft circle that follows the pointer (persistent; `radius`, `dim`).',
    defaults: { radius: 180, dim: 0.72 },
    run: (_el, o: any, ctx) => {
      if (ctx.reduced) return;
      const s = screen(`pointer-events:none;background:radial-gradient(circle ${o.radius}px at var(--x,50%) var(--y,50%),transparent 0,transparent 60%,rgba(0,0,0,${o.dim}) 100%)`);
      const move = (e: PointerEvent) => {
        s.style.setProperty('--x', `${e.clientX}px`);
        s.style.setProperty('--y', `${e.clientY}px`);
      };
      addEventListener('pointermove', move, { passive: true });
      return () => {
        removeEventListener('pointermove', move);
        s.remove();
      };
    },
  },
  {
    name: 'edge-glow',
    kind: 'scroll',
    description: 'A soft glow lights the top / bottom edge of the viewport while scrolling in that direction (persistent).',
    defaults: { color: '#7c5cff', size: 90 },
    run: (_el, o: any, ctx) => {
      if (ctx.reduced) return;
      const s = screen('pointer-events:none;opacity:0;transition:opacity .35s ease-out');
      let last = scrollY;
      let t = 0;
      const onScroll = () => {
        const down = scrollY >= last;
        last = scrollY;
        s.style.background = `linear-gradient(${down ? 'to top' : 'to bottom'},${o.color}55,transparent ${o.size}px)`;
        s.style.opacity = '1';
        clearTimeout(t);
        t = setTimeout(() => (s.style.opacity = '0'), 160) as unknown as number;
      };
      addEventListener('scroll', onScroll, { passive: true });
      return () => {
        removeEventListener('scroll', onScroll);
        clearTimeout(t);
        s.remove();
      };
    },
  },
];
