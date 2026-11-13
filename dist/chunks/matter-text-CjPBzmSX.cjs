'use strict';

var engine = require('./engine-D89D-YmJ.cjs');
var matter = require('./matter-CeAHN-RP.cjs');

const SAMPLE = 'Small details make an interface feel considered. Move slowly, read closely, and let each interaction explain what it can do.';
function matterTextClass(Base, kind) {
    return class MatterText extends Base {
        get value() { return engine.finite(this.num('value', 50), 50, 0, 100); }
        set value(v) { this.setAttribute('value', String(engine.finite(v, 50, 0, 100))); }
        update(data) { matter.setMatterData(this, data); }
        reset() { if (kind === 'revision')
            this.value = 50;
        else
            this._focus?.(.5, .5, false); }
        focusAt(x, y) { if (!this.flag('disabled'))
            this._focus?.(engine.finite(x, .5, 0, 1), engine.finite(y, .5, 0, 1), true); }
        notify(type, detail) { this.emit(type, detail); }
        changed() { this._sync?.(); }
        mount() {
            this.classList.add('usa-matter');
            this.setAttribute('role', 'group');
            const root = document.createElement('div');
            root.className = 'usa-matter-shell';
            const stage = document.createElement('div');
            stage.className = 'usa-matter-text';
            const primary = document.createElement('p');
            stage.append(primary);
            const overlay = document.createElement('div');
            overlay.className = kind === 'loupe' ? 'usa-matter-lens' : 'usa-matter-final';
            overlay.setAttribute('aria-hidden', 'true');
            const copy = document.createElement('p');
            overlay.append(copy);
            stage.append(overlay);
            const accessible = document.createElement('p');
            accessible.className = 'usa-matter-sr';
            const bar = document.createElement('div');
            bar.className = 'usa-matter-bar';
            const hint = document.createElement('span');
            hint.textContent = kind === 'loupe' ? 'Move · focus · arrows · Space zooms' : 'Draft → final';
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '100';
            slider.setAttribute('aria-label', 'Revision reveal');
            const reset = document.createElement('button');
            reset.type = 'button';
            reset.textContent = 'Reset';
            bar.append(hint);
            if (kind === 'revision')
                bar.append(slider);
            bar.append(reset);
            root.append(stage, accessible, bar);
            this.prepend(root);
            let x = .5, y = .5;
            this._focus = (xx, yy, active) => { x = xx; y = yy; stage.style.setProperty('--mx', `${xx * 100}%`); stage.style.setProperty('--my', `${yy * 100}%`); stage.toggleAttribute('data-active', active); };
            const sync = () => {
                const text = this.str('text', SAMPLE), disabled = this.flag('disabled');
                this.setAttribute('aria-label', this.str('label', kind === 'loupe' ? 'Text loupe' : 'Revision reveal'));
                primary.textContent = kind === 'revision' ? this.str('draft', 'An early idea becomes clearer when every detail has a purpose.') : text;
                copy.textContent = text;
                primary.className = kind === 'revision' ? 'usa-matter-draft' : '';
                if (kind === 'revision') {
                    primary.setAttribute('aria-hidden', 'true');
                    accessible.textContent = `Draft: ${primary.textContent}\nFinal: ${text}`;
                    stage.style.setProperty('--cut', `${100 - this.value}%`);
                    slider.value = String(this.value);
                    slider.disabled = disabled;
                }
                stage.tabIndex = kind === 'loupe' && !disabled ? 0 : -1;
                reset.disabled = disabled;
                if (disabled)
                    this._focus?.(.5, .5, false);
            };
            this._sync = sync;
            this.listen(stage, 'pointermove', (e) => { if (kind !== 'loupe' || this.flag('disabled'))
                return; const r = stage.getBoundingClientRect(); this.focusAt((e.clientX - r.left) / Math.max(1, r.width), (e.clientY - r.top) / Math.max(1, r.height)); });
            this.listen(stage, 'pointerleave', () => { if (document.activeElement !== stage)
                this._focus?.(x, y, false); });
            this.listen(stage, 'focus', () => { if (kind === 'loupe')
                this.focusAt(x, y); });
            this.listen(stage, 'blur', () => this._focus?.(x, y, false));
            this.listen(stage, 'keydown', (e) => {
                if (kind !== 'loupe' || this.flag('disabled') || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Escape'].includes(e.key))
                    return;
                e.preventDefault();
                if (e.key === 'Escape') {
                    this.reset();
                    return;
                }
                if (e.key === ' ') {
                    stage.toggleAttribute('data-active');
                    return;
                }
                this.focusAt(x + (e.key === 'ArrowLeft' ? -0.05 : e.key === 'ArrowRight' ? .05 : 0), y + (e.key === 'ArrowUp' ? -0.05 : e.key === 'ArrowDown' ? .05 : 0));
                this.notify('change', { x, y });
            });
            this.listen(slider, 'input', () => { if (!this.flag('disabled')) {
                this.value = slider.valueAsNumber;
                this.notify('change', { value: this.value });
            } });
            this.listen(reset, 'click', () => { this.reset(); this.notify('action', { action: 'reset' }); });
            if (kind === 'revision' && typeof ResizeObserver !== 'undefined') {
                const fit = () => { stage.style.minHeight = `${Math.max(170, primary.scrollHeight, copy.scrollHeight) + 50}px`; };
                const ro = new ResizeObserver(fit);
                ro.observe(primary);
                ro.observe(copy);
                this.onCleanup(() => ro.disconnect());
                fit();
            }
            this.onCleanup(() => { this._focus = this._sync = undefined; root.remove(); });
            sync();
        }
    };
}

exports.matterTextClass = matterTextClass;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/chunks/matter-text-CjPBzmSX.cjs.map