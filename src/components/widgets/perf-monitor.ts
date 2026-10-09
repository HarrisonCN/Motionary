import { defineElement, activeAnimations, schedulerStats, getClock, type UsaElement } from '../base';
import { fpsMeter } from '../fx2/perf3';
import css from './perf-monitor.css?raw';

/**
 * `<usa-perf-monitor>` (9.6) — a live performance overlay for motion work:
 * FPS with a sparkline, active Motionary animations, frame-loop callbacks,
 * long tasks (PerformanceObserver) and the shared clock state. `corner`
 * (top-right default · top-left · bottom-right · bottom-left · `inline`),
 * `collapsed`; click the header to collapse. `stats` property;
 * `usa:jank` { fps } when FPS drops under `warn` (45). A labelled `status`
 * region updated about twice a second.
 */
export interface PerfStats {
  fps: number;
  animations: number;
  loops: number;
  longTasks: number;
  clock: string;
}
export interface UsaPerfMonitorElement extends UsaElement {
  readonly stats: PerfStats;
}

export function definePerfMonitor(tag = 'usa-perf-monitor'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaPerfMonitor extends Base {
        static get observedAttributes(): string[] {
          return ['corner', 'warn'];
        }
        private _s: PerfStats = { fps: 0, animations: 0, loops: 0, longTasks: 0, clock: 'running' };
        get stats(): PerfStats {
          return { ...this._s };
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const corner = ['top-left', 'bottom-right', 'bottom-left', 'inline'].includes(this.str('corner')) ? this.str('corner') : 'top-right';
          this.setAttribute('data-corner', corner);
          this.setAttribute('role', 'status');
          this.setAttribute('aria-label', 'Performance monitor');
          this.insertAdjacentHTML(
            'beforeend',
            `<button type="button" class="usa-pm-head" aria-expanded="${!this.hasAttribute('collapsed')}" data-usa-part><b class="usa-pm-fps">–</b> fps</button><div class="usa-pm-body" data-usa-part><svg class="usa-pm-spark" viewBox="0 0 60 20" preserveAspectRatio="none" aria-hidden="true"><polyline points=""/></svg><dl><dt>Animations</dt><dd data-k="animations">0</dd><dt>Loops</dt><dd data-k="loops">0</dd><dt>Long tasks</dt><dd data-k="longTasks">0</dd><dt>Clock</dt><dd data-k="clock">running</dd></dl></div>`
          );
          const head = this.querySelector('.usa-pm-head') as HTMLButtonElement;
          this.listen(head, 'click', () => {
            const open = head.getAttribute('aria-expanded') !== 'true';
            head.setAttribute('aria-expanded', String(open));
            this.toggleAttribute('collapsed', !open);
          });
          const meter = fpsMeter(40);
          this.onCleanup(() => meter.stop());
          let longTasks = 0;
          if (typeof PerformanceObserver !== 'undefined')
            try {
              const po = new PerformanceObserver((l) => (longTasks += l.getEntries().length));
              po.observe({ type: 'longtask', buffered: true } as PerformanceObserverInit);
              this.onCleanup(() => po.disconnect());
            } catch {
              /* longtask not supported */
            }
          const hist: number[] = [];
          let jank = false;
          const tick = () => {
            const c = getClock();
            this._s = { fps: meter.fps, animations: activeAnimations(), loops: schedulerStats().loops, longTasks, clock: c.paused ? 'paused' : c.rate === 1 ? 'running' : `${c.rate}×` };
            hist.push(this._s.fps);
            if (hist.length > 30) hist.shift();
            (this.querySelector('.usa-pm-fps') as HTMLElement).textContent = this._s.fps ? String(this._s.fps) : '–';
            for (const k of ['animations', 'loops', 'longTasks', 'clock'] as const) {
              const d = this.querySelector(`[data-k=${k}]`);
              if (d) d.textContent = String(this._s[k]);
            }
            const max = 70;
            this.querySelector('.usa-pm-spark polyline')?.setAttribute('points', hist.map((v, i) => `${(i / 29) * 60},${20 - (Math.min(v, max) / max) * 20}`).join(' '));
            const low = this._s.fps > 0 && this._s.fps < this.num('warn', 45);
            this.setFlag('data-jank', low);
            if (low && !jank) this.emit('jank', { fps: this._s.fps });
            jank = low;
          };
          const id = setInterval(tick, 500);
          this.onCleanup(() => clearInterval(id));
          tick();
        }
      }
      return UsaPerfMonitor as unknown as CustomElementConstructor;
    },
    { id: 'perf-monitor', text: css }
  );
}
