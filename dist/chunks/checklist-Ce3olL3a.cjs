'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var partsKit12 = require('./parts-kit-12-CKE_UdA5.cjs');

/** Dash offset of a progress ring of radius `r` with `done` of `total` filled. */
function ringDash(done, total, r = 16) {
    const length = Math.round(2 * Math.PI * r * 1000) / 1000;
    const f = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;
    return { length, offset: Math.round(length * (1 - f) * 1000) / 1000 };
}
function defineChecklist(tag = 'usa-checklist') {
    const ctor = base.defineElement(tag, Base => class Checklist extends Base {
        constructor() {
            super(...arguments);
            this._done = 0;
        }
        static get observedAttributes() { return ['label', 'done-label']; }
        get done() { return this._done; }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make('section', 'usa-kit usa-check');
            const head = moments.make('header', 'usa-check-head');
            const ns = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(ns, 'svg');
            svg.setAttribute('viewBox', '0 0 40 40');
            svg.setAttribute('aria-hidden', 'true');
            svg.classList.add('usa-check-ring');
            const { length } = ringDash(0, 1);
            for (const cls of ['usa-check-ring-bg', 'usa-check-ring-fg']) {
                const c = document.createElementNS(ns, 'circle');
                c.setAttribute('class', cls);
                c.setAttribute('cx', '20');
                c.setAttribute('cy', '20');
                c.setAttribute('r', '16');
                svg.append(c);
            }
            const fg = svg.lastChild;
            fg.style.strokeDasharray = String(length);
            const title = moments.make('strong', 'usa-check-title', this.str('label', 'Getting started'));
            title.id = `usa-check-${Math.random().toString(36).slice(2, 8)}`;
            root.setAttribute('aria-labelledby', title.id);
            const count = moments.make('span', 'usa-check-count');
            count.setAttribute('aria-live', 'polite');
            head.append(svg, title, count);
            const ul = moments.make('ul', 'usa-check-list');
            const boxes = [];
            const rows = kids.map((k) => {
                const li = moments.make('li', 'usa-check-item');
                let box = k.querySelector('input[type="checkbox"]');
                if (!box) {
                    const label = moments.make('label');
                    box = moments.make('input');
                    box.type = 'checkbox';
                    const text = moments.make('span', 'usa-check-text');
                    text.append(k);
                    label.append(box, text);
                    li.append(label);
                }
                else
                    li.append(k);
                boxes.push(box);
                ul.append(li);
                return li;
            });
            root.append(head, ul);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            const total = boxes.length;
            const paint = () => {
                this._done = boxes.filter((b) => b.checked).length;
                fg.style.strokeDashoffset = String(ringDash(this._done, total).offset);
                count.textContent = `${this._done} / ${total}`;
                rows.forEach((li, i) => li.toggleAttribute('data-checked', boxes[i].checked));
                const all = total > 0 && this._done === total;
                root.toggleAttribute('data-complete', all);
                title.textContent = all ? this.str('done-label', 'All done!') : this.str('label', 'Getting started');
                return all;
            };
            boxes.forEach((b, i) => this.listen(b, 'change', () => {
                const was = root.hasAttribute('data-complete');
                const all = paint();
                this.emit('change', { index: i, checked: b.checked, done: this._done, total });
                if (all && !was)
                    this.emit('complete');
            }));
            this.onCleanup(() => {
                this.append(...kids);
                root.remove();
            });
            paint();
        }
    }, { id: 'parts-kit-12', text: partsKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineChecklist = defineChecklist;
exports.ringDash = ringDash;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/checklist-Ce3olL3a.cjs.map