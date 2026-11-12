'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var luminous = require('../chunks/luminous-B_-9G2GO.cjs');

var css = ":is(mo-orbit-progress,usa-orbit-progress){width:var(--mo-progress-size,120px);height:var(--mo-progress-size,120px)}.usa-op-face{position:relative;display:grid;place-items:center;width:100%;height:100%;border-radius:32%;background-image:var(--lu-glass)}.usa-op-face>svg{position:absolute;inset:5%;width:90%;height:90%;overflow:visible;transform:rotate(-90deg)}.usa-op-face circle{fill:none;stroke-width:4}.usa-op-track{stroke:var(--lu-edge)}.usa-op-ring{stroke:var(--lu-accent);stroke-linecap:round;stroke-dasharray:100;transition:stroke-dashoffset .65s cubic-bezier(.22,.8,.2,1);filter:drop-shadow(0 0 4px var(--lu-accent))}.usa-op-value{font-size:20px;font-variant-numeric:tabular-nums}";

function defineOrbitProgress(tag = 'usa-orbit-progress') {
    const ctor = base.defineElement(tag, Base => {
        class OrbitProgress extends Base {
            static get observedAttributes() { return ['value', 'max', 'label', 'theme']; }
            get value() { return Math.max(0, Math.min(Math.max(1, this.num('max', 100)), this.num('value', 0))); }
            set value(v) { this.setAttribute('value', String(Number.isFinite(v) ? v : 0)); }
            changed(name) { if (name === 'value' || name === 'max')
                this.sync();
            else
                super.changed(name); }
            mount() {
                luminous.luminousTheme(this);
                this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
                const face = document.createElement('span');
                face.className = 'usa-op-face usa-lu-surface';
                face.setAttribute('data-usa-part', '');
                face.setAttribute('aria-hidden', 'true');
                face.innerHTML = '<svg viewBox="0 0 100 100"><circle class="usa-op-track" cx="50" cy="50" r="42"/><circle class="usa-op-ring" cx="50" cy="50" r="42" pathLength="100"/></svg><span class="usa-op-value"></span>';
                this._ring = face.querySelector('.usa-op-ring');
                this._text = face.querySelector('.usa-op-value');
                this.append(face);
                this.sync();
            }
            sync() {
                const max = Math.max(1, this.num('max', 100)), value = this.value;
                this.setAttribute('role', 'progressbar');
                this.setAttribute('aria-label', this.str('label', 'Progress'));
                this.setAttribute('aria-valuemin', '0');
                this.setAttribute('aria-valuemax', String(max));
                this.setAttribute('aria-valuenow', String(value));
                this.toggleAttribute('data-lu-reduced', this.reduced);
                if (this._ring)
                    this._ring.style.strokeDashoffset = String(100 - value / max * 100);
                if (this._text)
                    this._text.textContent = `${Math.round(value / max * 100)}%`;
            }
        }
        return OrbitProgress;
    }, { id: 'orbit-progress', text: luminous.shared + css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineOrbitProgress = defineOrbitProgress;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/orbit-progress.cjs.map