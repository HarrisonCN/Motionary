import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { u as uniqueId } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/ui-kit-15--UZAZBHt.js';

function defineHoverCard(tag = 'usa-hover-card') {
    const ctor = defineElement(tag, Base => class HoverCard extends Base {
        constructor() {
            super(...arguments);
            this._open = false;
        }
        static get observedAttributes() { return ['open-delay', 'close-delay', 'placement', 'open']; }
        get open() { return this._open; }
        show() { this._set?.(true); }
        hide() { this._set?.(false); }
        mount() {
            const trigger = this.querySelector(':scope > [data-trigger]');
            const card = this.querySelector(':scope > [data-card]');
            if (!trigger || !card)
                return;
            this.classList.add('usa-hcard');
            this.toggleAttribute('data-static', this.reduced);
            const place = this.str('placement', 'bottom');
            this.dataset.placement = ['top', 'start', 'end'].includes(place) ? place : 'bottom';
            const hadId = card.id;
            if (!card.id)
                card.id = uniqueId('usa-hcard');
            const before = trigger.getAttribute('aria-describedby');
            trigger.setAttribute('aria-describedby', [before, card.id].filter(Boolean).join(' '));
            const hadClass = card.hasAttribute('class');
            card.classList.add('usa-hcard-card');
            const wasHidden = card.hidden;
            card.hidden = true;
            const openDelay = Math.max(0, Math.min(5000, this.num('open-delay', 300)));
            const closeDelay = Math.max(0, Math.min(5000, this.num('close-delay', 200)));
            let timer = 0;
            const clear = () => { if (timer)
                clearTimeout(timer), (timer = 0); };
            const set = (open) => {
                clear();
                if (open === this._open)
                    return;
                this._open = open;
                card.hidden = !open;
                this.toggleAttribute('data-open', open);
                this.emit('toggle', { open });
            };
            this._set = set;
            const later = (open) => {
                clear();
                if (open === this._open)
                    return;
                timer = window.setTimeout(() => set(open), open ? openDelay : closeDelay);
            };
            for (const el of [trigger, card]) {
                this.listen(el, 'pointerenter', (e) => { if (e.pointerType !== 'touch')
                    later(true); });
                this.listen(el, 'pointerleave', (e) => { if (e.pointerType !== 'touch')
                    later(false); });
            }
            this.listen(this, 'focusin', () => later(true));
            this.listen(this, 'focusout', (e) => { if (!this.contains(e.relatedTarget))
                later(false); });
            // Escape closes it wherever focus is, since a card opened by hover has none inside it
            this.listen(document, 'keydown', (e) => {
                if (e.key === 'Escape' && this._open)
                    set(false);
            });
            if (this.flag('open'))
                set(true);
            this.onCleanup(() => {
                clear();
                this._set = undefined;
                this._open = false;
                card.hidden = wasHidden;
                card.classList.remove('usa-hcard-card');
                if (!hadClass)
                    card.removeAttribute('class');
                if (!hadId)
                    card.removeAttribute('id');
                if (before === null)
                    trigger.removeAttribute('aria-describedby');
                else
                    trigger.setAttribute('aria-describedby', before);
                this.classList.remove('usa-hcard');
                if (!this.className)
                    this.removeAttribute('class');
                this.removeAttribute('data-open');
                this.removeAttribute('data-static');
                delete this.dataset.placement;
            });
        }
    }, { id: 'ui-kit-15', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineHoverCard };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/hover-card.js.map