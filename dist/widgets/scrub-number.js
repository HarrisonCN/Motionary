import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { f as finite } from '../chunks/engine-CUOpaIK4.js';
import { c as css, s as setMatterData } from '../chunks/matter-s1ApmJnh.js';

function defineScrubNumber(tag = 'usa-scrub-number') {
    const ctor = defineElement(tag, Base => {
        class ScrubNumber extends Base {
            static get observedAttributes() { return ['label', 'value', 'min', 'max', 'step', 'unit', 'disabled']; }
            bounds() { const a = finite(this.num('min', 0), 0, -1e12, 1e12), b = finite(this.num('max', 100), 100, -1e12, 1e12); return [Math.min(a, b), Math.max(a, b)]; }
            get value() { const [min, max] = this.bounds(); return finite(this.num('value', 50), 50, min, max); }
            set value(v) { const [min, max] = this.bounds(), step = finite(this.num('step', 1), 1, .000001, 1e6); this.setAttribute('value', String(Number(finite(min + Math.round((finite(v, min, min, max) - min) / step) * step, min, min, max).toFixed(10)))); }
            stepUp(amount = 1) { this.value += finite(amount, 1, -1e6, 1e6) * finite(this.num('step', 1), 1, .000001, 1e6); }
            stepDown(amount = 1) { this.stepUp(-amount); }
            reset() { this.value = this._initial ?? 50; }
            update(data) { setMatterData(this, data); }
            changed() { if (this.flag('disabled'))
                this._end?.(); this._sync?.(); }
            mount() {
                this._initial ?? (this._initial = this.value);
                this.classList.add('usa-matter');
                this.setAttribute('role', 'group');
                const root = document.createElement('div');
                root.className = 'usa-matter-tool';
                const row = document.createElement('div');
                row.className = 'usa-scrub';
                const handle = document.createElement('button');
                handle.type = 'button';
                handle.textContent = '↔';
                handle.setAttribute('aria-label', 'Drag horizontally to adjust');
                const input = document.createElement('input');
                input.type = 'number';
                const unit = document.createElement('span');
                unit.className = 'usa-matter-unit';
                row.append(handle, input, unit);
                const hint = document.createElement('div');
                hint.className = 'usa-hold-status';
                hint.textContent = 'Drag ↔ · Shift for precision · arrows / Page Up / Page Down';
                root.append(row, hint);
                this.prepend(root);
                let start, editing = false;
                const emitInput = () => this.emit('input', { value: this.value });
                const emitChange = () => this.emit('change', { value: this.value });
                const end = () => { const s = start; start = undefined; if (s) {
                    try {
                        if (handle.hasPointerCapture?.(s.pointer))
                            handle.releasePointerCapture(s.pointer);
                    }
                    catch { /* already cancelled */ }
                    if (s.moved)
                        emitChange();
                } };
                this._end = end;
                const sync = () => { const label = this.str('label', 'Value'), [min, max] = this.bounds(); this.setAttribute('aria-label', label); input.setAttribute('aria-label', label); if (!editing)
                    input.value = String(this.value); input.min = String(min); input.max = String(max); input.step = String(finite(this.num('step', 1), 1, .000001, 1e6)); input.disabled = handle.disabled = this.flag('disabled'); unit.textContent = this.str('unit'); };
                this._sync = sync;
                this.listen(input, 'input', () => { if (!this.flag('disabled') && Number.isFinite(input.valueAsNumber)) {
                    editing = true;
                    try {
                        this.value = input.valueAsNumber;
                    }
                    finally {
                        editing = false;
                    }
                    emitInput();
                } });
                this.listen(input, 'change', () => { sync(); emitChange(); });
                this.listen(input, 'keydown', (e) => {
                    if (this.flag('disabled') || !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key))
                        return;
                    e.preventDefault();
                    if (e.key === 'Home')
                        this.value = this.bounds()[0];
                    else if (e.key === 'End')
                        this.value = this.bounds()[1];
                    else
                        this.stepUp((e.key === 'ArrowDown' || e.key === 'PageDown' ? -1 : 1) * (e.key.startsWith('Page') ? 10 : 1));
                    emitInput();
                    emitChange();
                });
                this.listen(handle, 'pointerdown', (e) => { if (start || this.flag('disabled') || e.button !== 0)
                    return; start = { x: e.clientX, y: e.clientY, value: this.value, pointer: e.pointerId, touch: e.pointerType === 'touch', moved: false }; if (!start.touch) {
                    try {
                        handle.setPointerCapture(e.pointerId);
                    }
                    catch { /* synthetic */ }
                } });
                this.listen(handle, 'pointermove', (e) => {
                    if (!start || start.pointer !== e.pointerId || this.flag('disabled'))
                        return;
                    const dx = e.clientX - start.x, dy = e.clientY - start.y;
                    if (start.touch && !start.moved && Math.abs(dy) > Math.abs(dx) + 4) {
                        end();
                        return;
                    }
                    if (Math.abs(dx) < 4 && !start.moved)
                        return;
                    start.moved = true;
                    try {
                        handle.setPointerCapture(e.pointerId);
                    }
                    catch { /* synthetic */ }
                    const step = finite(this.num('step', 1), 1, .000001, 1e6);
                    this.value = start.value + Math.round(dx / (e.shiftKey ? 40 : 8)) * step;
                    emitInput();
                });
                for (const type of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'])
                    this.listen(handle, type, (e) => { if (e.pointerId === undefined || start?.pointer === e.pointerId)
                        end(); });
                this.listen(document, 'visibilitychange', () => { if (document.hidden)
                    end(); });
                this.onCleanup(() => { end(); this._end = this._sync = undefined; root.remove(); });
                sync();
            }
        }
        return ScrubNumber;
    }, { id: 'matter', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineScrubNumber };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/scrub-number.js.map