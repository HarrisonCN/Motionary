import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { o as ownChildren } from '../chunks/shared-C8Pi6tuh.js';

var css = "usa-masonry-flow{position:relative;display:block;width:100%}usa-masonry-flow>*{position:absolute;left:0;top:0;box-sizing:border-box;margin:0;will-change:transform}usa-masonry-flow>[data-hidden]:not([data-leaving]){display:none}usa-masonry-flow>[data-leaving]{pointer-events:none}";

function defineMasonryFlow(tag = 'usa-masonry-flow') {
    return defineElement(tag, (Base) => {
        class UsaMasonryFlow extends Base {
            constructor() {
                super(...arguments);
                this._cols = 1;
                this._pos = new Map();
                this._busy = false;
            }
            static get observedAttributes() {
                return ['min', 'gap'];
            }
            get columns() {
                return this._cols;
            }
            items() {
                return ownChildren(this);
            }
            mount() {
                this.layout(false);
                if (typeof ResizeObserver === 'function') {
                    let w = this.clientWidth;
                    const ro = new ResizeObserver(() => {
                        if (Math.abs(this.clientWidth - w) < 2)
                            return;
                        w = this.clientWidth;
                        this.layout(true);
                    });
                    ro.observe(this);
                    this.onCleanup(() => ro.disconnect());
                }
                if (typeof MutationObserver === 'function') {
                    const mo = new MutationObserver(() => !this._busy && this.layout(true));
                    mo.observe(this, { childList: true });
                    this.onCleanup(() => mo.disconnect());
                }
                // images change heights when they load
                this.listen(this, 'load', () => this.layout(false), { capture: true });
            }
            layout(animate = true) {
                const gap = Math.max(0, this.num('gap', 12));
                const min = Math.max(60, this.num('min', 160));
                const W = this.clientWidth || 1;
                const cols = Math.max(1, Math.floor((W + gap) / (min + gap)));
                const cw = (W - gap * (cols - 1)) / cols;
                const heights = new Array(cols).fill(0);
                const all = this.items();
                for (const it of all) {
                    const hidden = it.hasAttribute('data-hidden');
                    it.style.width = `${cw}px`;
                    if (hidden)
                        continue;
                    const c = heights.indexOf(Math.min(...heights));
                    const x = c * (cw + gap);
                    const y = heights[c];
                    heights[c] += (it.offsetHeight || 0) + gap;
                    const old = this._pos.get(it);
                    it.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
                    if (animate && !this.reduced && old && (old[0] !== x || old[1] !== y)) {
                        this.motion(it, [{ transform: `translate(${old[0].toFixed(1)}px,${old[1].toFixed(1)}px)` }, { transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)` }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
                    }
                    else if (animate && !this.reduced && !old) {
                        this.motion(it, [{ opacity: 0, transform: `translate(${x.toFixed(1)}px,${(y + 20).toFixed(1)}px) scale(.9)` }, { opacity: 1, transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)` }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
                    }
                    this._pos.set(it, [x, y]);
                }
                for (const k of Array.from(this._pos.keys()))
                    if (!all.includes(k) || k.hasAttribute('data-hidden'))
                        this._pos.delete(k);
                this.style.height = `${Math.max(0, Math.max(...heights) - gap)}px`;
                const changed = cols !== this._cols;
                this._cols = cols;
                if (changed || animate)
                    this.emit('layout', { columns: cols });
            }
            filter(fn) {
                const test = typeof fn === 'string' ? (el) => el.matches(fn) : fn || (() => true);
                for (const it of this.items()) {
                    const show = test(it);
                    const was = !it.hasAttribute('data-hidden');
                    if (show === was)
                        continue;
                    if (show)
                        it.removeAttribute('data-hidden');
                    else if (this.reduced)
                        it.setAttribute('data-hidden', '');
                    else {
                        const tf = it.style.transform;
                        const a = this.motion(it, [{ opacity: 1, transform: tf }, { opacity: 0, transform: `${tf} scale(.6)` }], { duration: 260, easing: 'ease-in' });
                        it.setAttribute('data-hidden', '');
                        if (a) {
                            it.setAttribute('data-leaving', '');
                            const rm = () => it.removeAttribute('data-leaving');
                            a.finished.then(rm, rm);
                        }
                    }
                }
                this.layout(true);
            }
            reorder(list) {
                this._busy = true;
                for (const it of list)
                    this.append(it);
                this._busy = false;
                this.layout(true);
            }
            shuffle() {
                const list = this.items();
                for (let i = list.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [list[i], list[j]] = [list[j], list[i]];
                }
                this.reorder(list);
            }
            sort(compare) {
                this.reorder(this.items().sort(compare));
            }
        }
        return UsaMasonryFlow;
    }, { id: 'masonry-flow', text: css });
}

export { defineMasonryFlow };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/widgets/masonry-flow.js.map