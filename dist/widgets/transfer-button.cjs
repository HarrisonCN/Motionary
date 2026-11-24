'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var tactile$1 = require('../chunks/tactile-Dfg7b_8s.cjs');
var tactile = require('../chunks/tactile-DqlGeBjU.cjs');

const SVG = 'http://www.w3.org/2000/svg';
function defineTransferButton(tag = 'usa-transfer-button') {
    const ctor = base.defineElement(tag, Base => class TransferButton extends Base {
        constructor() {
            super(...arguments);
            this._done = false;
        }
        static get observedAttributes() { return ['direction', 'label', 'progress', 'disabled']; }
        get progress() {
            if (!this.hasAttribute('progress'))
                return null;
            return Math.round(moments.bound(this.num('progress', 0), 0, 100, 0));
        }
        set progress(n) {
            if (n === null || n === undefined)
                this.removeAttribute('progress');
            else
                this.setAttribute('progress', String(Math.round(moments.bound(Number(n), 0, 100, 0))));
        }
        direction() { return this.str('direction') === 'upload' ? 'upload' : 'download'; }
        changed() { this._sync?.(); }
        mount() {
            const root = moments.make('span', 'usa-tactile usa-transfer');
            const key = moments.make('button', 'usa-squish-key usa-transfer-key');
            key.type = 'button';
            const ring = document.createElementNS(SVG, 'svg');
            ring.setAttribute('viewBox', '0 0 40 40');
            ring.setAttribute('aria-hidden', 'true');
            ring.classList.add('usa-transfer-ring');
            const track = document.createElementNS(SVG, 'circle');
            const bar = document.createElementNS(SVG, 'circle');
            for (const c of [track, bar]) {
                c.setAttribute('cx', '20');
                c.setAttribute('cy', '20');
                c.setAttribute('r', '18');
                c.setAttribute('pathLength', '1');
            }
            track.classList.add('usa-transfer-track');
            bar.classList.add('usa-transfer-bar');
            ring.append(track, bar);
            const icon = document.createElementNS(SVG, 'svg');
            icon.setAttribute('viewBox', '0 0 24 24');
            icon.setAttribute('aria-hidden', 'true');
            icon.classList.add('usa-transfer-icon');
            const shapes = [
                ['usa-transfer-arrow', 'M12 4v11M7 10.5l5 5 5-5'],
                ['usa-transfer-tray', 'M5 19.5h14'],
                ['usa-transfer-tick', 'M6 12.5l4 4 8-9'],
            ];
            for (const [cls, d] of shapes) {
                const p = document.createElementNS(SVG, 'path');
                p.setAttribute('d', d);
                p.setAttribute('pathLength', '1');
                p.classList.add(cls);
                icon.append(p);
            }
            const name = moments.make('span', 'usa-transfer-label');
            const status = moments.make('span', 'usa-sr');
            status.setAttribute('aria-live', 'polite');
            key.append(ring, icon);
            root.append(key, name, status);
            this.append(root);
            const press = tactile$1.pressSpring(this, key, 0.85);
            let lastSaid = -1;
            const sync = () => {
                const dir = this.direction();
                const p = this.progress;
                const label = this.str('label', dir === 'upload' ? 'Upload' : 'Download');
                root.dataset.direction = dir;
                name.textContent = label;
                key.setAttribute('aria-label', label);
                key.disabled = this.flag('disabled');
                root.style.setProperty('--progress', String((p ?? 0) / 100));
                root.dataset.state = p === null ? 'idle' : p >= 100 ? 'done' : 'busy';
                if (p === null) {
                    this._done = false;
                    lastSaid = -1;
                    status.textContent = '';
                }
                else {
                    // announce in quarters so a screen reader is not flooded
                    const quarter = Math.floor(p / 25);
                    if (quarter !== lastSaid) {
                        lastSaid = quarter;
                        status.textContent = p >= 100 ? `${label} complete` : `${label} ${p}%`;
                    }
                    if (p >= 100 && !this._done) {
                        this._done = true;
                        this.emit('complete', { direction: dir });
                    }
                    if (p < 100)
                        this._done = false;
                }
                key.setAttribute('aria-busy', String(root.dataset.state === 'busy'));
                root.toggleAttribute('data-static', this.reduced);
            };
            this._sync = sync;
            this.listen(key, 'click', (e) => {
                if (e.detail === 0)
                    tactile$1.tap(press);
                this.motion(icon, [{ transform: 'none' }, { transform: `translateY(${this.direction() === 'upload' ? -3 : 3}px)` }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.34,1.56,.64,1)' });
                this.emit('transfer', { direction: this.direction() });
            });
            this.onCleanup(() => { root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'tactile', text: tactile.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTransferButton = defineTransferButton;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/transfer-button.cjs.map