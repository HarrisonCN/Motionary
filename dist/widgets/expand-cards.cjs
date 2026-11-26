'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var dataMedia = require('../chunks/data-media-CzBZCPJg.cjs');

function defineExpandCards(tag = 'usa-expand-cards') {
    const ctor = base.defineElement(tag, Base => class ExpandCards extends Base {
        constructor() {
            super(...arguments);
            this._count = 0;
        }
        static get observedAttributes() { return ['index', 'trigger', 'stack', 'label']; }
        get index() { return Math.max(0, Math.min(Math.max(0, this._count - 1), Math.round(this.num('index', 0)))); }
        set index(i) { this.setAttribute('index', String(Math.round(Number(i)) || 0)); }
        changed(name) { if (name === 'index')
            this._sync?.();
        else
            super.changed(name); }
        mount() {
            const kids = kit.ownChildren(this);
            this._count = kids.length;
            const root = moments.make('div', 'usa-kit usa-xc');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', this.str('label', 'Panels'));
            const panels = kids.map((k, i) => {
                const p = moments.make('div', 'usa-xc-panel');
                const img = kit.safeImageUrl(k.dataset.image || '');
                if (img)
                    p.style.setProperty('--img', `url("${img.replace(/["\\]/g, '\\$&')}")`);
                const head = moments.make('button', 'usa-xc-head');
                head.type = 'button';
                const body = moments.make('div', 'usa-xc-body');
                body.id = moments.uniqueId('usa-xc');
                head.setAttribute('aria-controls', body.id);
                head.append(moments.make('span', 'usa-xc-title', k.dataset.title || `Panel ${i + 1}`));
                body.append(k);
                p.append(head, body);
                root.append(p);
                return { p, head, body };
            });
            this.append(root);
            const stack = Math.max(0, this.num('stack', 640));
            const fit = () => root.toggleAttribute('data-stacked', root.clientWidth > 0 && root.clientWidth < stack);
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(fit);
                ro.observe(root);
                this.onCleanup(() => ro.disconnect());
            }
            fit();
            const sync = () => {
                const at = this.index;
                root.toggleAttribute('data-static', this.reduced);
                panels.forEach(({ p, head, body }, i) => {
                    const on = i === at;
                    p.toggleAttribute('data-open', on);
                    head.setAttribute('aria-expanded', String(on));
                    body.hidden = !on;
                });
            };
            this._sync = sync;
            const pick = (i) => { if (i !== this.index) {
                this.index = i;
                this.emit('change', { index: i });
            } };
            const hover = this.str('trigger') !== 'click';
            panels.forEach(({ p, head }, i) => {
                this.listen(head, 'click', () => pick(i));
                if (hover)
                    this.listen(p, 'pointerenter', (e) => { if (e.pointerType === 'mouse')
                        pick(i); });
            });
            this.listen(root, 'keydown', (e) => {
                const i = panels.findIndex(({ head }) => head === e.target);
                if (i < 0)
                    return;
                const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                if (!d)
                    return;
                e.preventDefault();
                panels[(i + d + panels.length) % panels.length].head.focus();
            });
            this.onCleanup(() => {
                this.append(...kids);
                root.remove();
                this._sync = undefined;
            });
            sync();
        }
    }, { id: 'data-media', text: dataMedia.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineExpandCards = defineExpandCards;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/expand-cards.cjs.map