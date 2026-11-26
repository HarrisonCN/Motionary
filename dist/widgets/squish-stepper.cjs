'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var tactile$1 = require('../chunks/tactile-Dfg7b_8s.cjs');
var tactile = require('../chunks/tactile-DqlGeBjU.cjs');

function defineSquishStepper(tag = 'usa-squish-stepper') {
    const ctor = base.defineElement(tag, Base => class SquishStepper extends Base {
        static get observedAttributes() { return ['value', 'min', 'max', 'step', 'label', 'disabled']; }
        range() {
            const min = this.num('min', 0);
            const max = Math.max(min, this.num('max', 10));
            const step = this.num('step', 1) > 0 ? this.num('step', 1) : 1;
            return [min, max, step];
        }
        get value() { const [min, max] = this.range(); return moments.bound(this.num('value', min), min, max, min); }
        set value(n) { const [min, max, step] = this.range(); this.setAttribute('value', String(moments.roundTo(moments.bound(Number(n), min, max, min), step))); }
        nudge(dir) {
            if (this.flag('disabled'))
                return false;
            const [min, max, step] = this.range();
            const next = moments.roundTo(moments.bound(this.value + dir * step, min, max, min), step);
            if (next === this.value)
                return false;
            this.value = next;
            this.emit('input', { value: this.value });
            return true;
        }
        stepUp() { if (this.nudge(1))
            this.emit('change', { value: this.value }); }
        stepDown() { if (this.nudge(-1))
            this.emit('change', { value: this.value }); }
        changed() { this._sync?.(); }
        mount() {
            const root = moments.make('div', 'usa-tactile usa-stepper');
            root.setAttribute('role', 'group');
            const minus = moments.make('button', 'usa-squish-key usa-stepper-key');
            const plus = moments.make('button', 'usa-squish-key usa-stepper-key');
            minus.type = plus.type = 'button';
            minus.append(moments.make('span', 'usa-squish-glyph', '−'));
            plus.append(moments.make('span', 'usa-squish-glyph', '+'));
            minus.setAttribute('aria-label', 'Decrease');
            plus.setAttribute('aria-label', 'Increase');
            const win = moments.make('span', 'usa-stepper-window');
            const num = moments.make('output', 'usa-stepper-value');
            num.setAttribute('aria-live', 'polite');
            win.append(num);
            root.append(minus, win, plus);
            this.append(root);
            const springs = [tactile$1.pressSpring(this, minus), tactile$1.pressSpring(this, plus)];
            let delay;
            let repeat;
            let stepped = false;
            const stop = () => {
                clearTimeout(delay);
                clearInterval(repeat);
                delay = repeat = undefined;
                if (stepped) {
                    stepped = false;
                    this.emit('change', { value: this.value });
                }
            };
            const roll = (dir) => {
                win.dataset.roll = dir > 0 ? 'up' : 'down';
                this.motion(num, [{ transform: `translateY(${dir > 0 ? 40 : -40}%)`, opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.34,1.56,.64,1)' });
            };
            const step = (dir) => { if (this.nudge(dir)) {
                stepped = true;
                roll(dir);
            } };
            const hold = (dir) => {
                stop();
                step(dir);
                delay = setTimeout(() => { repeat = setInterval(() => step(dir), 90); }, 420);
            };
            [[minus, -1], [plus, 1]].forEach(([key, dir], i) => {
                this.listen(key, 'pointerdown', (e) => {
                    if (key.disabled || (e.pointerType === 'mouse' && e.button !== 0))
                        return;
                    hold(dir);
                });
                for (const type of ['pointerup', 'pointerleave', 'pointercancel', 'blur'])
                    this.listen(key, type, stop);
                // Enter / Space and assistive-tech clicks arrive as a click with no pointer press before it
                this.listen(key, 'click', (e) => {
                    if (e.detail !== 0)
                        return;
                    if (!springs[i].animating)
                        tactile$1.tap(springs[i]);
                    step(dir);
                    stop();
                });
                this.listen(key, 'keydown', (e) => {
                    const d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -1 : 0;
                    if (!d)
                        return;
                    e.preventDefault();
                    tactile$1.tap(springs[d > 0 ? 1 : 0]);
                    step(d);
                    stop();
                });
            });
            const sync = () => {
                const [min, max] = this.range();
                const v = this.value, disabled = this.flag('disabled');
                num.textContent = String(v);
                root.setAttribute('aria-label', this.str('label', 'Quantity'));
                minus.disabled = disabled || v <= min;
                plus.disabled = disabled || v >= max;
                root.toggleAttribute('data-disabled', disabled);
                root.toggleAttribute('data-static', this.reduced);
                if (minus.disabled || plus.disabled)
                    stop();
            };
            this._sync = sync;
            this.onCleanup(() => { clearTimeout(delay); clearInterval(repeat); root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'tactile', text: tactile.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSquishStepper = defineSquishStepper;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/squish-stepper.cjs.map