import { f as defineElement, r as raf, b as caf } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { p as pressureAt } from '../chunks/kit-13-hC4WCTBH.js';
import { c as css } from '../chunks/motion-kit-13-BNuKjO2V.js';

function defineTextPressure(tag = 'usa-text-pressure') {
    const ctor = defineElement(tag, Base => class TextPressure extends Base {
        static get observedAttributes() { return ['radius', 'min-weight', 'max-weight', 'stretch']; }
        mount() {
            const nodes = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
            const text = (this.textContent || '').replace(/\s+/g, ' ').trim();
            for (const n of nodes)
                n.remove();
            const minW = Math.max(100, Math.min(900, this.num('min-weight', 300)));
            const maxW = Math.max(minW, Math.min(1000, this.num('max-weight', 900)));
            const stretch = Math.max(0, Math.min(1, this.num('stretch', 0.35)));
            const radius = Math.max(20, Math.min(1000, this.num('radius', 160)));
            const root = make('span', 'usa-kit usa-press');
            root.style.setProperty('--wmin', String(minW));
            root.toggleAttribute('data-static', this.reduced);
            const sr = make('span', 'usa-kit-sr', text);
            const vis = make('span', 'usa-press-word');
            vis.setAttribute('aria-hidden', 'true');
            const letters = [...text].map((ch) => {
                const s = make('span', ch === ' ' ? 'usa-press-gap' : 'usa-press-ch', ch === ' ' ? ' ' : ch);
                vis.append(s);
                return s;
            });
            root.append(sr, vis);
            this.append(root);
            let frame = 0;
            let pointer = null;
            const draw = () => {
                frame = 0;
                for (const s of letters) {
                    if (!pointer) {
                        s.style.removeProperty('--p');
                        continue;
                    }
                    const r = s.getBoundingClientRect();
                    const p = pressureAt(Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2)), radius);
                    s.style.setProperty('--p', p.toFixed(3));
                }
            };
            root.style.setProperty('--wmax', String(maxW));
            root.style.setProperty('--stretch', String(stretch));
            if (!this.reduced) {
                let near = false;
                this.inView((v) => { near = v; if (!v) {
                    pointer = null;
                    draw();
                } }, { rootMargin: '200px' });
                this.listen(window, 'pointermove', (e) => {
                    if (!near)
                        return;
                    pointer = { x: e.clientX, y: e.clientY };
                    if (!frame)
                        frame = raf(draw, this);
                }, { passive: true });
                this.listen(document, 'pointerleave', () => { pointer = null; if (!frame)
                    frame = raf(draw, this); });
            }
            this.onCleanup(() => {
                if (frame)
                    caf(frame);
                root.remove();
                this.append(...nodes);
            });
        }
    }, { id: 'motion-kit-13', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineTextPressure };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/text-pressure.js.map