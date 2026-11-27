import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/parts-kit-O_H_tVRs.js';

function defineInfiniteScroll(tag = 'usa-infinite-scroll') {
    const ctor = defineElement(tag, Base => class InfiniteScroll extends Base {
        constructor() {
            super(...arguments);
            this._page = 1;
            this._state = 'idle';
        }
        static get observedAttributes() { return ['root-margin', 'auto', 'label', 'button-label', 'end-label', 'stagger']; }
        get page() { return this._page; }
        get loading() { return this._state === 'loading'; }
        done() { this._api?.done(); }
        end() { this._api?.end(); }
        reset() { this._api?.reset(); }
        mount() {
            const list = this.querySelector(':scope > ul, :scope > ol, :scope > [data-items]') ?? this;
            const foot = make('div', 'usa-kit usa-inf-foot');
            const sentinel = make('div', 'usa-inf-sentinel');
            sentinel.setAttribute('aria-hidden', 'true');
            const spin = make('span', 'usa-inf-spin');
            spin.setAttribute('aria-hidden', 'true');
            const more = make('button', 'usa-inf-more', this.str('button-label', 'Load more'));
            more.type = 'button';
            const live = make('p', 'usa-kit-sr');
            live.setAttribute('role', 'status');
            foot.append(spin, more, live);
            this.append(sentinel, foot);
            const ours = new Set([sentinel, foot]);
            const count = () => Array.from(list.children).filter((c) => !ours.has(c)).length;
            let before = count();
            let near = false;
            const endNote = () => foot.append(make('span', 'usa-inf-end', this.str('end-label', 'You have reached the end')));
            if (this._state === 'end')
                endNote();
            if (this._state === 'loading')
                this._state = 'idle';
            const paint = () => {
                foot.dataset.state = this._state;
                foot.toggleAttribute('data-static', this.reduced);
                more.disabled = this._state !== 'idle';
                this.setAttribute('aria-busy', String(this._state === 'loading'));
            };
            const load = () => {
                if (this._state !== 'idle')
                    return;
                this._state = 'loading';
                before = count();
                live.textContent = this.str('label', 'Loading more');
                paint();
                this.emit('load', { page: this._page + 1 });
            };
            const settle = (end) => {
                if (this._state === 'end')
                    return;
                const added = Math.max(0, count() - before);
                if (this._state === 'loading' && added)
                    this._page++;
                const fresh = Array.from(list.children).filter((c) => !ours.has(c)).slice(before);
                if (!this.reduced) {
                    const gap = Math.max(0, this.num('stagger', 40));
                    fresh.forEach((el, i) => {
                        el.style.setProperty('--d', `${Math.min(i, 12) * gap}ms`);
                        el.classList.add('usa-inf-item-in');
                        el.addEventListener('animationend', () => { el.classList.remove('usa-inf-item-in'); el.style.removeProperty('--d'); }, { once: true });
                    });
                }
                this._state = end ? 'end' : 'idle';
                live.textContent = end ? this.str('end-label', 'You have reached the end') : added ? `${added} more` : '';
                if (list === this)
                    this.append(sentinel, foot);
                if (end) {
                    endNote();
                    this.emit('end');
                }
                paint();
                if (!end && near)
                    queueMicrotask(() => { if (near && sentinel.getBoundingClientRect().top <= window.innerHeight + (parseFloat(this.str('root-margin', '200')) || 0))
                        load(); });
            };
            this._api = {
                done: () => { if (this._state === 'loading')
                    settle(false); },
                end: () => settle(true),
                reset: () => { this._page = 1; this._state = 'idle'; foot.querySelector('.usa-inf-end')?.remove(); live.textContent = ''; paint(); },
            };
            this.listen(more, 'click', load);
            if (this.str('auto') !== 'false' && typeof IntersectionObserver !== 'undefined') {
                const seen = (es) => { near = es.some((e) => e.isIntersecting); if (near)
                    load(); };
                let io;
                try {
                    io = new IntersectionObserver(seen, { rootMargin: `0px 0px ${this.str('root-margin', '200px')} 0px` });
                }
                catch {
                    io = new IntersectionObserver(seen, { rootMargin: '0px 0px 200px 0px' });
                }
                io.observe(sentinel);
                this.onCleanup(() => io.disconnect());
            }
            this.onCleanup(() => {
                sentinel.remove();
                foot.remove();
                this.removeAttribute('aria-busy');
                this._api = undefined;
            });
            paint();
        }
    }, { id: 'parts-kit', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineInfiniteScroll };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/infinite-scroll.js.map