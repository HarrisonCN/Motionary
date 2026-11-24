'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var uiKit13 = require('../chunks/ui-kit-13-CrE_IdG4.cjs');

function defineTour(tag = 'usa-tour') {
    const ctor = base.defineElement(tag, Base => class Tour extends Base {
        constructor() {
            super(...arguments);
            this._i = -1;
        }
        static get observedAttributes() { return ['open', 'label', 'next-label', 'back-label', 'done-label', 'skip-label', 'count-label', 'padding']; }
        get index() { return this._i; }
        start(index = 0) { this._go?.(index); }
        next() { if (this._i >= 0)
            this._go?.(this._i + 1); }
        back() { if (this._i > 0)
            this._go?.(this._i - 1); }
        end() { this._stop?.(false); }
        mount() {
            const steps = Array.from(this.querySelectorAll(':scope > [data-step]'));
            const hidden = steps.map((s) => s.hidden);
            for (const s of steps)
                s.hidden = true;
            const root = moments.make('div', 'usa-kit usa-tour');
            root.hidden = true;
            const shade = moments.make('div', 'usa-tour-shade');
            shade.setAttribute('aria-hidden', 'true');
            const card = moments.make('div', 'usa-tour-card');
            const id = moments.uniqueId('usa-tour');
            card.setAttribute('role', 'dialog');
            card.setAttribute('aria-labelledby', `${id}-t`);
            card.setAttribute('aria-describedby', `${id}-b`);
            card.tabIndex = -1;
            const count = moments.make('p', 'usa-tour-count');
            const title = moments.make('h2', 'usa-tour-title');
            title.id = `${id}-t`;
            const body = moments.make('div', 'usa-tour-body');
            body.id = `${id}-b`;
            const bar = moments.make('div', 'usa-tour-bar');
            const skip = moments.make('button', 'usa-tour-skip', this.str('skip-label', 'Skip'));
            const back = moments.make('button', 'usa-tour-back', this.str('back-label', 'Back'));
            const next = moments.make('button', 'usa-tour-next');
            for (const b of [skip, back, next])
                b.type = 'button';
            const dots = moments.make('span', 'usa-tour-dots');
            dots.setAttribute('aria-hidden', 'true');
            steps.forEach(() => dots.append(moments.make('i')));
            bar.append(skip, dots, back, next);
            const arrow = moments.make('span', 'usa-tour-arrow');
            arrow.setAttribute('aria-hidden', 'true');
            card.append(arrow, count, title, body, bar);
            root.append(shade, card);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            const pad = Math.max(0, Math.min(40, this.num('padding', 8)));
            let returnTo = null;
            let target = null;
            let frame = 0;
            const find = (sel) => {
                if (!sel)
                    return null;
                try {
                    return document.querySelector(sel);
                }
                catch {
                    return null;
                }
            };
            const place = () => {
                frame = 0;
                if (this._i < 0)
                    return;
                const vw = document.documentElement.clientWidth || window.innerWidth;
                const vh = window.innerHeight;
                const r = target?.getBoundingClientRect();
                const box = r && (r.width || r.height)
                    ? { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 }
                    : { top: vh / 2, left: vw / 2, width: 0, height: 0 };
                shade.style.cssText = `top:${box.top}px;left:${box.left}px;width:${box.width}px;height:${box.height}px`;
                shade.toggleAttribute('data-none', !(r && (r.width || r.height)));
                const p = kit13.tourPlace(box, { width: card.offsetWidth || 300, height: card.offsetHeight || 160 }, { width: vw, height: vh });
                card.style.top = `${Math.max(8, p.top)}px`;
                card.style.left = `${p.left}px`;
                card.dataset.side = p.side;
                card.style.setProperty('--arrow', `${Math.max(16, Math.min((card.offsetWidth || 300) - 16, box.left + box.width / 2 - p.left))}px`);
            };
            const later = () => { if (!frame)
                frame = base.raf(place, this); };
            const label = (k, d) => this.str(k, d);
            const go = (i) => {
                if (!steps.length)
                    return;
                if (i >= steps.length) {
                    stop(true);
                    return;
                }
                const first = this._i < 0;
                if (first)
                    returnTo = document.activeElement;
                this._i = Math.max(0, i);
                const s = steps[this._i];
                target = find(s.getAttribute('data-target'));
                title.textContent = s.getAttribute('data-title') || label('label', 'Tour');
                body.replaceChildren(...Array.from(s.cloneNode(true).childNodes));
                count.textContent = label('count-label', '{n} of {total}').replace('{n}', String(this._i + 1)).replace('{total}', String(steps.length));
                back.hidden = this._i === 0;
                next.textContent = this._i === steps.length - 1 ? label('done-label', 'Done') : label('next-label', 'Next');
                Array.from(dots.children).forEach((d, j) => d.toggleAttribute('data-on', j === this._i));
                root.hidden = false;
                root.setAttribute('data-open', '');
                card.removeAttribute('data-in');
                void card.offsetWidth;
                card.setAttribute('data-in', '');
                target?.scrollIntoView?.({ block: 'center', inline: 'nearest', behavior: this.reduced ? 'auto' : 'smooth' });
                place();
                later();
                card.focus({ preventScroll: true });
                this.emit('step', { index: this._i });
            };
            const stop = (completed) => {
                if (this._i < 0)
                    return;
                this._i = -1;
                root.hidden = true;
                root.removeAttribute('data-open');
                target = null;
                if (frame)
                    base.caf(frame), (frame = 0);
                this.emit('end', { completed });
                if (this.hasAttribute('open'))
                    this.removeAttribute('open');
                returnTo?.focus?.();
            };
            this._go = go;
            this._stop = stop;
            this.listen(next, 'click', () => go(this._i + 1));
            this.listen(back, 'click', () => go(this._i - 1));
            this.listen(skip, 'click', () => stop(false));
            this.listen(card, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    stop(false);
                }
            });
            this.listen(window, 'resize', later);
            this.listen(window, 'scroll', later, { passive: true, capture: true });
            for (const b of Array.from(this.querySelectorAll(':scope > [data-start], :scope [data-start]')))
                if (!root.contains(b))
                    this.listen(b, 'click', () => go(0));
            if (this.flag('open'))
                go(0);
            this.onCleanup(() => {
                if (frame)
                    base.caf(frame);
                const was = this._i;
                this._i = -1;
                root.remove();
                steps.forEach((s, j) => (s.hidden = hidden[j]));
                this._go = undefined;
                this._stop = undefined;
                if (was >= 0)
                    returnTo?.focus?.();
            });
        }
    }, { id: 'ui-kit-13', text: uiKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTour = defineTour;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/tour.cjs.map