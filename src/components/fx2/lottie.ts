/**
 * 9.2 — Lottie import (`motionary/fx/lottie`, also `motionary/components/fx-lottie`).
 *
 * `lottieToKeyframes(json)` converts the layer transforms of a Lottie
 * (bodymovin) JSON — position `p`, scale `s`, rotation `r`, opacity `o`
 * (static or keyframed) — into WAAPI keyframes per layer plus the duration
 * (`op − ip` frames at `fr` fps), so a designer's After Effects motion runs
 * on Motionary's clock without lottie-web. `lottieToSvg(json)` renders the
 * simple vector shapes (ellipse `el`, rect `rc`, path `sh`, fill `fl`,
 * stroke `st`) as SVG groups, one per layer. `riveInputs(instance, el, map)`
 * wires Motionary-style triggers (hover / press / click / enter) to the
 * boolean / trigger inputs of a Rive state machine you created with the
 * Rive runtime.
 *
 * Effects: `lottie-play` (attention) plays the keyframes stored on an
 * element by `<usa-lottie>`; `icon-pop` (click) a sticker-like pop with a
 * ring burst for icons. Reduced motion: no motion.
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { registerEffects } from '../fx/registry';

type Prop = { a?: number; k: any };
export interface LottieLayerMotion {
  name: string;
  index: number;
  keyframes: Keyframe[];
  anchor: [number, number];
}
export interface LottieMotion {
  width: number;
  height: number;
  duration: number;
  layers: LottieLayerMotion[];
}

const arr = (v: any): number[] => (Array.isArray(v) ? v.map(Number) : [Number(v)]);
/** Frames (t) → values for one transform property (static props give one key at t = ip) (9.2). */
function track(p: Prop | undefined, ip: number): { t: number; v: number[] }[] {
  if (!p) return [];
  if (!p.a || !Array.isArray(p.k) || typeof p.k[0] !== 'object') return [{ t: ip, v: arr(p.k) }];
  return (p.k as any[]).filter((k) => k && k.s != null).map((k) => ({ t: Number(k.t), v: arr(k.s) }));
}
const at = (tr: { t: number; v: number[] }[], t: number): number[] | undefined => {
  if (!tr.length) return undefined;
  if (t <= tr[0].t) return tr[0].v;
  for (let i = 1; i < tr.length; i++)
    if (t <= tr[i].t) {
      const a = tr[i - 1];
      const b = tr[i];
      const u = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
      return a.v.map((x, j) => x + ((b.v[j] ?? x) - x) * u);
    }
  return tr[tr.length - 1].v;
};
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Lottie JSON → WAAPI keyframes per layer + duration (ms) (9.2). */
export function lottieToKeyframes(json: any): LottieMotion {
  const d = typeof json === 'string' ? JSON.parse(json) : json;
  const fr = Number(d?.fr) || 30;
  const ip = Number(d?.ip) || 0;
  const op = Number(d?.op) || ip + fr;
  const span = Math.max(1, op - ip);
  const layers: LottieLayerMotion[] = (Array.isArray(d?.layers) ? d.layers : []).map((L: any, index: number) => {
    const ks = L?.ks || {};
    const tracks = { p: track(ks.p, ip), s: track(ks.s, ip), r: track(ks.r, ip), o: track(ks.o, ip) };
    const anchor = (arr(ks.a?.k ?? [0, 0]).slice(0, 2) as [number, number]) || [0, 0];
    const times = Array.from(new Set([ip, op, ...Object.values(tracks).flat().map((k) => k.t)])).filter((t) => t >= ip && t <= op).sort((a, b) => a - b);
    const keyframes: Keyframe[] = times.map((t) => {
      const p = at(tracks.p, t);
      const s = at(tracks.s, t);
      const r = at(tracks.r, t);
      const o = at(tracks.o, t);
      // Lottie order: move the anchor to the position, rotate + scale around the anchor
      const pp = p || anchor;
      const tf: string[] = [`translate(${r2(pp[0])}px, ${r2(pp[1] ?? 0)}px)`];
      if (r) tf.push(`rotate(${r2(r[0])}deg)`);
      if (s) tf.push(`scale(${r2(s[0] / 100)}, ${r2((s[1] ?? s[0]) / 100)})`);
      tf.push(`translate(${r2(-anchor[0])}px, ${r2(-anchor[1])}px)`);
      const k: Keyframe = { offset: r2((t - ip) / span), transform: tf.join(' ') };
      if (o) k.opacity = r2(o[0] / 100);
      return k;
    });
    return { name: String(L?.nm ?? `layer ${index + 1}`), index, keyframes, anchor };
  });
  return { width: Number(d?.w) || 100, height: Number(d?.h) || 100, duration: Math.round((span / fr) * 1000), layers };
}

const hex = (c: any): string => {
  const v = arr(c?.k ?? c).slice(0, 3).map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255));
  return `#${v.map((x) => x.toString(16).padStart(2, '0')).join('')}`;
};
function shapes(items: any[], fill: string, stroke: string, sw: number): string {
  let f = fill;
  let s = stroke;
  let w = sw;
  for (const it of items) {
    if (it?.ty === 'fl') f = hex(it.c);
    if (it?.ty === 'st') {
      s = hex(it.c);
      w = Number(it.w?.k) || 2;
    }
  }
  const paint = `fill="${f}"${s !== 'none' ? ` stroke="${s}" stroke-width="${w}"` : ''}`;
  return items
    .map((it) => {
      if (it?.ty === 'gr') return `<g>${shapes(it.it || [], f, s, w)}</g>`;
      if (it?.ty === 'el') {
        const [cx, cy] = arr(it.p?.k ?? [0, 0]);
        const [sx, sy] = arr(it.s?.k ?? [10, 10]);
        return `<ellipse cx="${cx}" cy="${cy}" rx="${sx / 2}" ry="${(sy ?? sx) / 2}" ${paint}/>`;
      }
      if (it?.ty === 'rc') {
        const [cx, cy] = arr(it.p?.k ?? [0, 0]);
        const [sx, sy] = arr(it.s?.k ?? [10, 10]);
        return `<rect x="${cx - sx / 2}" y="${cy - sy / 2}" width="${sx}" height="${sy}" rx="${Number(it.r?.k) || 0}" ${paint}/>`;
      }
      if (it?.ty === 'sh') {
        const k = it.ks?.k;
        const v: number[][] = k?.v || [];
        if (!v.length) return '';
        const i: number[][] = k.i || [];
        const o: number[][] = k.o || [];
        let dd = `M${v[0][0]} ${v[0][1]}`;
        for (let n = 1; n < v.length + (k.c ? 1 : 0); n++) {
          const a = v[n - 1];
          const b = v[n % v.length];
          const c1 = [a[0] + (o[n - 1]?.[0] || 0), a[1] + (o[n - 1]?.[1] || 0)];
          const c2 = [b[0] + (i[n % v.length]?.[0] || 0), b[1] + (i[n % v.length]?.[1] || 0)];
          dd += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${b[0]} ${b[1]}`;
        }
        return `<path d="${dd}${k.c ? 'Z' : ''}" ${paint}/>`;
      }
      return '';
    })
    .join('');
}

/** Render the simple vector layers of a Lottie JSON as an SVG string (one `<g data-layer>` per layer, top layer last) (9.2). */
export function lottieToSvg(json: any): string {
  const d = typeof json === 'string' ? JSON.parse(json) : json;
  const w = Number(d?.w) || 100;
  const h = Number(d?.h) || 100;
  const ls: any[] = Array.isArray(d?.layers) ? d.layers : [];
  const groups = ls
    .map((L, i) => ({ L, i }))
    .reverse()
    .map(({ L, i }) => `<g data-layer="${i}"><g class="usa-lt-inner">${shapes(L?.shapes || [], '#000', 'none', 0)}</g></g>`)
    .join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${groups}</svg>`;
}

/** Wire hover / press / click / enter on `el` to a Rive state machine's inputs: map { hover: 'isHover', click: 'fire' } (9.2). */
export function riveInputs(instance: { stateMachineInputs(sm: string): any[] }, stateMachine: string, el: HTMLElement, map: Partial<Record<'hover' | 'press' | 'click' | 'enter', string>>): () => void {
  const inputs = (instance.stateMachineInputs(stateMachine) || []) as { name: string; type?: number; value?: boolean; fire?: () => void }[];
  const get = (n?: string) => inputs.find((i) => i.name === n);
  const set = (n: string | undefined, v: boolean) => {
    const i = get(n);
    if (!i) return;
    // Rive StateMachineInputType: 58 = trigger (fire on true), 59 = boolean
    if (i.type === 58 && typeof i.fire === 'function') {
      if (v) i.fire();
    } else i.value = v;
  };
  const offs: (() => void)[] = [];
  const on = (t: string, fn: (e: Event) => void) => {
    el.addEventListener(t, fn);
    offs.push(() => el.removeEventListener(t, fn));
  };
  if (map.hover) (on('pointerenter', () => set(map.hover, true)), on('pointerleave', () => set(map.hover, false)));
  if (map.press) (on('pointerdown', () => set(map.press, true)), on('pointerup', () => set(map.press, false)));
  if (map.click) on('click', () => set(map.click, true));
  if (map.enter && typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((es) => es.forEach((e) => set(map.enter, e.isIntersecting)));
    io.observe(el);
    offs.push(() => io.disconnect());
  }
  return () => offs.splice(0).forEach((f) => f());
}

export const LOTTIE_FX: EffectDefinition[] = [
  {
    name: 'lottie-play',
    kind: 'attention',
    description: 'Replays the Lottie keyframes stored on an element by <usa-lottie> (or a `json` option) once.',
    defaults: {},
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const host = el.closest('usa-lottie') as (HTMLElement & { play?: () => void }) | null;
      if (host?.play) return void host.play();
      if (!o.json) return;
      const m = lottieToKeyframes(o.json);
      return Promise.all(m.layers.map((l) => ctx.animate(el, l.keyframes, { duration: m.duration })?.finished.catch(() => undefined))).then(() => undefined);
    },
  },
  {
    name: 'icon-pop',
    kind: 'click',
    description: 'A sticker-like pop with a ring burst, for icons (`color`).',
    defaults: { color: '#f43f5e', duration: 500 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      if (getComputedStyle(el).position === 'static') {
        const prev = el.style.position;
        el.style.position = 'relative';
        ctx.onCleanup(() => (el.style.position = prev));
      }
      const ring = document.createElement('span');
      ring.setAttribute('aria-hidden', 'true');
      Object.assign(ring.style, { position: 'absolute', inset: '0', borderRadius: '50%', border: `2px solid ${o.color}`, pointerEvents: 'none' });
      el.appendChild(ring);
      ctx.onCleanup(() => ring.remove());
      const a = ctx.animate(el, [{ transform: 'scale(1)' }, { transform: 'scale(.8)', offset: 0.2 }, { transform: 'scale(1.2)', offset: 0.55 }, { transform: 'scale(1)' }], { duration: o.duration, easing: 'cubic-bezier(.3,1.5,.5,1)' });
      const b = ctx.animate(ring, [{ transform: 'scale(.6)', opacity: 1 }, { transform: 'scale(1.8)', opacity: 0 }], { duration: o.duration, easing: 'ease-out' });
      const end = () => ring.remove();
      return Promise.all([a?.finished.catch(() => undefined), b?.finished.catch(() => undefined)]).then(end, end);
    },
  },
];

/** Register lottie-play and icon-pop (9.2). */
export function registerLottiePack(): void {
  registerEffects(LOTTIE_FX);
}
