/**
 * 7.2 — Data-viz motion (`motionary/fx/chart`, also
 * `motionary/components/fx-chart`): entrances for the charts you already
 * have (any SVG or HTML chart library), registered through `registerEffect()`:
 *
 * - `bars-grow` (enter) — bars (`[data-bar]`, `rect`, or the children) grow
 *   from the baseline in a stagger.
 * - `line-draw` (enter) — every SVG `path` / `polyline` / `line` draws itself.
 * - `ring-sweep` (enter) — SVG `circle` arcs sweep around from 12 o'clock.
 * - `sankey-flow` (loop) — dashes flow along the SVG links (`[data-flow]` or
 *   every stroked `path`) to show direction and volume.
 * - `number-roll` (enter) — numbers (`[data-value]` or the text) count up
 *   with locale formatting.
 * - `dots-pop` (enter) — scatter / line points (`circle`, `[data-dot]`) pop in.
 *
 * Reduced motion: final state with a short fade (sankey-flow is static).
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { registerEffects } from '../fx/registry';
import { all } from '../effects/shared';

const fade = (el: Element, ctx: EffectContext) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
const pick = <T extends Element>(el: Element, sel: string): T[] => Array.from(el.querySelectorAll<T>(sel));

/** Parse a number out of text like "$1,234.5k" → { n, pre, post, dec }. */
export function parseFigure(s: string): { n: number; pre: string; post: string; dec: number } | null {
  const m = /^(\D*?)(-?[\d,]*\.?\d+)(.*)$/.exec(s.trim());
  if (!m) return null;
  const raw = m[2].replace(/,/g, '');
  return { n: Number(raw), pre: m[1], post: m[3], dec: (raw.split('.')[1] || '').length };
}

export const CHART_FX: EffectDefinition[] = [
  {
    name: 'bars-grow',
    kind: 'enter',
    description: 'Bars (`[data-bar]`, SVG `rect`, or the children) grow from the baseline in a stagger (`axis` y | x, `stagger`, `duration`).',
    defaults: { axis: 'y', stagger: 60, duration: 700 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      let bars = pick<HTMLElement>(el, '[data-bar]');
      if (!bars.length) bars = pick<HTMLElement>(el, 'rect');
      if (!bars.length) bars = Array.from(el.children) as HTMLElement[];
      if (ctx.reduced) return fade(el, ctx);
      const x = o.axis === 'x';
      return all(
        bars.map((b, i) => {
          (b.style as CSSStyleDeclaration).transformOrigin = x ? '0% 50%' : '50% 100%';
          (b.style as CSSStyleDeclaration).transformBox = 'fill-box';
          return ctx.animate(b, [{ transform: x ? 'scaleX(0)' : 'scaleY(0)' }, { transform: x ? 'scaleX(1.04)' : 'scaleY(1.04)', offset: 0.75 }, { transform: 'none' }], { duration: o.duration, delay: i * o.stagger, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
        })
      );
    },
  },
  {
    name: 'line-draw',
    kind: 'enter',
    description: 'Every SVG `path` / `polyline` / `line` draws itself, then area fills fade in (`duration`, `stagger`).',
    defaults: { duration: 1100, stagger: 120 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      const lines = pick<SVGGeometryElement>(el, 'path, polyline, line');
      if (ctx.reduced || !lines.length) return fade(el, ctx);
      return all(
        lines.map((p, i) => {
          const len = typeof p.getTotalLength === 'function' ? p.getTotalLength() || 1000 : 1000;
          const fill = getComputedStyle(p).fill;
          const hasFill = fill && fill !== 'none' && fill !== 'rgba(0, 0, 0, 0)';
          return ctx.animate(p, [{ strokeDasharray: `${len}`, strokeDashoffset: len, fillOpacity: hasFill ? 0 : 1 }, { strokeDasharray: `${len}`, strokeDashoffset: 0, fillOpacity: hasFill ? 0 : 1, offset: 0.8 }, { strokeDasharray: `${len}`, strokeDashoffset: 0, fillOpacity: 1 }], { duration: o.duration, delay: i * o.stagger, easing: 'cubic-bezier(.6,.05,.3,1)', fill: 'backwards' });
        })
      );
    },
  },
  {
    name: 'ring-sweep',
    kind: 'enter',
    description: "SVG `circle` arcs (donut / ring charts) sweep around from 12 o'clock (`duration`, `stagger`).",
    defaults: { duration: 1000, stagger: 150 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      const rings = pick<SVGCircleElement>(el, 'circle');
      if (ctx.reduced || !rings.length) return fade(el, ctx);
      return all(
        rings.map((c, i) => {
          const r = Number(c.getAttribute('r')) || 0;
          const len = 2 * Math.PI * r || 100;
          const dash = c.getAttribute('stroke-dasharray') || `${len} ${len}`;
          const visible = Number(String(dash).split(/[ ,]+/)[0]) || len;
          return ctx.animate(c, [{ strokeDasharray: `0 ${len}` }, { strokeDasharray: `${visible} ${len}` }], { duration: o.duration, delay: i * o.stagger, easing: 'cubic-bezier(.6,.05,.3,1)', fill: 'backwards' });
        })
      );
    },
  },
  {
    name: 'sankey-flow',
    kind: 'loop',
    description: 'Dashes flow along the SVG links (`[data-flow]` or every stroked `path`) to show direction (`speed`, `dash`).',
    defaults: { speed: 1, dash: '6 10' },
    reduced: 'run',
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      let links = pick<SVGPathElement>(el, '[data-flow]');
      if (!links.length) links = pick<SVGPathElement>(el, 'path');
      const prev = links.map((l) => l.getAttribute('stroke-dasharray'));
      links.forEach((l) => l.setAttribute('stroke-dasharray', o.dash));
      const anims = ctx.reduced ? [] : links.map((l, i) => ctx.animate(l, [{ strokeDashoffset: 0 }, { strokeDashoffset: -32 }], { duration: (1200 + (i % 3) * 300) / Math.max(0.1, o.speed), iterations: Infinity }));
      const stop = () => {
        anims.forEach((a) => a?.cancel());
        links.forEach((l, i) => (prev[i] === null ? l.removeAttribute('stroke-dasharray') : l.setAttribute('stroke-dasharray', prev[i]!)));
      };
      ctx.onCleanup(stop);
      return stop;
    },
  },
  {
    name: 'number-roll',
    kind: 'enter',
    description: 'Numbers (`[data-value]` or the text of the element) count up with locale formatting, keeping prefixes and suffixes (`duration`).',
    defaults: { duration: 1200, locale: undefined },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      const targets = pick<HTMLElement>(el, '[data-value]');
      const list = targets.length ? targets : [el];
      const jobs = list.map((t) => {
        const f = t.dataset.value !== undefined ? { ...(parseFigure(t.textContent || '') || { pre: '', post: '', dec: 0 }), n: Number(t.dataset.value) } : parseFigure(t.textContent || '');
        return f && Number.isFinite(f.n) ? { t, f } : null;
      }).filter(Boolean) as { t: HTMLElement; f: NonNullable<ReturnType<typeof parseFigure>> }[];
      const out = (f: NonNullable<ReturnType<typeof parseFigure>>, v: number) => f.pre + v.toLocaleString(o.locale, { minimumFractionDigits: f.dec, maximumFractionDigits: f.dec }) + f.post;
      if (ctx.reduced || typeof requestAnimationFrame !== 'function') {
        jobs.forEach(({ t, f }) => (t.textContent = out(f, f.n)));
        return fade(el, ctx);
      }
      return new Promise<void>((resolve) => {
        const t0 = performance.now();
        let raf = 0;
        const step = (now: number) => {
          const k = Math.min(1, (now - t0) / o.duration);
          const e = 1 - Math.pow(1 - k, 3);
          jobs.forEach(({ t, f }) => (t.textContent = out(f, f.n * e)));
          if (k < 1) raf = requestAnimationFrame(step);
          else resolve();
        };
        raf = requestAnimationFrame(step);
        ctx.onCleanup(() => cancelAnimationFrame(raf));
      });
    },
  },
  {
    name: 'dots-pop',
    kind: 'enter',
    description: 'Scatter / line-chart points (`circle`, `[data-dot]`) pop in with an overshoot, left to right (`stagger`).',
    defaults: { stagger: 40, duration: 420 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      let dots = pick<SVGElement>(el, '[data-dot]');
      if (!dots.length) dots = pick<SVGElement>(el, 'circle');
      if (ctx.reduced || !dots.length) return fade(el, ctx);
      const xOf = (d: Element) => Number(d.getAttribute('cx')) || (d as HTMLElement).offsetLeft || 0;
      const sorted = dots.slice().sort((a, b) => xOf(a) - xOf(b));
      return all(
        sorted.map((d, i) => {
          (d.style as CSSStyleDeclaration).transformBox = 'fill-box';
          (d.style as CSSStyleDeclaration).transformOrigin = '50% 50%';
          return ctx.animate(d, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.5)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)', opacity: 1 }], { duration: o.duration, delay: i * o.stagger, easing: 'ease-out', fill: 'backwards' });
        })
      );
    },
  },
];

/** Register the 7.2 data-viz motion pack (idempotent). */
export function registerChartPack(): void {
  registerEffects(CHART_FX);
}
