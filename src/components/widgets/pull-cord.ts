import { defineElement, type UsaElement } from '../base';
import css from './pull-cord.css?raw';

/**
 * `<usa-pull-cord>` (6.8) — a lamp pull-cord switch. Drag the handle down
 * (or click / Space / Enter): the cord stretches, and when released past
 * `threshold` px it toggles `on` with a click-bounce; the cord swings back on
 * a damped spring (simulated, drawn as an SVG curve). The lamp shade above
 * glows when on (CSS custom property `--usa-pc-glow`). A real switch:
 * `role="switch"`, `aria-checked`; event `usa:change` (`{ on }`). Reduced
 * motion: no swing — it just toggles.
 */
export interface UsaPullCordElement extends UsaElement {
  on: boolean;
  toggle(force?: boolean): void;
}

export function definePullCord(tag = 'usa-pull-cord'): CustomElementConstructor | undefined {
  // contract-exempt: attr-unobserved — on: state reflected by the element itself (set the property instead); observing it would re-mount on every change
  return defineElement(
    tag,
    (Base) => {
      class UsaPullCord extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'threshold'];
        }
        private _on = false;
        private _raf = 0;
        private _x = 0;
        private _y = 0;
        private _vx = 0;
        private _vy = 0;

        get on(): boolean {
          return this._on;
        }
        set on(v: boolean) {
          this.toggle(!!v, false);
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML('afterbegin', '<span class="usa-pc-lamp" data-usa-part aria-hidden="true"></span><svg class="usa-pc-svg" data-usa-part aria-hidden="true" viewBox="-40 0 80 150"><path class="usa-pc-cord" d="M0 0 L0 90"/><circle class="usa-pc-knob" cx="0" cy="96" r="7"/></svg>');
          this.setAttribute('role', 'switch');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Light'));
          this._on = this.flag('on');
          this.sync();
          this.draw();
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              this.pull();
            }
          });
          this.listen(this, 'pointerdown', (e: PointerEvent) => this.drag(e));
          this.onCleanup(() => this._raf && cancelAnimationFrame(this._raf));
        }

        private sync(): void {
          this.setAttribute('aria-checked', String(this._on));
          this.toggleAttribute('data-on', this._on);
        }

        private draw(): void {
          const cord = this.querySelector('.usa-pc-cord');
          const knob = this.querySelector('.usa-pc-knob');
          const ex = this._x;
          const ey = 90 + this._y;
          cord?.setAttribute('d', `M0 0 Q${(ex * 0.5).toFixed(1)} ${(ey * 0.55).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
          knob?.setAttribute('cx', ex.toFixed(1));
          knob?.setAttribute('cy', (ey + 6).toFixed(1));
        }

        /** Damped spring back to rest. */
        private release(): void {
          if (this.reduced || typeof requestAnimationFrame !== 'function') {
            this._x = this._y = 0;
            this.draw();
            return;
          }
          let last = 0;
          const f = (now: number) => {
            const dt = last ? Math.min(0.033, (now - last) / 1000) : 1 / 60;
            last = now;
            this._vx += (-120 * this._x - 3 * this._vx) * dt;
            this._vy += (-260 * this._y - 9 * this._vy) * dt;
            this._x += this._vx * dt;
            this._y += this._vy * dt;
            this.draw();
            if (Math.abs(this._x) + Math.abs(this._y) + Math.abs(this._vx) + Math.abs(this._vy) > 0.05) this._raf = requestAnimationFrame(f);
            else ((this._raf = 0), (this._x = this._y = this._vx = this._vy = 0), this.draw());
          };
          if (!this._raf) this._raf = requestAnimationFrame(f);
        }

        /** Pull once (keyboard / click): tug the cord and toggle. */
        pull(): void {
          this._y = 26;
          this._vx = (Math.random() - 0.5) * 60;
          this.draw();
          this.toggle(undefined, true);
          this.release();
        }

        private drag(e: PointerEvent): void {
          if (e.button > 0) return;
          const y0 = e.clientY;
          const x0 = e.clientX;
          let moved = false;
          if (this._raf) (cancelAnimationFrame(this._raf), (this._raf = 0));
          const move = (ev: PointerEvent) => {
            moved = moved || Math.abs(ev.clientY - y0) > 4;
            this._y = Math.max(0, Math.min(50, ev.clientY - y0));
            this._x = Math.max(-30, Math.min(30, (ev.clientX - x0) * 0.6));
            this.draw();
          };
          const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
            if (!moved) return this.pull();
            if (this._y >= this.num('threshold', 24)) this.toggle(undefined, true);
            this._vy = -this._y * 2;
            this.release();
          };
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', up);
          window.addEventListener('pointercancel', up);
        }

        toggle(force?: boolean, user = false): void {
          const next = typeof force === 'boolean' ? force : !this._on;
          if (next === this._on) return;
          this._on = next;
          this.toggleAttribute('on', next);
          this.sync();
          const lamp = this.querySelector('.usa-pc-lamp');
          if (user && lamp && !this.reduced) this.motion(lamp, [{ transform: 'translateY(0)' }, { transform: 'translateY(3px)', offset: 0.3 }, { transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' });
          if (user) this.emit('change', { on: next });
        }
      }
      return UsaPullCord as unknown as CustomElementConstructor;
    },
    { id: 'pull-cord', text: css }
  );
}
