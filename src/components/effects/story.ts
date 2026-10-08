/**
 * 5.4 — `<usa-story template="…">` scroll-storytelling templates.
 *
 * - `pin` — a sticky `[data-stage]` while `[data-step]` sections scroll past; the
 *   step in view gets `data-active`, the stage gets `data-active-step="<index>"`.
 * - `gallery` — a horizontal `[data-track]` slides sideways as you scroll down.
 * - `zoom` — the `[data-stage]` zooms toward the viewer (`zoom="6"`) and fades.
 * - `compare` — before / after (`[data-before]`, `[data-after]`) wipe driven by
 *   scroll, plus a draggable, keyboard-accessible handle (`role="slider"`).
 * - `counter` — `[data-count="1234"]` numbers count up when they enter view.
 * - `highlight` — paragraphs dim except the one crossing the viewport center.
 *
 * Every template sets `--usa-story-progress` (0–1) on the host and dispatches
 * `usa-story-step` (`detail: { index }`). Reduced motion: no sliding / zooming
 * (the gallery stacks vertically), counters show final values, the rest is
 * class changes only.
 */
import { defineElement, type UsaElement } from '../base';

export const STORY_TEMPLATES = ['pin', 'gallery', 'zoom', 'compare', 'counter', 'highlight'] as const;
export type StoryTemplate = (typeof STORY_TEMPLATES)[number];

export interface UsaStoryElement extends UsaElement {
  /** Scroll progress through the story, 0–1. */
  readonly progress: number;
  /** Index of the active step (pin / highlight), or -1. */
  readonly step: number;
}

const CSS = `usa-story{display:block;position:relative}
usa-story[template=pin] [data-stage],usa-story[template=gallery] [data-sticky],usa-story[template=zoom] [data-stage],usa-story[template=compare] [data-sticky]{position:sticky;top:0}
usa-story[template=pin] [data-stage]{align-self:start}
usa-story[template=pin] [data-step]{min-height:80vh;opacity:.35;transition:opacity .3s}
usa-story[template=pin] [data-step][data-active]{opacity:1}
usa-story[template=gallery] [data-sticky]{height:100vh;overflow:hidden;display:flex;align-items:center}
usa-story[template=gallery] [data-track]{display:flex;gap:24px;will-change:transform}
usa-story[template=gallery][data-static] [data-sticky]{position:static;height:auto;overflow:visible}
usa-story[template=gallery][data-static] [data-track]{flex-direction:column;transform:none!important}
usa-story[template=zoom] [data-stage]{height:100vh;overflow:hidden;display:grid;place-items:center}
usa-story[template=compare] [data-sticky]{height:var(--usa-story-h,70vh);overflow:hidden}
usa-story[template=compare] [data-before],usa-story[template=compare] [data-after]{position:absolute;inset:0}
usa-story[template=compare] [data-after]{clip-path:inset(0 0 0 var(--usa-split,50%))}
usa-story [data-handle]{position:absolute;top:0;bottom:0;left:var(--usa-split,50%);width:4px;margin-left:-2px;background:#fff;box-shadow:0 0 0 1px #0003;cursor:ew-resize;touch-action:none}
usa-story [data-handle]:focus-visible{outline:3px solid #7c5cff;outline-offset:2px}
usa-story[template=highlight] p,usa-story[template=highlight] [data-step]{opacity:.3;transition:opacity .25s}
usa-story[template=highlight] [data-active]{opacity:1}`;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Progress of `el` through the viewport: 0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom. */
export function storyProgress(el: Element, vh = typeof innerHeight === 'number' ? innerHeight : 800): number {
  const r = el.getBoundingClientRect();
  const span = r.height - vh;
  return span > 0 ? clamp(-r.top / span) : clamp((vh - r.top) / (vh + r.height));
}

/** Format a counted value like the target (`1,234`, `12.5`, prefix / suffix kept). */
export function formatCount(target: string, t: number): string {
  const m = target.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
  if (!m) return target;
  const [, pre, num, post] = m;
  const n = parseFloat(num.replace(/,/g, ''));
  const dec = (num.split('.')[1] || '').length;
  let s = (n * t).toFixed(dec);
  if (num.includes(',')) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return pre + s + post;
}

export function defineStory(tag = 'usa-story'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaStory extends Base {
        static get observedAttributes(): string[] {
          return ['template', 'zoom'];
        }
        progress = 0;
        step = -1;
        private frame = 0;
        get template(): StoryTemplate {
          const t = this.str('template', 'pin') as StoryTemplate;
          return STORY_TEMPLATES.includes(t) ? t : 'pin';
        }
        private steps(): HTMLElement[] {
          const own = Array.from(this.querySelectorAll<HTMLElement>('[data-step]:not([data-stage])'));
          return own.length || this.template !== 'highlight' ? own : Array.from(this.querySelectorAll<HTMLElement>('p'));
        }
        private setStep(i: number): void {
          if (i === this.step) return;
          this.step = i;
          this.steps().forEach((s, k) => s.toggleAttribute('data-active', k === i));
          const stage = this.querySelector<HTMLElement>('[data-stage]');
          if (stage) stage.dataset.activeStep = String(i);
          this.dispatchEvent(new CustomEvent('usa-story-step', { detail: { index: i }, bubbles: true }));
        }
        /** Recompute from the current scroll position (called on scroll / resize). */
        update(): void {
          this.frame = 0;
          const p = (this.progress = storyProgress(this));
          this.style.setProperty('--usa-story-progress', p.toFixed(4));
          const t = this.template;
          const vh = innerHeight || 800;
          if (t === 'pin' || t === 'highlight') {
            const mid = vh / 2;
            let best = -1;
            let bestD = Infinity;
            this.steps().forEach((s, i) => {
              const r = s.getBoundingClientRect();
              const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
              if (d < bestD) (bestD = d), (best = i);
            });
            this.setStep(best);
          } else if (t === 'gallery' && !this.reduced) {
            const track = this.querySelector<HTMLElement>('[data-track]');
            const box = this.querySelector<HTMLElement>('[data-sticky]');
            if (track && box) track.style.transform = `translateX(${(-p * Math.max(0, track.scrollWidth - box.clientWidth)).toFixed(1)}px)`;
          } else if (t === 'zoom' && !this.reduced) {
            const inner = this.querySelector<HTMLElement>('[data-stage] > *');
            if (inner) {
              inner.style.transform = `scale(${(1 + p * (this.num('zoom', 6) - 1)).toFixed(3)})`;
              inner.style.opacity = String(clamp(1.4 - p * 1.4).toFixed(3));
            }
          } else if (t === 'compare' && !this.hasAttribute('data-dragged')) {
            this.setSplit(p * 100);
          } else if (t === 'counter') {
            this.querySelectorAll<HTMLElement>('[data-count]:not([data-counted])').forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.top < vh * 0.9 && r.bottom > 0) this.count(el);
            });
          }
        }
        private setSplit(pct: number): void {
          const v = clamp(pct, 0, 100);
          this.style.setProperty('--usa-split', `${v.toFixed(2)}%`);
          const h = this.querySelector<HTMLElement>('[data-handle]');
          if (h) h.setAttribute('aria-valuenow', String(Math.round(v)));
        }
        private count(el: HTMLElement): void {
          el.dataset.counted = '';
          const target = el.dataset.count || el.textContent || '0';
          el.setAttribute('aria-label', target);
          if (this.reduced) {
            el.textContent = target;
            return;
          }
          const dur = Number(el.dataset.duration) || 1600;
          const t0 = performance.now();
          const tick = (now: number) => {
            const k = clamp((now - t0) / dur);
            el.textContent = formatCount(target, 1 - (1 - k) ** 3);
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
        mount(): void {
          this.toggleAttribute('data-static', this.reduced);
          if (this.template === 'compare') this.mountCompare();
          const kick = () => {
            if (!this.frame) this.frame = requestAnimationFrame(() => this.update());
          };
          this.listen(window, 'scroll', kick, { passive: true });
          this.listen(window, 'resize', kick);
          this.onCleanup(() => cancelAnimationFrame(this.frame));
          this.update();
        }
        private mountCompare(): void {
          const box = this.querySelector<HTMLElement>('[data-sticky]') || this;
          let h = this.querySelector<HTMLElement>('[data-handle]');
          if (!h) {
            h = document.createElement('div');
            h.setAttribute('data-handle', '');
            box.appendChild(h);
            this.onCleanup(() => h!.remove());
          }
          h.tabIndex = 0;
          h.setAttribute('role', 'slider');
          h.setAttribute('aria-label', this.str('label', 'Before / after'));
          h.setAttribute('aria-valuemin', '0');
          h.setAttribute('aria-valuemax', '100');
          const at = (e: PointerEvent) => {
            const r = box.getBoundingClientRect();
            this.dataset.dragged = '';
            this.setSplit(((e.clientX - r.left) / (r.width || 1)) * 100);
          };
          let drag = false;
          this.listen(h, 'pointerdown', (e: PointerEvent) => {
            drag = true;
            h!.setPointerCapture?.(e.pointerId);
          });
          this.listen(h, 'pointermove', (e: PointerEvent) => drag && at(e));
          this.listen(h, 'pointerup', () => (drag = false));
          this.listen(h, 'keydown', (e: KeyboardEvent) => {
            const cur = parseFloat(h!.getAttribute('aria-valuenow') || '50');
            const step = e.shiftKey ? 10 : 2;
            const next = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? cur - step : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? cur + step : e.key === 'Home' ? 0 : e.key === 'End' ? 100 : null;
            if (next == null) return;
            e.preventDefault();
            this.dataset.dragged = '';
            this.setSplit(next);
          });
          this.setSplit(50);
        }
        unmount(): void {
          this.step = -1;
          delete this.dataset.dragged;
        }
      },
    { id: 'usa-story', text: CSS }
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-story': UsaStoryElement;
  }
}
