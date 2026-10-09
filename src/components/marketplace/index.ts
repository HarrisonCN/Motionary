/**
 * `motionary/marketplace` (= `motionary/components/marketplace`, 9.0 GA) —
 * the plugin marketplace. Builds on the 6.9 effect-pack manifest
 * (`packManifest`, `validateManifest`, `loadEffectPack`) with:
 *
 * - **`MARKETPLACE`** — the first-party catalogue: every Motionary effect
 *   pack as a marketplace listing (name, entry, effects, tags, since).
 * - **`searchPlugins(query, list?)`** — ranked search over names,
 *   descriptions, tags and effect names.
 * - **`installPlugin(listing | url, { load })`** — imports a pack (your
 *   `load` can map entries to bundler imports), validates it and registers
 *   its effects; remembered by `installedPlugins()`.
 * - **`fetchMarketplace(url)`** — read a third-party index
 *   (`{ "format": "motionary/marketplace", "version": 1, "plugins": [...] }`).
 */
import type { EffectDefinition } from '../fx/registry';
import { loadEffectPack } from '../fx2/manifest';

export { EFFECT_PACK_FORMAT, packManifest, validateManifest, loadEffectPack } from '../fx2/manifest';
export type { EffectPackManifest } from '../fx2/manifest';
export { pluginIntegrity, verifyPlugin, satisfies, checkCompat } from './sign';
export type { CompatResult } from './sign';

export const MARKETPLACE_FORMAT = 'motionary/marketplace';
export interface PluginListing {
  name: string;
  title: string;
  description: string;
  entry: string;
  register: string;
  effects: string[];
  tags: string[];
  since: string;
  author?: string;
  official?: boolean;
}

const L = (name: string, title: string, description: string, entry: string, register: string, effects: string, tags: string, since: string): PluginListing => ({ name, title, description, entry, register, effects: effects.split(' '), tags: tags.split(' '), since, author: 'Motionary', official: true });

/** The first-party catalogue (9.0). */
export const MARKETPLACE: PluginListing[] = [
  L('motionary/fx/festival', 'Festival', 'Fireworks, lanterns, Christmas snow and spooky floats.', 'motionary/fx/festival', 'registerFestivalPack', 'firework-burst lantern-rise xmas-snow spooky-float', 'holiday celebration seasonal', '8.1'),
  L('motionary/fx/retro', 'Retro', 'Pixel, CRT, VHS and Y2K looks.', 'motionary/fx/retro', 'registerRetroPack', 'pixelate-in crt-power vhs-glitch y2k-shine', 'pixel 8-bit vintage', '8.2'),
  L('motionary/fx/organic', 'Organic', 'Vines, blooms, water drops and breathing blobs.', 'motionary/fx/organic', 'registerOrganicPack', 'vine-grow bloom water-drop breathe', 'nature blob liquid', '8.3'),
  L('motionary/fx/cyber', 'Cyber', 'HUD lock-on, scanlines, holograms and data decode.', 'motionary/fx/cyber', 'registerCyberPack', 'hud-frame scanline-sweep hologram data-decode', 'sci-fi hud glitch', '8.4'),
  L('motionary/fx/paper', 'Paper & hand-drawn', 'Paper unfold, pencil sketch, watercolor and crumple.', 'motionary/fx/paper', 'registerPaperPack', 'paper-unfold pencil-sketch watercolor crumple', 'sketch paper drawing', '8.5'),
  L('motionary/fx/surface', 'Surface themes', 'Neon ignite and pulse, glass frost, neumorphic press.', 'motionary/fx/surface', 'registerSurfacePack', 'neon-ignite neon-pulse glass-frost neu-press', 'neon glassmorphism neumorphism theme', '8.6'),
  L('motionary/fx/gesture', 'Gestures 3.0', 'Swipe and pinch hints, tilt wobble, depth-in.', 'motionary/fx/gesture', 'registerGesture3Pack', 'swipe-hint pinch-hint tilt-wobble depth-in', 'touch onboarding 3d', '8.7'),
  L('motionary/fx/spatial', 'XR / spatial', 'Portal open, orbit-in, spatial float and depth pop.', 'motionary/fx/spatial', 'registerSpatialPack', 'portal-open orbit-in spatial-float depth-pop', 'xr vr visionos 3d', '8.8'),
  L('motionary/fx/cinema', 'Cinematic', 'Dolly-in, pan reveal, letterbox and rack focus.', 'motionary/fx/cinema', 'registerCinemaPack', 'dolly-in pan-reveal letterbox rack-focus', 'film camera story', '9.1'),
  L('motionary/fx/lottie', 'Lottie & Rive', 'Lottie import (keyframes + SVG), Rive state-machine inputs, icon pop.', 'motionary/fx/lottie', 'registerLottiePack', 'lottie-play icon-pop', 'lottie rive after-effects icons', '9.2'),
  L('motionary/fx/genart', 'Generative art 2.0', 'Halftone print-in, drifting mesh gradients, kaleidoscope and film grain.', 'motionary/fx/genart', 'registerGenArtPack', 'halftone-in mesh-drift kaleido grain-flicker', 'generative gradient grain art', '9.3'),
  L('motionary/fx/video', 'Video motion', 'Scroll-driven video and frame sequences, film burn, jump cut.', 'motionary/fx/video', 'registerVideoPack', 'film-burn jump-cut', 'video scroll film', '9.4'),
  L('motionary/fx/safe', 'Accessible motion 2.0', 'Motion that never moves: safe fade, focus glow, colour pulse, underline sweep.', 'motionary/fx/safe', 'registerSafePack', 'safe-fade focus-glow color-pulse underline-sweep', 'a11y accessibility vestibular reduced-motion', '9.5'),
  L('motionary/fx/perf', 'Performance 3.0', 'Idle-time reveals and compositor-only hover lifts; OffscreenCanvas / Worker helpers.', 'motionary/fx/perf', 'registerPerf3Pack', 'idle-reveal gpu-lift', 'performance worker offscreen', '9.6'),
];

/** Ranked search over listings (name / title / tags / effects / description) (9.0). */
export function searchPlugins(query: string, list: PluginListing[] = MARKETPLACE): PluginListing[] {
  const q = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!q.length) return list.slice();
  const score = (p: PluginListing) =>
    q.reduce((s, w) => {
      let n = 0;
      if (p.title.toLowerCase().includes(w)) n += 5;
      if (p.tags.some((t) => t.includes(w))) n += 4;
      if (p.effects.some((e) => e.includes(w))) n += 3;
      if (p.name.toLowerCase().includes(w)) n += 2;
      if (p.description.toLowerCase().includes(w)) n += 1;
      return n ? s + n : -1e9;
    }, 0);
  return list
    .map((p) => [p, score(p)] as const)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p);
}

const installed = /*#__PURE__*/ new Map<string, string[]>();
/** Names of installed plugins → their registered effects (9.0). */
export function installedPlugins(): Record<string, string[]> {
  return Object.fromEntries(installed);
}

/**
 * Install a plugin: `load(entry)` imports the module (default: dynamic `import()`), then its
 * `register*` function runs (first-party listing) or its `effects` are validated and registered
 * through `loadEffectPack` (third-party pack). Returns the registered effect names (9.0).
 */
export async function installPlugin(p: PluginListing | string, opts: { load?: (entry: string) => Promise<any>; override?: boolean } = {}): Promise<string[]> {
  const listing = typeof p === 'string' ? null : p;
  const entry = listing ? listing.entry : (p as string);
  const key = listing ? listing.name : entry;
  if (installed.has(key)) return installed.get(key) as string[];
  const load = opts.load || ((u: string) => import(/* @vite-ignore */ u));
  const mod = await load(entry);
  let names: string[];
  if (listing && typeof mod?.[listing.register] === 'function') {
    mod[listing.register]();
    names = listing.effects.slice();
  } else names = await loadEffectPack(mod as { effects?: EffectDefinition[]; default?: EffectDefinition[] }, { override: opts.override, manifest: mod?.manifest });
  installed.set(key, names);
  return names;
}

/** Read a marketplace index (`{ format: "motionary/marketplace", version: 1, plugins }`) (9.0). */
export async function fetchMarketplace(url: string, fetcher: typeof fetch = fetch): Promise<PluginListing[]> {
  const r = await fetcher(url);
  const j = await r.json();
  if (j?.format !== MARKETPLACE_FORMAT || j?.version !== 1 || !Array.isArray(j.plugins)) throw new Error(`[motionary] ${url} is not a ${MARKETPLACE_FORMAT} v1 index`);
  return j.plugins.filter((p: any) => p && typeof p.name === 'string' && typeof p.entry === 'string').map((p: any) => ({ title: p.name, description: '', register: '', effects: [], tags: [], since: '', ...p }));
}
