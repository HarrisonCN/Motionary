/**
 * 14.5 project & asset workflow (`motionary/studio/assets`): image, SVG, font, video and audio references in a Studio
 * project, relative path resolution confined to the project directory, an offline project pack (one JSON file holding
 * the project and every referenced local asset) and missing-asset reports / relinking after a project moved to another
 * device. Pure: no DOM, no network, no file system — callers pass bytes and file lists in and get bytes and reports out.
 * Nothing is ever executed: script-like files (`.js`, `.html`, `.wasm`, …) are reported and never packed, unpacked
 * or suggested.
 */
import { TimelineDocError, type TimelineDoc } from '../timeline/editor/format';
import { parseStudioProject, serializeStudioProject, type StudioUiState } from './project';
import type { SceneLoss } from '../timeline/editor/scene';

export const STUDIO_ASSETS_VERSION = 1;
export const STUDIO_PACK_FORMAT = 'motionary-studio-pack';
/** Hard limits: assets per project / pack, path length, bytes per file, pack text length. */
export const ASSET_LIMITS = { assets: 2000, pathLength: 1024, fileBytes: 50e6, packBytes: 200e6 } as const;

export type AssetKind = 'image' | 'svg' | 'font' | 'video' | 'audio' | 'data' | 'script' | 'other';
export type AssetPathReason = 'empty' | 'length' | 'control' | 'encoding' | 'absolute' | 'scheme' | 'outside' | 'directory' | 'forbidden';
export interface AssetUse { layer: string; keyframe: string; prop: string }
export interface AssetRef { path: string; kind: AssetKind; uses: AssetUse[] }
export interface AssetEntry { path: string; kind: AssetKind; bytes?: number; crc32?: number }
export interface RejectedRef extends AssetUse { ref: string; reason: AssetPathReason }
export interface AssetRefReport { assets: AssetRef[]; external: (AssetUse & { ref: string })[]; rejected: RejectedRef[] }
export type AssetFiles = Record<string, Uint8Array> | Map<string, Uint8Array>;
export type AssetAvailability = AssetFiles | Iterable<string> | ((path: string) => boolean);
export interface AssetCheck { ok: boolean; found: string[]; missing: AssetEntry[]; changed: AssetEntry[]; rejected: RejectedRef[]; messages: string[] }
export interface RelinkSuggestion { from: string; to: string; by: 'content' | 'name' }
export interface PackResult { text: string; missing: string[]; skipped: { path: string; reason: string }[] }
export interface UnpackProblem { path: string; reason: string }
export interface UnpackResult { project: { doc: TimelineDoc; ui: StudioUiState; lost: SceneLoss[] }; files: Map<string, Uint8Array>; problems: UnpackProblem[] }

export class AssetPathError extends Error {
  readonly path: string;
  readonly reason: AssetPathReason;
  constructor(path: string, reason: AssetPathReason) {
    super(`[motionary] asset path ${JSON.stringify(String(path).slice(0, 80))}: ${reason}`);
    this.name = 'AssetPathError';
    this.path = path;
    this.reason = reason;
  }
}

const KINDS: [AssetKind, RegExp][] = [
  ['script', /\.(m?js|cjs|jsx|tsx?|html?|xhtml|wasm|sh|bat|cmd|ps1|exe|php|py)$/],
  ['svg', /\.svgz?$/], ['image', /\.(png|jpe?g|gif|webp|avif|bmp|ico|apng)$/], ['font', /\.(woff2?|ttf|otf|eot)$/],
  ['video', /\.(mp4|webm|mov|m4v|ogv)$/], ['audio', /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus)$/], ['data', /\.(json|lottie|csv|txt|vtt)$/],
];
/** Kind of an asset by its extension (case-insensitive; query and hash ignored). */
export function assetKind(path: string): AssetKind {
  const p = String(path).replace(/[?#].*$/, '').toLowerCase();
  for (const [k, re] of KINDS) if (re.test(p)) return k;
  return 'other';
}

/** `https:` and `data:` references: external, never resolved or packed. */
export const isExternalAsset = (ref: string): boolean => /^(https:|data:)/i.test(String(ref).trim());

const FORBIDDEN = /*#__PURE__*/ new Set(['__proto__', 'constructor', 'prototype']);
function norm(path: string, base: string[]): string {
  const bad = (r: AssetPathReason): never => { throw new AssetPathError(path, r); };
  if (typeof path !== 'string' || !path) bad('empty');
  if (path.length > ASSET_LIMITS.pathLength) bad('length');
  let p = path;
  try { p = decodeURIComponent(p); } catch { bad('encoding'); }
  if (/[\u0000-\u001f\u007f]/.test(p)) bad('control');
  p = p.replace(/\\/g, '/');
  if (p[0] === '/' || /^[a-z]:\//i.test(p)) bad('absolute');
  if (/^[a-z][\w+.-]*:/i.test(p)) bad('scheme');
  const out = base.slice(), segs = p.split('/');
  segs.forEach((s, i) => {
    if (s === '..') { if (!out.length) bad('outside'); out.pop(); }
    else if (s === '' || s === '.') { if (i === segs.length - 1 && segs.length > 1 && s === '') bad('directory'); }
    else if (FORBIDDEN.has(s)) bad('forbidden');
    else out.push(s);
  });
  if (!out.length) bad('empty');
  return out.join('/');
}
/** A project-relative POSIX path (`./`, inner `..`, `//` and `\` normalized). Throws `AssetPathError` for anything that leaves the project, is absolute, has a scheme or control characters. */
export const normalizeAssetPath = (path: string): string => norm(path, []);
/** `ref` resolved relative to the project file that holds it (`from`, e.g. `scenes/intro.json`), still confined to the project root. */
export function resolveAssetPath(ref: string, from?: string): string {
  const dir = from ? normalizeAssetPath(from).split('/').slice(0, -1) : [];
  return norm(ref, dir);
}

const URL_RE = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)/g;
const SRC_PROP = /(^|-)src$/i;
/** Asset references in a document: `url(…)` in any string value and whole values of `*src` props (`--src`, `--font-src`). */
export function collectAssetRefs(doc: TimelineDoc): AssetRef[];
export function collectAssetRefs(doc: TimelineDoc, o: { report: true }): AssetRefReport;
export function collectAssetRefs(doc: TimelineDoc, o: { report?: boolean } = {}): AssetRef[] | AssetRefReport {
  const map = new Map<string, AssetRef>(), external: AssetRefReport['external'] = [], rejected: RejectedRef[] = [];
  for (const l of doc.layers) for (const k of l.keyframes || []) for (const prop of Object.keys(k.props)) {
    const v = k.props[prop];
    if (typeof v !== 'string') continue;
    const refs: string[] = [];
    for (const m of v.matchAll(URL_RE)) refs.push(m[1] ?? m[2] ?? m[3] ?? '');
    if (!refs.length && SRC_PROP.test(prop) && v.trim()) refs.push(v.trim());
    for (const ref of refs) {
      const use = { layer: l.id, keyframe: k.id, prop };
      if (!ref || ref[0] === '#') continue;
      if (isExternalAsset(ref)) { external.push({ ref, ...use }); continue; }
      try {
        const path = normalizeAssetPath(ref);
        const a = map.get(path) || map.set(path, { path, kind: assetKind(path), uses: [] }).get(path)!;
        a.uses.push(use);
      } catch (e) { rejected.push({ ref, reason: (e as AssetPathError).reason, ...use }); }
    }
  }
  const assets = [...map.values()].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  if (assets.length > ASSET_LIMITS.assets) throw new TimelineDocError([{ path: 'layers', message: `more than ${ASSET_LIMITS.assets} assets` }]);
  external.sort((a, b) => (a.ref < b.ref ? -1 : a.ref > b.ref ? 1 : 0));
  return o.report ? { assets, external, rejected } : assets;
}

const getter = (files: AssetFiles) => (p: string): Uint8Array | undefined =>
  files instanceof Map ? files.get(p) : Object.prototype.hasOwnProperty.call(files, p) ? (files as Record<string, Uint8Array>)[p] : undefined;
const entries = (files: AssetFiles): [string, Uint8Array][] => (files instanceof Map ? [...files] : Object.entries(files));

/** The document's assets with size and CRC-32 for the files that exist. */
export function createAssetManifest(doc: TimelineDoc, files: AssetFiles = {}): AssetEntry[] {
  const get = getter(files);
  return collectAssetRefs(doc).map(({ path, kind }) => {
    const b = get(path);
    return b ? { path, kind, bytes: b.length, crc32: crc32(b) } : { path, kind };
  });
}

/** Which assets of a manifest (or a document) are available, missing, changed (size / CRC differ) or rejected (unsafe path). */
export function checkAssets(target: AssetEntry[] | TimelineDoc, available: AssetAvailability): AssetCheck {
  let manifest: AssetEntry[], rejected: RejectedRef[] = [];
  if (Array.isArray(target)) manifest = target;
  else { const r = collectAssetRefs(target, { report: true }); manifest = r.assets.map(({ path, kind }) => ({ path, kind })); rejected = r.rejected; }
  let has: (p: string) => boolean, get: ((p: string) => Uint8Array | undefined) | undefined;
  if (typeof available === 'function') has = available;
  else if (available instanceof Map || (typeof available === 'object' && !(Symbol.iterator in available))) { get = getter(available as AssetFiles); has = (p) => !!get!(p); }
  else { const s = new Set(available as Iterable<string>); has = (p) => s.has(p); }
  const found: string[] = [], missing: AssetEntry[] = [], changed: AssetEntry[] = [], messages: string[] = [];
  for (const e of manifest) {
    if (!has(e.path)) { missing.push(e); messages.push(`missing ${e.kind}: ${e.path}`); continue; }
    found.push(e.path);
    const b = get && get(e.path);
    if (b && e.crc32 !== undefined && (b.length !== e.bytes || crc32(b) !== e.crc32)) { changed.push(e); messages.push(`changed ${e.kind}: ${e.path}`); }
  }
  for (const r of rejected) messages.push(`rejected (${r.reason}): ${r.ref} in ${r.layer}/${r.keyframe} ${r.prop}`);
  return { ok: !missing.length && !changed.length && !rejected.length, found, missing, changed, rejected, messages };
}

/** New locations for missing assets: by content (size + CRC-32) when exactly one file matches, else by a unique file name. Never a script or an unsafe path. */
export function relinkAssets(manifest: AssetEntry[], available: AssetFiles): RelinkSuggestion[] {
  const cands: { path: string; bytes: number; crc: number; name: string }[] = [];
  for (const [p, b] of entries(available)) {
    let n: string;
    try { n = normalizeAssetPath(p); } catch { continue; }
    if (assetKind(n) !== 'script') cands.push({ path: n, bytes: b.length, crc: crc32(b), name: n.split('/').pop()! });
  }
  const here = new Set(cands.map((c) => c.path)), out: RelinkSuggestion[] = [];
  for (const e of manifest) {
    if (here.has(e.path)) continue;
    const byC = e.crc32 === undefined ? [] : cands.filter((c) => c.bytes === e.bytes && c.crc === e.crc32);
    if (byC.length === 1) { out.push({ from: e.path, to: byC[0].path, by: 'content' }); continue; }
    if (byC.length > 1) continue;
    const name = e.path.split('/').pop(), byN = cands.filter((c) => c.name === name && assetKind(c.path) === e.kind);
    if (byN.length === 1) out.push({ from: e.path, to: byN[0].path, by: 'name' });
  }
  return out;
}

/** One JSON file with the project and every referenced local asset (deterministic). External URLs stay references; scripts are never packed. */
export function packStudioProject(project: string | { doc: TimelineDoc; ui?: StudioUiState }, files: AssetFiles): PackResult {
  const { doc, ui } = typeof project === 'string' ? parseStudioProject(project) : project;
  const r = collectAssetRefs(doc, { report: true }), get = getter(files), missing: string[] = [], skipped: PackResult['skipped'] = [], out: any[] = [];
  for (const x of r.rejected) skipped.push({ path: x.ref, reason: x.reason });
  for (const a of r.assets) {
    if (a.kind === 'script') { skipped.push({ path: a.path, reason: 'script' }); continue; }
    const b = get(a.path);
    if (!b) { missing.push(a.path); continue; }
    if (b.length > ASSET_LIMITS.fileBytes) { skipped.push({ path: a.path, reason: 'size' }); continue; }
    out.push({ path: a.path, kind: a.kind, bytes: b.length, crc32: crc32(b), data: toBase64(b) });
  }
  const text = JSON.stringify({ format: STUDIO_PACK_FORMAT, version: 1, project: JSON.parse(serializeStudioProject(doc, ui || {}, 0)), files: out }) + '\n';
  return { text, missing, skipped };
}

/** Open a pack: the project (checked like `parseStudioProject`) and the files whose path, size, CRC-32 and data check out; the rest are listed in `problems`. */
export function unpackStudioProject(text: string): UnpackResult {
  const fail = (m: string) => new TimelineDocError([{ path: '', message: m }]);
  if (typeof text !== 'string' || text.length > ASSET_LIMITS.packBytes) throw fail('pack too large or not text');
  let j: any;
  try { j = JSON.parse(text); } catch (e) { throw fail(`invalid JSON (${(e as Error).message})`); }
  if (!j || j.format !== STUDIO_PACK_FORMAT) throw fail(`expected a ${STUDIO_PACK_FORMAT} file`);
  if (j.version !== 1) throw fail('unsupported pack version');
  if (!Array.isArray(j.files)) throw fail('files: expected an array');
  if (j.files.length > ASSET_LIMITS.assets) throw fail(`more than ${ASSET_LIMITS.assets} assets`);
  const project = parseStudioProject(j.project), files = new Map<string, Uint8Array>(), problems: UnpackProblem[] = [];
  for (const f of j.files) {
    const raw = f && typeof f.path === 'string' ? f.path : String(f && f.path);
    const no = (reason: string) => problems.push({ path: raw, reason });
    let p: string;
    try { p = normalizeAssetPath(raw); } catch (e) { no((e as AssetPathError).reason || 'path'); continue; }
    if (assetKind(p) === 'script') { no('script'); continue; }
    if (files.has(p)) { no('duplicate'); continue; }
    let b: Uint8Array;
    try { b = fromBase64(typeof f.data === 'string' ? f.data : '!'); } catch { no('data'); continue; }
    if (b.length > ASSET_LIMITS.fileBytes || b.length !== f.bytes) { no('bytes'); continue; }
    if (crc32(b) !== f.crc32) { no('crc32'); continue; }
    files.set(p, b);
  }
  return { project, files, problems };
}

let TABLE: Uint32Array | undefined;
/** CRC-32 (IEEE, as zip / PNG). */
export function crc32(b: Uint8Array): number {
  if (!TABLE) { TABLE = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TABLE[n] = c >>> 0; } }
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
/** Standard base64 (with padding). */
export function toBase64(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 3) {
    const n = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
    s += B64[n >> 18] + B64[(n >> 12) & 63] + (i + 1 < b.length ? B64[(n >> 6) & 63] : '=') + (i + 2 < b.length ? B64[n & 63] : '=');
  }
  return s;
}
/** Strict base64 decode (throws on bad length, characters or padding). */
export function fromBase64(s: string): Uint8Array {
  if (s.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(s)) throw new Error('[motionary] invalid base64');
  const pad = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0, out = new Uint8Array((s.length / 4) * 3 - pad);
  for (let i = 0, o = 0; i < s.length; i += 4) {
    const n = (B64.indexOf(s[i]) << 18) | (B64.indexOf(s[i + 1]) << 12) | ((B64.indexOf(s[i + 2]) & 63) << 6) | (B64.indexOf(s[i + 3]) & 63);
    out[o++] = n >> 16; if (o < out.length) out[o++] = (n >> 8) & 255; if (o < out.length) out[o++] = n & 255;
  }
  return out;
}
