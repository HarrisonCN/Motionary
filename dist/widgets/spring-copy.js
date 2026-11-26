import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { m as micro } from '../chunks/micro-DxpcOO8J.js';
import { h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { c as css } from '../chunks/spring-kit-17-2jh182UJ.js';

const SVG = 'http://www.w3.org/2000/svg';
const ICONS = {
    copy: 'M9 9h10v11H9zM5 15V4h10',
    ok: 'M5 12.5l4.5 4.5L19 7.5',
    bad: 'M7 7l10 10M17 7L7 17',
};
const icon = (d) => {
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', d);
    svg.append(p);
    return svg;
};
function defineSpringCopy(tag = 'usa-spring-copy') {
    const ctor = defineElement(tag, (Base) => class SpringCopy extends Base {
        constructor() {
            super(...arguments);
            this._copy = null;
        }
        static get observedAttributes() {
            return ['text', 'for', 'label', 'copied-label', 'failed-label', 'show-text', 'reset', 'fx', 'disabled', 'feel', 'haptics'];
        }
        copy() {
            return this._copy ? this._copy() : Promise.resolve(false);
        }
        mount() {
            const btn = make('button', 'usa-skit usa-scopy');
            btn.type = 'button';
            btn.disabled = this.flag('disabled');
            const icons = make('span', 'usa-scopy-icons');
            const copyIcon = icon(ICONS.copy);
            const okIcon = icon(ICONS.ok);
            const badIcon = icon(ICONS.bad);
            icons.append(copyIcon, okIcon, badIcon);
            const label = this.str('label', 'Copy');
            const text = make('span', this.flag('show-text') ? 'usa-scopy-code' : 'usa-scopy-label');
            const source = () => {
                const id = this.str('for');
                const el = id ? this.ownerDocument.getElementById(id) : null;
                if (el)
                    return 'value' in el && typeof el.value === 'string' ? el.value : el.textContent ?? '';
                return this.str('text');
            };
            text.textContent = this.flag('show-text') ? source() : label;
            if (this.flag('show-text'))
                btn.setAttribute('aria-label', `${label}: ${source()}`);
            btn.append(icons, text);
            const live = make('span', 'usa-skit-sr');
            live.setAttribute('aria-live', 'polite');
            this.append(btn, live);
            const handle = micro(btn, this.str('fx', 'press hover focus'), { feel: this.str('feel') || undefined, haptics: this.flag('haptics') });
            const group = hostSprings(this, { c: 1, o: 0, x: 0 }, (v) => {
                copyIcon.style.transform = `scale(${Math.round(Math.max(0, v.c) * 1000) / 1000}) rotate(${Math.round((1 - Math.min(1, v.c)) * -40)}deg)`;
                const o = Math.max(0, v.o);
                okIcon.style.transform = `scale(${Math.round(o * 1000) / 1000})`;
                badIcon.style.transform = `scale(${Math.round(Math.max(0, v.x) * 1000) / 1000})`;
            });
            let timer;
            const settle = (state) => {
                clearTimeout(timer);
                btn.dataset.state = state;
                group.set({ c: 0 }, { spring: 'snappy' });
                group.jump({ o: 0, x: 0 });
                group.set(state === 'ok' ? { o: 1, x: 0 } : { o: 0, x: 1 }, { spring: 'pop' });
                live.textContent = state === 'ok' ? this.str('copied-label', 'Copied') : this.str('failed-label', "Couldn't copy");
                if (!this.flag('show-text'))
                    text.textContent = live.textContent;
                handle.feedback(state === 'ok' ? 'pop' : 'shake');
                tick(this, state === 'ok' ? 10 : [10, 50, 10]);
                const reset = this.num('reset', 1600);
                if (reset > 0)
                    timer = setTimeout(() => {
                        delete btn.dataset.state;
                        group.set({ c: 1, o: 0, x: 0 }, { spring: 'bouncy' });
                        if (!this.flag('show-text'))
                            text.textContent = label;
                    }, reset);
            };
            this._copy = async () => {
                const value = source();
                let ok = false;
                try {
                    if (!value)
                        throw new Error('[motionary] nothing to copy');
                    await navigator.clipboard.writeText(value);
                    ok = true;
                }
                catch {
                    ok = false;
                }
                settle(ok ? 'ok' : 'bad');
                this.emit('copy', { ok, text: value });
                return ok;
            };
            this.listen(btn, 'click', () => {
                if (!btn.disabled)
                    void this._copy?.();
            });
            this.onCleanup(() => {
                clearTimeout(timer);
                group.stop();
                handle.destroy();
                btn.remove();
                live.remove();
                this._copy = null;
            });
        }
    }, { id: 'spring-kit-17', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSpringCopy };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/spring-copy.js.map