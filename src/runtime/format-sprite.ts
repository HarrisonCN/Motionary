/**
 * `motionary/runtime/format-sprite` (10.3) — sprite sheets and image
 * sequences on the runtime timeline (original implementation).
 *
 * - `parseSpriteSheet(json)` — TexturePacker JSON (hash and array), Aseprite
 *   JSON (hash and array, per-frame `duration`, `meta.frameTags` with
 *   `forward` / `reverse` / `pingpong` directions) and the generic
 *   `{ frames: [{ x, y, w, h }] }` shape; trimmed frames (`spriteSourceSize` /
 *   `sourceSize`) and rotated frames are supported.
 * - `gridSheet(cols, rows, w, h, n?)` — a plain grid sheet.
 * - `frameOrder(sheet, tag?)` — the playback order of a tag (pingpong without repeating the ends).
 * - `spritePlayer(target, sheet, image, { tag, fps })` — a runtime `Playable`
 *   that draws frames onto a `<canvas>` or moves the background of an element.
 * - `imageSequence('frame_{0001}.webp', { start, end })`, `preloadImages(urls)`,
 *   `sequencePlayer(canvas, images, { fps })` — numbered image sequences,
 *   scrubbable (`player.progress = p`, e.g. from a scroll scene).
 * Parsing works without the DOM (SSR / workers); players need a canvas / element.
 */
import { RUNTIME_VERSION, type RuntimeModule } from './registry';
import { Playable } from './tween';

export interface SpriteFrame {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotated: boolean;
  /** Offset of the trimmed frame inside the original (untrimmed) size. */
  offsetX: number;
  offsetY: number;
  sourceW: number;
  sourceH: number;
  /** ms (Aseprite), or undefined (use the player's fps). */
  duration?: number;
}
export interface SpriteTag {
  name: string;
  from: number;
  to: number;
  direction: 'forward' | 'reverse' | 'pingpong' | 'pingpong_reverse';
}
export interface SpriteSheet {
  frames: SpriteFrame[];
  tags: SpriteTag[];
  image?: string;
  size?: { w: number; h: number };
  format: 'texturepacker' | 'aseprite' | 'generic';
}

const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** Parse a sprite-sheet JSON (object or string). */
export function parseSpriteSheet(input: string | Record<string, any>): SpriteSheet {
  const j = typeof input === 'string' ? JSON.parse(input) : input;
  if (!j || !j.frames) throw new Error('[motionary] format-sprite: no "frames" in the sprite sheet JSON');
  const meta = j.meta || {};
  const aseprite = /aseprite/i.test(meta.app || '') || Array.isArray(meta.frameTags);
  const entries: [string, any][] = Array.isArray(j.frames) ? j.frames.map((f: any, i: number) => [f.filename ?? f.name ?? String(i), f]) : Object.entries(j.frames);
  const frames = entries.map(([name, f]) => {
    const r = f.frame || f;
    const rotated = !!f.rotated;
    const sss = f.spriteSourceSize || { x: 0, y: 0 };
    const ss = f.sourceSize || { w: r.w, h: r.h };
    const out: SpriteFrame = { name, x: num(r.x), y: num(r.y), w: num(r.w), h: num(r.h), rotated, offsetX: num(sss.x), offsetY: num(sss.y), sourceW: num(ss.w, r.w), sourceH: num(ss.h, r.h) };
    if (typeof f.duration === 'number') out.duration = f.duration;
    return out;
  });
  if (!Array.isArray(j.frames) && !aseprite) frames.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const tags: SpriteTag[] = (meta.frameTags || []).map((t: any) => ({ name: t.name, from: num(t.from), to: num(t.to), direction: t.direction || 'forward' }));
  return { frames, tags, image: meta.image, size: meta.size, format: aseprite ? 'aseprite' : meta.app || j.meta ? 'texturepacker' : 'generic' };
}

/** A grid sheet: `cols × rows` cells of `w × h` (first `n` cells). */
export function gridSheet(cols: number, rows: number, w: number, h: number, n = cols * rows): SpriteSheet {
  const frames: SpriteFrame[] = [];
  for (let i = 0; i < n; i++) frames.push({ name: String(i), x: (i % cols) * w, y: Math.floor(i / cols) * h, w, h, rotated: false, offsetX: 0, offsetY: 0, sourceW: w, sourceH: h });
  return { frames, tags: [], format: 'generic' };
}

/** Frame indices for a tag (or the whole sheet). */
export function frameOrder(sheet: SpriteSheet, tag?: string): number[] {
  const t = tag ? sheet.tags.find((x) => x.name === tag) : undefined;
  if (tag && !t) throw new Error(`[motionary] format-sprite: unknown tag "${tag}" (have: ${sheet.tags.map((x) => x.name).join(', ') || 'none'})`);
  const from = t ? t.from : 0, to = t ? t.to : sheet.frames.length - 1;
  const fwd = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const dir = t?.direction || 'forward';
  if (dir === 'reverse') return fwd.reverse();
  if (dir === 'pingpong') return [...fwd, ...fwd.slice(1, -1).reverse()];
  if (dir === 'pingpong_reverse') { const r = fwd.reverse(); return [...r, ...r.slice(1, -1).reverse()]; }
  return fwd;
}

/** Draw one frame onto a 2D context at (dx, dy), honouring trim offsets and rotation. */
export function drawFrame(ctx: CanvasRenderingContext2D, image: CanvasImageSource, f: SpriteFrame, dx = 0, dy = 0, scale = 1): void {
  ctx.save();
  ctx.translate(dx + f.offsetX * scale, dy + f.offsetY * scale);
  if (f.rotated) {
    // TexturePacker stores rotated frames 90° clockwise: w/h are the unrotated size
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(image, f.x, f.y, f.h, f.w, -f.h * scale, 0, f.h * scale, f.w * scale);
  } else ctx.drawImage(image, f.x, f.y, f.w, f.h, 0, 0, f.w * scale, f.h * scale);
  ctx.restore();
}

/** Plays a list of frames (by index) with per-frame durations. */
abstract class FramePlayable extends Playable {
  protected times: number[] = [0];
  protected order: number[] = [];
  protected current = -1;
  protected setOrder(order: number[], dur: (i: number) => number): void {
    this.order = order;
    this.times = [0];
    for (const i of order) this.times.push(this.times[this.times.length - 1] + dur(i));
  }
  get duration(): number {
    return this.times[this.times.length - 1];
  }
  /** Index into `order` at a local time. */
  protected indexAt(ms: number): number {
    let lo = 0, hi = this.order.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.times[mid] <= ms) lo = mid;
      else hi = mid - 1;
    }
    return Math.min(lo, this.order.length - 1);
  }
  protected renderLocal(ms: number): void {
    const k = this.order[this.indexAt(Math.min(ms, this.duration - 0.001))];
    if (k === this.current) return;
    this.current = k;
    this.show(k);
  }
  /** The frame index currently shown. */
  get frame(): number {
    return this.current;
  }
  protected abstract show(index: number): void;
}

export interface SpritePlayerOptions {
  tag?: string;
  /** Frames per second for frames without their own duration (default 12). */
  fps?: number;
  repeat?: number;
  yoyo?: boolean;
  paused?: boolean;
  /** Canvas only: draw scale (default: fit the canvas width). */
  scale?: number;
}

class SpritePlayer extends FramePlayable {
  constructor(private target: HTMLCanvasElement | HTMLElement, private sheet: SpriteSheet, private image: CanvasImageSource | string, o: SpritePlayerOptions) {
    super({ repeat: o.repeat ?? -1, yoyo: o.yoyo });
    const fps = o.fps || 12;
    this.setOrder(frameOrder(sheet, o.tag), (i) => sheet.frames[i].duration ?? 1000 / fps);
    this.scale = o.scale;
    if (!o.paused) this.play();
  }
  private scale?: number;
  protected show(i: number): void {
    const f = this.sheet.frames[i];
    const t = this.target as HTMLCanvasElement;
    if (typeof t.getContext === 'function' && typeof this.image !== 'string') {
      const ctx = t.getContext('2d');
      if (!ctx) return;
      const s = this.scale ?? t.width / (f.sourceW || f.w || 1);
      ctx.clearRect(0, 0, t.width, t.height);
      drawFrame(ctx, this.image, f, 0, 0, s);
    } else {
      const el = this.target as HTMLElement;
      if (typeof this.image === 'string') el.style.backgroundImage = `url("${this.image}")`;
      el.style.backgroundPosition = `${-f.x}px ${-f.y}px`;
      el.style.width = `${f.w}px`;
      el.style.height = `${f.h}px`;
      el.style.backgroundRepeat = 'no-repeat';
    }
  }
}

/** Play a sprite sheet on a canvas (image = loaded image / bitmap) or an element's background (image = URL). */
export function spritePlayer(target: HTMLCanvasElement | HTMLElement, sheet: SpriteSheet, image: CanvasImageSource | string, o: SpritePlayerOptions = {}): Playable & { readonly frame: number } {
  return new SpritePlayer(target, sheet, image, o);
}

/** 'frame_{0001}.webp' + { start: 1, end: 3 } → frame_0001.webp, frame_0002.webp, frame_0003.webp ('{1}' = no padding). */
export function imageSequence(pattern: string, o: { start?: number; end: number; step?: number }): string[] {
  const m = /\{(\d+)\}/.exec(pattern);
  if (!m) throw new Error('[motionary] format-sprite: the pattern needs a {0001}-style placeholder');
  const pad = m[1].length;
  const out: string[] = [];
  for (let i = o.start ?? (+m[1] || 0); i <= o.end; i += o.step || 1) out.push(pattern.replace(m[0], String(i).padStart(pad, '0')));
  return out;
}

/** Load images (resolves when all are decoded; rejects with the failing URL). */
export function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(urls.map((u) => new Promise<HTMLImageElement>((ok, bad) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => ok(img);
    img.onerror = () => bad(new Error(`[motionary] format-sprite: could not load ${u}`));
    img.src = u;
  })));
}

class SequencePlayer extends FramePlayable {
  constructor(private canvas: HTMLCanvasElement, private images: CanvasImageSource[], o: { fps?: number; repeat?: number; yoyo?: boolean; paused?: boolean }) {
    super({ repeat: o.repeat ?? 0, yoyo: o.yoyo });
    const fps = o.fps || 24;
    this.setOrder(images.map((_, i) => i), () => 1000 / fps);
    if (!o.paused) this.play();
  }
  protected show(i: number): void {
    const ctx = this.canvas.getContext('2d');
    const img = this.images[i] as any;
    if (!ctx || !img) return;
    const w = this.canvas.width, h = this.canvas.height;
    const iw = img.naturalWidth || img.width || w, ih = img.naturalHeight || img.height || h;
    const s = Math.max(w / iw, h / ih); // cover
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
  }
}

/** Play (or scrub, via `progress`) an image sequence on a canvas, `object-fit: cover` style. */
export function sequencePlayer(canvas: HTMLCanvasElement, images: CanvasImageSource[], o: { fps?: number; repeat?: number; yoyo?: boolean; paused?: boolean } = {}): Playable & { readonly frame: number } {
  return new SequencePlayer(canvas, images, o);
}

export interface FormatSpriteApi {
  parseSpriteSheet: typeof parseSpriteSheet;
  gridSheet: typeof gridSheet;
  frameOrder: typeof frameOrder;
  drawFrame: typeof drawFrame;
  spritePlayer: typeof spritePlayer;
  imageSequence: typeof imageSequence;
  preloadImages: typeof preloadImages;
  sequencePlayer: typeof sequencePlayer;
}

/** The module object for `use(formatSprite)`. */
export const formatSprite: RuntimeModule<FormatSpriteApi> = { id: 'format-sprite', version: RUNTIME_VERSION, tier: 'standard', requires: ['core'], api: { parseSpriteSheet, gridSheet, frameOrder, drawFrame, spritePlayer, imageSequence, preloadImages, sequencePlayer } };
