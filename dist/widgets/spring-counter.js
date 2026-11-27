import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { h as hostSprings } from '../chunks/micro-kit-16-DrJflWG2.js';
import { f as counterText, b as alignDigits } from '../chunks/spring-kit-17-B1KexqJR.js';
import { c as css } from '../chunks/spring-kit-17-2jh182UJ.js';

function defineSpringCounter(tag = 'usa-spring-counter') {
    const ctor = defineElement(tag, (Base) => class SpringCounter extends Base {
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
            const root = make('span', 'usa-skit usa-scount');
            root.setAttribute('role', 'status');
            const sr = make('span', 'usa-skit-sr');
            const show = make('span', 'usa-scount-digits');
            show.setAttribute('aria-hidden', 'true');
            const pre = this.str('prefix') ? make('span', 'usa-scount-affix', this.str('prefix')) : null;
            const suf = this.str('suffix') ? make('span', 'usa-scount-affix', this.str('suffix')) : null;
            if (pre)
                pre.setAttribute('aria-hidden', 'true');
            if (suf)
                suf.setAttribute('aria-hidden', 'true');
            root.append(sr, ...(pre ? [pre] : []), show, ...(suf ? [suf] : []));
            this.append(root);
            let cols = [];
            let seq = 0;
            const group = hostSprings(this, {}, (v) => {
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
                const r = make('span', 'usa-scount-reel');
                for (let d = 0; d <= 9; d++)
                    r.append(make('span', '', String(d)));
                return r;
            };
            const build = (text) => {
                show.textContent = '';
                cols = text.split('').map((ch) => {
                    const digit = /\d/.test(ch);
                    const el = make('span', 'usa-scount-col');
                    const key = `c${++seq}`;
                    let r;
                    if (digit) {
                        el.dataset.digit = '';
                        r = reel();
                    }
                    else
                        r = make('span', 'usa-scount-reel', ch);
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
                const pairs = alignDigits(from, to);
                // rebuild the columns for the new text, starting every digit at its old digit
                show.textContent = '';
                const next = [];
                pairs.forEach(([a, b], i) => {
                    if (!b)
                        return;
                    const digit = /\d/.test(b);
                    const el = make('span', 'usa-scount-col');
                    const key = `c${++seq}`;
                    const r = digit ? reel() : make('span', 'usa-scount-reel', b);
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
            const text = () => counterText(this._value, decimals, sep);
            const set = (n) => {
                const before = this._shown ?? counterText(0, decimals, sep);
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
                const zero = counterText(0, decimals, sep);
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
    }, { id: 'spring-kit-17', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSpringCounter };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/spring-counter.js.map