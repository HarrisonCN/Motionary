'use strict';

/**
 * 17.12 helpers shared by the tab, copy and list widgets (progress-tabs, code-tabs, share-button, sortable-list, …).
 * Original implementations; see docs/collections-17-12.md.
 */
/**
 * The index a roving-focus key moves to in a row of `n` items: ArrowRight / ArrowDown go forward, ArrowLeft / ArrowUp
 * back (both wrap), Home and End jump to the ends. Any other key returns `-1`. `rtl` swaps left and right.
 */
function rovingIndex(key, index, n, rtl = false) {
    if (n <= 0)
        return -1;
    const i = Math.min(n - 1, Math.max(0, Math.round(index) || 0));
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (key === fwd || key === 'ArrowDown')
        return (i + 1) % n;
    if (key === back || key === 'ArrowUp')
        return (i - 1 + n) % n;
    if (key === 'Home')
        return 0;
    if (key === 'End')
        return n - 1;
    return -1;
}
/** Copy `text` to the clipboard; resolves `true` when a copy happened (Clipboard API, then a hidden textarea). */
async function copyText(text) {
    try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    }
    catch {
        /* fall through to the textarea */
    }
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.append(ta);
        ta.select();
        const ok = typeof document.execCommand === 'function' && document.execCommand('copy');
        ta.remove();
        return !!ok;
    }
    catch {
        return false;
    }
}
/** A small deterministic pseudo-random number in [0, 1) for index `i` and `seed` (stable layouts, no Math.random). */
function seeded(i, seed = 1) {
    const x = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
}
/** Move one item of a copy of `list` from `from` to `to` (both clamped). */
function moveItem(list, from, to) {
    const out = list.slice();
    if (!out.length)
        return out;
    const f = Math.min(out.length - 1, Math.max(0, Math.round(from)));
    const t = Math.min(out.length - 1, Math.max(0, Math.round(to)));
    const [item] = out.splice(f, 1);
    out.splice(t, 0, item);
    return out;
}
/** Numbers from a comma / space separated attribute; non-numbers become 0, negatives 0; at most `max` values. */
function numbers(text, max = 1000) {
    return String(text ?? '')
        .split(/[\s,]+/)
        .filter(Boolean)
        .slice(0, max)
        .map((s) => {
        const n = Number(s);
        return Number.isFinite(n) && n > 0 ? n : 0;
    });
}

exports.copyText = copyText;
exports.moveItem = moveItem;
exports.numbers = numbers;
exports.rovingIndex = rovingIndex;
exports.seeded = seeded;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/kit-12-B4H_NaC_.cjs.map