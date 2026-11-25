import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { micro, type MicroHandle } from '../interaction/micro';
import { hostSprings, tick } from './micro-kit-16';
import css from './micro-kit-16.css?raw';

const SVG = 'http://www.w3.org/2000/svg';
export type MicroButtonState = 'idle' | 'loading' | 'success' | 'error';
const STATES: MicroButtonState[] = ['idle', 'loading', 'success', 'error'];

/**
 * An action button that shows the whole life of an action with springs: it dips when pressed, folds into a round
 * spinner while the work runs, pops a tick on success or shakes with a cross on failure, then springs back to its
 * label. Each state is announced. Give it the work with `run(task)` (a promise or a function returning one) — for
 * instance from the `usa:action` event — or drive it with the `state` attribute.
 *
 * Attributes: `label`, `loading-label` (announced; Working…), `success-label` (Done), `error-label` (Try again),
 * `state` (idle | loading | success | error), `reset` (ms before going back to idle; 1800; 0 stays), `variant`
 * (solid | soft | ghost), `fx` (micro behaviours of the button; press hover focus), `disabled`, `feel`, `haptics`.
 * Events: `usa:action` ({ run }) on click while idle, `usa:state` ({ state }).
 */
export interface UsaMicroButtonElement extends UsaElement {
  readonly state: MicroButtonState;
  run(task: Promise<unknown> | (() => unknown)): Promise<boolean>;
  setState(state: MicroButtonState): void;
}

const icon = (d: string) => {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(SVG, 'path');
  p.setAttribute('d', d);
  svg.append(p);
  return svg;
};

export function defineMicroButton(tag = 'usa-micro-button'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class MicroButton extends Base {
    static get observedAttributes(): string[] {
      return ['label', 'loading-label', 'success-label', 'error-label', 'state', 'reset', 'variant', 'fx', 'disabled', 'feel', 'haptics'];
    }
    private _state: MicroButtonState = 'idle';
    private _seen?: string | null;
    private _go: ((s: MicroButtonState) => void) | null = null;
    get state(): MicroButtonState {
      return this._state;
    }
    setState(state: MicroButtonState): void {
      if (!STATES.includes(state)) return;
      if (this._go) this._go(state);
      else this._state = state;
    }
    async run(task: Promise<unknown> | (() => unknown)): Promise<boolean> {
      if (this._state === 'loading') return false;
      this.setState('loading');
      try {
        await (typeof task === 'function' ? task() : task);
        this.setState('success');
        return true;
      } catch {
        this.setState('error');
        return false;
      }
    }
    mount(): void {
      const attr = this.getAttribute('state');
      if (attr !== this._seen) {
        this._seen = attr;
        this._state = STATES.includes(attr as MicroButtonState) ? (attr as MicroButtonState) : 'idle';
      }
      const btn = make('button', 'usa-mkit usa-mbtn');
      btn.type = 'button';
      const variant = this.str('variant');
      btn.dataset.variant = ['soft', 'ghost'].includes(variant) ? variant : 'solid';
      btn.disabled = this.flag('disabled');
      const text = make('span', 'usa-mbtn-text', this.str('label', 'Submit'));
      const spin = make('span', 'usa-mbtn-spin');
      spin.setAttribute('aria-hidden', 'true');
      const ok = icon('M5.5 12.5l4.2 4.2L18.5 7.5');
      ok.setAttribute('class', 'usa-mbtn-icon usa-mbtn-ok');
      const bad = icon('M7 7l10 10M17 7L7 17');
      bad.setAttribute('class', 'usa-mbtn-icon usa-mbtn-bad');
      const live = make('span', 'usa-kit-sr');
      live.setAttribute('aria-live', 'polite');
      btn.append(spin, ok, bad, text);
      this.append(btn, live);
      const handle: MicroHandle = micro(btn, this.str('fx', 'press hover focus'), { feel: this.str('feel') || undefined, haptics: this.flag('haptics') });

      let idleWidth = 0;
      // back at the idle width: hand the width back to CSS
      const release = () => {
        if (this._state !== 'loading' && idleWidth && Math.abs(group.get('w') - idleWidth) < 0.5) {
          btn.style.width = '';
          group.jump({ w: 0 });
          idleWidth = 0;
        }
      };
      const group = hostSprings(this, { w: 0, k: 0 }, (v) => {
        if (v.w > 0 && idleWidth) btn.style.width = `${Math.round(v.w * 10) / 10}px`;
        const k = Math.max(0, v.k);
        ok.style.transform = bad.style.transform = `scale(${Math.round(k * 1000) / 1000})`;
      }, { onRest: () => release() });
      let timer: ReturnType<typeof setTimeout> | undefined;
      const labels: Record<MicroButtonState, string> = {
        idle: this.str('label', 'Submit'),
        loading: this.str('loading-label', 'Working…'),
        success: this.str('success-label', 'Done'),
        error: this.str('error-label', 'Try again'),
      };
      const go = (s: MicroButtonState, first = false) => {
        clearTimeout(timer);
        const was = this._state;
        this._state = s;
        btn.dataset.state = s;
        btn.setAttribute('aria-busy', String(s === 'loading'));
        btn.setAttribute('aria-disabled', String(s === 'loading'));
        text.textContent = s === 'loading' ? labels.idle : labels[s];
        if (!first && s !== was) live.textContent = labels[s];
        const h = btn.getBoundingClientRect().height;
        if (s === 'loading') {
          if (!idleWidth) idleWidth = btn.getBoundingClientRect().width;
          if (idleWidth && h) {
            group.jump({ w: group.get('w') || idleWidth });
            group.set({ w: h }, { spring: first ? 'instant' : 'snappy' });
          }
          group.set({ k: 0 }, { spring: 'instant' });
        } else {
          if (idleWidth && group.get('w')) {
            group.set({ w: idleWidth }, { spring: 'settle' });
            if (!group.animating) release();
          }
          if (s === 'success') {
            group.jump({ k: 0 });
            group.set({ k: 1 }, { spring: 'pop' });
            if (!first) {
              handle.feedback('pop');
              tick(this, 12);
            }
          } else if (s === 'error') {
            group.jump({ k: 0 });
            group.set({ k: 1 }, { spring: 'pop' });
            if (!first) {
              handle.feedback('shake');
              tick(this, [10, 50, 10]);
            }
          } else group.set({ k: 0 }, { spring: 'smooth' });
          if (s !== 'idle') {
            const reset = this.num('reset', 1800);
            if (reset > 0) timer = setTimeout(() => go('idle'), reset);
          }
        }
        if (!first && s !== was) this.emit('state', { state: s });
      };
      go(this._state, true);
      this._go = (s) => go(s);
      this.listen(btn, 'click', () => {
        if (this._state !== 'idle' || btn.disabled) return;
        this.emit('action', { run: (task: Promise<unknown> | (() => unknown)) => this.run(task) });
      });
      this.onCleanup(() => {
        clearTimeout(timer);
        group.stop();
        handle.destroy();
        btn.remove();
        live.remove();
        this._go = null;
      });
    }
  }, { id: 'micro-kit-16', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
