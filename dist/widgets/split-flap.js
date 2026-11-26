import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { l as list } from '../chunks/kit-DugHPVcq.js';
import { f as flapSteps } from '../chunks/kit-13-hC4WCTBH.js';
import { c as css } from '../chunks/motion-kit-13-BNuKjO2V.js';

const CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/';
function defineSplitFlap(tag = 'usa-split-flap') {
    const ctor = defineElement(tag, Base => class SplitFlap extends Base {
        constructor() {
            super(...arguments);
            this._text = '';
        }
        static get observedAttributes() { return ['value', 'words', 'interval', 'length', 'charset', 'speed']; }
        get value() { return this.getAttribute('value') ?? this._text; }
        set value(v) { this.setAttribute('value', String(v ?? '')); }
        changed(name) { if (name === 'value' && this._show)
            this._show(this.value);
        else
            super.changed(name); }
        mount() {
            const nodes = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
            if (!this._text)
                this._text = (this.textContent || '').trim();
            for (const n of nodes)
                n.remove();
            const words = list(this.str('words'), 30);
            const charset = (this.str('charset') || CHARSET).toUpperCase();
            const up = (s) => s.toUpperCase();
            const len = Math.max(1, Math.min(40, Math.round(this.num('length', Math.max(this.value.length, ...words.map((w) => w.length), 1)))));
            const speed = Math.max(20, Math.min(400, this.num('speed', 60)));
            const root = make('span', 'usa-kit usa-flap');
            root.style.setProperty('--flap-ms', `${speed}ms`);
            root.toggleAttribute('data-static', this.reduced);
            const live = make('span', 'usa-kit-sr');
            live.setAttribute('aria-live', 'polite');
            const board = make('span', 'usa-flap-board');
            board.setAttribute('aria-hidden', 'true');
            const cells = Array.from({ length: len }, () => {
                const c = make('span', 'usa-flap-cell');
                const top = make('span', 'usa-flap-top');
                const bot = make('span', 'usa-flap-bot');
                const leaf = make('span', 'usa-flap-leaf');
                const leafBack = make('span', 'usa-flap-leaf-back');
                c.append(top, bot, leaf, leafBack);
                board.append(c);
                return { c, top, bot, leaf, leafBack, ch: ' ', timer: 0 };
            });
            root.append(board, live);
            this.append(root);
            const setFace = (cell, ch) => {
                cell.ch = ch;
                cell.top.textContent = cell.bot.textContent = ch;
            };
            const flipTo = (cell, target, delay) => {
                clearTimeout(cell.timer);
                if (this.reduced) {
                    setFace(cell, target);
                    return;
                }
                let steps = Math.min(charset.length, flapSteps(cell.ch, target, charset));
                if (!steps)
                    return;
                const tick = () => {
                    const i = charset.indexOf(cell.ch);
                    const next = steps <= 1 || i < 0 ? target : charset[(i + 1) % charset.length];
                    cell.leaf.textContent = cell.ch;
                    cell.leafBack.textContent = next;
                    cell.top.textContent = next;
                    cell.c.removeAttribute('data-flip');
                    void cell.c.offsetWidth;
                    cell.c.setAttribute('data-flip', '');
                    cell.timer = window.setTimeout(() => { cell.bot.textContent = next; cell.ch = next; steps--; if (steps > 0)
                        tick();
                    else
                        cell.c.removeAttribute('data-flip'); }, speed);
                };
                cell.timer = window.setTimeout(tick, delay);
            };
            const show = (v, first = false) => {
                const text = up(String(v ?? '')).slice(0, len).padEnd(len, ' ');
                live.textContent = String(v ?? '').trim();
                cells.forEach((cell, i) => (first ? setFace(cell, text[i]) : flipTo(cell, text[i], i * 40)));
                if (!first)
                    this.emit('change', { value: String(v ?? '') });
            };
            this._show = (v) => show(v);
            cells.forEach((c) => setFace(c, ' '));
            let started = false;
            this.inView((vis) => {
                if (!vis || started)
                    return;
                started = true;
                show(this.value || words[0] || '', this.reduced);
            });
            let wi = 0;
            let cycle = 0;
            const interval = Math.max(800, this.num('interval', 3000));
            if (words.length > 1 && !this.reduced) {
                cycle = window.setInterval(() => {
                    if (!started || document.hidden)
                        return;
                    wi = (wi + 1) % words.length;
                    show(words[wi]);
                }, interval);
            }
            this.onCleanup(() => {
                clearInterval(cycle);
                cells.forEach((c) => clearTimeout(c.timer));
                root.remove();
                this.append(...nodes);
                this._show = undefined;
            });
        }
    }, { id: 'motion-kit-13', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSplitFlap };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/split-flap.js.map