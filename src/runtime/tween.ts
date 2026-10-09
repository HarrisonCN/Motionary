/**
 * Tween + timeline engine (original implementation). Times are in
 * milliseconds. Targets are plain objects (numeric props) or elements
 * (CSS: numbers with units, colours, `opacity`, custom properties, and the
 * transform shorthands `x y rotate scale scaleX scaleY skewX skewY`,
 * composed in that order). Driven by the shared ticker; a tween placed in a
 * timeline is driven by the timeline instead.
 */
import { getTicker } from './ticker';
import { parseEase, type Ease } from './ease';

export type Target = object | Element;
export type Props = Record<string, number | string>;

export interface PlayOptions {
  /** Delay before the first iteration, ms. */
  delay?: number;
  /** Extra iterations (-1 = forever). */
  repeat?: number;
  /** Alternate direction on every other iteration. */
  yoyo?: boolean;
  /** Start paused (`play()` to start). */
  paused?: boolean;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

export interface TweenOptions extends PlayOptions {
  to?: Props;
  from?: Props;
  /** ms (default 600). */
  duration?: number;
  ease?: string | Ease;
  /** Delay added per target index (ms) when several targets are given. */
  stagger?: number;
}

const TRANSFORM = ['x', 'y', 'rotate', 'scale', 'scaleX', 'scaleY', 'skewX', 'skewY'];
const DEFAULT_UNIT: Record<string, string> = { x: 'px', y: 'px', rotate: 'deg', skewX: 'deg', skewY: 'deg', scale: '', scaleX: '', scaleY: '' };
type TState = Record<string, { v: number; u: string }>;
const tstate = /*#__PURE__*/ new WeakMap<Element, TState>();

const isEl = (t: unknown): t is HTMLElement => typeof Element !== 'undefined' && t instanceof Element;

interface Num { kind: 'num'; v: number; u: string }
interface Col { kind: 'col'; c: number[] }
/** Any other string: its numbers are interpolated when both ends share the same text around them. */
interface Str { kind: 'str'; s: string; parts: string[]; nums: number[] }
type Val = Num | Col | Str;
const NUM_RE = /-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi;

/** Parse '12px', '-3.5', '50%', '#0af', 'rgb(1 2 3 / .5)', 'rgba(…)'. */
export function parseValue(v: number | string): Val {
  if (typeof v === 'number') return { kind: 'num', v, u: '' };
  const s = v.trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = h.split('').map((c) => c + c).join('');
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { kind: 'col', c: [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1] };
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map((x) => (x.endsWith('%') ? (parseFloat(x) / 100) * 255 : parseFloat(x)));
    return { kind: 'col', c: [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3] > 1 ? p[3] / 255 : p[3]] };
  }
  if (s === 'transparent') return { kind: 'col', c: [0, 0, 0, 0] };
  m = /^(-?[\d.]+(?:e-?\d+)?)([a-z%]*)$/i.exec(s);
  if (m) return { kind: 'num', v: parseFloat(m[1]), u: m[2] };
  return { kind: 'str', s, parts: s.split(NUM_RE), nums: (s.match(NUM_RE) || []).map(Number) };
}

const lerpVal = (a: Val, b: Val, p: number): string | number => {
  if (a.kind === 'str' || b.kind === 'str') {
    if (a.kind === 'str' && b.kind === 'str' && a.parts.join('\u0000') === b.parts.join('\u0000') && a.nums.length === b.nums.length) {
      return a.parts.map((t, i) => t + (i < a.nums.length ? +(a.nums[i] + (b.nums[i] - a.nums[i]) * p).toFixed(4) : '')).join('');
    }
    const src = p < 0.5 ? a : b;
    return src.kind === 'str' ? src.s : src.kind === 'num' ? (src.u ? src.v + src.u : src.v) : `rgba(${src.c.join(', ')})`;
  }
  if (a.kind === 'col' || b.kind === 'col') {
    const ca = a.kind === 'col' ? a.c : [0, 0, 0, 0], cb = b.kind === 'col' ? b.c : [0, 0, 0, 0];
    const c = ca.map((x, i) => x + (cb[i] - x) * p);
    return `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${+c[3].toFixed(3)})`;
  }
  const v = a.v + (b.v - a.v) * p;
  const u = b.u || a.u;
  return u ? `${+v.toFixed(4)}${u}` : +v.toFixed(6);
};

const kebab = (k: string) => (k.startsWith('--') ? k : k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));

function readProp(t: Target, k: string): number | string {
  if (!isEl(t)) return (t as any)[k] ?? 0;
  if (TRANSFORM.includes(k)) {
    const s = tstate.get(t)?.[k];
    return s ? s.v + s.u : k.startsWith('scale') ? 1 : 0;
  }
  const inline = t.style.getPropertyValue(kebab(k));
  if (inline) return inline;
  const cs = typeof getComputedStyle === 'function' ? getComputedStyle(t).getPropertyValue(kebab(k)) : '';
  return cs || (k === 'opacity' ? 1 : 0);
}

function writeTransform(el: HTMLElement): void {
  const s = tstate.get(el)!;
  const g = (k: string, d: number) => (s[k] ? s[k].v : d);
  const u = (k: string) => (s[k]?.u ?? DEFAULT_UNIT[k]);
  const parts: string[] = [];
  if (s.x || s.y) parts.push(`translate(${g('x', 0)}${u('x') || 'px'}, ${g('y', 0)}${u('y') || 'px'})`);
  if (s.rotate) parts.push(`rotate(${g('rotate', 0)}${u('rotate') || 'deg'})`);
  if (s.scale) parts.push(`scale(${g('scale', 1)})`);
  if (s.scaleX || s.scaleY) parts.push(`scale(${g('scaleX', 1)}, ${g('scaleY', 1)})`);
  if (s.skewX) parts.push(`skewX(${g('skewX', 0)}${u('skewX') || 'deg'})`);
  if (s.skewY) parts.push(`skewY(${g('skewY', 0)}${u('skewY') || 'deg'})`);
  el.style.transform = parts.join(' ');
}

function writeProp(t: Target, k: string, v: string | number): void {
  if (!isEl(t)) {
    (t as any)[k] = typeof v === 'string' && typeof (t as any)[k] === 'number' ? parseFloat(v) : v;
    return;
  }
  if (TRANSFORM.includes(k)) {
    const p = parseValue(v) as Num;
    if (p.kind !== 'num') throw new Error(`[motionary] ${k} needs a number (got "${v}")`);
    const s = tstate.get(t) || {};
    s[k] = { v: p.v, u: p.u };
    tstate.set(t, s);
    return;
  }
  t.style.setProperty(kebab(k), typeof v === 'number' && !['opacity', 'zIndex', 'z-index'].includes(k) && !k.startsWith('--') ? v + 'px' : String(v));
}

/** Common playback: delay, repeat, yoyo, direction, ticker attachment, promise. */
export abstract class Playable {
  delay: number;
  repeat: number;
  yoyo: boolean;
  /** Playback rate multiplier. */
  timeScale = 1;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
  protected _t = 0;
  private _dir = 1;
  private _off: (() => void) | null = null;
  private _done = false;
  private _resolve!: () => void;
  /** Resolves on completion (forward end, or start when reversed). */
  finished: Promise<void>;
  /** Set when owned by a timeline (then the ticker never drives it). */
  parent: Timeline | null = null;

  constructor(o: PlayOptions) {
    this.delay = o.delay || 0;
    this.repeat = o.repeat || 0;
    this.yoyo = !!o.yoyo;
    this.onUpdate = o.onUpdate;
    this.onComplete = o.onComplete;
    this.finished = new Promise((r) => (this._resolve = r));
  }
  /** One iteration, ms. */
  abstract get duration(): number;
  /** Render at `ms` into one iteration. */
  protected abstract renderLocal(ms: number, iterationEnded: boolean): void;

  get totalDuration(): number {
    return this.repeat < 0 ? Infinity : this.delay + this.duration * (this.repeat + 1);
  }
  get time(): number {
    return this._t;
  }
  get progress(): number {
    const td = this.totalDuration;
    return td === Infinity ? ((this._t - this.delay) % this.duration) / this.duration : td ? this._t / td : 1;
  }
  set progress(p: number) {
    this.seek(p * (this.totalDuration === Infinity ? this.delay + this.duration : this.totalDuration));
  }
  get isActive(): boolean {
    return !!this._off;
  }
  get reversed(): boolean {
    return this._dir < 0;
  }

  /** Jump to `ms` (total time, including the delay) and render. */
  seek(ms: number): this {
    const td = this.totalDuration;
    this._t = Math.max(0, Math.min(ms, td));
    const t = this._t - this.delay;
    const d = this.duration || 0;
    if (t < 0) this.renderLocal(0, false);
    else if (!d) this.renderLocal(0, true);
    else {
      let it = d === Infinity ? 0 : Math.floor(t / d);
      let local = d === Infinity ? t : t - it * d;
      if (t >= td - this.delay && td !== Infinity) {
        it = this.repeat;
        local = d;
      }
      const back = this.yoyo && it % 2 === 1;
      this.renderLocal(back ? d - local : local, local === d);
    }
    this.onUpdate?.(this.progress);
    return this;
  }

  play(): this {
    this._dir = 1;
    if (this._t >= this.totalDuration) this._t = 0;
    return this.attach();
  }
  pause(): this {
    this._off?.();
    this._off = null;
    return this;
  }
  /** Play backwards from the current time. */
  reverse(): this {
    this._dir = -1;
    if (this._t <= 0) this._t = this.totalDuration === Infinity ? this.delay + this.duration : this.totalDuration;
    return this.attach();
  }
  restart(): this {
    this._done = false;
    this.seek(0);
    return this.play();
  }
  /** Stop and detach for good. */
  kill(): void {
    this.pause();
    this.parent?.remove(this);
  }
  /** Promise-like: `await tween(...)`. */
  then<R>(ok?: (v: void) => R, err?: (e: unknown) => R): Promise<R> {
    return this.finished.then(ok, err);
  }

  private attach(): this {
    if (this.parent || this._off) return this;
    this._done = false;
    this._off = getTicker().add((_, dt) => this.advance(dt));
    return this;
  }
  private advance(dt: number): void {
    const td = this.totalDuration;
    this.seek(this._t + dt * this._dir * this.timeScale);
    if ((this._dir > 0 && this._t >= td) || (this._dir < 0 && this._t <= 0)) this.complete();
  }
  protected complete(): void {
    this.pause();
    if (this._done) return;
    this._done = true;
    this.onComplete?.();
    this._resolve();
  }
}

interface Track { k: string; from?: Val; to: Val; fromRaw?: number | string; toRaw: number | string }

/** A tween of one target. */
export class Tween extends Playable {
  readonly target: Target;
  private _dur: number;
  private ease: Ease;
  private tracks: Track[] | null = null;
  private toProps: Props;
  private fromProps: Props;
  constructor(target: Target, o: TweenOptions) {
    super(o);
    this.target = target;
    this._dur = o.duration ?? 600;
    this.ease = parseEase(o.ease);
    this.toProps = o.to || {};
    this.fromProps = o.from || {};
  }
  get duration(): number {
    return this._dur;
  }
  /** Capture start values (first render). */
  private init(): Track[] {
    const keys = Array.from(new Set([...Object.keys(this.fromProps), ...Object.keys(this.toProps)]));
    return keys.map((k) => {
      const fromRaw = k in this.fromProps ? this.fromProps[k] : readProp(this.target, k);
      const toRaw = k in this.toProps ? this.toProps[k] : readProp(this.target, k);
      return { k, fromRaw, toRaw, from: parseValue(fromRaw), to: parseValue(toRaw) };
    });
  }
  protected renderLocal(ms: number, ended: boolean): void {
    this.tracks ||= this.init();
    const p = this._dur ? (ended ? this.ease(ms >= this._dur ? 1 : 0) : this.ease(ms / this._dur)) : 1;
    let tr = false;
    for (const t of this.tracks) {
      writeProp(this.target, t.k, lerpVal(t.from!, t.to, p));
      if (TRANSFORM.includes(t.k)) tr = true;
    }
    if (tr && isEl(this.target)) writeTransform(this.target);
  }
}

type Child = { item: Playable | (() => void); start: number; fired?: boolean };

/** Position: ms number, '<' (start of previous), '>' (end of previous, default), '+=200' / '-=200' (relative to the end), 'label', 'label+=100', '<+=100'. */
export type Position = number | string;

export interface TimelineOptions extends PlayOptions {
  /** Defaults merged into every `.to()`. */
  defaults?: Omit<TweenOptions, 'to' | 'from'>;
}

/** A sequence of tweens, nested timelines and callbacks. */
export class Timeline extends Playable {
  private children: Child[] = [];
  private labels: Record<string, number> = {};
  private prevStart = 0;
  private prevEnd = 0;
  private defaults: TimelineOptions['defaults'];
  private lastLocal = 0;
  constructor(o: TimelineOptions = {}) {
    super(o);
    this.defaults = o.defaults;
  }
  get duration(): number {
    let d = 0;
    for (const c of this.children) d = Math.max(d, c.start + (typeof c.item === 'function' ? 0 : c.item.totalDuration));
    return d;
  }
  private resolve(pos: Position | undefined): number {
    if (pos === undefined || pos === '>') return this.prevEnd;
    if (typeof pos === 'number') return Math.max(0, pos);
    const m = /^([<>]|[\w-]+)?\s*(?:([+-])=\s*([\d.]+))?$/.exec(pos.trim());
    if (!m) throw new Error(`[motionary] bad timeline position "${pos}"`);
    let base = this.prevEnd;
    if (m[1] === '<') base = this.prevStart;
    else if (m[1] && m[1] !== '>') {
      if (!(m[1] in this.labels)) throw new Error(`[motionary] unknown timeline label "${m[1]}"`);
      base = this.labels[m[1]];
    }
    const off = m[2] ? (m[2] === '+' ? 1 : -1) * parseFloat(m[3]) : 0;
    return Math.max(0, base + off);
  }
  /** Add a tween, timeline or callback at a position. */
  add(item: Playable | (() => void), position?: Position): this {
    const start = this.resolve(position);
    if (typeof item !== 'function') {
      item.pause();
      item.parent = this;
    }
    this.children.push({ item, start });
    this.prevStart = start;
    this.prevEnd = start + (typeof item === 'function' ? 0 : item.totalDuration);
    return this;
  }
  /** `tween(target, vars)` placed at `position` (stagger across several targets). */
  to(target: Target | Target[] | ArrayLike<Target>, vars: TweenOptions, position?: Position): this {
    const list = toList(target);
    const start = this.resolve(position);
    let end = start;
    list.forEach((t, i) => {
      const tw = new Tween(t, { ...this.defaults, ...vars, delay: (vars.delay || 0) + (vars.stagger || 0) * i, paused: true });
      tw.parent = this;
      this.children.push({ item: tw, start });
      end = Math.max(end, start + tw.totalDuration);
    });
    this.prevStart = start;
    this.prevEnd = end;
    return this;
  }
  call(fn: () => void, position?: Position): this {
    return this.add(fn, position);
  }
  label(name: string, position?: Position): this {
    this.labels[name] = this.resolve(position);
    return this;
  }
  /** Time of a label, ms. */
  labelTime(name: string): number | undefined {
    return this.labels[name];
  }
  remove(item: Playable): void {
    this.children = this.children.filter((c) => c.item !== item);
  }
  /** Children in start order (callbacks excluded). */
  getChildren(): Playable[] {
    return this.children.filter((c) => typeof c.item !== 'function').map((c) => c.item as Playable);
  }
  protected renderLocal(ms: number): void {
    const forward = ms >= this.lastLocal;
    const list = [...this.children].sort((a, b) => (forward ? a.start - b.start : b.start - a.start));
    for (const c of list) {
      if (typeof c.item === 'function') {
        if (forward && !c.fired && ms >= c.start && this.lastLocal <= c.start) {
          c.fired = true;
          c.item();
        } else if (!forward && ms < c.start) c.fired = false;
        continue;
      }
      const local = ms - c.start;
      const p = c.item as Playable & { _started?: boolean };
      if (local < 0) {
        if (p._started) p.seek(0);
        continue;
      }
      p._started = true;
      p.seek(Math.min(local, p.totalDuration));
    }
    this.lastLocal = ms;
  }
}

function toList(t: Target | Target[] | ArrayLike<Target>): Target[] {
  if (Array.isArray(t)) return t;
  if (t && typeof (t as ArrayLike<Target>).length === 'number' && !isEl(t)) return Array.from(t as ArrayLike<Target>);
  return [t as Target];
}

/**
 * Tween one or more targets. Returns a `Tween` (or a `Timeline` holding one
 * tween per target when several are given) that starts on the next frame
 * unless `paused`. `await` it for completion.
 */
export function tween(target: Target | Target[] | ArrayLike<Target>, o: TweenOptions): Playable {
  const list = toList(target);
  let p: Playable;
  if (list.length === 1) p = new Tween(list[0], o);
  else {
    const tl = new Timeline({ repeat: o.repeat, yoyo: o.yoyo, onUpdate: o.onUpdate, onComplete: o.onComplete, delay: o.delay });
    tl.to(list, { ...o, delay: 0, repeat: 0, yoyo: false, onUpdate: undefined, onComplete: undefined }, 0);
    p = tl;
  }
  if (!o.paused) p.play();
  return p;
}

/** A new timeline (plays on the next frame unless `paused`). */
export function timeline(o: TimelineOptions = {}): Timeline {
  const tl = new Timeline(o);
  if (!o.paused) tl.play();
  return tl;
}
