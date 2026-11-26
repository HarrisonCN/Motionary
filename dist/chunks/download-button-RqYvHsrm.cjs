'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var pageKit = require('./page-kit-BcYkJGw5.cjs');

const ICON = '<svg class="usa-dl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="usa-dl-arrow" d="M12 4v11m-5-5l5 5 5-5M5 20h14"/><path class="usa-dl-tick" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
/** A progress value (0–100) as a whole-number percentage label. */
function percentLabel(p) {
    const n = Number.isFinite(p) ? Math.min(100, Math.max(0, p)) : 0;
    return `${Math.floor(n)}%`;
}
function defineDownloadButton(tag = 'usa-download-button') {
    const ctor = base.defineElement(tag, Base => class DownloadButton extends Base {
        constructor() {
            super(...arguments);
            this._state = 'idle';
        }
        static get observedAttributes() { return ['label', 'done-label', 'progress', 'duration', 'once']; }
        get state() { return this._state; }
        get progress() { return Math.min(100, Math.max(0, this.num('progress', 0))); }
        set progress(v) { this.setAttribute('progress', String(Math.min(100, Math.max(0, Number(v) || 0)))); }
        reset() { this._state = 'idle'; this.removeAttribute('progress'); this._paint?.(); }
        changed(name) { if (name === 'progress')
            this._paint?.();
        else
            super.changed(name); }
        mount() {
            const btn = moments.make('button', 'usa-kit usa-dl');
            btn.type = 'button';
            btn.innerHTML = ICON;
            const text = moments.make('span', 'usa-dl-text');
            const live = moments.make('span', 'usa-kit-sr');
            live.setAttribute('role', 'status');
            btn.append(text);
            this.append(btn, live);
            let tick = 0, said = -1;
            const paint = () => {
                const p = this.progress;
                if (this._state === 'busy' && p >= 100) {
                    this._state = 'done';
                    this.emit('done');
                }
                btn.dataset.state = this._state;
                btn.toggleAttribute('data-static', this.reduced);
                btn.setAttribute('aria-busy', String(this._state === 'busy'));
                btn.style.setProperty('--p', String(this._state === 'busy' ? p / 100 : 0));
                text.textContent = this._state === 'busy' ? percentLabel(p) : this._state === 'done' ? this.str('done-label', 'Downloaded') : this.str('label', 'Download');
                const tens = this._state === 'busy' ? Math.floor(p / 10) : -1;
                if (this._state === 'done')
                    live.textContent = this.str('done-label', 'Downloaded');
                else if (tens !== said && tens >= 0)
                    live.textContent = percentLabel(tens * 10);
                said = tens;
            };
            this._paint = paint;
            const run = (ms) => {
                const start = base.now();
                const step = () => {
                    if (this._state !== 'busy')
                        return;
                    this.progress = Math.min(100, ((base.now() - start) / ms) * 100);
                    if (this.progress < 100)
                        tick = base.raf(step, this);
                };
                if (this.reduced) {
                    this.progress = 100;
                    return;
                }
                tick = base.raf(step, this);
            };
            this.listen(btn, 'click', () => {
                if (this._state === 'busy')
                    return;
                if (this._state === 'done' && this.flag('once'))
                    return;
                this._state = 'busy';
                this.setAttribute('progress', '0');
                paint();
                this.emit('start');
                const ms = Math.max(0, this.num('duration', 0));
                if (ms)
                    run(ms);
            });
            this.onCleanup(() => {
                base.caf(tick);
                btn.remove();
                live.remove();
                this._paint = undefined;
            });
            paint();
        }
    }, { id: 'page-kit', text: pageKit.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineDownloadButton = defineDownloadButton;
exports.percentLabel = percentLabel;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/download-button-RqYvHsrm.cjs.map