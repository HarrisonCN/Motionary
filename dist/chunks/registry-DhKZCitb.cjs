'use strict';

/**
 * Module registry shared by every copy of `motionary/runtime` on the page
 * (ESM, CJS and the CDN IIFE builds all read the same `globalThis` slot),
 * so a component never needs to import the runtime itself — it asks for a
 * module with `requireModule()` and gets a clear error when it is missing.
 * Nothing here touches `window` / `document`: safe to import during SSR and
 * inside Web Workers.
 */
/** Runtime version (kept in sync with the package version by the release script). */
const RUNTIME_VERSION = '10.7.0';
/** Where the CDN builds live (major-pinned). */
const RUNTIME_CDN = 'https://cdn.jsdelivr.net/npm/motionary@10/dist/';
const KEY = Symbol.for('motionary.runtime');
/** The page-wide registry (created on first use). */
function registry() {
    const g = globalThis;
    return (g[KEY] || (g[KEY] = { version: RUNTIME_VERSION, modules: new Map(), slots: {} }));
}
/** The import path of a module id. */
const modulePath = (id) => (id === 'core' ? 'motionary/runtime' : `motionary/runtime/${id}`);
/** The CDN IIFE file of a module id. */
const moduleCdn = (id) => RUNTIME_CDN + (id === 'core' ? 'runtime.iife.js' : `runtime/${id}.iife.js`);
/** The text of the "module missing" error (shared with the components). */
function missingMessage(id, who = 'This feature') {
    const path = modulePath(id);
    const reg = id === 'core' ? `import { use } from 'motionary/runtime'; use();` : `import { use } from 'motionary/runtime'; import { ${camel(id)} } from '${path}'; use(${camel(id)});`;
    const cdn = id === 'core' ? `<script src="${moduleCdn('core')}"></script>` : `<script src="${moduleCdn('core')}"></script><script src="${moduleCdn(id)}"></script>`;
    return `[motionary] ${who} requires ${path}. Install once: npm i motionary — then register it before the component mounts: ${reg} Or from a CDN (core first): ${cdn} Docs: https://github.com/HarrisonCN/Motionary/blob/main/docs/runtime/${id}.md`;
}
/** 'format-css' → 'formatCss' (the module object's export name). */
const camel = (id) => id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
/** Thrown by `requireModule()` when a module is not registered. */
class RuntimeModuleError extends Error {
    constructor(id, who) {
        super(missingMessage(id, who));
        this.name = 'RuntimeModuleError';
        this.module = id;
    }
}
/** Register modules (each once; re-registering the same id keeps the first). Returns the registry. */
function register(...mods) {
    const r = registry();
    for (const m of mods) {
        if (!m || typeof m.id !== 'string')
            throw new TypeError('[motionary] use(): not a runtime module — pass the object exported by motionary/runtime/<module>');
        if (r.modules.has(m.id))
            continue;
        for (const dep of m.requires || [])
            if (!r.modules.has(dep))
                throw new RuntimeModuleError(dep, `motionary/runtime/${m.id}`);
        r.modules.set(m.id, m);
        m.setup?.(r);
    }
    return r;
}
/** Is a module registered? */
const hasModule = (id) => registry().modules.has(id);
/** The API of a registered module, or a `RuntimeModuleError` with install / import / CDN instructions. */
function requireModule(id, who) {
    const m = registry().modules.get(id);
    if (!m)
        throw new RuntimeModuleError(id, who);
    return m.api;
}
/** Ids of the registered modules. */
const registeredModules = () => Array.from(registry().modules.keys());

exports.RUNTIME_CDN = RUNTIME_CDN;
exports.RUNTIME_VERSION = RUNTIME_VERSION;
exports.RuntimeModuleError = RuntimeModuleError;
exports.hasModule = hasModule;
exports.missingMessage = missingMessage;
exports.moduleCdn = moduleCdn;
exports.modulePath = modulePath;
exports.register = register;
exports.registeredModules = registeredModules;
exports.registry = registry;
exports.requireModule = requireModule;
//# sourceMappingURL=registry-DhKZCitb.cjs.map
