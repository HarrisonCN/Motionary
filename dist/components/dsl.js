import { hasEffect, bindEffect, EFFECT_TRIGGERS } from '../chunks/registry-CYojuxi5.js';
import '../chunks/base-zSGb8ujt.js';

/**
 * `motionary/dsl` (= `motionary/components/dsl`, 9.0) — the declarative
 * motion DSL. Describe motion as one readable string instead of code:
 *
 * ```html
 * <section data-motion="enter: fade-up 600ms ease-out stagger 80ms; hover: pop; click: confetti count=40">
 * ```
 *
 * Grammar — rules separated by `;`, each `trigger: effect [modifiers…]`:
 * - trigger: `enter` · `click` · `hover` · `load` · `loop` · `manual`
 * - effect: any registered effect name (timeline presets, packs, plugins)
 * - modifiers: a duration (`600ms` / `0.6s`), `delay 120ms`,
 *   `stagger 80ms` (children one after another), an easing (`ease-out`,
 *   `linear`, `spring`, `cubic-bezier(…)`, `steps(…)`), `once`, and
 *   `key=value` effect options (numbers / booleans parsed).
 *
 * `parseMotion()` → rules + errors, `serializeMotion()` back to a string,
 * `motion\`…\`` tagged template, `applyMotion(root)` binds every
 * `[data-motion]` under `root` (and watches for new ones with `observe`),
 * `bindMotion(el, rules)` for one element, and `createComponent(json)`
 * builds live markup from the 8.9 `describeComponent()` JSON.
 */
const EASINGS = { ease: 'ease', 'ease-in': 'ease-in', 'ease-out': 'ease-out', 'ease-in-out': 'ease-in-out', linear: 'linear', spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', smooth: 'cubic-bezier(0.22, 1, 0.36, 1)' };
const TIME = /^(\d+(?:\.\d+)?)(ms|s)$/;
const time = (t) => {
    const m = t.match(TIME);
    return m ? Math.round(Number(m[1]) * (m[2] === 's' ? 1000 : 1)) : undefined;
};
const value = (v) => (v === 'true' ? true : v === 'false' ? false : v !== '' && !Number.isNaN(Number(v)) ? Number(v) : v);
/** Split on whitespace, keeping `fn(…)` groups together. */
function tokens(s) {
    const out = [];
    let cur = '';
    let depth = 0;
    for (const ch of s) {
        if (ch === '(')
            depth++;
        if (ch === ')')
            depth = Math.max(0, depth - 1);
        if (/\s/.test(ch) && !depth) {
            if (cur)
                out.push(cur);
            cur = '';
        }
        else
            cur += ch;
    }
    if (cur)
        out.push(cur);
    return out;
}
/** Parse a motion string into rules (+ human-readable errors for what was skipped) (9.0). */
function parseMotion(src) {
    const rules = [];
    const errors = [];
    for (const raw of src.split(';')) {
        const part = raw.trim();
        if (!part)
            continue;
        const i = part.indexOf(':');
        if (i < 0) {
            errors.push(`"${part}": expected "trigger: effect"`);
            continue;
        }
        const trigger = part.slice(0, i).trim();
        if (!EFFECT_TRIGGERS.includes(trigger)) {
            errors.push(`"${trigger}": unknown trigger (${EFFECT_TRIGGERS.join(', ')})`);
            continue;
        }
        const [effect, ...mods] = tokens(part.slice(i + 1));
        if (!effect || !/^[a-z][a-z0-9-]*$/.test(effect)) {
            errors.push(`"${part}": missing effect name`);
            continue;
        }
        const r = { trigger, effect, options: {} };
        for (let k = 0; k < mods.length; k++) {
            const m = mods[k];
            if ((m === 'delay' || m === 'stagger') && time(mods[k + 1] || '') != null)
                r[m] = time(mods[++k]);
            else if (time(m) != null)
                r.duration = time(m);
            else if (m === 'once')
                r.once = true;
            else if (EASINGS[m])
                r.easing = EASINGS[m];
            else if (/^(cubic-bezier|steps|linear)\(.*\)$/.test(m))
                r.easing = m;
            else if (/^[a-zA-Z][\w-]*=/.test(m)) {
                const j = m.indexOf('=');
                r.options[m.slice(0, j)] = value(m.slice(j + 1));
            }
            else
                errors.push(`"${m}" in "${part}": unknown modifier`);
        }
        rules.push(r);
    }
    return { rules, errors };
}
/** Rules back to the canonical motion string (9.0). */
function serializeMotion(rules) {
    const inv = Object.fromEntries(Object.entries(EASINGS).map(([k, v]) => [v, k]));
    return rules
        .map((r) => {
        const p = [`${r.trigger}: ${r.effect}`];
        if (r.duration != null)
            p.push(`${r.duration}ms`);
        if (r.easing)
            p.push(inv[r.easing] && inv[r.easing] !== 'ease' ? inv[r.easing] : r.easing);
        if (r.delay != null)
            p.push(`delay ${r.delay}ms`);
        if (r.stagger != null)
            p.push(`stagger ${r.stagger}ms`);
        if (r.once)
            p.push('once');
        for (const [k, v] of Object.entries(r.options))
            p.push(`${k}=${v}`);
        return p.join(' ');
    })
        .join('; ');
}
/** Tagged template: motion`enter: fade-up ${dur}ms` → the motion string (validated in dev via `parseMotion`) (9.0). */
function motion(strings, ...vals) {
    return strings.reduce((a, s, i) => a + s + (i < vals.length ? String(vals[i]) : ''), '').replace(/\s+/g, ' ').trim();
}
/** Bind parsed rules (or a motion string) to one element; returns the cleanup (9.0). */
function bindMotion(el, rules, onError) {
    const parsed = typeof rules === 'string' ? parseMotion(rules) : { rules, errors: [] };
    parsed.errors.forEach((e) => onError?.(e));
    const cleanups = [];
    for (const r of parsed.rules) {
        if (!hasEffect(r.effect)) {
            onError?.(`"${r.effect}": effect not registered (register its pack or plugin first)`);
            continue;
        }
        const opts = { ...r.options, trigger: r.trigger };
        if (r.duration != null)
            opts.duration = r.duration;
        if (r.easing)
            opts.easing = r.easing;
        if (r.once)
            opts.once = true;
        const targets = r.stagger != null && el.children.length ? Array.from(el.children) : [el];
        targets.forEach((t, i) => {
            const delay = (r.delay || 0) + (r.stagger || 0) * i;
            try {
                cleanups.push(bindEffect(t, r.effect, delay ? { ...opts, delay } : opts));
            }
            catch (e) {
                onError?.(String(e.message || e));
            }
        });
    }
    return () => cleanups.splice(0).forEach((c) => c());
}
/** Bind every `[data-motion]` under `root` (default `document`); `observe` also binds ones added later. Returns { errors, cleanup } (9.0). */
function applyMotion(root = document, opts = {}) {
    const attr = opts.attribute || 'data-motion';
    const errors = [];
    const bound = new Map();
    const bindOne = (el) => {
        if (bound.has(el))
            return;
        bound.set(el, bindMotion(el, el.getAttribute(attr) || '', (m) => errors.push(m)));
    };
    const scan = (n) => {
        if (n.hasAttribute?.(attr))
            bindOne(n);
        n.querySelectorAll?.(`[${attr}]`).forEach(bindOne);
    };
    scan(root);
    let mo = null;
    if (opts.observe && typeof MutationObserver !== 'undefined') {
        mo = new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && scan(n))));
        mo.observe(root, { childList: true, subtree: true });
    }
    return {
        errors,
        cleanup: () => {
            mo?.disconnect();
            bound.forEach((c) => c());
            bound.clear();
        },
    };
}
/** Build live markup from the 8.9 `describeComponent()` / `exportComponent(el, 'json')` format (9.0). */
function createComponent(desc) {
    const d = typeof desc === 'string' ? JSON.parse(desc) : desc;
    if (!d || typeof d.tag !== 'string' || !/^[a-z][a-z0-9-]*$/.test(d.tag) || d.tag === 'script')
        throw new Error('[motionary] createComponent: invalid tag');
    const el = document.createElement(d.tag);
    for (const [k, v] of Object.entries(d.attrs || {}))
        if (!/^on/i.test(k))
            el.setAttribute(k, String(v));
    for (const c of d.children || [])
        el.append(typeof c === 'string' ? document.createTextNode(c) : createComponent(c));
    return el;
}

export { applyMotion, bindMotion, createComponent, motion, parseMotion, serializeMotion };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/components/dsl.js.map