'use strict';

var registry = require('./registry-BB1oO-lR.cjs');

const EFFECT_PACK_FORMAT = 'motionary/effect-pack';
const SEMVER = /^\d+\.\d+\.\d+(?:-[\w.]+)?$/;
const PKG = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
/** Build a manifest from an effect pack. */
function packManifest(name, packVersion, effects, extra = {}) {
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
function validateManifest(m, effects) {
    const errors = [];
    const x = m;
    if (!x || typeof x !== 'object')
        return { ok: false, errors: ['manifest must be an object'] };
    if (x.format !== EFFECT_PACK_FORMAT)
        errors.push(`format must be "${EFFECT_PACK_FORMAT}"`);
    if (x.version !== 1)
        errors.push('version must be 1');
    if (!x.name || !PKG.test(x.name))
        errors.push('name must be an npm package name');
    if (!x.packVersion || !SEMVER.test(x.packVersion))
        errors.push('packVersion must be semver (x.y.z)');
    if (!Array.isArray(x.effects) || !x.effects.length)
        errors.push('effects must be a non-empty array');
    const seen = new Set();
    for (const e of x.effects || []) {
        if (!e || !/^[a-z][a-z0-9-]*$/.test(e.name || ''))
            errors.push(`invalid effect name "${e?.name}"`);
        else if (seen.has(e.name))
            errors.push(`duplicate effect "${e.name}"`);
        else
            seen.add(e.name);
        if (!e || !registry.EFFECT_KINDS.includes(e.kind))
            errors.push(`effect "${e?.name}": unknown kind "${e?.kind}"`);
    }
    if (effects) {
        const names = new Set(effects.map((e) => e.name));
        for (const n of seen)
            if (!names.has(n))
                errors.push(`effect "${n}" is in the manifest but not exported`);
        for (const n of names)
            if (!seen.has(n))
                errors.push(`effect "${n}" is exported but missing from the manifest`);
    }
    return { ok: !errors.length, errors };
}
/**
 * Import an effect pack (a URL / specifier, or an already imported module
 * with `effects` / `default` and `manifest`), validate and register it.
 * Returns the registered effect names.
 */
async function loadEffectPack(src, opts = {}) {
    const mod = typeof src === 'string' ? await import(/* @vite-ignore */ src) : src;
    const effects = mod.effects || mod.default || [];
    const manifest = opts.manifest || mod.manifest;
    const v = validateManifest(manifest, effects);
    if (!v.ok)
        throw new Error(`[motionary] invalid effect pack: ${v.errors.join('; ')}`);
    const clash = effects.filter((e) => registry.hasEffect(e.name));
    if (clash.length && !opts.override)
        throw new Error(`[motionary] effect pack "${manifest.name}" would replace ${clash.map((e) => e.name).join(', ')} (pass { override: true })`);
    for (const e of effects)
        registry.registerEffect(e, { override: !!opts.override });
    return effects.map((e) => e.name);
}

exports.EFFECT_PACK_FORMAT = EFFECT_PACK_FORMAT;
exports.loadEffectPack = loadEffectPack;
exports.packManifest = packManifest;
exports.validateManifest = validateManifest;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.0/dist/chunks/manifest-Bcz6rQ20.cjs.map