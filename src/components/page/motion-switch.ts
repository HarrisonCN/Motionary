import { defineElement, configureComponents, getMotionIntensity, getMotionSensitivity, type MotionIntensity, type UsaElement } from '../base';
import css from './motion-switch.css?raw';

const INTENSITIES: MotionIntensity[] = ['low', 'normal', 'high'];
/** The switch's levels: Off (motion sensitivity `minimal`) + the three intensities. */
export type MotionSwitchLevel = 'off' | MotionIntensity;
const LEVELS: MotionSwitchLevel[] = ['off', 'low', 'normal', 'high'];
const KEY = 'usa:motion';

/**
 * Set the global motion intensity for every `<usa-*>` component:
 * `'low'`, `'normal'` (default), `'high'`. Sets `--usa-motion` and
 * `data-usa-motion` on `<html>`; with `persist` the choice is remembered
 * (localStorage) and restored by `restoreMotionIntensity()`.
 * 5.0: `'off'` was removed — use `setMotionSensitivity('minimal')`.
 */
export function setMotionIntensity(level: MotionIntensity, persist = false): void {
  if (!INTENSITIES.includes(level)) return;
  configureComponents({ motionIntensity: level });
  store(level, persist);
}

function store(level: MotionSwitchLevel, persist: boolean): void {
  if (persist) {
    try {
      localStorage.setItem(KEY, level);
    } catch {
      /* private mode */
    }
  }
  if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('usa:motion', { detail: { level } }));
}

/** Apply a switch level: `'off'` = motion sensitivity `minimal`, otherwise full motion at that intensity. */
export function setMotionLevel(level: MotionSwitchLevel, persist = false): void {
  if (!LEVELS.includes(level)) return;
  if (level === 'off') configureComponents({ motionSensitivity: 'minimal' });
  else configureComponents({ motionIntensity: level, ...(getMotionSensitivity() === 'minimal' ? { motionSensitivity: 'full' as const } : {}) });
  store(level, persist);
}

/** The current switch level. */
export function getMotionLevel(): MotionSwitchLevel {
  return getMotionSensitivity() === 'minimal' || getMotionSensitivity() === 'static' ? 'off' : getMotionIntensity();
}

/** Re-apply a persisted level (call early on page load). Returns the active intensity. */
export function restoreMotionIntensity(): MotionIntensity {
  try {
    const v = localStorage.getItem(KEY) as MotionSwitchLevel | null;
    if (v && LEVELS.includes(v)) setMotionLevel(v);
  } catch {
    /* ignore */
  }
  return getMotionIntensity();
}

/**
 * `<usa-motion-switch>` — a segmented control letting users choose the
 * app's motion intensity (Off · Low · Normal · High), persisted.
 * `role="radiogroup"`; arrow keys move. Attributes: `labels` (comma list),
 * `label` ("Motion"). Events: `usa:change` (`{ level }`).
 */
export interface UsaMotionSwitchElement extends UsaElement {
  value: MotionSwitchLevel;
}

export function defineMotionSwitch(tag = 'usa-motion-switch'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaMotionSwitch extends Base {
        static get observedAttributes(): string[] {
          return ['labels', 'label'];
        }
        get value(): MotionSwitchLevel {
          return getMotionLevel();
        }
        set value(v: MotionSwitchLevel) {
          setMotionLevel(v, true);
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
            if (b) this.pick(b.dataset.level as MotionSwitchLevel);
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
        private pick(l: MotionSwitchLevel): void {
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
