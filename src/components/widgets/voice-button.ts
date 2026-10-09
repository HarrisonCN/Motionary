import { defineElement, clamp, type UsaElement } from '../base';
import css from './voice-button.css?raw';

/**
 * `<usa-voice-button>` (7.8) — a push-to-talk mic button: click (or Space /
 * Enter) toggles `listening`; while listening a halo breathes round the
 * button and `bars` (default 5) wave beside it. Feed it the live input level
 * with `level` (0–1, e.g. from an `AnalyserNode` or a speech API) and the
 * bars and halo follow it; without levels they run an idle wave. `usa:start`
 * / `usa:stop`. A real `<button aria-pressed>`; `label`. Reduced motion: no
 * halo or wave — the pressed state shows by colour.
 */
export interface UsaVoiceButtonElement extends UsaElement {
  listening: boolean;
  level: number;
  toggle(force?: boolean): void;
}

/** Bar heights (0–1) for a level and a phase, centre bars tallest (7.8). */
export function waveBars(level: number, n = 5, phase = 0): number[] {
  const l = clamp(level, 0, 1);
  return Array.from({ length: n }, (_, i) => {
    const mid = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2 || 1);
    const wob = 0.5 + 0.5 * Math.sin(phase + i * 1.3);
    return Math.round(clamp(0.15 + l * (0.45 + 0.4 * mid) * (0.6 + 0.4 * wob), 0.1, 1) * 100) / 100;
  });
}

export function defineVoiceButton(tag = 'usa-voice-button'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaVoiceButton extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'bars', 'listening'];
        }
        private _level = -1;
        get listening(): boolean {
          return this.flag('listening');
        }
        set listening(on: boolean) {
          this.setFlag('listening', on);
        }
        get level(): number {
          return Math.max(0, this._level);
        }
        set level(v: number) {
          this._level = clamp(Number(v) || 0, 0, 1);
          this.paint();
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const n = Math.max(3, Math.min(9, Math.round(this.num('bars', 5))));
          this.insertAdjacentHTML(
            'beforeend',
            `<div class="usa-vb" data-usa-part><button type="button" class="usa-vb-btn" aria-pressed="false" aria-label="${this.str('label', 'Voice input').replace(/"/g, '&quot;')}"><span class="usa-vb-halo" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg></button><span class="usa-vb-bars" aria-hidden="true">${'<i></i>'.repeat(n)}</span></div>`
          );
          this.listen(this.querySelector('.usa-vb-btn') as Element, 'click', () => this.toggle());
          this.sync(true);
        }
        changed(name: string): void {
          if (name === 'listening') return this.sync(false);
          super.changed(name);
        }
        toggle(force?: boolean): void {
          this.listening = force ?? !this.listening;
        }
        private sync(first: boolean): void {
          const btn = this.querySelector('.usa-vb-btn');
          if (!btn) return;
          btn.setAttribute('aria-pressed', String(this.listening));
          if (!first) this.emit(this.listening ? 'start' : 'stop');
          if (!this.listening) this._level = -1;
          this.paint();
        }
        private paint(): void {
          const bars = Array.from(this.querySelectorAll<HTMLElement>('.usa-vb-bars i'));
          const live = this.listening && this._level >= 0;
          this.setFlag('data-live', live);
          const hs = waveBars(live ? this._level : 0, bars.length, (typeof performance !== 'undefined' ? performance.now() : 0) / 120);
          bars.forEach((b, i) => (b.style.transform = live ? `scaleY(${hs[i]})` : ''));
          const halo = this.querySelector('.usa-vb-halo') as HTMLElement | null;
          if (halo) halo.style.transform = live ? `scale(${1 + this._level * 0.6})` : '';
        }
      }
      return UsaVoiceButton as unknown as CustomElementConstructor;
    },
    { id: 'voice-button', text: css }
  );
}
