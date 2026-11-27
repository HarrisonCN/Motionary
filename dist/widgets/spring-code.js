import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { f as feedback } from '../chunks/micro-DxpcOO8J.js';
import { h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { d as codeChars } from '../chunks/spring-kit-17-B1KexqJR.js';
import { c as css } from '../chunks/spring-kit-17-2jh182UJ.js';

function defineSpringCode(tag = 'usa-spring-code') {
    const ctor = defineElement(tag, (Base) => class SpringCode extends Base {
        constructor() {
            super(...arguments);
            this._chars = [];
            this._api = null;
        }
        static get observedAttributes() {
            return ['length', 'mode', 'group', 'label', 'value', 'name', 'mask', 'disabled', 'feel', 'haptics'];
        }
        get value() {
            return this._chars.join('');
        }
        set value(v) {
            if (this._api)
                this._api.fill(String(v ?? ''), -1, false);
            else
                this._chars = String(v ?? '').split('');
        }
        accept() {
            this._api?.state('ok');
        }
        reject() {
            this._api?.state('bad');
        }
        clear() {
            this._api?.fill('', -1, false);
        }
        mount() {
            const length = Math.max(1, Math.min(12, Math.floor(this.num('length', 6))));
            const mode = this.str('mode') === 'alphanumeric' ? 'alphanumeric' : 'numeric';
            const attr = this.getAttribute('value');
            if (attr !== this._seen) {
                this._seen = attr;
                this._chars = codeChars(attr ?? '', mode, length);
            }
            this._chars = codeChars(this._chars.join(''), mode, length);
            const disabled = this.flag('disabled');
            const mask = this.flag('mask');
            const every = Math.max(0, Math.floor(this.num('group', 0)));
            const label = this.str('label', 'Verification code');
            const root = make('div', 'usa-skit usa-scode');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', label);
            const boxes = Array.from({ length }, (_, i) => {
                if (every && i && i % every === 0) {
                    const gap = make('span', 'usa-scode-gap');
                    gap.setAttribute('aria-hidden', 'true');
                    root.append(gap);
                }
                const b = make('input', 'usa-scode-box');
                b.type = mask ? 'password' : 'text';
                b.inputMode = mode === 'numeric' ? 'numeric' : 'text';
                b.autocomplete = i === 0 ? 'one-time-code' : 'off';
                b.setAttribute('autocapitalize', 'characters');
                b.spellcheck = false;
                b.disabled = disabled;
                b.setAttribute('aria-label', `${label}, character ${i + 1} of ${length}`);
                root.append(b);
                return b;
            });
            const live = make('span', 'usa-skit-sr');
            live.setAttribute('aria-live', 'polite');
            const hidden = this.str('name') ? make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
            }
            this.append(root, live, ...(hidden ? [hidden] : []));
            const init = {};
            boxes.forEach((_, i) => (init[`b${i}`] = 1));
            const group = hostSprings(this, init, (v) => {
                boxes.forEach((b, i) => {
                    b.style.transform = `scale(${Math.round(Math.max(0, v[`b${i}`]) * 1000) / 1000})`;
                });
            });
            const paint = () => {
                boxes.forEach((b, i) => (b.value = this._chars[i] ?? ''));
                if (hidden)
                    hidden.value = this._chars.join('');
            };
            paint();
            const pop = (i, delay = 0) => {
                group.jump({ [`b${i}`]: 0.78 - Math.min(0.2, delay * 0.03) });
                group.set({ [`b${i}`]: 1 }, { spring: 'pop', velocity: { [`b${i}`]: 1.5 } });
            };
            const fill = (text, from, user) => {
                root.removeAttribute('data-state');
                const chars = codeChars(text, mode, length);
                if (from < 0)
                    this._chars = chars;
                else {
                    const next = this._chars.slice();
                    chars.forEach((c, k) => from + k < length && (next[from + k] = c));
                    this._chars = next.slice(0, length);
                }
                // keep it a prefix: no holes before a filled box
                const firstHole = Array.from({ length }, (_, i) => this._chars[i] ?? '').findIndex((c) => !c);
                if (firstHole >= 0)
                    this._chars = this._chars.slice(0, firstHole);
                paint();
                if (user)
                    chars.forEach((_, k) => from + k < length && pop(Math.max(0, from) + k, k));
                const value = this._chars.join('');
                if (user) {
                    tick(this, 4);
                    this.emit('change', { value });
                    if (value.length === length) {
                        live.textContent = 'Code complete';
                        this.emit('complete', { value });
                    }
                }
                return Math.min(length - 1, this._chars.length);
            };
            const state = (s) => {
                if (s === 'bad') {
                    root.setAttribute('data-state', 'bad');
                    feedback(root, 'shake', { feel: this.str('feel') || undefined });
                    tick(this, [12, 60, 12]);
                    live.textContent = 'Code not accepted';
                    this._chars = [];
                    paint();
                    if (!disabled)
                        boxes[0]?.focus();
                }
                else if (s === 'ok') {
                    root.setAttribute('data-state', 'ok');
                    feedback(root, 'nod', { feel: this.str('feel') || undefined });
                    boxes.forEach((_, i) => group.impulse({ [`b${i}`]: 1.2 + i * 0.25 }, 'bouncy'));
                    tick(this, 14);
                    live.textContent = 'Code accepted';
                }
                else
                    root.removeAttribute('data-state');
            };
            this._api = { fill: (t, f, u) => void fill(t, f, u), state };
            boxes.forEach((b, i) => {
                this.listen(b, 'focus', () => {
                    // never leave a hole: focusing past the end goes to the first empty box
                    const first = Math.min(length - 1, this._chars.length);
                    if (i > first)
                        boxes[first].focus();
                    else
                        b.select();
                });
                this.listen(b, 'input', () => {
                    const typed = b.value;
                    if (!typed) {
                        this._chars = this._chars.slice(0, i);
                        paint();
                        this.emit('change', { value: this._chars.join('') });
                        return;
                    }
                    const chars = codeChars(typed.length > 1 && typed.startsWith(this._chars[i] ?? '\u0000') ? typed.slice(1) : typed, mode, length);
                    if (!chars.length) {
                        b.value = this._chars[i] ?? '';
                        feedback(b, 'shake', { feel: this.str('feel') || undefined });
                        return;
                    }
                    const next = fill(chars.join(''), i, true);
                    if (this._chars.length < length)
                        boxes[next]?.focus();
                    else
                        b.blur();
                });
                this.listen(b, 'keydown', (e) => {
                    if (e.key === 'Backspace' && !b.value && i > 0) {
                        e.preventDefault();
                        this._chars = this._chars.slice(0, i - 1);
                        paint();
                        boxes[i - 1].focus();
                        group.impulse({ [`b${i - 1}`]: -1.2 }, 'gentle');
                        this.emit('change', { value: this._chars.join('') });
                    }
                    else if (e.key === 'ArrowLeft' && i > 0) {
                        e.preventDefault();
                        boxes[i - 1].focus();
                    }
                    else if (e.key === 'ArrowRight' && i < length - 1) {
                        e.preventDefault();
                        boxes[i + 1].focus();
                    }
                });
                this.listen(b, 'paste', (e) => {
                    const text = e.clipboardData?.getData('text') ?? '';
                    e.preventDefault();
                    const next = fill(text, i, true);
                    if (this._chars.length < length)
                        boxes[next]?.focus();
                });
            });
            this.onCleanup(() => {
                group.stop();
                root.remove();
                live.remove();
                hidden?.remove();
                this._api = null;
            });
        }
    }, { id: 'spring-kit-17', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSpringCode };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/spring-code.js.map