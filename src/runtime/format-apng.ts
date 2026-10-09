/**
 * `motionary/runtime/format-apng` (10.4) — animated PNG (APNG) loader written
 * for Motionary: reads `acTL` / `fcTL` / `fdAT`, rebuilds every frame as a
 * standalone PNG (header + palette / transparency chunks + its image data,
 * with fresh CRCs) and lets the browser's own PNG decoder decode it, then
 * composites the frames (`dispose_op` none / background / previous,
 * `blend_op` source / over) into full-size RGBA. A plain (non-animated) PNG
 * loads as a one-frame animation.
 *
 * `parseApng()` and `apngFramePngs()` are pure (no DOM); `decodeApng()` needs
 * an image decoder — the browser's by default (also in workers), or your own
 * via `{ decode }`.
 */
import { RUNTIME_VERSION, type RuntimeModule } from './registry';
import { composeFrames, fixDelay, bytesOf, browserDecode, crc32, animatedImagePlayer, u8, type AnimatedImage, type FramePart, type FrameDecoder } from './anim-image';

export type { AnimatedImage, AnimFrame, Rgba, AnimPlayer, AnimPlayerOptions, FrameDecoder } from './anim-image';
export { animatedImagePlayer } from './anim-image';

const SIG = [137, 80, 78, 71, 13, 10, 26, 10];

export interface ApngChunk {
  type: string;
  data: Uint8Array;
}

export interface ApngFrameInfo {
  width: number;
  height: number;
  x: number;
  y: number;
  /** ms */
  delay: number;
  dispose: FramePart['dispose'];
  blend: FramePart['blend'];
  /** Image data (zlib stream pieces) of this frame. */
  data: Uint8Array[];
}

export interface ApngInfo {
  width: number;
  height: number;
  /** acTL num_plays (0 = forever); 1 for a plain PNG. */
  plays: number;
  animated: boolean;
  /** The default image (IDAT) is not part of the animation. */
  hiddenDefault: boolean;
  frames: ApngFrameInfo[];
  /** Chunks copied into every frame PNG (PLTE, tRNS, gAMA, cHRM, sRGB, iCCP, sBIT). */
  shared: ApngChunk[];
  ihdr: Uint8Array;
}

const u32 = (b: Uint8Array, i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const u16 = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1];

/** Read the chunk list of a PNG / APNG (pure). */
export function pngChunks(b: Uint8Array): ApngChunk[] {
  for (let i = 0; i < 8; i++) if (b[i] !== SIG[i]) throw new Error('[motionary] format-apng: not a PNG file');
  const out: ApngChunk[] = [];
  let p = 8;
  while (p + 8 <= b.length) {
    const len = u32(b, p), type = String.fromCharCode(b[p + 4], b[p + 5], b[p + 6], b[p + 7]);
    out.push({ type, data: b.subarray(p + 8, p + 8 + len) });
    p += 12 + len;
    if (type === 'IEND') break;
  }
  return out;
}

/** Parse the animation structure (pure; no pixels decoded). */
export function parseApng(input: Uint8Array | ArrayBuffer): ApngInfo {
  const b = u8(input);
  const chunks = pngChunks(b);
  const ihdr = chunks[0]?.type === 'IHDR' ? chunks[0].data : null;
  if (!ihdr) throw new Error('[motionary] format-apng: missing IHDR');
  const width = u32(ihdr, 0), height = u32(ihdr, 4);
  const shared = chunks.filter((c) => /^(PLTE|tRNS|gAMA|cHRM|sRGB|iCCP|sBIT)$/.test(c.type));
  const actl = chunks.find((c) => c.type === 'acTL');
  const frames: ApngFrameInfo[] = [];
  let cur: ApngFrameInfo | null = null, sawIdat = false, idatHasFrame = false;
  const idat: Uint8Array[] = [];
  for (const c of chunks) {
    if (c.type === 'fcTL') {
      const d = c.data;
      const dn = u16(d, 20), dd = u16(d, 22) || 100;
      cur = { width: u32(d, 4), height: u32(d, 8), x: u32(d, 12), y: u32(d, 16), delay: fixDelay((dn / dd) * 1000), dispose: (['none', 'background', 'previous'] as const)[d[24]] || 'none', blend: d[25] === 1 ? 'over' : 'source', data: [] };
      frames.push(cur);
      if (!sawIdat) idatHasFrame = true;
    } else if (c.type === 'IDAT') {
      sawIdat = true;
      idat.push(c.data);
      if (cur && idatHasFrame) cur.data.push(c.data);
    } else if (c.type === 'fdAT' && cur) cur.data.push(c.data.subarray(4)); // drop the sequence number
  }
  if (!actl || !frames.length) {
    // a plain PNG: one frame, the whole image
    return { width, height, plays: 1, animated: false, hiddenDefault: false, frames: [{ width, height, x: 0, y: 0, delay: 100, dispose: 'none', blend: 'source', data: idat }], shared, ihdr };
  }
  // the first frame's dispose "previous" acts like "background" (spec)
  if (frames[0].dispose === 'previous') frames[0].dispose = 'background';
  return { width, height, plays: u32(actl.data, 4), animated: true, hiddenDefault: !idatHasFrame, frames, shared, ihdr };
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const v = new DataView(out.buffer);
  v.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  v.setUint32(8 + data.length, crc32(out, 4, 8 + data.length));
  return out;
}

/** Rebuild every animation frame as a standalone PNG file (pure). */
export function apngFramePngs(info: ApngInfo): Uint8Array[] {
  return info.frames.map((f) => {
    const ihdr = new Uint8Array(info.ihdr); // a copy (never a Node Buffer view)
    const v = new DataView(ihdr.buffer);
    v.setUint32(0, f.width);
    v.setUint32(4, f.height);
    const parts = [new Uint8Array(SIG), chunk('IHDR', ihdr), ...info.shared.map((c) => chunk(c.type, c.data)), ...f.data.map((d) => chunk('IDAT', d)), chunk('IEND', new Uint8Array(0))];
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let o = 0;
    for (const p of parts) {
      out.set(p, o);
      o += p.length;
    }
    return out;
  });
}

/** Decode an APNG (or PNG) into composited RGBA frames. */
export async function decodeApng(input: Uint8Array | ArrayBuffer, o: { decode?: FrameDecoder } = {}): Promise<AnimatedImage & { info: ApngInfo }> {
  const info = parseApng(input);
  const decode = o.decode || browserDecode;
  const pngs = apngFramePngs(info);
  const images = await Promise.all(pngs.map((p) => decode(p, 'image/png')));
  const parts: FramePart[] = info.frames.map((f, i) => ({ x: f.x, y: f.y, image: images[i], delay: f.delay, blend: f.blend, dispose: f.dispose }));
  return { format: 'apng', width: info.width, height: info.height, plays: info.plays, frames: composeFrames(info.width, info.height, parts), info };
}

/** Fetch (URL) or read (ArrayBuffer / Blob / bytes) and decode an APNG. */
export async function loadApng(src: string | ArrayBuffer | ArrayBufferView | Blob, o: { decode?: FrameDecoder } = {}): Promise<AnimatedImage & { info: ApngInfo }> {
  return decodeApng(await bytesOf(src), o);
}

export interface FormatApngApi {
  parseApng: typeof parseApng;
  apngFramePngs: typeof apngFramePngs;
  decodeApng: typeof decodeApng;
  loadApng: typeof loadApng;
  animatedImagePlayer: typeof animatedImagePlayer;
}

/** The module object for `use(formatApng)`. */
export const formatApng: RuntimeModule<FormatApngApi> = { id: 'format-apng', version: RUNTIME_VERSION, requires: ['core'], api: { parseApng, apngFramePngs, decodeApng, loadApng, animatedImagePlayer } };
