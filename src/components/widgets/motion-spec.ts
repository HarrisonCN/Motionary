import { defineElement, type UsaElement } from '../base';
import { parseMotion, type MotionRule } from '../dsl/index';
import { easingPoints, motionToCss } from '../design/index';
import css from './motion-spec.css?raw';

/**
 * `<usa-motion-spec rules="enter: fade-up 600ms ease-out stagger 80ms; hover: pop 300ms">`
 * (9.7) — a motion spec sheet for design hand-off: one row per rule with
 * its trigger, effect, a duration / delay bar on a shared time axis and the
 * easing curve drawn from its cubic-bezier, plus a Play button that runs a
 * playhead across the timeline and "Copy CSS" (`motionToCss`). `rules`;
 * `parsed`, `play()`, `css`; `usa:copy`. A labelled `table`.
 */
export interface UsaMotionSpecElement extends UsaElement {
  readonly parsed: MotionRule[];
  readonly css: string;
  play(): void;
}
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineMotionSpec(tag = 'usa-motion-spec'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMotionSpec extends Base {
        static get observedAttributes(): string[] {
          return ['rules', 'label'];
        }
        get parsed(): MotionRule[] {
          return parseMotion(this.str('rules')).rules;
        }
        get css(): string {
          return motionToCss(this.parsed);
        }
        private total(): number {
          return Math.max(400, ...this.parsed.map((r) => (r.delay || 0) + (r.duration ?? 600) + (r.stagger || 0) * 3));
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const rs = this.parsed;
          const T = this.total();
          const curve = (e?: string) => {
            const [a, b, c, d] = easingPoints(e || 'cubic-bezier(0.22, 1, 0.36, 1)');
            return `<svg class="usa-ms-curve" viewBox="0 0 40 40" aria-hidden="true"><path d="M2 38 C${2 + a * 36} ${38 - b * 36} ${2 + c * 36} ${38 - d * 36} 38 2"/></svg>`;
          };
          const rows = rs
            .map((r) => {
              const d = r.duration ?? 600;
              const left = ((r.delay || 0) / T) * 100;
              const w = (d / T) * 100;
              return `<tr><th scope="row"><span class="usa-ms-trig" data-t="${r.trigger}">${r.trigger}</span></th><td><code>${esc(r.effect)}</code></td><td class="usa-ms-time"><span class="usa-ms-bar" style="left:${left.toFixed(1)}%;width:${w.toFixed(1)}%"></span><small>${r.delay ? `${r.delay}ms + ` : ''}${d}ms${r.stagger ? ` · stagger ${r.stagger}ms` : ''}</small></td><td>${curve(r.easing)}<small>${esc(r.easing || 'default')}</small></td></tr>`;
            })
            .join('');
          this.insertAdjacentHTML(
            'beforeend',
            `<div class="usa-ms-bar-top" data-usa-part><b>${esc(this.str('label', 'Motion spec'))}</b><button type="button" class="usa-ms-play">Play</button><button type="button" class="usa-ms-copy">Copy CSS</button></div><table class="usa-ms" aria-label="${esc(this.str('label', 'Motion spec'))}" data-usa-part><thead><tr><th scope="col">Trigger</th><th scope="col">Effect</th><th scope="col">Timing (${T}ms)</th><th scope="col">Easing</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No rules</td></tr>'}</tbody></table><span class="usa-ms-head" aria-hidden="true" data-usa-part></span>`
          );
          this.listen(this.querySelector('.usa-ms-play') as Element, 'click', () => this.play());
          this.listen(this.querySelector('.usa-ms-copy') as Element, 'click', async () => {
            let ok = false;
            try {
              await navigator.clipboard.writeText(this.css);
              ok = true;
            } catch {
              ok = false;
            }
            this.emit('copy', { ok });
          });
        }
        play(): void {
          if (this.reduced) return;
          const T = this.total();
          this.querySelectorAll('.usa-ms-bar').forEach((b) => this.motion(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: Math.min(1600, T), easing: 'linear', fill: 'backwards' }));
          const h = this.querySelector('.usa-ms-head');
          if (h) this.motion(h, [{ left: '0%', opacity: 1 }, { left: '100%', opacity: 1 }], { duration: Math.min(1600, T), easing: 'linear' });
        }
      }
      return UsaMotionSpec as unknown as CustomElementConstructor;
    },
    { id: 'motion-spec', text: css }
  );
}
