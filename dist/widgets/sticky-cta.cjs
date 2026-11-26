'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var uiBlocks = require('../chunks/ui-blocks-DKqRP2UQ.cjs');

function defineStickyCta(tag = 'usa-sticky-cta') {
    const ctor = base.defineElement(tag, Base => class StickyCta extends Base {
        constructor() {
            super(...arguments);
            this._shown = false;
        }
        static get observedAttributes() { return ['watch', 'offset', 'position', 'label', 'dismissible', 'close-label']; }
        get shown() { return this._shown; }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make('section', 'usa-kit usa-cta-bar');
            root.setAttribute('aria-label', this.str('label', 'Call to action'));
            root.dataset.position = this.str('position') === 'top' ? 'top' : 'bottom';
            const inner = moments.make('div', 'usa-cta-inner');
            inner.append(...kids);
            root.append(inner);
            let closed = false;
            if (this.flag('dismissible')) {
                const close = moments.make('button', 'usa-ann-btn usa-ann-close');
                close.type = 'button';
                close.setAttribute('aria-label', this.str('close-label', 'Dismiss'));
                close.append(moments.make('span', 'usa-ann-x'));
                root.append(close);
                this.listen(close, 'click', () => { closed = true; set(false); this.emit('dismiss'); });
            }
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            const set = (on) => {
                on = on && !closed;
                root.inert = !on;
                root.toggleAttribute('data-shown', on);
                root.setAttribute('aria-hidden', String(!on));
                if (on === this._shown)
                    return;
                // moving focus out of a bar that is about to hide keeps it from being lost
                if (!on && root.contains(document.activeElement))
                    document.activeElement.blur();
                this._shown = on;
                this.emit(on ? 'show' : 'hide');
            };
            set(false);
            let watched = null;
            try {
                watched = this.str('watch') ? document.querySelector(this.str('watch')) : null;
            }
            catch { /* invalid selector */ }
            if (watched && typeof IntersectionObserver !== 'undefined') {
                const io = new IntersectionObserver(([e]) => set(!e.isIntersecting && e.boundingClientRect.top < 0));
                io.observe(watched);
                this.onCleanup(() => io.disconnect());
            }
            else {
                const offset = Math.max(0, this.num('offset', 320));
                let pending = 0;
                const check = () => { pending = 0; set(window.scrollY > offset); };
                this.listen(window, 'scroll', () => { if (!pending)
                    pending = base.raf(check); }, { passive: true });
                this.onCleanup(() => pending && base.caf(pending));
                check();
            }
            this.onCleanup(() => {
                this.append(...kids);
                root.remove();
                this._shown = false;
            });
        }
    }, { id: 'ui-blocks', text: uiBlocks.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineStickyCta = defineStickyCta;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/sticky-cta.cjs.map