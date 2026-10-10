'use strict';

var registry = require('../chunks/registry-U0scTJZr.cjs');

/**
 * `motionary/runtime/text` (10.3) — split text into characters, words and
 * lines for animation, keeping it accessible (original implementation).
 *
 * - `segment(text, 'chars' | 'words')` — pure, works anywhere (SSR, workers):
 *   grapheme clusters via `Intl.Segmenter` when available (emoji, combining
 *   marks, CJK stay whole), whitespace-aware words.
 * - `splitText(el, { type: 'chars,words,lines' })` — wraps the element's text
 *   in spans (nested elements such as `<a>`, `<em>` keep their markup), groups
 *   words into lines by their rendered position, sets `aria-label` on the
 *   element with the original text and hides the pieces from assistive tech.
 *   `revert()` restores the original markup; `resplit()` re-measures lines
 *   (e.g. after a resize).
 */
/** Split a string into graphemes ('chars') or words + whitespace runs ('words'). */
function segment(text, by = 'chars') {
    const Seg = Intl.Segmenter;
    if (by === 'chars') {
        if (Seg)
            return Array.from(new Seg(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment);
        return Array.from(text);
    }
    return text.split(/(\s+)/).filter((s) => s !== '');
}
const types = (t) => new Set((t || 'chars,words').split(/[\s,]+/).filter(Boolean));
/** Split an element's text (see module docs). Needs a DOM. */
function splitText(el, o = {}) {
    if (typeof document === 'undefined')
        throw new Error('[motionary] splitText needs a DOM — use segment() on the server');
    const want = types(o.type);
    const pre = o.className || 'usa-split';
    const original = el.innerHTML;
    const hadLabel = el.getAttribute('aria-label');
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const chars = [], words = [];
    const mk = (cls, txt) => {
        const s = document.createElement('span');
        s.className = cls;
        s.setAttribute('aria-hidden', 'true');
        s.style.display = 'inline-block';
        if (txt !== undefined)
            s.textContent = txt;
        return s;
    };
    const wantWords = want.has('words') || want.has('lines');
    const walk = (node) => {
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === 3) {
                const frag = document.createDocumentFragment();
                for (const part of segment(child.textContent || '', 'words')) {
                    if (/^\s+$/.test(part)) {
                        frag.appendChild(document.createTextNode(' '));
                        continue;
                    }
                    const w = wantWords ? mk(`${pre}-word`) : null;
                    if (want.has('chars')) {
                        for (const g of segment(part, 'chars')) {
                            const c = mk(`${pre}-char`, g);
                            chars.push(c);
                            (w || frag).appendChild(c);
                        }
                    }
                    else if (w)
                        w.textContent = part;
                    else
                        frag.appendChild(document.createTextNode(part));
                    if (w) {
                        words.push(w);
                        frag.appendChild(w);
                    }
                }
                child.replaceWith(frag);
            }
            else if (child.nodeType === 1 && !child.classList.contains(`${pre}-word`))
                walk(child);
        }
    };
    walk(el);
    if (text && hadLabel === null)
        el.setAttribute('aria-label', text);
    el.setAttribute('data-split', Array.from(want).join(' '));
    const lines = [];
    if (want.has('lines') && words.length) {
        // group words by their rendered top; wrap each group in a line span (flat text only)
        let top = NaN, cur = [];
        const groups = [];
        for (const w of words) {
            const t = Math.round(w.offsetTop);
            if (cur.length && Math.abs(t - top) > 2) {
                groups.push(cur);
                cur = [];
            }
            if (!cur.length)
                top = t;
            cur.push(w);
        }
        if (cur.length)
            groups.push(cur);
        const flat = words.every((w) => w.parentElement === el);
        if (flat) {
            el.textContent = '';
            for (const g of groups) {
                const line = mk(`${pre}-line`);
                line.style.display = 'block';
                g.forEach((w, i) => {
                    if (i)
                        line.appendChild(document.createTextNode(' '));
                    line.appendChild(w);
                });
                lines.push(line);
                el.appendChild(line);
            }
        }
        else
            groups.forEach((g, i) => g.forEach((w) => w.setAttribute('data-line', String(i))));
    }
    if (o.indexVar !== false)
        for (const list of [chars, words, lines])
            list.forEach((s, i) => s.style.setProperty('--i', String(i)));
    const result = {
        chars,
        words: want.has('words') ? words : [],
        lines,
        revert() {
            el.innerHTML = original;
            el.removeAttribute('data-split');
            if (hadLabel === null)
                el.removeAttribute('aria-label');
        },
        resplit() {
            result.revert();
            return splitText(el, o);
        },
    };
    return result;
}
/** The module object for `use(text)`. */
const text = { id: 'text', version: registry.RUNTIME_VERSION, tier: 'basic', requires: ['core'], api: { segment, splitText } };

exports.segment = segment;
exports.splitText = splitText;
exports.text = text;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.8.0/dist/runtime/text.cjs.map