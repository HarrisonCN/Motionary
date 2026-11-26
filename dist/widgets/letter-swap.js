import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/motion-kit-12-C9izfNaB.js';

function defineLetterSwap(tag = 'usa-letter-swap') {
    const ctor = defineElement(tag, Base => class LetterSwap extends Base {
        static get observedAttributes() { return ['stagger', 'direction']; }
        mount() {
            const target = this.firstElementChild && !this.firstElementChild.classList.contains('usa-kit')
                ? this.firstElementChild
                : this;
            if (target.children.length && target !== this)
                return;
            if (target === this && this.children.length)
                return;
            const text = target.textContent || '';
            if (!text.trim() || this.reduced)
                return;
            const original = Array.from(target.childNodes);
            const wrap = make('span', 'usa-kit usa-swap');
            wrap.dataset.dir = this.str('direction') === 'down' ? 'down' : 'up';
            wrap.style.setProperty('--stagger', `${Math.min(120, Math.max(0, this.num('stagger', 24)))}ms`);
            const sr = make('span', 'usa-kit-sr', text);
            const vis = make('span', 'usa-swap-letters');
            vis.setAttribute('aria-hidden', 'true');
            Array.from(text).forEach((ch, i) => {
                const cell = make('span', 'usa-swap-cell');
                cell.style.setProperty('--i', String(i));
                const glyph = ch === ' ' ? ' ' : ch;
                cell.append(make('span', 'usa-swap-a', glyph), make('span', 'usa-swap-b', glyph));
                vis.append(cell);
            });
            wrap.append(sr, vis);
            for (const n of original)
                n.remove();
            target.append(wrap);
            this.onCleanup(() => { wrap.remove(); target.append(...original); });
        }
    }, { id: 'motion-kit-12', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineLetterSwap };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/letter-swap.js.map