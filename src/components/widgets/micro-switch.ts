import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick, overdrag, stretch, px } from './micro-kit-16';
import css from './micro-kit-16.css?raw';

/**
 * A switch on real springs. The knob carries its speed (it stretches as it travels and squashes into the end), can be
 * dragged with rubber-band ends and flicked, and widens while held. Space, Enter or a click toggles it.
 *
 * Attributes: `checked`, `disabled`, `label` (visible text; also its name), `name` + `value` (form value when on;
 * "on"), `size` (sm | md | lg; md), `feel`, `haptics`. Event `usa:change` ({ checked }).
 */
export interface UsaMicroSwitchElement extends UsaElement {
  checked: boolean;
  toggle(force?: boolean): void;
}

const TRAVEL: Record<string, number> = { sm: 16, md: 20, lg: 26 };

export function defineMicroSwitch(tag = 'usa-micro-switch'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class MicroSwitch extends Base {
    static get observedAttributes(): string[] {
      return ['checked', 'disabled', 'label', 'name', 'value', 'size', 'feel', 'haptics'];
    }
    private _on = false;
    private _seen?: string | null;
    private _paint: (() => void) | null = null;
    get checked(): boolean {
      return this._on;
    }
    set checked(v: boolean) {
      this.toggle(!!v);
    }
    toggle(force?: boolean): void {
      const next = force ?? !this._on;
      if (next === this._on) return;
      this._on = next;
      this._paint?.();
    }
    mount(): void {
      const attr = this.getAttribute('checked');
      if (attr !== this._seen) {
        this._seen = attr;
        this._on = this.flag('checked');
      }
      const size = ['sm', 'lg'].includes(this.str('size')) ? this.str('size') : 'md';
      const travel = TRAVEL[size];
      const btn = make('button', 'usa-mkit usa-mswitch');
      btn.type = 'button';
      btn.setAttribute('role', 'switch');
      btn.dataset.size = size;
      const track = make('span', 'usa-mswitch-track');
      const knob = make('span', 'usa-mswitch-knob');
      track.append(knob);
      btn.append(track);
      const label = this.str('label');
      if (label) btn.append(make('span', 'usa-mswitch-label', label));
      else btn.setAttribute('aria-label', 'Toggle');
      btn.disabled = this.flag('disabled');
      const hidden = this.str('name') ? make('input') : null;
      if (hidden) {
        hidden.type = 'hidden';
        hidden.name = this.str('name');
        hidden.value = this.str('value', 'on');
      }
      this.append(btn);
      if (hidden) this.append(hidden);

      const dir = typeof getComputedStyle === 'function' && getComputedStyle(this).direction === 'rtl' ? -1 : 1;
      const group = hostSprings(this, { p: this._on ? 1 : 0, w: 0 }, (v) => {
        const p = v.p;
        const e = v.w * 6 + stretch(group.velocity('p') * travel, 10, 60);
        const pos = Math.min(1, Math.max(0, p));
        knob.style.setProperty('--e', px(e));
        knob.style.transform = `translateX(${px(dir * (pos * (travel - e) + (p - pos) * travel))})`;
        btn.style.setProperty('--p', String(Math.round(pos * 1000) / 1000));
      });
      const sync = (animate: boolean, velocity?: number) => {
        btn.setAttribute('aria-checked', String(this._on));
        btn.toggleAttribute('data-on', this._on);
        if (hidden) hidden.disabled = !this._on;
        if (animate) group.set({ p: this._on ? 1 : 0 }, { spring: 'toggle', velocity: velocity === undefined ? undefined : { p: velocity } });
        else group.jump({ p: this._on ? 1 : 0 });
      };
      sync(false);
      this._paint = () => sync(true);
      const commit = (on: boolean, velocity?: number) => {
        const changed = on !== this._on;
        this._on = on;
        sync(true, velocity);
        if (changed) {
          tick(this, 10);
          this.emit('change', { checked: on });
        }
      };

      let drag: { x: number; p: number; id: number; moved: boolean; hist: [number, number][] } | null = null;
      let swallow = false;
      this.listen(btn, 'pointerdown', (e: PointerEvent) => {
        if (btn.disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
        drag = { x: e.clientX, p: group.get('p'), id: e.pointerId, moved: false, hist: [[e.clientX, performance.now()]] };
        group.set({ w: 1 }, { spring: 'press' });
        try {
          btn.setPointerCapture?.(e.pointerId);
        } catch {
          /* synthetic */
        }
      });
      this.listen(btn, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) < 3) return;
        drag.moved = true;
        drag.hist.push([e.clientX, performance.now()]);
        if (drag.hist.length > 6) drag.hist.shift();
        const raw = drag.p + (dx * dir) / travel;
        group.jump({ p: Math.min(1, Math.max(0, raw)) + overdrag(raw, 0, 1, 0.45) });
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        group.set({ w: 0 }, { spring: 'release' });
        if (!d.moved || e.type === 'pointercancel') {
          if (e.type === 'pointercancel') sync(true);
          return;
        }
        swallow = true;
        setTimeout(() => (swallow = false), 0);
        const h = d.hist;
        const a = h[0];
        const b = h[h.length - 1];
        const v = h.length > 1 ? (dir * (b[0] - a[0])) / Math.max(0.008, (b[1] - a[1]) / 1000) / travel : 0;
        const p = group.get('p');
        commit(p + v * 0.12 >= 0.5, v);
      };
      this.listen(btn, 'pointerup', end);
      this.listen(btn, 'pointercancel', end);
      this.listen(btn, 'click', (e: MouseEvent) => {
        if (swallow) {
          e.preventDefault();
          return;
        }
        commit(!this._on);
      });
      this.onCleanup(() => {
        group.stop();
        btn.remove();
        hidden?.remove();
        this._paint = null;
      });
    }
  }, { id: 'micro-kit-16', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
