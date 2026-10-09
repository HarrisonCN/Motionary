import { defineElement, type UsaElement } from '../base';
import { applyMotionPreferences, loadMotionPreferences, type MotionPreferences } from '../fx2/safemotion';
import css from './motion-prefs.css?raw';

/**
 * `<usa-motion-prefs>` (9.5) — a motion preference panel for your users:
 * motion level (Full · Gentle · Minimal · None — Motionary's sensitivity
 * levels), animation speed (the shared clock rate, 0.25–2×), "pause
 * autoplaying video" and "no parallax". Changes apply instantly to every
 * Motionary component on the page, persist in localStorage and are shown
 * as `data-usa-*` attributes on `<html>`; a live sample shows the result.
 * `prefs`, `reset()`; `usa:change` { prefs }. A labelled `form` of real
 * radio buttons, slider and checkboxes.
 */
export interface UsaMotionPrefsElement extends UsaElement {
  readonly prefs: MotionPreferences;
  reset(): void;
}
const LEVELS: [MotionPreferences['sensitivity'], string, string][] = [
  ['full', 'Full', 'All motion'],
  ['gentle', 'Gentle', 'Smaller, softer moves'],
  ['minimal', 'Minimal', 'Fades only'],
  ['static', 'None', 'No animation'],
];

export function defineMotionPrefs(tag = 'usa-motion-prefs'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMotionPrefs extends Base {
        static get observedAttributes(): string[] {
          return ['label'];
        }
        private _p: MotionPreferences = loadMotionPreferences();
        get prefs(): MotionPreferences {
          return { ...this._p };
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this._p = loadMotionPreferences();
          const id = `usa-mp-${Math.random().toString(36).slice(2, 7)}`;
          const p = this._p;
          this.insertAdjacentHTML(
            'beforeend',
            `<form class="usa-mp" aria-label="${(this.str('label', 'Motion preferences')).replace(/"/g, '&quot;')}" data-usa-part><fieldset><legend>Motion</legend>${LEVELS.map(([v, l, d]) => `<label class="usa-mp-level"><input type="radio" name="${id}" value="${v}"${p.sensitivity === v ? ' checked' : ''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</fieldset><label class="usa-mp-row">Speed <input type="range" min="0.25" max="2" step="0.25" value="${p.speed}" data-k="speed"><output>${p.speed}×</output></label><label class="usa-mp-row"><input type="checkbox" data-k="pauseAutoplay"${p.pauseAutoplay ? ' checked' : ''}> Pause autoplaying video</label><label class="usa-mp-row"><input type="checkbox" data-k="noParallax"${p.noParallax ? ' checked' : ''}> No parallax</label><div class="usa-mp-sample" aria-hidden="true"><i></i></div><button type="button" class="usa-mp-reset">Reset</button></form>`
          );
          const form = this.querySelector('form') as HTMLFormElement;
          this.listen(form, 'submit', (e: Event) => e.preventDefault());
          const read = () => {
            const lv = (form.querySelector(`input[name="${id}"]:checked`) as HTMLInputElement | null)?.value as MotionPreferences['sensitivity'];
            const sp = Number((form.querySelector('[data-k=speed]') as HTMLInputElement).value);
            (form.querySelector('output') as HTMLOutputElement).textContent = `${sp}×`;
            this.set({ sensitivity: lv || 'full', speed: sp, pauseAutoplay: (form.querySelector('[data-k=pauseAutoplay]') as HTMLInputElement).checked, noParallax: (form.querySelector('[data-k=noParallax]') as HTMLInputElement).checked });
          };
          this.listen(form, 'change', read);
          this.listen(form, 'input', read);
          this.listen(this.querySelector('.usa-mp-reset') as Element, 'click', () => this.reset());
          this.sample();
        }
        private set(p: MotionPreferences): void {
          this._p = applyMotionPreferences(p);
          this.sample();
          this.emit('change', { prefs: this.prefs });
        }
        private sample(): void {
          const dot = this.querySelector<HTMLElement>('.usa-mp-sample i');
          if (!dot) return;
          dot.getAnimations?.().forEach((a) => a.cancel());
          const lv = this._p.sensitivity;
          if (lv === 'static' || this.reduced) return;
          const kf: Keyframe[] = lv === 'minimal' ? [{ opacity: 0.3 }, { opacity: 1 }, { opacity: 0.3 }] : [{ transform: 'translateX(0)' }, { transform: `translateX(${lv === 'gentle' ? 40 : 120}px)` }, { transform: 'translateX(0)' }];
          dot.animate?.(kf, { duration: 1600 / this._p.speed, iterations: Infinity, easing: 'ease-in-out' });
        }
        reset(): void {
          this._p = applyMotionPreferences({});
          this.changed('reset');
          this.emit('change', { prefs: this.prefs });
        }
      }
      return UsaMotionPrefs as unknown as CustomElementConstructor;
    },
    { id: 'motion-prefs', text: css }
  );
}
