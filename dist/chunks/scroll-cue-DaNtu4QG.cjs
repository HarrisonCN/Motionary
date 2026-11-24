'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var pageKit = require('./page-kit-BcYkJGw5.cjs');

const CUE_KINDS = ['mouse', 'chevron', 'line'];
function defineScrollCue(tag = 'usa-scroll-cue') {
    const ctor = base.defineElement(tag, Base => class ScrollCue extends Base {
        constructor() {
            super(...arguments);
            this._gone = false;
        }
        static get observedAttributes() { return ['kind', 'label', 'target', 'hide-after', 'text']; }
        get away() { return this._gone; }
        mount() {
            const kind = CUE_KINDS.includes(this.str('kind')) ? this.str('kind') : 'mouse';
            const btn = moments.make('button', 'usa-kit usa-cue');
            btn.type = 'button';
            btn.setAttribute('aria-label', this.str('label', 'Scroll down'));
            const art = moments.make('span', `usa-cue-${kind}`);
            art.setAttribute('aria-hidden', 'true');
            if (kind === 'chevron')
                art.append(moments.make('i'), moments.make('i'));
            btn.append(art);
            const caption = this.str('text');
            if (caption)
                btn.append(moments.make('span', 'usa-cue-text', caption));
            this.append(btn);
            const after = Math.max(0, this.num('hide-after', 40));
            const check = () => {
                const gone = window.scrollY > after;
                if (gone === this._gone)
                    return;
                this._gone = gone;
                btn.toggleAttribute('data-hidden', gone);
                btn.tabIndex = gone ? -1 : 0;
                this.emit(gone ? 'hide' : 'show');
            };
            this.listen(window, 'scroll', check, { passive: true });
            this.listen(btn, 'click', () => {
                const target = base.queryAttr(this.str('target') || null);
                const behavior = this.reduced ? 'auto' : 'smooth';
                if (target) {
                    target.scrollIntoView({ behavior, block: 'start' });
                    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName))
                        target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
                else
                    window.scrollBy({ top: window.innerHeight * 0.9, behavior });
            });
            this.onCleanup(() => {
                btn.remove();
                this._gone = false;
            });
            btn.toggleAttribute('data-static', this.reduced);
            check();
        }
    }, { id: 'page-kit', text: pageKit.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.CUE_KINDS = CUE_KINDS;
exports.defineScrollCue = defineScrollCue;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/scroll-cue-DaNtu4QG.cjs.map