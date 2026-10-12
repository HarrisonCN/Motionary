'use strict';

var indexTags = require('../chunks/index-tags-hLIF2Clq.cjs');
var bind = require('../chunks/bind-Ui43-n2d.cjs');

/**
 * motionary/components/react — React wrappers for every `<usa-*>`
 * element (v2.9). React 19 handles custom elements natively; for React 18
 * (and nicer DX in both) `createUsaComponents(React)` returns typed wrapper
 * components that set **properties** (`checked`, `value`, `state`, …),
 * forward `ref`, and map `onUsaChange`-style props to `usa:change` events.
 *
 * ```tsx
 * import * as React from 'react';
 * import { createUsaComponents } from 'motionary/components/react';
 * import { defineComponents } from 'motionary/components';
 * defineComponents();
 * const { UsaButton, UsaSwitch } = createUsaComponents(React);
 * <UsaButton deform="squash" onUsaSubmit={(e) => e.detail.done(true)}><button>Pay</button></UsaButton>
 * ```
 *
 * JSX types for the raw tags (`<usa-card effect="flip">`) come from
 * `motionary/components/jsx` (see `UsaIntrinsicElements`).
 *
 * React 19 + SSR (13.5.0): React 19 does NOT attach custom-element event props
 * (`onusa:change`) to server-rendered elements it hydrates (they work on
 * client-created elements). For SSR/hydrated trees bind events with a ref
 * callback over `bindUsa` (re-exported here):
 *
 * ```tsx
 * import { bindUsa } from 'motionary/components/react';
 * <usa-switch ref={(el) => { if (!el) return; const b = bindUsa(el, { on: { change: onChange } }); return () => b.destroy(); }} />
 * ```
 */
/** `usa-auto-animate` → `UsaAutoAnimate` */
const pascal = (tag) => tag.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
/** `onUsaChange` → `usa:change`, `onUsaDragEnd` → `usa:drag-end`; `onChange` → `change`. */
function eventName(prop) {
    const m = /^on([A-Z].*)$/.exec(prop);
    if (!m)
        return null;
    const kebab = m[1].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    return kebab.startsWith('usa-') ? `usa:${kebab.slice(4)}` : kebab;
}
/** Props written as DOM properties (not attributes) when given non-string values. */
const PROPS = /*#__PURE__*/ new Set(['checked', 'value', 'state', 'open', 'liked', 'count', 'loading', 'flipped', 'selected', 'index', 'indeterminate']);
/** All `<usa-*>` tags shipped by the package. */
const USA_TAGS = /*#__PURE__*/ Object.values(indexTags.COMPONENT_CATEGORIES).flat();
function createUsaComponents(React) {
    // 13.5.0: useLayoutEffect only in the browser — React 18 warns for every wrapper rendered on the server otherwise.
    const useIso = (typeof document != 'undefined' && React.useLayoutEffect) || React.useEffect;
    const make = (tag) => {
        const C = React.forwardRef((props, ref) => {
            const inner = React.useRef(null);
            const attrs = {};
            const events = [];
            const propsSet = [];
            for (const [k, v] of Object.entries(props)) {
                if (k === 'children')
                    continue;
                const ev = typeof v === 'function' ? eventName(k) : null;
                if (ev)
                    events.push([ev, v]);
                else if (PROPS.has(k) && typeof v !== 'string')
                    propsSet.push([k, v]);
                else if (k === 'className')
                    attrs.class = v;
                else if (typeof v === 'boolean') {
                    if (v)
                        attrs[k] = '';
                }
                else
                    attrs[k] = v;
            }
            useIso(() => {
                const el = inner.current;
                if (!el)
                    return;
                for (const [k, v] of propsSet)
                    el[k] = v;
            });
            useIso(() => {
                const el = inner.current;
                if (!el)
                    return;
                events.forEach(([n, f]) => el.addEventListener(n, f));
                return () => events.forEach(([n, f]) => el.removeEventListener(n, f));
            });
            const setRef = (node) => {
                inner.current = node;
                if (typeof ref === 'function')
                    ref(node);
                else if (ref)
                    ref.current = node;
            };
            return React.createElement(tag, { ...attrs, ref: setRef }, props.children);
        });
        C.displayName = pascal(tag);
        return C;
    };
    // 13.5.0: the wrappers used to cover only the core tags (USA_TAGS) — `UsaSwitch`, `UsaPricing` and every other
    // widget were `undefined`. Known tags are created up front (enumerable); any other `Usa*` name — widgets, packs,
    // your own `usa-*` elements — is created on first access and cached.
    const all = Object.fromEntries(USA_TAGS.map((t) => [pascal(t), make(t)]));
    return new Proxy(all, {
        get: (o, k) => (typeof k === 'string' && /^Usa[A-Z0-9]/.test(k) && !(k in o) ? (o[k] = make(kebab(k))) : o[k]),
    });
}
/** `UsaAutoAnimate` → `usa-auto-animate`, `UsaCarousel3d` → `usa-carousel-3d` (inverse of {@link pascal} for the shipped tags). */
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').replace(/([a-z])(\d)/g, '$1-$2').toLowerCase();

exports.bindUsa = bind.bindUsa;
exports.usaEventName = bind.usaEventName;
exports.USA_TAGS = USA_TAGS;
exports.createUsaComponents = createUsaComponents;
exports.eventName = eventName;
exports.kebab = kebab;
exports.pascal = pascal;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.6.0/dist/components/react.cjs.map