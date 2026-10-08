import { defineElement, type UsaElement } from '../base';
import css from './weather-card.css?raw';

/**
 * `<usa-weather-card>` (6.8) — an animated weather widget. `condition`
 * (`clear | cloudy | rain | snow | storm | fog | night`) picks an animated
 * icon and sky (sun rays turn, clouds drift, rain and snow fall, a gentle —
 * flash-safe — bolt, fog bands, twinkling stars); `temp` counts up to the
 * value, `unit` (°), `place` and `label` fill the text. Changing `condition`
 * cross-fades the scene. Reduced motion: static icon, no count-up. The scene
 * is decorative; the text is the accessible summary (`role="group"` with an
 * `aria-label` like "Rain, 12°, Lisbon").
 */
export interface UsaWeatherCardElement extends UsaElement {
  condition: string;
}

export const WEATHER_CONDITIONS = ['clear', 'cloudy', 'rain', 'snow', 'storm', 'fog', 'night'] as const;
const LABEL: Record<string, string> = { clear: 'Clear', cloudy: 'Cloudy', rain: 'Rain', snow: 'Snow', storm: 'Thunderstorm', fog: 'Fog', night: 'Clear night' };

const icon = (c: string): string => {
  const drops = (cls: string, n: number) => Array.from({ length: n }, (_, i) => `<i class="${cls}" style="--i:${i}"></i>`).join('');
  switch (c) {
    case 'clear':
      return '<span class="usa-wc-sun"></span>';
    case 'night':
      return `<span class="usa-wc-moon"></span>${drops('usa-wc-star', 5)}`;
    case 'cloudy':
      return '<span class="usa-wc-cloud usa-wc-c2"></span><span class="usa-wc-cloud"></span>';
    case 'rain':
      return `<span class="usa-wc-cloud"></span>${drops('usa-wc-drop', 6)}`;
    case 'snow':
      return `<span class="usa-wc-cloud"></span>${drops('usa-wc-flake', 6)}`;
    case 'storm':
      return `<span class="usa-wc-cloud usa-wc-dark"></span><span class="usa-wc-bolt"></span>${drops('usa-wc-drop', 4)}`;
    default:
      return `${drops('usa-wc-fogband', 3)}`;
  }
};

export function defineWeatherCard(tag = 'usa-weather-card'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaWeatherCard extends Base {
        static get observedAttributes(): string[] {
          return ['condition', 'temp', 'place', 'unit', 'label'];
        }
        get condition(): string {
          return this.dataset.condition || 'clear';
        }
        set condition(v: string) {
          this.setAttribute('condition', v);
        }

        mount(): void {
          const c = this.str('condition', 'clear');
          const cond = (WEATHER_CONDITIONS as readonly string[]).includes(c) ? c : 'clear';
          const changed = this.dataset.condition && this.dataset.condition !== cond;
          this.dataset.condition = cond;
          const temp = this.num('temp', NaN);
          const unit = this.str('unit', '°');
          const label = this.str('label', LABEL[cond]);
          const place = this.str('place', '');
          this.setAttribute('role', 'group');
          this.setAttribute('aria-label', [label, Number.isFinite(temp) ? `${Math.round(temp)}${unit}` : '', place].filter(Boolean).join(', '));
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const scene = document.createElement('div');
          scene.className = 'usa-wc-scene';
          scene.setAttribute('aria-hidden', 'true');
          scene.setAttribute('data-usa-part', '');
          scene.innerHTML = `<span class="usa-wc-icon">${icon(cond)}</span>`;
          const text = document.createElement('div');
          text.className = 'usa-wc-text';
          text.setAttribute('data-usa-part', '');
          text.setAttribute('aria-hidden', 'true');
          text.innerHTML = `<b class="usa-wc-temp">${Number.isFinite(temp) ? Math.round(temp) + unit : ''}</b><span class="usa-wc-label"></span><span class="usa-wc-place"></span>`;
          (text.querySelector('.usa-wc-label') as HTMLElement).textContent = label;
          (text.querySelector('.usa-wc-place') as HTMLElement).textContent = place;
          this.prepend(scene, text);
          if (this.reduced) return;
          if (changed) this.motion(scene, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'ease-out' });
          if (Number.isFinite(temp) && typeof requestAnimationFrame === 'function') {
            const el = text.querySelector('.usa-wc-temp') as HTMLElement;
            const t0 = performance.now();
            const from = Math.round(temp) - Math.min(12, Math.abs(Math.round(temp)) + 6);
            let raf = 0;
            const f = (now: number) => {
              const k = Math.min(1, (now - t0) / 900);
              el.textContent = Math.round(from + (Math.round(temp) - from) * (1 - Math.pow(1 - k, 3))) + unit;
              if (k < 1) raf = requestAnimationFrame(f);
            };
            raf = requestAnimationFrame(f);
            this.onCleanup(() => cancelAnimationFrame(raf));
          }
        }
      }
      return UsaWeatherCard as unknown as CustomElementConstructor;
    },
    { id: 'weather-card', text: css }
  );
}
