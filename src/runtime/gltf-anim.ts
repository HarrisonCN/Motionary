/**
 * `motionary/runtime/gltf-anim` (10.8) — glTF 2.0 animation, skinning and
 * morph targets for models loaded by `motionary/runtime/format-gltf`
 * (own implementation; requires `use(gl, formatGltf, gltfAnim)`).
 *
 * - animation channels on node `translation` / `rotation` / `scale` /
 *   `weights` with `LINEAR` (quaternions slerped), `STEP` and
 *   `CUBICSPLINE` (Hermite with in / out tangents) samplers;
 * - morph targets (POSITION + NORMAL deltas) with mesh default weights,
 *   node weights and animated weights;
 * - skins: joint hierarchy, inverse bind matrices, 4 joints / vertex
 *   (JOINTS_0 / WEIGHTS_0), skinned on the CPU and re-uploaded each frame
 *   (`geometry.version`), so it works with every runtime/gl material;
 * - `gltfAnimator(model)` plays a clip (by name or index) with loop / speed
 *   / seek, `update(dt)` from your loop or `play()` on the shared ticker.
 *
 * Sampling and deformation are pure (SSR / workers / tests).
 */
import { RUNTIME_VERSION, requireModule, type RuntimeModule } from './registry';
import type { CoreApi } from './index';
import { mat4, quatSlerp, type GlNode, type Geometry, type Mat4, type Quat } from './gl';

type Num = number;
export type ChannelPath = 'translation' | 'rotation' | 'scale' | 'weights';
export type Interpolation = 'LINEAR' | 'STEP' | 'CUBICSPLINE';
export interface GltfChannel {
  node: GlNode;
  path: ChannelPath;
  interpolation: Interpolation;
  times: Float32Array;
  values: Float32Array;
  /** Components per key (3, 4 or the morph target count). */
  size: Num;
}
export interface GltfClip {
  name: string;
  duration: Num;
  channels: GltfChannel[];
}

/** Morph / skin source data kept on a geometry by format-gltf (10.8). */
export interface DeformSource {
  positions: Float32Array;
  normals?: Float32Array;
  joints?: Float32Array;
  weights?: Float32Array;
  targets?: { positions?: Float32Array; normals?: Float32Array }[];
}

const model = (root: GlNode): { gltf: any; nodes: GlNode[]; read: (i: Num) => Float32Array } => {
  const x = root.extras as any;
  if (!x?.gltf || !x.read) throw new Error('[motionary] gltf-anim: pass the node returned by loadGltf() / gltfToNode() (motionary/runtime/format-gltf 10.8+)');
  return x;
};

/** The animation clips of a loaded model. */
export function gltfClips(root: GlNode): GltfClip[] {
  const { gltf, nodes, read } = model(root);
  return (gltf.animations || []).map((a: any, ai: Num) => {
    let duration = 0;
    const channels: GltfChannel[] = [];
    for (const c of a.channels || []) {
      const node = nodes[c.target?.node];
      const s = a.samplers?.[c.sampler];
      if (!node || !s || !['translation', 'rotation', 'scale', 'weights'].includes(c.target.path)) continue; // KHR_animation_pointer etc.
      const times = read(s.input), values = read(s.output);
      const interpolation: Interpolation = s.interpolation || 'LINEAR';
      const size = values.length / times.length / (interpolation === 'CUBICSPLINE' ? 3 : 1);
      duration = Math.max(duration, times[times.length - 1] || 0);
      channels.push({ node, path: c.target.path, interpolation, times, values, size });
    }
    return { name: a.name || `animation${ai}`, duration, channels };
  });
}

/** Value of a channel at time `t` (seconds; clamped to the key range). */
export function sampleChannel(ch: GltfChannel, t: Num): Num[] {
  const { times: T, values: V, size: n } = ch;
  const cubic = ch.interpolation === 'CUBICSPLINE';
  const at = (k: Num) => Array.from(V.subarray((cubic ? k * 3 + 1 : k) * n, (cubic ? k * 3 + 1 : k) * n + n));
  const last = T.length - 1;
  if (t <= T[0] || last === 0) return at(0);
  if (t >= T[last]) return at(last);
  let k = 0;
  while (k < last - 1 && T[k + 1] <= t) k++;
  const td = T[k + 1] - T[k], s = (t - T[k]) / td;
  let out: Num[];
  if (ch.interpolation === 'STEP') return at(k);
  if (cubic) {
    const s2 = s * s, s3 = s2 * s;
    const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
    const p0 = k * 3 * n, p1 = (k + 1) * 3 * n;
    out = Array.from({ length: n }, (_, i) => h00 * V[p0 + n + i] + h10 * td * V[p0 + 2 * n + i] + h01 * V[p1 + n + i] + h11 * td * V[p1 + i]);
    if (ch.path === 'rotation') {
      const l = Math.hypot(...out) || 1;
      out = out.map((v) => v / l);
    }
    return out;
  }
  const a = at(k), b = at(k + 1);
  if (ch.path === 'rotation') return quatSlerp(a as Quat, b as Quat, s);
  return a.map((v, i) => v + (b[i] - v) * s);
}

/** Pose the model at time `t` of a clip (sets node TRS and morph weights). */
export function applyClip(clip: GltfClip, t: Num): void {
  for (const ch of clip.channels) {
    const v = sampleChannel(ch, t);
    const n = ch.node;
    if (ch.path === 'weights') n.extras.weights = v;
    else {
      n.matrix = null; // animated nodes are TRS (glTF spec)
      if (ch.path === 'translation') n.position = v as [Num, Num, Num];
      else if (ch.path === 'rotation') n.rotation = v as Quat;
      else n.scale = v as [Num, Num, Num];
    }
  }
}

const meshesOf = (n: GlNode) => (n.mesh ? (Array.isArray(n.mesh) ? n.mesh : [n.mesh]) : []);

/**
 * Apply morph weights and skins to every deformable mesh of the model
 * (call after posing; updates world matrices). Returns how many meshes changed.
 */
export function deformModel(root: GlNode): Num {
  const { gltf, nodes, read } = model(root);
  root.updateWorld();
  let changed = 0;
  const cache = ((root.extras as any).skinCache ||= {}) as Record<Num, { joints: GlNode[]; ibm: Mat4[] }>;
  for (const node of nodes) {
    const ms = meshesOf(node);
    if (!ms.length) continue;
    const si = node.extras.skin as Num | undefined;
    let jm: Mat4[] | null = null;
    if (si !== undefined && gltf.skins?.[si]) {
      const sk = gltf.skins[si];
      const c = (cache[si] ||= {
        joints: sk.joints.map((j: Num) => nodes[j]),
        ibm: sk.joints.map((_: Num, i: Num) => (sk.inverseBindMatrices !== undefined ? new Float32Array(read(sk.inverseBindMatrices).subarray(i * 16, i * 16 + 16)) : mat4.identity())),
      });
      const inv = mat4.invert(node.world) || mat4.identity();
      jm = c.joints.map((j, i) => mat4.multiply(inv, mat4.multiply(j.world, c.ibm[i])));
    }
    const w = (node.extras.weights as Num[] | undefined) || [];
    for (const m of ms) {
      const g = m.geometry as Geometry & { deform?: DeformSource };
      const src = g.deform;
      if (!src || (!jm && !src.targets?.length)) continue;
      deformGeometry(g, src, w, jm);
      changed++;
    }
  }
  return changed;
}

/** Morph + skin one geometry from its source data (pure). */
export function deformGeometry(g: Geometry, src: DeformSource, weights: Num[], joints: Mat4[] | null): void {
  const P = src.positions, N = src.normals, n = P.length / 3;
  const pos = g.positions !== P && g.positions.length === P.length ? g.positions : (g.positions = new Float32Array(P.length));
  const nrm = N ? (g.normals && g.normals !== N && g.normals.length === N.length ? g.normals : (g.normals = new Float32Array(N.length))) : null;
  pos.set(P);
  if (nrm && N) nrm.set(N);
  (src.targets || []).forEach((tg, k) => {
    const wk = weights[k] || 0;
    if (!wk) return;
    if (tg.positions) for (let i = 0; i < pos.length; i++) pos[i] += wk * tg.positions[i];
    if (tg.normals && nrm) for (let i = 0; i < nrm.length; i++) nrm[i] += wk * tg.normals[i];
  });
  if (joints && src.joints && src.weights) {
    const J = src.joints, W = src.weights, m = new Float32Array(16);
    for (let v = 0; v < n; v++) {
      m.fill(0);
      let tw = 0;
      for (let k = 0; k < 4; k++) {
        const wt = W[v * 4 + k];
        if (!wt) continue;
        const jm = joints[J[v * 4 + k]];
        if (!jm) continue;
        tw += wt;
        for (let e = 0; e < 16; e++) m[e] += wt * jm[e];
      }
      if (!tw) continue;
      const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
      pos[v * 3] = m[0] * x + m[4] * y + m[8] * z + m[12];
      pos[v * 3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
      pos[v * 3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      if (nrm) {
        const a = nrm[v * 3], b = nrm[v * 3 + 1], c = nrm[v * 3 + 2];
        const nx = m[0] * a + m[4] * b + m[8] * c, ny = m[1] * a + m[5] * b + m[9] * c, nz = m[2] * a + m[6] * b + m[10] * c;
        const l = Math.hypot(nx, ny, nz) || 1;
        nrm[v * 3] = nx / l;
        nrm[v * 3 + 1] = ny / l;
        nrm[v * 3 + 2] = nz / l;
      }
    }
  }
  g.version = (g.version || 0) + 1;
}

export interface GltfAnimatorOptions {
  /** Clip name or index (default 0). */
  clip?: string | Num;
  loop?: boolean;
  speed?: Num;
}
export interface GltfAnimator {
  readonly clips: GltfClip[];
  readonly clip: GltfClip | null;
  time: Num;
  speed: Num;
  loop: boolean;
  readonly playing: boolean;
  /** Switch clip (name or index); keeps playing state. */
  use(clip: string | Num): void;
  seek(t: Num): void;
  /** Advance by `dt` seconds and pose + deform. */
  update(dt: Num): void;
  /** Run on the shared ticker. */
  play(): void;
  pause(): void;
  dispose(): void;
}

/** A clip player for a loaded model. */
export function gltfAnimator(root: GlNode, o: GltfAnimatorOptions = {}): GltfAnimator {
  const clips = gltfClips(root);
  let clip: GltfClip | null = null, off: (() => void) | null = null;
  const pick = (c: string | Num) => (typeof c === 'number' ? clips[c] : clips.find((x) => x.name === c) || clips[Number(c)]) || null;
  const pose = () => {
    if (clip) applyClip(clip, a.time);
    deformModel(root);
  };
  const a: GltfAnimator = {
    clips,
    get clip() {
      return clip;
    },
    time: 0,
    speed: o.speed ?? 1,
    loop: o.loop ?? true,
    get playing() {
      return !!off;
    },
    use(c) {
      clip = pick(c);
      a.time = 0;
      pose();
    },
    seek(t) {
      const d = clip?.duration || 0;
      a.time = d ? (a.loop ? ((t % d) + d) % d : Math.min(d, Math.max(0, t))) : 0;
      pose();
    },
    update(dt) {
      a.seek(a.time + dt * a.speed);
    },
    play() {
      if (!off) off = requireModule<CoreApi>('core', 'motionary/runtime/gltf-anim').getTicker().add((_, ms) => a.update(Math.min(ms, 100) / 1000));
    },
    pause() {
      off?.();
      off = null;
    },
    dispose() {
      a.pause();
    },
  };
  clip = pick(o.clip ?? 0);
  pose();
  return a;
}

export interface GltfAnimApi {
  gltfClips: typeof gltfClips;
  sampleChannel: typeof sampleChannel;
  applyClip: typeof applyClip;
  deformModel: typeof deformModel;
  deformGeometry: typeof deformGeometry;
  gltfAnimator: typeof gltfAnimator;
}

export const gltfAnim: RuntimeModule<GltfAnimApi> = { id: 'gltf-anim', version: RUNTIME_VERSION, tier: 'advanced', requires: ['core', 'gl', 'format-gltf'], api: { gltfClips, sampleChannel, applyClip, deformModel, deformGeometry, gltfAnimator } };
