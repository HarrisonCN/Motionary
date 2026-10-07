import { defineElement, clamp, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import { shake, haptic } from './fx';
import css from './button.css?raw';

export const BUTTON_DEFORMS = ['squash', 'wobble', 'gooey', 'dent'] as const;
export type ButtonDeform = (typeof BUTTON_DEFORMS)[number];
export type ButtonShape = 'pill' | 'circle' | 'icon';
export type ButtonState = 'idle' | 'loading' | 'success' | 'error';

let gooInjected = false;
function injectGoo(): void {
  if (gooInjected || typeof document === 'undefined') return;
  gooInjected = true;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = '<filter id="usa-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>';
  document.body.appendChild(svg);
}

/**
 * `<usa-button>` — **button click deformation** (按钮点击形变) around a
 * native `<button>` (or `<a>`) child — or the element itself becomes a button.
 *
 * `deform` (combinable, e.g. `deform="squash wobble"`):
 * - `squash` — squash on press, stretch-and-settle on release (spring);
 * - `wobble` — elastic border-radius wobble after a click;
 * - `gooey` — liquid blob: droplets squeeze out from the press point and
 *   merge back (SVG goo filter);
 * - `dent` — the surface dents toward the pressed point (3D tilt + inner shade).
 *
 * `shape="pill | circle | icon"` morphs the outline with a spring (label =
 * `[data-label]`, icon = `[data-icon]` children); `morphTo(shape)`.
 *
 * `morph="submit"` — click → `loading` (shrinks to a circle with a spinner,
 * `aria-busy`), then `success` (check) or `error` (shake + cross), and back
 * to `idle` after `reset` ms (1800). Drive it with `state="…"` / `.state`, or
 * call `event.detail.done(ok)` from a `usa:submit` listener.
 *
 * Attributes: `deform`, `shape`, `morph`, `state`, `reset`, `haptic`,
 * `disabled`. Events: `usa:submit`, `usa:state`. Reduced motion: no
 * deformation; shape and state changes are instant; status still announced.
 */
export interface UsaButtonElement extends UsaElement {
  readonly target: HTMLElement;
  shape: ButtonShape;
  state: ButtonState;
  morphTo(shape: ButtonShape): Promise<void>;
}

export function defineButton(tag = 'usa-button'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaButton extends Base {
        static get observedAttributes(): string[] {
          return ['deform', 'state', 'shape', 'disabled'];
        }

        private _press: Animation | null = null;
        private _timer: ReturnType<typeof setTimeout> | undefined;
        private _status: HTMLElement | null = null;
        private _shapeBefore: ButtonShape | null = null;

        get target(): HTMLElement {
          return (this.querySelector(':scope > button, :scope > a, :scope > [role="button"]') as HTMLElement) || this;
        }
        private deforms(): string[] {
          return this.str('deform').split(/[\s,]+/).filter(Boolean);
        }
        get shape(): ButtonShape {
          return (this.str('shape', 'pill') as ButtonShape) || 'pill';
        }
        set shape(v: ButtonShape) {
          this.morphTo(v);
        }
        get state(): ButtonState {
          return (this.str('state', 'idle') as ButtonState) || 'idle';
        }
        set state(v: ButtonState) {
          this.setAttribute('state', v);
        }

        mount(): void {
          const t = this.target;
          if (t === this) {
            this.setAttribute('role', 'button');
            if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          }
          t.classList.add('usa-button-face');
          if (this.str('morph') === 'submit' && !t.querySelector('.usa-button-status')) {
            const s = document.createElement('span');
            s.className = 'usa-button-status';
            s.setAttribute('aria-hidden', 'true');
            s.innerHTML =
              '<svg class="usa-button-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" pathLength="100"/></svg>' +
              '<svg class="usa-button-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" pathLength="1"/></svg>' +
              '<svg class="usa-button-err" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" pathLength="1"/></svg>';
            t.append(s);
            const live = document.createElement('span');
            live.className = 'usa-sr';
            live.setAttribute('role', 'status');
            this.append(live);
            this._status = live;
          }
          if (this.deforms().includes('gooey')) injectGoo();
          this.applyState();
          this.listen(t, 'pointerdown', (e: PointerEvent) => {
            if (this.isOff() || (e.pointerType === 'mouse' && e.button !== 0)) return;
            this.down(e.clientX, e.clientY);
          });
          for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) this.listen(t, ev, () => this.up());
          this.listen(t, 'keydown', (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && this.down());
          this.listen(t, 'keyup', () => this.up());
          this.listen(t, 'click', (e: MouseEvent) => {
            if (this.isOff()) {
              if (this.state === 'loading') e.preventDefault();
              return;
            }
            if (this.deforms().includes('wobble')) this.wobble();
            if (this.hasAttribute('haptic')) haptic(this.num('haptic', 10));
            if (this.str('morph') === 'submit' && this.state === 'idle') this.submit();
          });
          if (t === this)
            this.listen(this, 'keydown', (e: KeyboardEvent) => {
              if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                e.preventDefault();
                this.click();
              }
            });
        }

        unmount(): void {
          clearTimeout(this._timer);
          this._press?.cancel();
        }

        changed(name: string): void {
          if (name === 'state') this.applyState();
          else if (name === 'shape') this.target.setAttribute('data-shape', this.shape);
          else {
            super.changed(name);
          }
        }

        private isOff(): boolean {
          return this.flag('disabled') || this.state === 'loading';
        }

        /* ------------------------------------------------ press deformations */
        private down(x?: number, y?: number): void {
          if (this.reduced || this.hasAttribute('data-pressed')) return;
          const d = this.deforms();
          if (!d.length) return;
          this.setAttribute('data-pressed', '');
          const t = this.target;
          const r = t.getBoundingClientRect();
          const px = x === undefined ? 0.5 : clamp((x - r.left) / (r.width || 1), 0, 1);
          const py = y === undefined ? 0.5 : clamp((y - r.top) / (r.height || 1), 0, 1);
          t.style.setProperty('--usa-dent-x', `${(px * 100).toFixed(1)}%`);
          t.style.setProperty('--usa-dent-y', `${(py * 100).toFixed(1)}%`);
          const parts: string[] = [];
          if (d.includes('dent')) parts.push(`perspective(600px) rotateX(${((0.5 - py) * -14).toFixed(2)}deg) rotateY(${((px - 0.5) * 14).toFixed(2)}deg) scale(0.97)`);
          if (d.includes('squash')) parts.push('scale(1.12, 0.84)');
          if (d.includes('gooey')) {
            parts.push('scale(0.96)');
            this.goo(px, py);
          }
          if (!parts.length) return;
          this._press?.cancel();
          this._press = this.motion(t, [{ transform: 'none' }, { transform: parts.join(' ') }], { duration: 110, easing: 'ease-out', fill: 'forwards' });
        }

        private up(): void {
          if (!this.hasAttribute('data-pressed')) return;
          this.removeAttribute('data-pressed');
          const t = this.target;
          const a = this._press;
          const from = (a?.effect as KeyframeEffect | null)?.getKeyframes?.().slice(-1)[0]?.transform as string | undefined;
          a?.cancel();
          if (!from) return;
          this._press = this.motion(t, [{ transform: from }, { transform: 'none' }], { ...springEasing(this.deforms().includes('squash') ? 'bouncy' : 'wobbly') });
        }

        private wobble(): void {
          if (this.reduced) return;
          const t = this.target;
          const r = getComputedStyle(t).borderRadius || '12px';
          this.motion(
            t,
            [
              { borderRadius: r },
              { borderRadius: '42% 58% 50% 50% / 60% 45% 55% 40%', offset: 0.2 },
              { borderRadius: '58% 42% 45% 55% / 40% 60% 40% 60%', offset: 0.45 },
              { borderRadius: '48% 52% 52% 48% / 52% 48% 52% 48%', offset: 0.7 },
              { borderRadius: r },
            ],
            { duration: 700, easing: 'ease-out' }
          );
        }

        private goo(px: number, py: number): void {
          const t = this.target;
          const layer = document.createElement('span');
          layer.className = 'usa-button-goo';
          layer.setAttribute('aria-hidden', 'true');
          layer.style.setProperty('--usa-goo-bg', getComputedStyle(t).backgroundColor || 'currentColor');
          const drops: HTMLElement[] = [];
          for (let i = 0; i < 4; i++) {
            const d = document.createElement('i');
            d.style.left = `${(px * 100).toFixed(1)}%`;
            d.style.top = `${(py * 100).toFixed(1)}%`;
            layer.append(d);
            drops.push(d);
          }
          this.prepend(layer);
          let left = drops.length;
          drops.forEach((d, i) => {
            const ang = (i / drops.length) * Math.PI * 2 + 0.6;
            const dist = 26 + (i % 2) * 12;
            const a = this.motion(
              d,
              [
                { transform: 'translate(-50%, -50%) scale(0.4)' },
                { transform: `translate(calc(-50% + ${(Math.cos(ang) * dist).toFixed(1)}px), calc(-50% + ${(Math.sin(ang) * dist).toFixed(1)}px)) scale(1)`, offset: 0.45 },
                { transform: 'translate(-50%, -50%) scale(0.2)' },
              ],
              { duration: 700, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)', fill: 'forwards' }
            );
            const end = () => --left === 0 && layer.remove();
            if (a) a.onfinish = end;
            else end();
          });
        }

        /* ------------------------------------------------ shape morph */
        async morphTo(shape: ButtonShape): Promise<void> {
          const t = this.target;
          const before = t.getBoundingClientRect();
          this.setAttribute('shape', shape);
          t.setAttribute('data-shape', shape);
          if (this.reduced) return;
          const after = t.getBoundingClientRect();
          if (!before.width || !after.width || Math.abs(before.width - after.width) < 0.5) return;
          const a = this.motion(t, [{ width: `${before.width}px` }, { width: `${after.width}px` }], springEasing('stiff'));
          await a?.finished.catch(() => undefined);
        }

        /* ------------------------------------------------ submit morph */
        private submit(): void {
          let settled = false;
          const done = (ok = true) => {
            if (settled) return;
            settled = true;
            this.state = ok ? 'success' : 'error';
          };
          this.state = 'loading';
          this.emit('submit', { done });
        }

        private applyState(): void {
          if (this.str('morph') !== 'submit') return;
          const t = this.target;
          const s = this.state;
          clearTimeout(this._timer);
          t.setAttribute('data-state', s);
          if (s === 'loading') {
            if (this._shapeBefore === null) this._shapeBefore = this.shape;
            t.setAttribute('aria-busy', 'true');
            this.morphTo('circle');
          } else {
            t.removeAttribute('aria-busy');
          }
          if (s === 'error') {
            shake(t);
            if (this.hasAttribute('haptic')) haptic([30, 40, 30]);
          }
          if (s === 'success' && !this.reduced) {
            const ok = t.querySelector('.usa-button-ok');
            if (ok) this.motion(ok, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], springEasing('bouncy'));
          }
          if (this._status) this._status.textContent = s === 'loading' ? 'Loading…' : s === 'success' ? 'Done' : s === 'error' ? 'Failed' : '';
          if (s === 'success' || s === 'error') {
            this._timer = setTimeout(() => {
              this.state = 'idle';
            }, this.num('reset', 1800));
          }
          if (s === 'idle' && this._shapeBefore !== null) {
            const back = this._shapeBefore;
            this._shapeBefore = null;
            this.morphTo(back);
          }
          this.emit('state', { state: s });
        }
      },
    { id: 'button', text: css }
  );
}
