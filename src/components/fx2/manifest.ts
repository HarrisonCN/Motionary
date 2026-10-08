/**
 * 6.9 — effect marketplace manifest (`motionary/components/marketplace`).
 *
 * A third-party effect pack is an ES module that exports its effects (an
 * `EffectDefinition[]` as `effects` or `default`) plus a JSON manifest:
 *
 * ```json
 * { "format": "motionary/effect-pack", "version": 1,
 *   "name": "@acme/motion-snow", "packVersion": "1.2.0",
 *   "description": "Snow and frost effects", "license": "MIT",
 *   "author": "Acme", "entry": "./dist/index.js", "requires": ">=6.9",
 *   "effects": [{ "name": "frost", "kind": "background", "description": "…",
 *                 "defaults": { "speed": 1 } }] }
 * ```
 *
 * `packManifest()` writes one from your effects, `validateManifest()` checks
 * one (format, semver, unique kebab-case names, known kinds, effects match
 * the module), and `loadEffectPack()` imports a pack (URL or module),
 * validates it and registers its effects — refusing names that already
 * exist unless `override`.
 */
import type { EffectDefinition } from '../fx/registry';
import { EFFECT_KINDS, registerEffect, hasEffect } from '../fx/registry';

export const EFFECT_PACK_FORMAT = 'motionary/effect-pack';

export interface EffectPackManifest {
  format: typeof EFFECT_PACK_FORMAT;
  version: 1;
  name: string;
  packVersion: string;
  description?: string;
  license?: string;
  author?: string;
  homepage?: string;
  entry?: string;
  requires?: string;
  keywords?: string[];
  effects: { name: string; kind: string; description?: string; defaults?: Record<string, unknown> }[];
}

const SEMVER = /^\d+\.\d+\.\d+(?:-[\w.]+)?$/;
const PKG = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/** Build a manifest from an effect pack. */
export function packManifest(name: string, packVersion: string, effects: EffectDefinition[], extra: Partial<Omit<EffectPackManifest, 'format' | 'version' | 'name' | 'packVersion' | 'effects'>> = {}): EffectPackManifest {
  return {
    format: EFFECT_PACK_FORMAT,
    version: 1,
    name,
    packVersion,
    ...extra,
    effects: effects.map((e) => ({ name: e.name, kind: e.kind, ...(e.description ? { description: e.description } : {}), ...(e.defaults ? { defaults: JSON.parse(JSON.stringify(e.defaults)) } : {}) })),
  };
}

/** Check a manifest (and optionally the module's effects against it). */
export function validateManifest(m: unknown, effects?: EffectDefinition[]): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const x = m as Partial<EffectPackManifest> | null;
  if (!x || typeof x !== 'object') return { ok: false, errors: ['manifest must be an object'] };
  if (x.format !== EFFECT_PACK_FORMAT) errors.push(`format must be "${EFFECT_PACK_FORMAT}"`);
  if (x.version !== 1) errors.push('version must be 1');
  if (!x.name || !PKG.test(x.name)) errors.push('name must be an npm package name');
  if (!x.packVersion || !SEMVER.test(x.packVersion)) errors.push('packVersion must be semver (x.y.z)');
  if (!Array.isArray(x.effects) || !x.effects.length) errors.push('effects must be a non-empty array');
  const seen = new Set<string>();
  for (const e of x.effects || []) {
    if (!e || !/^[a-z][a-z0-9-]*$/.test(e.name || '')) errors.push(`invalid effect name "${e?.name}"`);
    else if (seen.has(e.name)) errors.push(`duplicate effect "${e.name}"`);
    else seen.add(e.name);
    if (!e || !(EFFECT_KINDS as readonly string[]).includes(e.kind)) errors.push(`effect "${e?.name}": unknown kind "${e?.kind}"`);
  }
  if (effects) {
    const names = new Set(effects.map((e) => e.name));
    for (const n of seen) if (!names.has(n)) errors.push(`effect "${n}" is in the manifest but not exported`);
    for (const n of names) if (!seen.has(n)) errors.push(`effect "${n}" is exported but missing from the manifest`);
  }
  return { ok: !errors.length, errors };
}

/**
 * Import an effect pack (a URL / specifier, or an already imported module
 * with `effects` / `default` and `manifest`), validate and register it.
 * Returns the registered effect names.
 */
export async function loadEffectPack(src: string | { effects?: EffectDefinition[]; default?: EffectDefinition[]; manifest?: EffectPackManifest }, opts: { manifest?: EffectPackManifest; override?: boolean } = {}): Promise<string[]> {
  const mod: any = typeof src === 'string' ? await import(/* @vite-ignore */ src) : src;
  const effects: EffectDefinition[] = mod.effects || mod.default || [];
  const manifest = opts.manifest || mod.manifest;
  const v = validateManifest(manifest, effects);
  if (!v.ok) throw new Error(`[motionary] invalid effect pack: ${v.errors.join('; ')}`);
  const clash = effects.filter((e) => hasEffect(e.name));
  if (clash.length && !opts.override) throw new Error(`[motionary] effect pack "${manifest.name}" would replace ${clash.map((e) => e.name).join(', ')} (pass { override: true })`);
  for (const e of effects) registerEffect(e, { override: !!opts.override });
  return effects.map((e) => e.name);
}
