import { defineElement, configureComponents, getMotionIntensity, withoutDeprecations, deprecate, type MotionIntensity, type UsaElement } from '../base';
import css from './motion-switch.css?raw';

const LEVELS: MotionIntensity[] = ['off', 'low', 'normal', 'high'];
const KEY = 'usa:motion';
let fromSwitch = false;

/**
 * Set the global motion intensity for every `<usa-*>` component:
 * `'off'` (like reduced motion), `'low'`, `'normal'` (default), `'high'`.
 * Sets `--usa-motion` and `data-usa-motion` on `<html>`; with `persist`
 * the choice is remembered (localStorage) and restored by `restoreMotionIntensity()`.
 */
export function setMotionIntensity(level: MotionIntensity, persist = false): void {
  if (!LEVELS.includes(level)) return;
  if (level === 'off' && !fromSwitch)
    deprecate('set-intensity-off', "setMotionIntensity('off') is deprecated and will be removed in 5.0 — use setMotionSensitivity('minimal') from use-scroll-animate/components/a11y.");
  withoutDeprecations(() => configureComponents({ motionIntensity: level }));
  if (persist) {
    try {
      localStorage.setItem(KEY, level);
    } catch {
      /* private mode */
    }
  }
  if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('usa:motion', { detail: { level } }));
}

/** Re-apply a persisted intensity (call early on page load). Returns it. */
export function restoreMotionIntensity(): MotionIntensity {
  try {
    const v = localStorage.getItem(KEY) as MotionIntensity | null;
    if (v && LEVELS.includes(v)) {
      fromSwitch = true;
      setMotionIntensity(v);
    }
  } catch {
    /* ignore */
  }
  fromSwitch = false;
  return getMotionIntensity();
}

/**
 * `<usa-motion-switch>` — a segmented control letting users choose the
 * app's motion intensity (Off · Low · Normal · High), persisted.
 * `role="radiogroup"`; arrow keys move. Attributes: `labels` (comma list),
 * `label` ("Motion"). Events: `usa:change` (`{ level }`).
 */
export interface UsaMotionSwitchElement extends UsaElement {
  value: MotionIntensity;
}

export function defineMotionSwitch(tag = 'usa-motion-switch'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaMotionSwitch extends Base {
        get value(): MotionIntensity {
          return getMotionIntensity();
        }
        set value(v: MotionIntensity) {
          fromSwitch = true;
          setMotionIntensity(v, true);
          fromSwitch = false;
          this.sync();
        }
        mount(): void {
          restoreMotionIntensity();
          const labels = this.str('labels', 'Off,Low,Normal,High').split(',');
          this.setAttribute('role', 'radiogroup');
          this.setAttribute('aria-label', this.str('label', 'Motion'));
          this.innerHTML = LEVELS.map((l, i) => `<button type="button" role="radio" data-level="${l}">${labels[i] || l}</button><span hidden></span>`.replace('<span hidden></span>', '')).join('') + '<span class="usa-motion-thumb" aria-hidden="true"></span>';
          this.listen(this, 'click', (e: MouseEvent) => {
            const b = (e.target as Element).closest?.('[data-level]') as HTMLElement | null;
            if (b) this.pick(b.dataset.level as MotionIntensity);
          });
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const i = LEVELS.indexOf(this.value);
            const n = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null;
            if (n === null) return;
            e.preventDefault();
            this.pick(LEVELS[(n + LEVELS.length) % LEVELS.length]);
            (this.querySelector('[aria-checked="true"]') as HTMLElement)?.focus();
          });
          this.listen(document, 'usa:motion', () => this.sync());
          this.sync();
        }
        private pick(l: MotionIntensity): void {
          this.value = l;
          this.emit('change', { level: l });
        }
        private sync(): void {
          const v = this.value;
          const i = LEVELS.indexOf(v);
          this.style.setProperty('--usa-motion-i', String(i));
          this.querySelectorAll<HTMLElement>('[data-level]').forEach((b) => {
            const on = b.dataset.level === v;
            b.setAttribute('aria-checked', String(on));
            b.tabIndex = on ? 0 : -1;
          });
        }
      },
    { id: 'motion-switch', text: css }
  );
}
