/**
 * 14.4 Motion Studio: save / load. A Studio project is `{ format: 'motionary-studio', version: 1, scene, studio }`:
 * `scene` is the document as Scene Format v2 (`timelineDocToScene`, lossless), `studio` is editor state (time, zoom,
 * fps, collapsed groups, spring parameters). `parseStudioProject` also opens a bare Scene v2 document, a
 * `motionary-timeline` v1 document or `<usa-player>` animation JSON, checks size and shape (never evaluates input) and
 * drops editor state that does not match the document. `sampleFrames` is the reference for "same animation":
 * every frame at a fixed frame rate, a pure function of the document.
 */
import { loadMotionDoc, timelineDocToScene, type SceneLoss } from '../timeline/editor/scene';
import { validateTimelineDoc, timelineDocDuration, TimelineDocError, TIMELINE_DOC_LIMITS, type TimelineDoc } from '../timeline/editor/format';
import { sampleTimelineDoc, type TimelineFrame } from '../timeline/editor/preview';
import { springBezier, springParams, type SpringParams } from './curve';
import type { SceneV2Doc } from '../scene/v2';

export const STUDIO_PROJECT_FORMAT = 'motionary-studio';
export const STUDIO_PROJECT_VERSION = 1;

/** Editor state saved with a project. */
export interface StudioUiState {
  /** Playhead (ms). */
  time?: number;
  /** Timeline zoom (px per second). */
  zoom?: number;
  fps?: number;
  /** Collapsed group ids. */
  collapsed?: string[];
  /** Keyframe id → the spring its easing was fitted from. */
  springs?: Record<string, SpringParams>;
}
export interface StudioProject { format: typeof STUDIO_PROJECT_FORMAT; version: 1; scene: SceneV2Doc; studio: StudioUiState }

const r4 = (n: number) => Math.round(n * 1e4) / 1e4 + 0;
const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const fail = (path: string, message: string) => new TimelineDocError([{ path, message }]);

/** `ms` snapped to the nearest frame at `fps` (4 decimals, like the editor model). */
export const frameTime = (ms: number, fps = 60): number => r4((Math.round((ms * fps) / 1000) * 1000) / fps);

/** Every frame of the document at `fps` from `from` to `to` (default 0 … duration): the reference for "same animation". */
export function sampleFrames(doc: TimelineDoc, o: { fps?: number; from?: number; to?: number } = {}): TimelineFrame[] {
  const fps = o.fps ?? 60, end = o.to ?? timelineDocDuration(doc), out: TimelineFrame[] = [];
  for (let n = Math.round(((o.from ?? 0) * fps) / 1000), t = 0; (t = frameTime((n * 1000) / fps, fps)) <= end + 1e-9 && out.length < 1e5; n++) out.push(sampleTimelineDoc(doc, t));
  return out;
}

/** Editor state checked against the document: unknown ids, bad numbers and stale springs are dropped. */
export function cleanUiState(doc: TimelineDoc, s: unknown): StudioUiState {
  const ui: StudioUiState = {};
  if (!isObj(s)) return ui;
  const num = (v: unknown, lo: number, hi: number, d: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
  if (s.time !== undefined) ui.time = num(s.time, 0, TIMELINE_DOC_LIMITS.time, 0);
  if (s.zoom !== undefined) ui.zoom = num(s.zoom, 1, 10000, 100);
  if (s.fps !== undefined) ui.fps = Number.isInteger(s.fps) && s.fps >= 1 && s.fps <= 240 ? s.fps : 60;
  const groups = new Set(doc.layers.filter((l) => l.type === 'group').map((l) => l.id));
  if (Array.isArray(s.collapsed)) ui.collapsed = [...new Set(s.collapsed.filter((id: unknown) => typeof id === 'string' && groups.has(id)))] as string[];
  if (isObj(s.springs)) {
    const easing = new Map(doc.layers.flatMap((l) => (l.keyframes || []).map((k) => [k.id, k.easing ?? 'linear'] as const)));
    const sp: Record<string, SpringParams> = {};
    for (const id of Object.keys(s.springs)) {
      const v = s.springs[id];
      if (!isObj(v) || !['stiffness', 'damping', 'mass'].every((k) => typeof v[k] === 'number' && Number.isFinite(v[k]))) continue;
      const p = springParams(v);
      if (easing.get(id) === springBezier(p).easing) sp[id] = p;
    }
    if (Object.keys(sp).length) ui.springs = sp;
  }
  return ui;
}

/** The project as JSON text (stable: the same document and state always give the same text). */
export function serializeStudioProject(doc: TimelineDoc, ui: StudioUiState = {}, space: number | string = 2): string {
  const p: StudioProject = { format: STUDIO_PROJECT_FORMAT, version: 1, scene: timelineDocToScene(doc), studio: cleanUiState(doc, ui) };
  return JSON.stringify(p, null, space) + (space ? '\n' : '');
}

export interface ParseStudioProjectOptions {
  /** `sceneV3ToV2` from motionary/scene/v3: opens nested Scene v3 (compositions, component instances). Without it only flat v3 opens. */
  sceneV3ToV2?: (doc: any) => { doc: any; lost: SceneLoss[] };
}
/**
 * Open a Studio project, a Scene v3 / v2 document (nested v3 only with `opts.sceneV3ToV2`), a timeline v1 document or animation JSON (object or text). Throws a
 * `TimelineDocError` for anything malformed or over the limits; `lost` lists what a scene had that the editor cannot hold.
 */
export function parseStudioProject(input: unknown, opts?: ParseStudioProjectOptions): { doc: TimelineDoc; ui: StudioUiState; lost: SceneLoss[] } {
  let d: any = input;
  if (typeof input === 'string') {
    if (input.length > TIMELINE_DOC_LIMITS.textBytes) throw fail('', `text longer than ${TIMELINE_DOC_LIMITS.textBytes} characters`);
    try { d = JSON.parse(input); } catch (e) { throw fail('', `invalid JSON (${(e as Error).message})`); }
  }
  if (!isObj(d)) throw fail('', 'expected an object');
  let ui: unknown;
  if (d.format === STUDIO_PROJECT_FORMAT) {
    if (d.version !== STUDIO_PROJECT_VERSION) throw fail('version', `expected ${STUDIO_PROJECT_VERSION}`);
    ui = d.studio;
    d = d.scene;
    if (!isObj(d) || d.format !== 'motionary-scene') throw fail('scene', 'expected a Scene Format v3 / v2 document');
  }
  let lost3: SceneLoss[] = [];
  if (opts?.sceneV3ToV2 && d.format === 'motionary-scene' && d.version === 3 && Array.isArray(d.layers)) {
    // 16.0: nested Scene v3 through the caller's full reader (comps → groups, component instances expanded, losses reported); flat v3 opens below
    try { const f = opts.sceneV3ToV2(d); d = f.doc; lost3 = f.lost; } catch (e) { throw fail('scene', `unreadable Scene v3 (${(e as Error)?.message || e})`); }
  }
  if (d.format === 'motionary-scene') {
    // shape check before mapping (the mapping trusts its input)
    const ok = Array.isArray(d.layers) && d.layers.length <= TIMELINE_DOC_LIMITS.layers && d.layers.every((l: any) =>
      isObj(l) && (l.keyframes === undefined || (Array.isArray(l.keyframes) && l.keyframes.every((k: any) => isObj(k) && isObj(k.props)))));
    if (!ok) throw fail('layers', 'malformed scene layers');
  }
  let r: { doc: TimelineDoc; lost: SceneLoss[] };
  try { r = loadMotionDoc(d); } catch (e) { throw e instanceof TimelineDocError ? e : fail('', String((e as Error)?.message || e)); }
  const problems = validateTimelineDoc(r.doc);
  if (problems.length) throw new TimelineDocError(problems);
  return { doc: r.doc, ui: cleanUiState(r.doc, ui), lost: [...lost3, ...r.lost] };
}
