'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var motionKit12 = require('../chunks/motion-kit-12-MnOftQWG.cjs');

function defineLetterSwap(tag = 'usa-letter-swap') {
    const ctor = base.defineElement(tag, Base => class LetterSwap extends Base {
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
            const wrap = moments.make('span', 'usa-kit usa-swap');
            wrap.dataset.dir = this.str('direction') === 'down' ? 'down' : 'up';
            wrap.style.setProperty('--stagger', `${Math.min(120, Math.max(0, this.num('stagger', 24)))}ms`);
            const sr = moments.make('span', 'usa-kit-sr', text);
            const vis = moments.make('span', 'usa-swap-letters');
            vis.setAttribute('aria-hidden', 'true');
            Array.from(text).forEach((ch, i) => {
                const cell = moments.make('span', 'usa-swap-cell');
                cell.style.setProperty('--i', String(i));
                const glyph = ch === ' ' ? ' ' : ch;
                cell.append(moments.make('span', 'usa-swap-a', glyph), moments.make('span', 'usa-swap-b', glyph));
                vis.append(cell);
            });
            wrap.append(sr, vis);
            for (const n of original)
                n.remove();
            target.append(wrap);
            this.onCleanup(() => { wrap.remove(); target.append(...original); });
        }
    }, { id: 'motion-kit-12', text: motionKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineLetterSwap = defineLetterSwap;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/letter-swap.cjs.map