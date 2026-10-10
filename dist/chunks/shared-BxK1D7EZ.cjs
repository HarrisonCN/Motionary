'use strict';

/** Helpers shared by the 6.x widgets (`motionary/components/widgets`). */
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
/** Children of `el` that are elements and not created by the widget itself. */
const ownChildren = (el, skip = '[data-usa-part]') => Array.from(el.children).filter((c) => c instanceof HTMLElement && !c.matches(skip));
/** Create a part element (marked so re-mounts can find / skip it). */
function part(tag, cls, attrs = {}, html = '') {
    const n = document.createElement(tag);
    n.className = cls;
    n.setAttribute('data-usa-part', '');
    for (const [k, v] of Object.entries(attrs))
        n.setAttribute(k, v);
    if (html)
        n.innerHTML = html;
    return n;
}
/** Remove the parts a previous mount created. */
const dropParts = (el) => el.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
let uid = 0;
/** A document-unique id with a prefix. */
const nextId = (p) => `${p}-${++uid}`;
/** Roving arrow-key focus over `items` (horizontal or vertical); returns the new index or -1. */
function arrowIndex(e, i, n, vertical = false) {
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    if (e.key === prev)
        return (i - 1 + n) % n;
    if (e.key === next)
        return (i + 1) % n;
    if (e.key === 'Home')
        return 0;
    if (e.key === 'End')
        return n - 1;
    return -1;
}

exports.arrowIndex = arrowIndex;
exports.clampN = clampN;
exports.dropParts = dropParts;
exports.nextId = nextId;
exports.ownChildren = ownChildren;
exports.part = part;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.5.0/dist/chunks/shared-BxK1D7EZ.cjs.map