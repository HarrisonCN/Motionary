'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var microKit16 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var springKit17$1 = require('../chunks/spring-kit-17-Y1urAq72.cjs');
var springKit17 = require('../chunks/spring-kit-17-BzIkfNWk.cjs');

function defineSpringCounter(tag = 'usa-spring-counter') {
    const ctor = base.defineElement(tag, (Base) => class SpringCounter extends Base {
        constructor() {
            super(...arguments);
            this._value = 0;
            this._shown = null;
            this._played = false;
            this._set = null;
        }
        static get observedAttributes() {
            return ['value', 'decimals', 'group', 'prefix', 'suffix', 'from-zero', 'label', 'feel'];
        }
        get value() {
            return this._value;
        }
        set value(v) {
            const n = Number(v);
            if (!Number.isFinite(n))
                return;
            if (this._set)
                this._set(n);
            else
                this._value = n;
        }
        mount() {
            const attr = this.getAttribute('value');
            const first = this._seen === undefined;
            if (attr !== this._seen) {
                this._seen = attr;
                this._value = this.num('value', 0);
            }
            const decimals = this.num('decimals', 0);
            const sep = this.str('group');
            const root = moments.make('span', 'usa-skit usa-scount');
            root.setAttribute('role', 'status');
            const sr = moments.make('span', 'usa-skit-sr');
            const show = moments.make('span', 'usa-scount-digits');
            show.setAttribute('aria-hidden', 'true');
            const pre = this.str('prefix') ? moments.make('span', 'usa-scount-affix', this.str('prefix')) : null;
            const suf = this.str('suffix') ? moments.make('span', 'usa-scount-affix', this.str('suffix')) : null;
            if (pre)
                pre.setAttribute('aria-hidden', 'true');
            if (suf)
                suf.setAttribute('aria-hidden', 'true');
            root.append(sr, ...(pre ? [pre] : []), show, ...(suf ? [suf] : []));
            this.append(root);
            let cols = [];
            let seq = 0;
            const group = microKit16.hostSprings(this, {}, (v) => {
                for (const c of cols) {
                    const p = v[c.key] ?? 0;
                    if (c.digit)
                        c.reel.style.transform = `translateY(${Math.round(-p * 1000) / 100}%)`;
                    const w = v[`${c.key}w`];
                    if (w !== undefined) {
                        c.el.style.width = w >= 0.999 ? '' : `${Math.round(Math.max(0, w) * 100) / 100}ch`;
                        c.el.style.opacity = String(Math.round(Math.min(1, Math.max(0, w)) * 100) / 100);
                    }
                }
            });
            const reel = () => {
                const r = moments.make('span', 'usa-scount-reel');
                for (let d = 0; d <= 9; d++)
                    r.append(moments.make('span', '', String(d)));
                return r;
            };
            const build = (text) => {
                show.textContent = '';
                cols = text.split('').map((ch) => {
                    const digit = /\d/.test(ch);
                    const el = moments.make('span', 'usa-scount-col');
                    const key = `c${++seq}`;
                    let r;
                    if (digit) {
                        el.dataset.digit = '';
                        r = reel();
                    }
                    else
                        r = moments.make('span', 'usa-scount-reel', ch);
                    el.append(r);
                    show.append(el);
                    group.jump({ [key]: digit ? Number(ch) : 0 });
                    return { el, reel: r, key, digit };
                });
            };
            const say = (text) => {
                sr.textContent = `${this.str('label') ? `${this.str('label')} ` : ''}${this.str('prefix')}${text}${this.str('suffix')}`;
            };
            const roll = (from, to) => {
                const pairs = springKit17$1.alignDigits(from, to);
                // rebuild the columns for the new text, starting every digit at its old digit
                show.textContent = '';
                const next = [];
                pairs.forEach(([a, b], i) => {
                    if (!b)
                        return;
                    const digit = /\d/.test(b);
                    const el = moments.make('span', 'usa-scount-col');
                    const key = `c${++seq}`;
                    const r = digit ? reel() : moments.make('span', 'usa-scount-reel', b);
                    if (digit)
                        el.dataset.digit = '';
                    el.append(r);
                    show.append(el);
                    const col = { el, reel: r, key, digit };
                    next.push(col);
                    const delay = pairs.length - 1 - i;
                    if (digit) {
                        const start = /\d/.test(a) ? Number(a) : 0;
                        group.jump({ [key]: start });
                        group.set({ [key]: Number(b) }, { spring: delay ? 'smooth' : 'bouncy' });
                    }
                    if (!a) {
                        group.jump({ [`${key}w`]: 0 });
                        group.set({ [`${key}w`]: 1 }, { spring: 'smooth' });
                    }
                });
                cols = next;
            };
            const text = () => springKit17$1.counterText(this._value, decimals, sep);
            const set = (n) => {
                const before = this._shown ?? springKit17$1.counterText(0, decimals, sep);
                const changed = n !== this._value;
                this._value = n;
                this._played = true;
                const after = text();
                this._shown = after;
                say(after);
                roll(before, after);
                if (changed)
                    this.emit('change', { value: n });
            };
            this._set = set;
            if (this.flag('from-zero') && !this._played) {
                // the intro roll from zero plays once, the first time the counter is seen
                const zero = springKit17$1.counterText(0, decimals, sep);
                build(zero);
                this._shown = zero;
                say(text());
                this.inView((visible) => {
                    if (!visible || this._played)
                        return;
                    this._played = true;
                    const after = text();
                    this._shown = after;
                    roll(zero, after);
                });
            }
            else if (this._shown && this._shown !== text()) {
                const before = this._shown;
                this._shown = text();
                say(this._shown);
                roll(before, this._shown);
                if (!first)
                    this.emit('change', { value: this._value });
            }
            else {
                this._shown = text();
                build(this._shown);
                say(this._shown);
            }
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._set = null;
            });
        }
    }, { id: 'spring-kit-17', text: springKit17.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSpringCounter = defineSpringCounter;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/spring-counter.cjs.map