import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { b as bound, m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-ui-CQJNkFyY.js';

function defineStepTrack(tag = 'usa-step-track') {
    const ctor = defineElement(tag, Base => class StepTrack extends Base {
        static get observedAttributes() { return ['steps', 'value', 'label', 'disabled']; }
        steps() { return Math.round(bound(this.num('steps', 4), 2, 8, 4)); }
        get value() { return Math.round(bound(this.num('value', 1), 1, this.steps(), 1)); }
        set value(n) { this.setAttribute('value', String(Math.round(bound(Number(n), 1, this.steps(), 1)))); }
        go(delta) {
            if (this.flag('disabled'))
                return this.value;
            const before = this.value;
            this.value = before + delta;
            if (this.value !== before)
                this.emit('change', { value: this.value });
            return this.value;
        }
        next() { return this.go(1); }
        prev() { return this.go(-1); }
        changed(name) { if (name === 'steps')
            super.changed(name);
        else
            this._sync?.(); }
        mount() {
            const steps = this.steps();
            const root = make('div', 'usa-moment usa-steps');
            root.setAttribute('role', 'group');
            const line = make('span', 'usa-steps-line');
            line.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < steps; i++) {
                const dot = make('i', 'usa-steps-dot');
                dot.style.setProperty('--i', String(i));
                line.append(dot);
            }
            line.append(make('span', 'usa-steps-bead'));
            line.style.setProperty('--steps', String(steps));
            const nav = make('span', 'usa-steps-nav');
            const back = make('button', 'usa-steps-btn', '‹');
            const fwd = make('button', 'usa-steps-btn', '›');
            back.type = fwd.type = 'button';
            back.setAttribute('aria-label', 'Previous step');
            fwd.setAttribute('aria-label', 'Next step');
            nav.append(back, fwd);
            const status = make('span', 'usa-sr');
            status.setAttribute('role', 'status');
            root.append(line, nav, status);
            this.append(root);
            let last = 0;
            const sync = () => {
                const v = this.value, disabled = this.flag('disabled');
                root.setAttribute('aria-label', this.str('label', 'Progress'));
                line.style.setProperty('--at', String(v - 1));
                Array.from(line.querySelectorAll('.usa-steps-dot')).forEach((d, i) => d.toggleAttribute('data-done', i < v));
                back.disabled = disabled || v <= 1;
                fwd.disabled = disabled || v >= steps;
                root.toggleAttribute('data-static', this.reduced);
                if (last && v !== last)
                    status.textContent = `Step ${v} of ${steps}`;
                root.dataset.dir = v >= last ? 'fwd' : 'back';
                last = v;
            };
            this._sync = sync;
            this.listen(back, 'click', () => this.prev());
            this.listen(fwd, 'click', () => this.next());
            this.onCleanup(() => { root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineStepTrack };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/step-track.js.map