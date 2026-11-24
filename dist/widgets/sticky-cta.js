import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { o as ownChildren } from '../chunks/kit-Dmjuhvd8.js';
import { c as css } from '../chunks/ui-blocks-CBiLi5cj.js';

function defineStickyCta(tag = 'usa-sticky-cta') {
    const ctor = defineElement(tag, Base => class StickyCta extends Base {
        constructor() {
            super(...arguments);
            this._shown = false;
        }
        static get observedAttributes() { return ['watch', 'offset', 'position', 'label', 'dismissible', 'close-label']; }
        get shown() { return this._shown; }
        mount() {
            const kids = ownChildren(this);
            const root = make('section', 'usa-kit usa-cta-bar');
            root.setAttribute('aria-label', this.str('label', 'Call to action'));
            root.dataset.position = this.str('position') === 'top' ? 'top' : 'bottom';
            const inner = make('div', 'usa-cta-inner');
            inner.append(...kids);
            root.append(inner);
            let closed = false;
            if (this.flag('dismissible')) {
                const close = make('button', 'usa-ann-btn usa-ann-close');
                close.type = 'button';
                close.setAttribute('aria-label', this.str('close-label', 'Dismiss'));
                close.append(make('span', 'usa-ann-x'));
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
                    pending = requestAnimationFrame(check); }, { passive: true });
                this.onCleanup(() => pending && cancelAnimationFrame(pending));
                check();
            }
            this.onCleanup(() => {
                this.append(...kids);
                root.remove();
                this._shown = false;
            });
        }
    }, { id: 'ui-blocks', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineStickyCta };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/sticky-cta.js.map