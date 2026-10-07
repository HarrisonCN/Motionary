'use strict';

var base = require('../chunks/base-BR6fYLBA.cjs');

var css$4 = "usa-typewriter{white-space:pre-wrap}usa-typewriter .usa-tw-caret{display:inline-block;width:var(--usa-caret-width,0.08em);height:1.05em;margin-left:0.06em;vertical-align:-0.12em;background:var(--usa-caret-color,currentColor);animation:usa-caret 1.06s steps(1) infinite}usa-typewriter[data-typing] .usa-tw-caret{animation:none}usa-typewriter[data-no-cursor] .usa-tw-caret{display:none}@keyframes usa-caret{50%{opacity:0}}@media (prefers-reduced-motion:reduce){usa-typewriter .usa-tw-caret,usa-shimmer-text{animation:none}}";

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
    }, { id: 'typewriter', text: css$4 });
}

var css$3 = "usa-split-text .usa-split-word{display:inline-block;white-space:nowrap}usa-split-text .usa-split-unit{display:inline-block;white-space:pre}usa-split-text[data-state=\"hidden\"] .usa-split-unit{opacity:0}usa-split-text[data-state=\"play\"] .usa-split-unit{animation:usa-split-rise var(--usa-split-duration,620ms) cubic-bezier(0.22,1,0.36,1) both;animation-delay:calc(var(--usa-split-delay,0ms) + var(--i,0) * var(--usa-split-stagger,28ms))}usa-split-text[effect=\"fade\"][data-state=\"play\"] .usa-split-unit{animation-name:usa-split-fade}usa-split-text[effect=\"blur\"][data-state=\"play\"] .usa-split-unit{animation-name:usa-split-blur}usa-split-text[effect=\"flip\"][data-state=\"play\"] .usa-split-unit{animation-name:usa-split-flip;transform-origin:50% 100%}usa-split-text[effect=\"pop\"][data-state=\"play\"] .usa-split-unit{animation-name:usa-split-pop;animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)}@keyframes usa-split-rise{from{opacity:0;transform:translate3d(0,0.6em,0)}to{opacity:1;transform:none}}@keyframes usa-split-fade{from{opacity:0}to{opacity:1}}@keyframes usa-split-blur{from{opacity:0;filter:blur(8px)}to{opacity:1;filter:none}}@keyframes usa-split-flip{from{opacity:0;transform:perspective(500px) rotateX(-80deg)}to{opacity:1;transform:none}}@keyframes usa-split-pop{from{opacity:0;transform:scale(0.3)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){usa-split-text .usa-split-unit{animation:none !important;opacity:1 !important}}";

function defineSplitText(tag = 'usa-split-text') {
    return base.defineElement(tag, (Base) => class UsaSplitText extends Base {
        constructor() {
            super(...arguments);
            this._source = null;
            this._timer = 0;
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
            const byWords = this.str('by', 'chars') === 'words';
            const frag = document.createDocumentFragment();
            frag.append(base.srText(text));
            let i = 0;
            text.split(' ').forEach((word, w) => {
                if (w > 0)
                    frag.append(' ');
                const wordEl = document.createElement('span');
                wordEl.className = 'usa-split-word';
                wordEl.setAttribute('aria-hidden', 'true');
                const parts = byWords ? [word] : Array.from(word);
                for (const part of parts) {
                    const u = document.createElement('span');
                    u.className = 'usa-split-unit';
                    u.textContent = part;
                    u.style.setProperty('--i', String(i++));
                    wordEl.append(u);
                }
                frag.append(wordEl);
            });
            this.replaceChildren(frag);
            this.style.setProperty('--usa-split-stagger', `${this.num('stagger', byWords ? 70 : 28)}ms`);
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
            const n = this.units.length;
            const total = this.num('delay', 0) + this.num('duration', 620) + Math.max(0, n - 1) * this.num('stagger', this.str('by') === 'words' ? 70 : 28);
            this._timer = setTimeout(() => {
                this.setAttribute('data-state', 'shown');
                this.emit('complete');
            }, total);
        }
        reset() {
            clearTimeout(this._timer);
            this.setAttribute('data-state', this.reduced ? 'shown' : 'hidden');
        }
    }, { id: 'split-text', text: css$3 });
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

var css$2 = "usa-counter{font-variant-numeric:tabular-nums}";

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
    }, { id: 'counter', text: css$2 });
}

var css$1 = "usa-shimmer-text{--usa-shimmer-color:currentColor;--usa-shimmer-shine:#fff;background:linear-gradient(var(--usa-shimmer-angle,110deg),var(--usa-shimmer-color) 35%,var(--usa-shimmer-shine) 50%,var(--usa-shimmer-color) 65%) 0 0 / 250% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:usa-shimmer var(--usa-shimmer-duration,2600ms) linear infinite}@keyframes usa-shimmer{from{background-position:100% 0}to{background-position:-150% 0}}";

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
    }, { id: 'shimmer-text', text: css$1 });
}

var css = "usa-text-rotate{display:inline-grid;vertical-align:bottom;overflow:hidden;padding-block:0.08em}usa-text-rotate .usa-rotate-word{grid-area:1 / 1;white-space:nowrap}usa-text-rotate .usa-rotate-word[data-hidden]{opacity:0}";

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
    }, { id: 'text-rotate', text: css });
}

/**
 * use-scroll-animate/components/text — text effects.
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
}

exports.configureComponents = base.configureComponents;
exports.prefersReducedMotion = base.prefersReducedMotion;
exports.defineCounter = defineCounter;
exports.defineScramble = defineScramble;
exports.defineShimmerText = defineShimmerText;
exports.defineSplitText = defineSplitText;
exports.defineTextComponents = defineTextComponents;
exports.defineTextRotate = defineTextRotate;
exports.defineTypewriter = defineTypewriter;
exports.easeOutExpo = easeOutExpo;
exports.scrambleFrame = scrambleFrame;
//# sourceMappingURL=text.cjs.map
