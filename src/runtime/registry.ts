/**
 * Module registry shared by every copy of `motionary/runtime` on the page
 * (ESM, CJS and the CDN IIFE builds all read the same `globalThis` slot),
 * so a component never needs to import the runtime itself — it asks for a
 * module with `requireModule()` and gets a clear error when it is missing.
 * Nothing here touches `window` / `document`: safe to import during SSR and
 * inside Web Workers.
 */

/** Runtime version (kept in sync with the package version by the release script). */
export const RUNTIME_VERSION = '12.0.0';

/** Where the CDN builds live (major-pinned). */
export const RUNTIME_CDN = 'https://cdn.jsdelivr.net/npm/motionary@12/dist/';

/**
 * 11.4: runtime tiers. **basic** — ticker, tween, timeline, scroll, text, CSS / WAAPI keyframes; **standard** — smooth
 * scrolling, drag-snap, SVG, sprites, GIF / APNG / WebP, Lottie; **advanced** — WebGL, 3D file parsing and decoders,
 * physics. A page that only uses basic modules never downloads standard or advanced code.
 */
export type RuntimeTier = 'basic' | 'standard' | 'advanced';
export const TIER_ORDER: readonly RuntimeTier[] = ['basic', 'standard', 'advanced'];
/** The tier of every runtime module id (and of the optional peer runtimes components can use). */
export const RUNTIME_TIERS: Readonly<Record<string, RuntimeTier>> = {
  'core': 'basic',
  'scroll': 'basic',
  'text': 'basic',
  'format-css': 'basic',
  'format-motion': 'basic',
  'smooth': 'standard',
  'drag-snap': 'standard',
  'format-svg': 'standard',
  'format-sprite': 'standard',
  'format-gif': 'standard',
  'format-apng': 'standard',
  'format-webp': 'standard',
  'vector': 'standard',
  'lottie-state': 'standard',
  'rive': 'standard',
  'gl': 'advanced',
  'format-gltf': 'advanced',
  'format-obj': 'advanced',
  'gltf-anim': 'advanced',
  'gltf-decoders': 'advanced',
  'basis-transcoder': 'advanced',
  'draco3d': 'advanced',
  'physics': 'advanced',
  'format-scene': 'advanced',
};
/** The tier of a module id (`undefined` for an unknown id). */
export const tierOf = (id: string): RuntimeTier | undefined => RUNTIME_TIERS[id];
/** The highest tier among module ids — what a component that requires them costs (`basic` for none). */
export function maxTier(ids: readonly string[] = []): RuntimeTier {
  let i = 0;
  for (const id of ids) i = Math.max(i, TIER_ORDER.indexOf(RUNTIME_TIERS[id] ?? 'basic'));
  return TIER_ORDER[i];
}

/** A runtime module: `{ id, version, api }`, registered with `use()`. */
export interface RuntimeModule<A = unknown> {
  /** Module id: 'core', 'format-css', 'scroll', … (import path `motionary/runtime/<id>`). */
  id: string;
  version: string;
  /** Other modules this one needs (registered first by `use()` callers). */
  requires?: string[];
  /** 11.4: runtime tier — basic · standard · advanced (docs/runtime-tiers.md). */
  tier?: RuntimeTier;
  /** The module's public API (what `requireModule(id)` returns). */
  api: A;
  /** Optional one-time setup, called on first registration. */
  setup?(registry: RuntimeRegistry): void;
}

export interface RuntimeRegistry {
  version: string;
  modules: Map<string, RuntimeModule>;
  /** Shared per-page state slots (the ticker lives here). */
  slots: Record<string, unknown>;
}

const KEY = /*#__PURE__*/ Symbol.for('motionary.runtime');

/** The page-wide registry (created on first use). */
export function registry(): RuntimeRegistry {
  const g = globalThis as unknown as Record<symbol, RuntimeRegistry | undefined>;
  return (g[KEY] ||= { version: RUNTIME_VERSION, modules: new Map(), slots: {} });
}

/** The import path of a module id. */
export const modulePath = (id: string): string => (id === 'core' ? 'motionary/runtime' : `motionary/runtime/${id}`);

/** The CDN IIFE file of a module id. */
export const moduleCdn = (id: string): string => RUNTIME_CDN + (id === 'core' ? 'runtime.iife.js' : `runtime/${id}.iife.js`);

/** The text of the "module missing" error (shared with the components). */
export function missingMessage(id: string, who = 'This feature'): string {
  const path = modulePath(id);
  const reg = id === 'core' ? `import { use } from 'motionary/runtime'; use();` : `import { use } from 'motionary/runtime'; import { ${camel(id)} } from '${path}'; use(${camel(id)});`;
  const cdn = id === 'core' ? `<script src="${moduleCdn('core')}"></script>` : `<script src="${moduleCdn('core')}"></script><script src="${moduleCdn(id)}"></script>`;
  return `[motionary] ${who} requires ${path}. Install once: npm i motionary — then register it before the component mounts: ${reg} Or from a CDN (core first): ${cdn} Docs: https://github.com/HarrisonCN/Motionary/blob/main/docs/runtime/${id}.md`;
}

/** 'format-css' → 'formatCss' (the module object's export name). */
export const camel = (id: string): string => id.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());

/** Thrown by `requireModule()` when a module is not registered. */
export class RuntimeModuleError extends Error {
  readonly module: string;
  constructor(id: string, who?: string) {
    super(missingMessage(id, who));
    this.name = 'RuntimeModuleError';
    this.module = id;
  }
}

/** Register modules (each once; re-registering the same id keeps the first). Returns the registry. */
export function register(...mods: RuntimeModule[]): RuntimeRegistry {
  const r = registry();
  for (const m of mods) {
    if (!m || typeof m.id !== 'string') throw new TypeError('[motionary] use(): not a runtime module');
    if (r.modules.has(m.id)) continue;
    for (const dep of m.requires || []) if (!r.modules.has(dep)) throw new RuntimeModuleError(dep, `motionary/runtime/${m.id}`);
    r.modules.set(m.id, m as RuntimeModule);
    m.setup?.(r);
  }
  return r;
}

/** Is a module registered? */
export const hasModule = (id: string): boolean => registry().modules.has(id);

/** The API of a registered module, or a `RuntimeModuleError` with install / import / CDN instructions. */
export function requireModule<A = unknown>(id: string, who?: string): A {
  const m = registry().modules.get(id);
  if (!m) throw new RuntimeModuleError(id, who);
  return m.api as A;
}

/** Ids of the registered modules. */
export const registeredModules = (): string[] => Array.from(registry().modules.keys());
