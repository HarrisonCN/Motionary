import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { c as createSpring } from '../chunks/spring-Bu3AwUgu.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { b as bound, m as make, u as uniqueId } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-D7dR6K16.js';

function defineBulgeVolume(tag = 'usa-bulge-volume') {
    const ctor = defineElement(tag, Base => class BulgeVolume extends Base {
        static get observedAttributes() { return ['value', 'label', 'disabled']; }
        get value() { return Math.round(bound(this.num('value', 60), 0, 100, 60)); }
        set value(n) { this.setAttribute('value', String(Math.round(bound(Number(n), 0, 100, 0)))); }
        changed() { this._sync?.(); }
        mount() {
            const root = make('div', 'usa-moment usa-bulge');
            const pill = make('div', 'usa-bulge-pill');
            pill.setAttribute('aria-hidden', 'true');
            pill.append(make('span', 'usa-bulge-fill'), make('span', 'usa-bulge-glyph'));
            const id = uniqueId('usa-bulge');
            const input = make('input', 'usa-bulge-input');
            input.type = 'range';
            input.min = '0';
            input.max = '100';
            input.step = '1';
            input.id = id;
            const title = make('label', 'usa-bulge-label');
            title.htmlFor = id;
            const out = make('output', 'usa-bulge-value');
            root.append(pill, input, title, out);
            this.append(root);
            const swell = createSpring({ spring: { stiffness: 380, damping: 15 }, onUpdate: (b) => root.style.setProperty('--bulge', b.toFixed(4)) });
            const level = createSpring({ value: this.value / 100, spring: { stiffness: 460, damping: 30 }, onUpdate: (v) => root.style.setProperty('--v', v.toFixed(4)) });
            root.style.setProperty('--v', String(this.value / 100));
            let pointer;
            const fromPointer = (e) => {
                const r = pill.getBoundingClientRect();
                const at = r.height ? bound((e.clientY - r.top) / r.height, 0, 1, 0.5) : 0.5;
                root.style.setProperty('--at', at.toFixed(4));
                return Math.round((1 - at) * 100);
            };
            const set = (v) => {
                if (v === this.value)
                    return;
                this.value = v;
                this.emit('input', { value: this.value });
            };
            const sync = () => {
                const v = this.value, disabled = this.flag('disabled');
                title.textContent = this.str('label', 'Volume');
                out.textContent = `${v}%`;
                input.value = String(v);
                input.disabled = disabled;
                root.toggleAttribute('data-disabled', disabled);
                root.dataset.level = v === 0 ? 'mute' : v < 34 ? 'low' : v < 67 ? 'mid' : 'high';
                level.set(v / 100);
            };
            this._sync = sync;
            this.listen(pill, 'pointerdown', (e) => {
                if (this.flag('disabled') || pointer !== undefined || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                pointer = e.pointerId;
                pill.setPointerCapture?.(e.pointerId);
                e.preventDefault();
                input.focus({ preventScroll: true });
                swell.set(1);
                set(fromPointer(e));
            });
            this.listen(pill, 'pointermove', (e) => { if (e.pointerId === pointer)
                set(fromPointer(e)); });
            const end = (e) => {
                if (e.pointerId !== pointer)
                    return;
                pointer = undefined;
                swell.set(0, -2);
                this.emit('change', { value: this.value });
            };
            this.listen(pill, 'pointerup', end);
            this.listen(pill, 'pointercancel', end);
            this.listen(input, 'input', () => {
                root.style.setProperty('--at', String(1 - input.valueAsNumber / 100));
                swell.set(0.45);
                set(input.valueAsNumber);
            });
            this.listen(input, 'change', () => { swell.set(0); this.emit('change', { value: this.value }); });
            this.listen(input, 'blur', () => swell.set(0));
            this.onCleanup(() => { swell.stop(); level.stop(); root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moments', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineBulgeVolume };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/bulge-volume.js.map