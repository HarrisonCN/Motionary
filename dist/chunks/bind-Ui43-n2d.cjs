'use strict';

/** Normalise an event key: `change` → `usa:change`, `usa:change` stays. */
const usaEventName = (k) => (k.includes(':') ? k : `usa:${k}`);
/** Bind properties and `usa:*` listeners to an element; returns `{ update, destroy }`. */
function bindUsa(el, binding = {}) {
    let current = [];
    const apply = (b) => {
        current.forEach(([n, f]) => el.removeEventListener(n, f));
        current = Object.entries(b.on || {}).map(([k, f]) => [usaEventName(k), f]);
        current.forEach(([n, f]) => el.addEventListener(n, f));
        for (const [k, v] of Object.entries(b.props || {}))
            if (el[k] !== v)
                el[k] = v;
    };
    apply(binding);
    return {
        update: apply,
        destroy: () => current.forEach(([n, f]) => el.removeEventListener(n, f)),
    };
}

exports.bindUsa = bindUsa;
exports.usaEventName = usaEventName;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.6.0/dist/chunks/bind-Ui43-n2d.cjs.map