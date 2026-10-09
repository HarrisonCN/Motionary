'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var core = require('../chunks/core-KIvPGg0c.cjs');
require('./tokens.cjs');

var css$5 = "usa-typewriter{white-space:pre-wrap}usa-typewriter .usa-tw-caret{display:inline-block;width:var(--usa-caret-width,0.08em);height:1.05em;margin-left:0.06em;vertical-align:-0.12em;background:var(--usa-caret-color,currentColor);animation:usa-caret 1.06s steps(1) infinite}usa-typewriter[data-typing] .usa-tw-caret{animation:none}usa-typewriter[data-no-cursor] .usa-tw-caret{display:none}@keyframes usa-caret{50%{opacity:0}}@media (prefers-reduced-motion:reduce){usa-typewriter .usa-tw-caret,usa-shimmer-text{animation:none}}";

function defineTypewriter(tag = 'usa-typewriter') {
    return base.defineElement(tag, (Base) => class UsaTypewriter extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._out = null;
            this._timer = 0;
            this._running = false;
        }
        static get observedAttributes() {
            return ['text', 'words'];
        }
        get phrases() {
            const words = this.getAttribute('words');
            if (words)
                return words.split('|').map((w) => w.trim()).filter(Boolean);
            return [this.getAttribute('text') ?? this._source ?? ''];
        }
        mount() {
            if (this._source === null)
                this._source = (this.textContent || '').trim();
            const phrases = this.phrases;
            const sr = base.srText(phrases.join(', '));
            this._out = document.createElement('span');
            this._out.className = 'usa-tw-text';
            this._out.setAttribute('aria-hidden', 'true');
            const caret = document.createElement('span');
            caret.className = 'usa-tw-caret';
            caret.setAttribute('aria-hidden', 'true');
            this.replaceChildren(sr, this._out, caret);
            this.toggleAttribute('data-no-cursor', this.getAttribute('cursor') === 'false');
            if (this.reduced) {
                this._out.textContent = phrases[0] || '';
                return;
            }
            const start = this.str('start', 'view');
            if (start === 'load')
                this.start();
            else if (start === 'view') {
                this.inView((visible) => {
                    if (visible && !this._running && !this._out?.textContent)
                        this.start();
                });
            }
        }
        unmount() {
            this.stop();
        }
        stop() {
            clearTimeout(this._timer);
            this._timer = 0;
            this._running = false;
            this.removeAttribute('data-typing');
        }
        restart() {
            this.stop();
            if (this._out)
                this._out.textContent = '';
            this.start();
        }
        start() {
            if (this._running || !this._out)
                return;
            const out = this._out;
            const phrases = this.phrases;
            if (this.reduced) {
                out.textContent = phrases[0] || '';
                return;
            }
            this._running = true;
            const speed = this.num('speed', 55);
            const del = this.num('delete-speed', 30);
            const pause = this.num('pause', 1400);
            const loop = this.flag('loop') || phrases.length > 1;
            let p = 0;
            let i = 0;
            let deleting = false;
            const tick = () => {
                const word = phrases[p] || '';
                if (!deleting) {
                    i++;
                    out.textContent = word.slice(0, i);
                    this.setAttribute('data-typing', '');
                    if (i >= word.length) {
                        this.removeAttribute('data-typing');
                        const last = p === phrases.length - 1;
                        if (last)
                            this.emit('complete');
                        if (!loop && last) {
                            this._running = false;
                            return;
                        }
                        deleting = true;
                        this._timer = setTimeout(tick, pause);
                        return;
                    }
                    this._timer = setTimeout(tick, speed * (0.6 + Math.random() * 0.8));
                }
                else {
                    i--;
                    out.textContent = word.slice(0, Math.max(0, i));
                    if (i <= 0) {
                        deleting = false;
                        p = (p + 1) % phrases.length;
                        this._timer = setTimeout(tick, speed * 4);
                        return;
                    }
                    this._timer = setTimeout(tick, del);
                }
            };
            this._timer = setTimeout(tick, this.num('delay', 0));
        }
    }, { id: 'typewriter', text: css$5 });
}

var css$4 = "usa-split-text .usa-split-word{display:inline-block;white-space:nowrap}usa-split-text .usa-split-unit{display:inline-block;white-space:pre}usa-split-text[data-state=\"hidden\"] .usa-split-unit{opacity:0}usa-split-text[data-state=\"play\"] .usa-split-unit{animation:usa-split-rise var(--usa-split-duration,620ms) cubic-bezier(0.22,1,0.36,1) both;animation-delay:calc(var(--usa-split-delay,0ms) + var(--i,0) * var(--usa-split-stagger,28ms))}usa-split-text[effect=\"fade\"][data-state=\"play\"] .usa-split-unit{animation-name:usa-split-fade}usa-split-text[effect=\"blur\"][data-state=\"play\"] .usa-split-unit{animation-name:usa-split-blur}usa-split-text[effect=\"flip\"][data-state=\"play\"] .usa-split-unit{animation-name:usa-split-flip;transform-origin:50% 100%}usa-split-text[effect=\"pop\"][data-state=\"play\"] .usa-split-unit{animation-name:usa-split-pop;animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)}@keyframes usa-split-rise{from{opacity:0;transform:translate3d(0,0.6em,0)}to{opacity:1;transform:none}}@keyframes usa-split-fade{from{opacity:0}to{opacity:1}}@keyframes usa-split-blur{from{opacity:0;filter:blur(8px)}to{opacity:1;filter:none}}@keyframes usa-split-flip{from{opacity:0;transform:perspective(500px) rotateX(-80deg)}to{opacity:1;transform:none}}@keyframes usa-split-pop{from{opacity:0;transform:scale(0.3)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){usa-split-text .usa-split-unit{animation:none !important;opacity:1 !important}}";

const CJK = /[\u2E80-\u2FFF\u3000-\u303F\u3040-\u30FF\u3100-\u312F\u3130-\u318F\u31A0-\u31FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/;
/** Scripts whose letters join (splitting them would break shaping). */
const JOINING_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const SR = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0';
function segmenter(locale, granularity) {
    const S = globalThis.Intl?.Segmenter;
    if (typeof S !== 'function')
        return null;
    try {
        return new S(locale || undefined, { granularity });
    }
    catch {
        return null;
    }
}
/** Grapheme clusters of `s` (emoji / combining marks stay whole). */
function graphemes(s, locale) {
    const seg = segmenter(locale, 'grapheme');
    if (seg)
        return Array.from(seg.segment(s), (x) => x.segment);
    return Array.from(s);
}
/**
 * Word-ish tokens of `s`, whitespace kept as separate tokens. CJK text is
 * segmented into words with `Intl.Segmenter`, or per character without it.
 */
function words(s, locale) {
    const seg = segmenter(locale, 'word');
    const out = [];
    if (seg) {
        for (const x of seg.segment(s)) {
            const last = out[out.length - 1];
            // glue punctuation onto the previous word so it never starts a line alone
            if (!x.isWordLike && !/^\s+$/.test(x.segment) && last && !/^\s+$/.test(last))
                out[out.length - 1] = last + x.segment;
            else
                out.push(x.segment);
        }
        return out;
    }
    for (const part of s.split(/(\s+)/)) {
        if (!part)
            continue;
        if (/^\s+$/.test(part) || !CJK.test(part))
            out.push(part);
        else {
            let buf = '';
            for (const ch of Array.from(part)) {
                if (CJK.test(ch)) {
                    if (buf)
                        out.push(buf), (buf = '');
                    out.push(ch);
                }
                else if (/[\p{P}]/u.test(ch) && out.length)
                    out[out.length - 1] += ch;
                else
                    buf += ch;
            }
            if (buf)
                out.push(buf);
        }
    }
    return out;
}
function dirOf(el, text) {
    const attr = el.closest?.('[dir]')?.getAttribute('dir');
    if (attr === 'rtl' || attr === 'ltr')
        return attr;
    try {
        const d = getComputedStyle(el).direction;
        if (d === 'rtl')
            return 'rtl';
    }
    catch {
        /* no layout */
    }
    return RTL.test(text) && !/[A-Za-z]/.test(text.replace(RTL, '')) ? 'rtl' : 'ltr';
}
function splitText(el, options = {}) {
    const by = new Set((Array.isArray(options.by) ? options.by : String(options.by ?? 'char').split(/[\s,]+/)).filter(Boolean));
    const cls = options.className || 'usa-split';
    const locale = options.locale || el.closest?.('[lang]')?.getAttribute('lang') || undefined;
    const original = Array.from(el.childNodes).map((n) => n.cloneNode(true));
    const text = el.textContent || '';
    const direction = dirOf(el, text);
    const chars = [];
    const wordEls = [];
    let lines = [];
    const doc = el.ownerDocument;
    const span = (c, t) => {
        const s = doc.createElement('span');
        s.className = c;
        if (t !== undefined)
            s.textContent = t;
        return s;
    };
    const splitNode = (node) => {
        if (node.nodeType === 3) {
            const frag = doc.createDocumentFragment();
            for (const w of words(node.nodeValue || '', locale)) {
                if (/^\s+$/.test(w)) {
                    frag.append(doc.createTextNode(w));
                    continue;
                }
                const wordEl = span(`${cls}-word`);
                wordEl.style.display = 'inline-block';
                wordEl.style.whiteSpace = 'nowrap';
                wordEl.dataset.index = String(wordEls.length);
                wordEls.push(wordEl);
                // Arabic script joins its letters: keep the word whole (shaping), even in char mode.
                if (by.has('char') && !JOINING_SCRIPT.test(w)) {
                    for (const g of graphemes(w, locale)) {
                        const c = span(`${cls}-char`, g);
                        c.style.display = 'inline-block';
                        c.dataset.index = String(chars.length);
                        chars.push(c);
                        wordEl.append(c);
                    }
                }
                else {
                    wordEl.textContent = w;
                    if (by.has('char')) {
                        wordEl.dataset.whole = '';
                        chars.push(wordEl);
                    }
                }
                frag.append(wordEl);
            }
            node.parentNode.replaceChild(frag, node);
        }
        else if (node.nodeType === 1 && !/^(BR|SCRIPT|STYLE|SVG|IMG)$/i.test(node.tagName)) {
            Array.from(node.childNodes).forEach(splitNode);
        }
    };
    const wrap = doc.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.className = `${cls}-body`;
    original.forEach((n) => wrap.append(n.cloneNode(true)));
    Array.from(wrap.childNodes).forEach(splitNode);
    const sr = span(`${cls}-sr`, text.replace(/\s+/g, ' ').trim());
    sr.setAttribute('style', SR);
    el.replaceChildren(sr, wrap);
    el.setAttribute('data-split', [...by].join(' '));
    if (direction === 'rtl')
        el.setAttribute('data-split-dir', 'rtl');
    const relayout = () => {
        // unwrap old lines
        for (const l of lines)
            l.replaceWith(...Array.from(l.childNodes));
        lines = [];
        if (!by.has('line') || !wordEls.length)
            return lines;
        const groups = [];
        let lastTop = null;
        for (const w of wordEls) {
            const top = Math.round(w.offsetTop);
            if (lastTop === null || Math.abs(top - lastTop) > 2)
                groups.push([]);
            groups[groups.length - 1].push(w);
            lastTop = top;
        }
        groups.forEach((g, i) => {
            // only group words that share a parent (inline markup keeps its words)
            const parent = g[0].parentNode;
            const same = g.filter((w) => w.parentNode === parent);
            const line = span(`${cls}-line`);
            line.style.display = 'inline-block';
            line.dataset.index = String(i);
            parent.insertBefore(line, same[0]);
            let n = same[0];
            const end = same[same.length - 1];
            while (n) {
                const next = n.nextSibling;
                line.append(n);
                if (n === end)
                    break;
                n = next;
            }
            // keep the space between lines outside the line box
            lines.push(line);
        });
        return lines;
    };
    relayout();
    return {
        chars,
        words: wordEls,
        get lines() {
            return lines;
        },
        direction,
        relayout,
        revert() {
            el.replaceChildren(...original.map((n) => n.cloneNode(true)));
            el.removeAttribute('data-split');
            el.removeAttribute('data-split-dir');
        },
    };
}
/** Order indices `0…n-1` by choreography: from the start, end, center outwards, edges inwards, or random (seeded). */
function splitOrder(n, from = 'start', seed = 1) {
    const idx = Array.from({ length: n }, (_, i) => i);
    const mid = (n - 1) / 2;
    if (from === 'end')
        return idx.map((i) => n - 1 - i);
    if (from === 'center')
        return idx.map((i) => Math.round(Math.abs(i - mid) * 2) / 2);
    if (from === 'edges')
        return idx.map((i) => Math.round((mid - Math.abs(i - mid)) * 2) / 2);
    if (from === 'random') {
        let s = seed;
        const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
        const shuffled = idx.slice().sort(() => r() - 0.5);
        const rank = [];
        shuffled.forEach((v, i) => (rank[v] = i));
        return rank;
    }
    return idx;
}
/**
 * Split `el` and build a `timeline()` with one step per unit — play it,
 * `scrub()` it with scroll, `reverse()` or `seek()` it.
 *
 * ```ts
 * const { timeline: tl } = splitTimeline(h1, { by: 'char', preset: 'blur', from: 'center' });
 * tl.play();
 * ```
 */
function splitTimeline(el, options = {}) {
    const split = splitText(el, options);
    const by = Array.isArray(options.by) ? options.by : String(options.by ?? 'char').split(/[\s,]+/);
    const unit = options.unit || (by.includes('char') ? 'char' : by.includes('word') ? 'word' : 'line');
    const units = unit === 'char' ? split.chars : unit === 'word' ? split.words : split.lines;
    const stagger = options.stagger ?? (unit === 'char' ? 30 : unit === 'word' ? 80 : 140);
    const order = splitOrder(units.length, options.from);
    const tl = core.timeline({ defaults: { duration: options.duration ?? 500, easing: options.easing } });
    units.forEach((u, i) => tl.to(u, options.preset || 'fade-up', { at: order[i] * stagger }));
    tl.seek(0);
    return { split, timeline: tl };
}

function defineSplitText(tag = 'usa-split-text') {
    return base.defineElement(tag, (Base) => class UsaSplitText extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._timer = 0;
            this._steps = 0;
        }
        static get observedAttributes() {
            return ['by', 'text'];
        }
        get units() {
            return Array.from(this.querySelectorAll('.usa-split-unit'));
        }
        mount() {
            if (this._source === null)
                this._source = this.getAttribute('text') ?? (this.textContent || '').replace(/\s+/g, ' ').trim();
            const text = this.getAttribute('text') ?? this._source;
            const mode = this.str('by', 'chars');
            const byWords = mode !== 'chars';
            const lang = this.closest('[lang]')?.getAttribute('lang') || undefined;
            const frag = document.createDocumentFragment();
            frag.append(base.srText(text));
            const units = [];
            for (const word of words(text, lang)) {
                if (/^\s+$/.test(word)) {
                    frag.append(' ');
                    continue;
                }
                const wordEl = document.createElement('span');
                wordEl.className = 'usa-split-word';
                wordEl.setAttribute('aria-hidden', 'true');
                const parts = byWords || JOINING_SCRIPT.test(word) ? [word] : graphemes(word, lang);
                for (const part of parts) {
                    const u = document.createElement('span');
                    u.className = 'usa-split-unit';
                    u.textContent = part;
                    units.push(u);
                    wordEl.append(u);
                }
                frag.append(wordEl);
            }
            this.replaceChildren(frag);
            // cascade order: per unit, or per line for by="lines"
            let rank = units.map((_, k) => k);
            if (mode === 'lines') {
                let line = -1;
                let top = null;
                rank = units.map((u) => {
                    const t = Math.round(u.parentElement.offsetTop);
                    if (top === null || Math.abs(t - top) > 2)
                        line++;
                    top = t;
                    return line;
                });
            }
            const groups = Math.max(0, ...rank) + 1;
            const order = splitOrder(groups, this.str('from', 'start'));
            units.forEach((u, k) => u.style.setProperty('--i', String(order[rank[k]] ?? 0)));
            const i = Math.max(0, ...units.map((_, k) => order[rank[k]] ?? 0)) + 1;
            this._steps = i;
            this.style.setProperty('--usa-split-stagger', `${this.num('stagger', mode === 'lines' ? 140 : byWords ? 70 : 28)}ms`);
            this.style.setProperty('--usa-split-duration', `${this.num('duration', 620)}ms`);
            this.style.setProperty('--usa-split-delay', `${this.num('delay', 0)}ms`);
            this.style.setProperty('--usa-split-count', String(i));
            if (this.reduced) {
                this.setAttribute('data-state', 'shown');
                return;
            }
            this.setAttribute('data-state', 'hidden');
            const trigger = this.str('trigger', 'view');
            if (trigger === 'load')
                this.play();
            else if (trigger === 'view') {
                this.inView((visible) => {
                    if (visible && this.getAttribute('data-state') === 'hidden')
                        this.play();
                    else if (!visible && this.flag('repeat'))
                        this.reset();
                }, { threshold: 0.2 });
            }
        }
        unmount() {
            clearTimeout(this._timer);
        }
        play() {
            clearTimeout(this._timer);
            if (this.reduced) {
                this.setAttribute('data-state', 'shown');
                return;
            }
            // Restart the CSS animations
            this.setAttribute('data-state', 'hidden');
            void this.offsetWidth;
            this.setAttribute('data-state', 'play');
            const by = this.str('by', 'chars');
            const total = this.num('delay', 0) + this.num('duration', 620) + Math.max(0, this._steps - 1) * this.num('stagger', by === 'lines' ? 140 : by === 'words' ? 70 : 28);
            this._timer = setTimeout(() => {
                this.setAttribute('data-state', 'shown');
                this.emit('complete');
            }, total);
        }
        reset() {
            clearTimeout(this._timer);
            this.setAttribute('data-state', this.reduced ? 'shown' : 'hidden');
        }
    }, { id: 'split-text', text: css$4 });
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\?!';
/** One frame of the scramble: the first `progress` share is resolved. */
function scrambleFrame(text, progress, glyphs = GLYPHS, rnd = Math.random) {
    const done = Math.floor(text.length * progress);
    let out = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += i < done || /\s|[.,:;!?'"()\-–—]/.test(ch) ? ch : glyphs[Math.floor(rnd() * glyphs.length)];
    }
    return out;
}
function defineScramble(tag = 'usa-scramble') {
    return base.defineElement(tag, (Base) => class UsaScramble extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._out = null;
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['text'];
        }
        get text() {
            return this.getAttribute('text') ?? this._source ?? '';
        }
        mount() {
            if (this._source === null)
                this._source = (this.textContent || '').trim();
            this._out = document.createElement('span');
            this._out.setAttribute('aria-hidden', 'true');
            this._out.textContent = this.text;
            this.replaceChildren(base.srText(this.text), this._out);
            if (this.reduced)
                return;
            const trigger = this.str('trigger', 'view');
            if (trigger === 'load')
                this.play();
            else if (trigger === 'hover') {
                this.listen(this, 'pointerenter', () => this.play());
                this.listen(this, 'focusin', () => this.play());
            }
            else if (trigger === 'view') {
                let played = false;
                this.inView((v) => {
                    if (v && !played) {
                        played = true;
                        this.play();
                    }
                });
            }
        }
        unmount() {
            base.caf(this._frame);
            this._frame = 0;
        }
        play() {
            base.caf(this._frame);
            const out = this._out;
            const text = this.text;
            if (!out || this.reduced) {
                if (out)
                    out.textContent = text;
                return Promise.resolve();
            }
            const duration = this.num('duration', 900);
            const glyphs = this.str('chars', GLYPHS) || GLYPHS;
            const t0 = base.now();
            let last = -1;
            return new Promise((resolve) => {
                const step = () => {
                    const p = Math.min(1, Math.max(0, base.now() - t0) / duration);
                    // ~30 fps glyph churn is plenty and halves DOM writes
                    const bucket = Math.floor(p * duration / 33);
                    if (bucket !== last || p === 1) {
                        last = bucket;
                        out.textContent = p === 1 ? text : scrambleFrame(text, p, glyphs);
                    }
                    if (p < 1)
                        this._frame = base.raf(step);
                    else {
                        this._frame = 0;
                        this.emit('complete');
                        resolve();
                    }
                };
                this._frame = base.raf(step);
            });
        }
    }, undefined);
}

var css$3 = "usa-counter{font-variant-numeric:tabular-nums}";

/** easeOutExpo */
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
function defineCounter(tag = 'usa-counter') {
    return base.defineElement(tag, (Base) => class UsaCounter extends Base {
        constructor() {
            super(...arguments);
            this._current = NaN;
            this._target = NaN;
            this._frame = 0;
            this._fmt = null;
        }
        static get observedAttributes() {
            return ['to', 'decimals', 'locale', 'prefix', 'suffix', 'grouping'];
        }
        get value() {
            return Number.isNaN(this._target) ? this.num('to', 0) : this._target;
        }
        set value(v) {
            this.play(Number(v));
        }
        format(n) {
            if (!this._fmt) {
                const d = Math.max(0, Math.min(20, this.num('decimals', 0)));
                const locale = this.getAttribute('locale') || (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
                try {
                    this._fmt = new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: this.getAttribute('grouping') !== 'false' });
                }
                catch {
                    this._fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
                }
            }
            return `${this.str('prefix')}${this._fmt.format(n)}${this.str('suffix')}`;
        }
        render(n) {
            this._current = n;
            this.textContent = this.format(n);
        }
        changed(name) {
            this._fmt = null;
            if (name === 'to')
                this.play();
            else
                this.render(Number.isNaN(this._current) ? this.num('from', 0) : this._current);
        }
        mount() {
            this._fmt = null;
            const to = this.num('to', 0);
            if (this.reduced) {
                this._target = to;
                this.render(to);
                return;
            }
            if (Number.isNaN(this._current))
                this.render(this.num('from', 0));
            const start = this.str('start', 'view');
            if (start === 'load')
                this.play();
            else if (start === 'view') {
                let done = false;
                this.inView((v) => {
                    if (v && !done) {
                        done = true;
                        this.play();
                    }
                }, { threshold: 0.4 });
            }
        }
        unmount() {
            base.caf(this._frame);
            this._frame = 0;
        }
        play(to = this.num('to', 0)) {
            base.caf(this._frame);
            this._target = to;
            const from = Number.isNaN(this._current) ? this.num('from', 0) : this._current;
            if (this.reduced || from === to || !this.isConnected) {
                this.render(to);
                this.emit('complete', { value: to });
                return Promise.resolve();
            }
            const duration = this.num('duration', 1600);
            const t0 = base.now();
            return new Promise((resolve) => {
                const step = () => {
                    const t = Math.min(1, Math.max(0, base.now() - t0) / duration);
                    this.render(from + (to - from) * easeOutExpo(t));
                    if (t < 1)
                        this._frame = base.raf(step);
                    else {
                        this._frame = 0;
                        this.render(to);
                        this.emit('complete', { value: to });
                        resolve();
                    }
                };
                this._frame = base.raf(step);
            });
        }
    }, { id: 'counter', text: css$3 });
}

var css$2 = "usa-shimmer-text{--usa-shimmer-color:currentColor;--usa-shimmer-shine:#fff;background:linear-gradient(var(--usa-shimmer-angle,110deg),var(--usa-shimmer-color) 35%,var(--usa-shimmer-shine) 50%,var(--usa-shimmer-color) 65%) 0 0 / 250% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:usa-shimmer var(--usa-shimmer-duration,2600ms) linear infinite}@keyframes usa-shimmer{from{background-position:100% 0}to{background-position:-150% 0}}";

function defineShimmerText(tag = 'usa-shimmer-text') {
    return base.defineElement(tag, (Base) => class UsaShimmerText extends Base {
        static get observedAttributes() {
            return ['duration', 'color', 'shine', 'angle'];
        }
        mount() {
            const set = (attr, prop, unit = '') => {
                const v = this.getAttribute(attr);
                if (v !== null)
                    this.style.setProperty(prop, v + unit);
                else
                    this.style.removeProperty(prop);
            };
            set('duration', '--usa-shimmer-duration', 'ms');
            set('color', '--usa-shimmer-color');
            set('shine', '--usa-shimmer-shine');
            set('angle', '--usa-shimmer-angle', 'deg');
        }
    }, { id: 'shimmer-text', text: css$2 });
}

var css$1 = "usa-text-rotate{display:inline-grid;vertical-align:bottom;overflow:hidden;padding-block:0.08em}usa-text-rotate .usa-rotate-word{grid-area:1 / 1;white-space:nowrap}usa-text-rotate .usa-rotate-word[data-hidden]{opacity:0}";

function defineTextRotate(tag = 'usa-text-rotate') {
    return base.defineElement(tag, (Base) => class UsaTextRotate extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._index = 0;
            this._timer = 0;
            this._visible = true;
        }
        static get observedAttributes() {
            return ['words', 'interval', 'paused'];
        }
        get index() {
            return this._index;
        }
        get words() {
            return (this.getAttribute('words') ?? this._source ?? '').split('|').map((w) => w.trim()).filter(Boolean);
        }
        mount() {
            if (this._source === null)
                this._source = (this.textContent || '').trim();
            const words = this.words;
            this.replaceChildren(base.srText(words.join(', ')), ...words.map((w, i) => {
                const s = document.createElement('span');
                s.className = 'usa-rotate-word';
                s.textContent = w;
                s.setAttribute('aria-hidden', 'true');
                if (i !== this._index)
                    s.setAttribute('data-hidden', '');
                return s;
            }));
            if (this._index >= words.length)
                this._index = 0;
            if (words.length < 2)
                return;
            this.inView((v) => (this._visible = v));
            if (!this.flag('paused')) {
                this._timer = setInterval(() => {
                    if (this._visible && !(typeof document !== 'undefined' && document.hidden))
                        this.next();
                }, Math.max(400, this.num('interval', 2200)));
            }
        }
        unmount() {
            clearInterval(this._timer);
            this._timer = 0;
        }
        next() {
            const els = Array.from(this.querySelectorAll('.usa-rotate-word'));
            if (els.length < 2)
                return;
            const prev = els[this._index];
            this._index = (this._index + 1) % els.length;
            const cur = els[this._index];
            prev.setAttribute('data-hidden', '');
            cur.removeAttribute('data-hidden');
            const effect = this.reduced ? 'fade' : this.str('effect', 'slide');
            const [inFrom, outTo] = effect === 'fade'
                ? [{ opacity: 0 }, { opacity: 0 }]
                : effect === 'flip'
                    ? [{ opacity: 0, transform: 'perspective(400px) rotateX(-90deg)' }, { opacity: 0, transform: 'perspective(400px) rotateX(90deg)' }]
                    : effect === 'blur'
                        ? [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 0, filter: 'blur(8px)' }]
                        : [{ opacity: 0, transform: 'translateY(0.8em)' }, { opacity: 0, transform: 'translateY(-0.8em)' }];
            const neutral = { opacity: 1, transform: 'none', filter: 'none' };
            const pick = (f) => Object.fromEntries(Object.keys(f).map((k) => [k, neutral[k]]));
            this.motion(prev, [{ ...pick(outTo) }, outTo], { duration: 380, easing: base.EASE_OUT });
            this.motion(cur, [inFrom, pick(inFrom)], { duration: 520, easing: effect === 'slide' ? base.EASE_SPRING : base.EASE_OUT });
            this.emit('change', { index: this._index, word: cur.textContent });
        }
    }, { id: 'text-rotate', text: css$1 });
}

var css = "usa-wave-text .usa-word,usa-scroll-highlight .usa-word{display:inline-block;white-space:nowrap}usa-wave-text .usa-char{display:inline-block;animation:usa-wave var(--usa-wave-s,1.6s) ease-in-out infinite;animation-delay:calc(var(--i) * var(--usa-wave-d,0.06s))}@keyframes usa-wave{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(calc(var(--usa-wave-a,0.25em) * -1))}}usa-glitch{position:relative;display:inline-block}usa-glitch::before,usa-glitch::after{content:attr(data-text);position:absolute;inset:0;pointer-events:none}usa-glitch::before{color:#ff2bd6;transform:translate(calc(var(--usa-glitch-i,3px) * -1),0);clip-path:inset(0 0 55% 0);mix-blend-mode:screen;animation:usa-glitch-a 2.4s steps(2,end) infinite}usa-glitch::after{color:#00f0ff;transform:translate(var(--usa-glitch-i,3px),0);clip-path:inset(50% 0 0 0);mix-blend-mode:screen;animation:usa-glitch-b 1.9s steps(2,end) infinite}usa-glitch[trigger=\"hover\"]::before,usa-glitch[trigger=\"hover\"]::after{animation-play-state:paused;opacity:0}usa-glitch[trigger=\"hover\"]:hover::before,usa-glitch[trigger=\"hover\"]:hover::after{animation-play-state:running;opacity:1}@keyframes usa-glitch-a{0%{clip-path:inset(0 0 80% 0)}20%{clip-path:inset(30% 0 40% 0)}40%{clip-path:inset(70% 0 5% 0)}60%{clip-path:inset(10% 0 60% 0)}80%{clip-path:inset(50% 0 30% 0)}100%{clip-path:inset(0 0 80% 0)}}@keyframes usa-glitch-b{0%{clip-path:inset(60% 0 10% 0)}25%{clip-path:inset(15% 0 70% 0)}50%{clip-path:inset(80% 0 2% 0)}75%{clip-path:inset(40% 0 35% 0)}100%{clip-path:inset(60% 0 10% 0)}}usa-gradient-text{background:var(--usa-grad) 0 50% / 300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:usa-grad-flow var(--usa-grad-s,6s) linear infinite}@keyframes usa-grad-flow{to{background-position:150% 50%}}usa-handwriting{--usa-hw-stroke:currentColor;display:inline-block;line-height:0}usa-handwriting svg{width:auto;max-width:100%;height:auto;overflow:visible}usa-handwriting text{fill:transparent;stroke:var(--usa-hw-stroke);stroke-width:1.2;stroke-dasharray:1600;stroke-dashoffset:1600;font-family:\"Segoe Script\",\"Brush Script MT\",\"Snell Roundhand\",cursive}usa-handwriting[data-state=\"drawing\"] text{animation:usa-hw-draw var(--usa-hw-d,2400ms) cubic-bezier(0.55,0,0.45,1) forwards,usa-hw-fill 0.6s ease calc(var(--usa-hw-d,2400ms) * 0.8) forwards}usa-handwriting[data-state=\"done\"] text{stroke-dashoffset:0;fill:currentColor}@keyframes usa-hw-draw{to{stroke-dashoffset:0}}@keyframes usa-hw-fill{to{fill:currentColor}}usa-scroll-highlight .usa-hl-word{opacity:var(--usa-hl-dim,0.2);transition:opacity 0.35s ease}usa-scroll-highlight .usa-hl-word[data-on]{opacity:1}usa-scroll-highlight[mode=\"marker\"]{--usa-hl-color:color-mix(in srgb,#facc15 55%,transparent);background:linear-gradient(var(--usa-hl-color),var(--usa-hl-color)) 0 88% / 0% 40% no-repeat;transition:background-size 1s cubic-bezier(0.65,0,0.35,1);-webkit-box-decoration-break:clone;box-decoration-break:clone}usa-scroll-highlight[mode=\"marker\"][data-lit]{background-size:100% 40%}@media (prefers-reduced-motion:reduce){usa-wave-text .usa-char,usa-glitch::before,usa-glitch::after,usa-gradient-text{animation:none !important}usa-glitch::before,usa-glitch::after{display:none}usa-scroll-highlight .usa-hl-word,usa-scroll-highlight[mode=\"marker\"]{transition:none}}";

/** Split `text` into per-character spans (words never break). The animated copy is aria-hidden. */
function splitChars(host, text) {
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    const chars = [];
    text.split(/(\s+)/).forEach((w) => {
        if (/^\s+$/.test(w)) {
            vis.append(document.createTextNode(w));
            return;
        }
        const word = document.createElement('span');
        word.className = 'usa-word';
        for (const c of Array.from(w)) {
            const s = document.createElement('span');
            s.className = 'usa-char';
            s.textContent = c;
            s.style.setProperty('--i', String(chars.length));
            word.append(s);
            chars.push(s);
        }
        vis.append(word);
    });
    host.replaceChildren(base.srText(text), vis);
    return chars;
}
const textOf = (el) => (el.getAttribute('text') ?? el.dataset.usaText ?? (el.dataset.usaText = (el.textContent || '').trim()));
function defineWaveText(tag = 'usa-wave-text') {
    return base.defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() { return ['text']; }
        mount() {
            splitChars(this, textOf(this));
            this.style.setProperty('--usa-wave-a', `${this.num('amplitude', 0.25)}em`);
            this.style.setProperty('--usa-wave-s', `${this.num('speed', 1.6)}s`);
            this.style.setProperty('--usa-wave-d', `${this.num('stagger', 0.06)}s`);
        }
    }, { id: 'text-fx', text: css });
}
function defineGlitch(tag = 'usa-glitch') {
    return base.defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() { return ['text', 'intensity']; }
        mount() {
            const t = textOf(this);
            this.setAttribute('data-text', t);
            this.style.setProperty('--usa-glitch-i', `${this.num('intensity', 3)}px`);
            if (!this.firstChild)
                this.textContent = t;
        }
    }, { id: 'text-fx', text: css });
}
function defineGradientText(tag = 'usa-gradient-text') {
    return base.defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() { return ['colors', 'speed', 'angle']; }
        mount() {
            const c = this.str('colors', '#7c5cff,#22d3ee,#f472b6,#facc15').split(',').map((s) => s.trim());
            this.style.setProperty('--usa-grad', `linear-gradient(${this.num('angle', 90)}deg, ${[...c, c[0]].join(', ')})`);
            this.style.setProperty('--usa-grad-s', `${this.num('speed', 6)}s`);
        }
    }, { id: 'text-fx', text: css });
}
function defineHandwriting(tag = 'usa-handwriting') {
    return base.defineElement(tag, (Base) => class extends Base {
        static get observedAttributes() { return ['text', 'size', 'font']; }
        mount() {
            const t = textOf(this);
            const size = this.num('size', 64);
            const w = Math.ceil(t.length * size * 0.62) + 8;
            this.replaceChildren(base.srText(t));
            this.insertAdjacentHTML('beforeend', `<svg aria-hidden="true" viewBox="0 0 ${w} ${Math.ceil(size * 1.3)}" width="${w}" height="${Math.ceil(size * 1.3)}"><text x="4" y="${Math.round(size)}" font-size="${size}"></text></svg>`);
            const text = this.querySelector('text');
            text.textContent = t;
            if (this.str('font'))
                text.setAttribute('font-family', this.str('font'));
            if (this.str('stroke'))
                this.style.setProperty('--usa-hw-stroke', this.str('stroke'));
            this.style.setProperty('--usa-hw-d', `${this.num('duration', 2400)}ms`);
            if (this.reduced) {
                this.setAttribute('data-state', 'done');
                return;
            }
            this.inView((v) => v && this.play(), { threshold: 0.3 });
        }
        play() {
            this.removeAttribute('data-state');
            void this.offsetWidth;
            this.setAttribute('data-state', 'drawing');
            setTimeout(() => {
                this.setAttribute('data-state', 'done');
                this.emit('complete');
            }, this.reduced ? 0 : this.num('duration', 2400));
        }
    }, { id: 'text-fx', text: css });
}
function defineScrollHighlight(tag = 'usa-scroll-highlight') {
    return base.defineElement(tag, (Base) => class extends Base {
        constructor() {
            super(...arguments);
            this._f = 0;
            this._p = 0;
        }
        static get observedAttributes() { return ['mode', 'text']; }
        get progress() { return this._p; }
        mount() {
            const mode = this.str('mode', 'words');
            if (this.str('color'))
                this.style.setProperty('--usa-hl-color', this.str('color'));
            this.style.setProperty('--usa-hl-dim', String(this.num('dim', 0.2)));
            if (mode === 'marker') {
                if (this.reduced)
                    this.setAttribute('data-lit', '');
                else
                    this.inView((v) => v && this.setAttribute('data-lit', ''), { threshold: 0.6 });
                return;
            }
            const t = textOf(this);
            const vis = document.createElement('span');
            vis.setAttribute('aria-hidden', 'true');
            const words = t.split(/\s+/).filter(Boolean).map((w) => {
                const s = document.createElement('span');
                s.className = 'usa-hl-word';
                s.textContent = w;
                vis.append(s, ' ');
                return s;
            });
            this.replaceChildren(base.srText(t), vis);
            if (this.reduced) {
                words.forEach((w) => w.setAttribute('data-on', ''));
                return;
            }
            const update = () => {
                this._f = 0;
                const r = this.getBoundingClientRect();
                const H = window.innerHeight || 800;
                this._p = base.clamp((H * 0.85 - r.top) / (r.height + H * 0.35), 0, 1);
                const lit = Math.round(this._p * words.length);
                words.forEach((w, i) => w.toggleAttribute('data-on', i < lit));
            };
            const on = () => !this._f && (this._f = base.raf(update));
            let active = false;
            this.inView((v) => {
                if (v === active)
                    return;
                active = v;
                if (v)
                    window.addEventListener('scroll', on, { passive: true });
                else
                    window.removeEventListener('scroll', on);
                on();
            });
            this.onCleanup(() => window.removeEventListener('scroll', on));
        }
        unmount() {
            base.caf(this._f);
            this._f = 0;
        }
    }, { id: 'text-fx', text: css });
}

/**
 * motionary/components/text — text effects.
 * `<usa-typewriter>`, `<usa-split-text>`, `<usa-scramble>`, `<usa-counter>`,
 * `<usa-shimmer-text>`, `<usa-text-rotate>`.
 */
/** Register every component of this category under its default tag. */
function defineTextComponents() {
    defineTypewriter();
    defineSplitText();
    defineScramble();
    defineCounter();
    defineShimmerText();
    defineTextRotate();
    defineWaveText();
    defineGlitch();
    defineGradientText();
    defineHandwriting();
    defineScrollHighlight();
}

exports.JOINING_SCRIPT = JOINING_SCRIPT;
exports.defineCounter = defineCounter;
exports.defineGlitch = defineGlitch;
exports.defineGradientText = defineGradientText;
exports.defineHandwriting = defineHandwriting;
exports.defineScramble = defineScramble;
exports.defineScrollHighlight = defineScrollHighlight;
exports.defineShimmerText = defineShimmerText;
exports.defineSplitText = defineSplitText;
exports.defineTextComponents = defineTextComponents;
exports.defineTextRotate = defineTextRotate;
exports.defineTypewriter = defineTypewriter;
exports.defineWaveText = defineWaveText;
exports.easeOutExpo = easeOutExpo;
exports.graphemes = graphemes;
exports.scrambleFrame = scrambleFrame;
exports.splitOrder = splitOrder;
exports.splitText = splitText;
exports.splitTimeline = splitTimeline;
exports.splitWords = words;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/components/text.cjs.map