import { defineElement, type UsaElement } from '../base';
import { createSpring, rubberBand, type SpringValue } from '../physics/spring';
import { defineMoName } from './mo-name';
import { bound, make, uniqueId } from './moments';
import css from './tactile.css?raw';

/**
 * A thumb stick in a soft well: drag the cap and it follows with a rubbery pull past the rim, then springs back to
 * centre when let go. The cap is a native button, so arrow keys push it (Shift halves the push) and releasing the key
 * lets it spring home. Readings are normalised to -1…1 on each axis, with a dead zone around the centre.
 *
 * Attributes: `label` (Joystick), `dead-zone` (0–0.9, 0.12), `disabled`. Read-only properties `x`, `y`.
 * Events `usa:move` ({ x, y }) while it moves and `usa:release` ({ x, y }, the last reading) when let go.
 */
export interface UsaAnalogStickElement extends UsaElement {
  readonly x: number;
  readonly y: number;
}

/** Apply a radial dead zone and rescale the rest so the reading still reaches 1 at the rim. */
export function deadZone(x: number, y: number, zone: number): [number, number] {
  const len = Math.hypot(x, y);
  if (len <= zone || len === 0) return [0, 0];
  const capped = Math.min(1, len);
  const k = (capped - zone) / (1 - zone) / len;
  return [Number((x * k).toFixed(3)) || 0, Number((y * k).toFixed(3)) || 0];
}

export function defineAnalogStick(tag = 'usa-analog-stick'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class AnalogStick extends Base {
    static get observedAttributes(): string[] { return ['label', 'dead-zone', 'disabled']; }
    private _x = 0;
    private _y = 0;
    private _sync?: () => void;
    get x(): number { return this._x; }
    get y(): number { return this._y; }
    changed(): void { this._sync?.(); }
    mount(): void {
      const well = make('div', 'usa-tactile usa-stick');
      const cap = make('button', 'usa-stick-cap');
      cap.type = 'button';
      const readout = make('span', 'usa-sr');
      readout.id = uniqueId('usa-stick');
      cap.setAttribute('aria-describedby', readout.id);
      well.append(make('span', 'usa-stick-rim'), cap, readout);
      this.append(well);

      const write = (axis: 'x' | 'y') => (v: number) => well.style.setProperty(`--s${axis}`, v.toFixed(2));
      const sx: SpringValue = createSpring({ spring: { stiffness: 360, damping: 14 }, onUpdate: write('x') });
      const sy: SpringValue = createSpring({ spring: { stiffness: 360, damping: 14 }, onUpdate: write('y') });
      let pointer: number | undefined;
      let origin = { x: 0, y: 0 };
      const keys = new Set<string>();
      const radius = () => Math.max(1, (well.getBoundingClientRect().width || 120) * 0.32);
      const report = (px: number, py: number) => {
        const r = radius();
        const [x, y] = deadZone(px / r, -py / r, bound(this.num('dead-zone', 0.12), 0, 0.9, 0.12));
        if (x === this._x && y === this._y) return;
        this._x = x; this._y = y;
        readout.textContent = `x ${x.toFixed(2)}, y ${y.toFixed(2)}`;
        this.emit('move', { x, y });
      };
      const place = (dx: number, dy: number) => {
        const r = radius();
        const len = Math.hypot(dx, dy);
        // inside the rim the cap follows the finger; past it the pull turns rubbery
        const k = len > r ? (r + rubberBand(len - r, r, 0.4)) / len : 1;
        sx.jump(dx * k); sy.jump(dy * k);
        const clamp = len > r ? r / len : 1;
        report(dx * clamp, dy * clamp);
      };
      const letGo = () => {
        well.removeAttribute('data-held');
        sx.set(0, 0); sy.set(0, 0);
        const last = { x: this._x, y: this._y };
        if (this._x || this._y) { this._x = this._y = 0; readout.textContent = 'x 0.00, y 0.00'; }
        this.emit('release', last);
      };
      this.listen(cap, 'pointerdown', (e: PointerEvent) => {
        if (cap.disabled || pointer !== undefined || (e.pointerType === 'mouse' && e.button !== 0)) return;
        pointer = e.pointerId;
        cap.setPointerCapture?.(e.pointerId);
        e.preventDefault();
        cap.focus({ preventScroll: true });
        origin = { x: e.clientX - sx.value, y: e.clientY - sy.value };
        well.setAttribute('data-held', '');
      });
      this.listen(cap, 'pointermove', (e: PointerEvent) => {
        if (e.pointerId === pointer) place(e.clientX - origin.x, e.clientY - origin.y);
      });
      const end = (e: PointerEvent) => {
        if (e.pointerId !== pointer) return;
        pointer = undefined;
        letGo();
      };
      this.listen(cap, 'pointerup', end);
      this.listen(cap, 'pointercancel', end);
      const fromKeys = (half: boolean) => {
        const r = radius() * (half ? 0.5 : 1);
        const dx = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
        const dy = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
        const len = Math.hypot(dx, dy) || 1;
        sx.set((dx / len) * r); sy.set((dy / len) * r);
        report((dx / len) * r, (dy / len) * r);
      };
      this.listen(cap, 'keydown', (e: KeyboardEvent) => {
        if (!e.key.startsWith('Arrow') || cap.disabled) return;
        e.preventDefault();
        keys.add(e.key);
        well.setAttribute('data-held', '');
        fromKeys(e.shiftKey);
      });
      this.listen(cap, 'keyup', (e: KeyboardEvent) => {
        if (!keys.delete(e.key)) return;
        if (keys.size) fromKeys(e.shiftKey); else letGo();
      });
      this.listen(cap, 'blur', () => { if (keys.size) { keys.clear(); letGo(); } });
      const sync = () => {
        cap.setAttribute('aria-label', this.str('label', 'Joystick'));
        cap.disabled = this.flag('disabled');
        well.toggleAttribute('data-disabled', cap.disabled);
        well.toggleAttribute('data-static', this.reduced);
      };
      this._sync = sync;
      readout.textContent = 'x 0.00, y 0.00';
      this.onCleanup(() => { sx.stop(); sy.stop(); well.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'tactile', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
