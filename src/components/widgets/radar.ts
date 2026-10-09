import { defineElement, type UsaElement } from '../base';
import css from './radar.css?raw';

/**
 * `<usa-radar targets="A:40,0.6; B:200,0.3">` (8.4) — a sci-fi radar scope:
 * a conic sweep turns round (`speed` seconds per turn) and each target
 * (`name:bearing°,distance 0–1`) lights up and fades as the beam passes
 * over it. `rings` (default 4), `label`; `setTargets()`, `targets`;
 * `usa:ping` { name } as a target is swept. An `img` with a text summary of
 * the targets; the sweep runs only on screen, reduced motion shows a still
 * scope with all targets lit.
 */
export interface RadarTarget {
  name: string;
  bearing: number;
  distance: number;
}
export interface UsaRadarElement extends UsaElement {
  targets: RadarTarget[];
  setTargets(list: RadarTarget[]): void;
}

/** "A:40,0.6; B:200,0.3" → targets (bearing normalised to 0–360, distance clamped 0–1) (8.4). */
export function parseTargets(s: string): RadarTarget[] {
  return s
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^(.*?):\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)$/);
      if (!m) return null;
      return { name: m[1].trim(), bearing: ((Number(m[2]) % 360) + 360) % 360, distance: Math.min(1, Math.max(0, Number(m[3]))) };
    })
    .filter(Boolean) as RadarTarget[];
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineRadar(tag = 'usa-radar'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaRadar extends Base {
        static get observedAttributes(): string[] {
          return ['targets', 'rings', 'speed', 'label'];
        }
        private _t: RadarTarget[] | null = null;
        private _timers: ReturnType<typeof setTimeout>[] = [];
        get targets(): RadarTarget[] {
          return (this._t || parseTargets(this.str('targets'))).map((t) => ({ ...t }));
        }
        set targets(v: RadarTarget[]) {
          this.setTargets(v);
        }
        setTargets(list: RadarTarget[]): void {
          this._t = list.map((t) => ({ name: String(t.name), bearing: ((Number(t.bearing) % 360) + 360) % 360, distance: Math.min(1, Math.max(0, Number(t.distance))) }));
          if (this.isConnected) this.changed('targets');
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const ts = this.targets;
          const rings = Math.max(1, Math.min(8, Math.round(this.num('rings', 4))));
          this.setAttribute('role', 'img');
          this.setAttribute('aria-label', `${this.str('label', 'Radar')}: ${ts.length ? ts.map((t) => `${t.name} at ${Math.round(t.bearing)}°`).join(', ') : 'no targets'}`);
          const ringHtml = Array.from({ length: rings }, (_, i) => `<i class="usa-rd-ring" style="--r:${((i + 1) / rings) * 100}%"></i>`).join('');
          const dots = ts
            .map((t, i) => {
              const a = ((t.bearing - 90) * Math.PI) / 180;
              const x = 50 + Math.cos(a) * t.distance * 48;
              const y = 50 + Math.sin(a) * t.distance * 48;
              return `<span class="usa-rd-dot" data-i="${i}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%"><em>${esc(t.name)}</em></span>`;
            })
            .join('');
          this.insertAdjacentHTML('beforeend', `<div class="usa-rd" aria-hidden="true" data-usa-part>${ringHtml}<i class="usa-rd-cross"></i><i class="usa-rd-sweep"></i>${dots}</div>`);
          const period = Math.max(1, this.num('speed', 4)) * 1000;
          (this.querySelector('.usa-rd') as HTMLElement).style.setProperty('--usa-rd-period', `${period}ms`);
          if (this.reduced) {
            this.querySelectorAll('.usa-rd-dot').forEach((d) => d.setAttribute('data-lit', ''));
            return;
          }
          this.inView((v) => {
            this.setFlag('data-live', v);
            this._timers.forEach(clearTimeout);
            this._timers = [];
            if (!v) return;
            const start = performance.now();
            const ping = (t: RadarTarget, i: number) => {
              const d = this.querySelector(`.usa-rd-dot[data-i="${i}"]`);
              if (!d || !this.isConnected) return;
              this.motion(d, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1.5)' }, { opacity: 0.15, transform: 'translate(-50%,-50%) scale(1)' }], { duration: period * 0.85, easing: 'ease-out', fill: 'forwards' });
              this.emit('ping', { name: t.name });
              this._timers.push(setTimeout(() => ping(t, i), period));
            };
            ts.forEach((t, i) => {
              const elapsed = (performance.now() - start) % period;
              const at = ((t.bearing / 360) * period - elapsed + period) % period;
              this._timers.push(setTimeout(() => ping(t, i), at));
            });
          });
          this.onCleanup(() => this._timers.forEach(clearTimeout));
        }
      }
      return UsaRadar as unknown as CustomElementConstructor;
    },
    { id: 'radar', text: css }
  );
}
