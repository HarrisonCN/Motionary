import { defineElement, getClock, setClock, onClockChange, type UsaElement } from '../base';
import css from './clock-control.css?raw';

/**
 * `<usa-clock-control>` (8.0) — a small control bar for the unified motion
 * clock: play / pause every Motionary animation on the page and switch the
 * speed (`speeds="0.25,0.5,1,2"`). It reflects changes made elsewhere
 * (`motionClock.rate = …`). Handy for demos, debugging and as a user-facing
 * "pause animations" control. A labelled `group` with a toggle button
 * (`aria-pressed`) and a radio group of speeds; `usa:change` { rate, paused }.
 */
export interface UsaClockControlElement extends UsaElement {
  readonly rate: number;
  readonly paused: boolean;
}

export function defineClockControl(tag = 'usa-clock-control'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaClockControl extends Base {
        static get observedAttributes(): string[] {
          return ['speeds', 'label'];
        }
        get rate(): number {
          return getClock().rate;
        }
        get paused(): boolean {
          return getClock().paused;
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const speeds = this.str('speeds', '0.25,0.5,1,2')
            .split(',')
            .map(Number)
            .filter((n) => Number.isFinite(n) && n > 0)
            .slice(0, 6);
          const label = this.str('label', 'Motion clock').replace(/"/g, '&quot;');
          this.insertAdjacentHTML(
            'beforeend',
            `<div class="usa-clk" role="group" aria-label="${label}" data-usa-part><button type="button" class="usa-clk-play" aria-pressed="false" aria-label="Pause animations"><svg viewBox="0 0 24 24" aria-hidden="true"><rect class="usa-clk-bar" x="6" y="5" width="4" height="14" rx="1"/><rect class="usa-clk-bar" x="14" y="5" width="4" height="14" rx="1"/><path class="usa-clk-tri" d="M7 5l12 7-12 7z"/></svg></button><div class="usa-clk-speeds" role="radiogroup" aria-label="Speed"><span class="usa-clk-ink" aria-hidden="true"></span>${speeds.map((s) => `<button type="button" role="radio" class="usa-clk-speed" data-rate="${s}" aria-checked="false">${s}×</button>`).join('')}</div></div>`
          );
          this.listen(this.querySelector('.usa-clk-play') as Element, 'click', () => {
            setClock({ paused: !getClock().paused });
          });
          this.querySelectorAll<HTMLElement>('.usa-clk-speed').forEach((b) => this.listen(b, 'click', () => setClock({ rate: Number(b.dataset.rate) })));
          this.onCleanup(onClockChange(() => this.sync(true)));
          this.sync(false);
        }
        private sync(user: boolean): void {
          const { rate, paused } = getClock();
          const play = this.querySelector('.usa-clk-play');
          if (!play) return;
          play.setAttribute('aria-pressed', String(paused));
          play.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
          this.setFlag('data-paused', paused);
          let on: HTMLElement | null = null;
          this.querySelectorAll<HTMLElement>('.usa-clk-speed').forEach((b) => {
            const hit = Math.abs(Number(b.dataset.rate) - rate) < 1e-6;
            b.setAttribute('aria-checked', String(hit));
            if (hit) on = b;
          });
          const ink = this.querySelector('.usa-clk-ink') as HTMLElement;
          const target = on as HTMLElement | null;
          if (target) {
            ink.style.opacity = '1';
            ink.style.width = `${target.offsetWidth}px`;
            ink.style.transform = `translateX(${target.offsetLeft}px)`;
          } else ink.style.opacity = '0';
          if (user) this.emit('change', { rate, paused });
        }
      }
      return UsaClockControl as unknown as CustomElementConstructor;
    },
    { id: 'clock-control', text: css }
  );
}
