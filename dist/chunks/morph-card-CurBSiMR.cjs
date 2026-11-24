'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var partsKit = require('./parts-kit-CZw4-JX_.cjs');

/** The transform that makes a box at `to` look like it sits at `from` (FLIP "invert" step). */
function invertRect(from, to) {
    const sx = to.width ? from.width / to.width : 1;
    const sy = to.height ? from.height / to.height : 1;
    const r = (n) => Math.round(n * 1000) / 1000;
    return `translate(${r(from.left - to.left)}px, ${r(from.top - to.top)}px) scale(${r(sx)}, ${r(sy)})`;
}
function defineMorphCard(tag = 'usa-morph-card') {
    const ctor = base.defineElement(tag, Base => class MorphCard extends Base {
        static get observedAttributes() { return ['label', 'close-label']; }
        get open() { return !!this._api?.isOpen(); }
        show() { this._api?.show(); }
        close() { this._api?.close(); }
        mount() {
            const detail = this.querySelector(':scope > [data-detail]');
            const card = Array.from(this.children).find((c) => c !== detail && !c.className.toString().startsWith('usa-'));
            if (!card || !detail)
                return;
            const trigger = moments.make('button', 'usa-kit usa-morph-open');
            trigger.type = 'button';
            const label = this.str('label');
            if (label)
                trigger.setAttribute('aria-label', label);
            trigger.setAttribute('aria-haspopup', 'dialog');
            this.insertBefore(trigger, card);
            trigger.append(card);
            const dialog = moments.make('dialog', 'usa-kit usa-morph-dialog');
            dialog.id = moments.uniqueId('usa-morph');
            trigger.setAttribute('aria-controls', dialog.id);
            const closeBtn = moments.make('button', 'usa-morph-close', '×');
            closeBtn.type = 'button';
            closeBtn.setAttribute('aria-label', this.str('close-label', 'Close'));
            const body = moments.make('div', 'usa-morph-body');
            const wasHidden = detail.hidden;
            detail.hidden = false;
            body.append(detail);
            dialog.append(closeBtn, body);
            const heading = detail.querySelector('h1, h2, h3, h4');
            if (heading) {
                if (!heading.id)
                    heading.id = `${dialog.id}-h`;
                dialog.setAttribute('aria-labelledby', heading.id);
            }
            else
                dialog.setAttribute('aria-label', label || (card.textContent || '').trim().slice(0, 80));
            this.append(dialog);
            let busy = null;
            const morph = (opening) => {
                if (this.reduced)
                    return null;
                const from = trigger.getBoundingClientRect(), to = dialog.getBoundingClientRect();
                if (!to.width || !from.width)
                    return null;
                const small = { transform: invertRect(from, to), borderRadius: '14px', opacity: 0.6 };
                const big = { transform: 'none', borderRadius: '22px', opacity: 1 };
                dialog.style.transformOrigin = '0 0';
                return this.motion(dialog, opening ? [small, big] : [big, small], { duration: opening ? 460 : 340, easing: 'cubic-bezier(.22,1,.36,1)' });
            };
            const show = () => {
                if (dialog.open)
                    return;
                busy?.cancel();
                if (typeof dialog.showModal === 'function')
                    dialog.showModal();
                else
                    dialog.setAttribute('open', '');
                dialog.toggleAttribute('data-anim', !this.reduced);
                trigger.setAttribute('aria-expanded', 'true');
                busy = morph(true);
                closeBtn.focus();
                this.emit('open');
            };
            const close = () => {
                if (!dialog.open)
                    return;
                const done = () => {
                    busy = null;
                    if (typeof dialog.close === 'function')
                        dialog.close();
                    else {
                        dialog.removeAttribute('open');
                        dialog.dispatchEvent(new Event('close'));
                    }
                };
                trigger.setAttribute('aria-expanded', 'false');
                busy = morph(false);
                if (busy)
                    busy.finished.then(done, done);
                else
                    done();
            };
            this._api = { show, close, isOpen: () => dialog.open };
            trigger.setAttribute('aria-expanded', 'false');
            this.listen(trigger, 'click', show);
            this.listen(closeBtn, 'click', close);
            this.listen(dialog, 'cancel', (e) => { e.preventDefault(); close(); });
            this.listen(dialog, 'click', (e) => { if (e.target === dialog)
                close(); });
            this.listen(dialog, 'close', () => { trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); this.emit('close'); });
            this.onCleanup(() => {
                busy?.cancel();
                if (dialog.open) {
                    if (typeof dialog.close === 'function')
                        dialog.close();
                    else
                        dialog.removeAttribute('open');
                }
                detail.hidden = wasHidden;
                if (heading?.id === `${dialog.id}-h`)
                    heading.removeAttribute('id');
                this.insertBefore(card, trigger);
                this.append(detail);
                trigger.remove();
                dialog.remove();
                this._api = undefined;
            });
        }
    }, { id: 'parts-kit', text: partsKit.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMorphCard = defineMorphCard;
exports.invertRect = invertRect;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/morph-card-CurBSiMR.cjs.map