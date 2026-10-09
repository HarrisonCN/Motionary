import { defineElement, type UsaElement } from '../base';
import css from './hud-panel.css?raw';

/**
 * `<usa-hud-panel title="SYSTEM">` (8.4) — a sci-fi HUD panel: angled
 * corners, a glowing frame that draws itself in when the panel scrolls into
 * view, a header with a blinking status light and `status` text, and its
 * own content below. Child `<meter>`-like rows `<p data-value="72">Shields</p>`
 * become animated bar readouts. `color`, `status`; `boot()` replays the
 * intro; `usa:boot`. A labelled `region`; reduced motion: shown at once.
 */
export interface UsaHudPanelElement extends UsaElement {
  boot(): void;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineHudPanel(tag = 'usa-hud-panel'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaHudPanel extends Base {
        static get observedAttributes(): string[] {
          return ['title', 'status', 'color'];
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('role', 'region');
          this.setAttribute('aria-label', this.str('title', 'Panel'));
          if (this.hasAttribute('color')) this.style.setProperty('--usa-hud-c', this.str('color'));
          this.insertAdjacentHTML(
            'afterbegin',
            `<svg class="usa-hud-frame" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100" data-usa-part><path pathLength="100" vector-effect="non-scaling-stroke" d="M6 1H94L99 6V94L94 99H6L1 94V6Z"/></svg><header class="usa-hud-head" data-usa-part><span class="usa-hud-dot" aria-hidden="true"></span><span class="usa-hud-title">${esc(this.str('title', 'SYSTEM'))}</span><span class="usa-hud-status">${esc(this.str('status', 'ONLINE'))}</span></header>`
          );
          this.querySelectorAll<HTMLElement>(':scope > [data-value]').forEach((r) => {
            if (r.querySelector('.usa-hud-bar')) return;
            const v = Math.min(100, Math.max(0, Number(r.dataset.value) || 0));
            r.classList.add('usa-hud-row');
            r.insertAdjacentHTML('beforeend', `<span class="usa-hud-bar" aria-hidden="true"><i style="--v:${v}%"></i></span><span class="usa-hud-num">${v}%</span>`);
          });
          let booted = false;
          this.inView((v) => {
            if (v && !booted) {
              booted = true;
              this.boot();
            }
          }, { threshold: 0.3 });
        }
        boot(): void {
          this.setAttribute('data-booted', '');
          if (this.reduced) return void this.emit('boot');
          const frame = this.querySelector('.usa-hud-frame path');
          if (frame) this.motion(frame, [{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }], { duration: 900, easing: 'ease-in-out', fill: 'backwards' });
          this.motion(this.querySelector('.usa-hud-head') as Element, [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: 300, easing: 'steps(4, end)', fill: 'backwards' });
          const rows = Array.from(this.querySelectorAll<HTMLElement>('.usa-hud-bar i'));
          rows.forEach((b, i) => this.motion(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, delay: 500 + i * 120, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
          const last = this.motion(this, [{ filter: 'brightness(1.6)' }, { filter: 'none' }], { duration: 500, delay: 500 + rows.length * 120 });
          if (last) last.finished.then(() => this.emit('boot'), () => undefined);
          else this.emit('boot');
        }
      }
      return UsaHudPanel as unknown as CustomElementConstructor;
    },
    { id: 'hud-panel', text: css }
  );
}
