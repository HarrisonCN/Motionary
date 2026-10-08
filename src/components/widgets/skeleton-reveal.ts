import { defineElement, type UsaElement } from '../base';
import { part } from './shared';
import css from './skeleton-reveal.css?raw';

/**
 * `<usa-skeleton-reveal loading>` (6.4) — a skeleton generated from the
 * real content: while `loading`, every text line, image and marked block
 * (`[data-skeleton]`) of the children is measured and covered by a
 * placeholder with one synchronized shimmer (`variant="wave | pulse |
 * glow"`). Remove `loading` (or call `reveal()`) and the placeholders
 * dissolve top-to-bottom while the content fades in from a blur.
 *
 * `aria-busy` follows `loading`. Event `usa:reveal`. Reduced motion: no
 * shimmer, a plain crossfade.
 */
export interface UsaSkeletonRevealElement extends UsaElement {
  loading: boolean;
  reveal(): Promise<void>;
}

export const SKELETON_VARIANTS = ['wave', 'pulse', 'glow'] as const;

export function defineSkeletonReveal(tag = 'usa-skeleton-reveal'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSkeletonReveal extends Base {
        static get observedAttributes(): string[] {
          return ['loading', 'variant'];
        }
        private _layer: HTMLElement | null = null;

        get loading(): boolean {
          return this.flag('loading');
        }
        set loading(v: boolean) {
          this.setFlag('loading', v);
        }

        changed(name: string): void {
          if (name === 'loading') {
            if (this.loading) this.build();
            else void this.reveal();
            return;
          }
          super.changed(name);
        }

        mount(): void {
          const v = this.str('variant', 'wave');
          this.dataset.variant = (SKELETON_VARIANTS as readonly string[]).includes(v) ? v : 'wave';
          if (this.loading) this.build();
          if (typeof ResizeObserver === 'function') {
            const ro = new ResizeObserver(() => this.loading && this.build());
            ro.observe(this);
            this.onCleanup(() => ro.disconnect());
          }
          this.onCleanup(() => this._layer?.remove());
        }

        /** Measure the content and lay placeholders over it. */
        private build(): void {
          this.setAttribute('aria-busy', 'true');
          this.setAttribute('data-loading', '');
          this._layer?.remove();
          const layer = part('div', 'usa-sk-layer', { 'aria-hidden': 'true' });
          const host = this.getBoundingClientRect();
          const boxes: [number, number, number, number, boolean][] = [];
          const add = (r: DOMRect | { left: number; top: number; width: number; height: number }, round = false) => {
            if (r.width < 2 || r.height < 2) return;
            boxes.push([r.left - host.left, r.top - host.top, r.width, r.height, round]);
          };
          const marked = Array.from(this.querySelectorAll<HTMLElement>('[data-skeleton], img, svg, video, canvas, button, input'));
          for (const m of marked) if (!m.closest('.usa-sk-layer')) add(m.getBoundingClientRect(), m.dataset.skeleton === 'circle' || getComputedStyle(m).borderRadius === '50%');
          // text: one bar per rendered line (Range client rects), skipping marked elements
          const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!n.textContent?.trim() || (n.parentElement && marked.some((m) => m.contains(n!.parentElement)))) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            const rects = typeof range.getClientRects === 'function' ? Array.from(range.getClientRects()) : [];
            for (const r of rects) add({ left: r.left, top: r.top + r.height * 0.18, width: r.width, height: r.height * 0.64 });
          }
          for (const [x, y, w, h, round] of boxes) {
            const b = document.createElement('span');
            b.className = 'usa-sk-box';
            b.style.cssText = `left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;${round ? 'border-radius:50%' : ''}`;
            b.style.setProperty('--usa-sk-x', `${(-x).toFixed(1)}px`);
            layer.append(b);
          }
          this.append(layer);
          this._layer = layer;
        }

        reveal(): Promise<void> {
          const layer = this._layer;
          this.removeAttribute('aria-busy');
          if (this.hasAttribute('loading')) this.removeAttribute('loading');
          this._layer = null;
          if (!layer) {
            this.removeAttribute('data-loading');
            return Promise.resolve();
          }
          const boxes = Array.from(layer.children) as HTMLElement[];
          const kids = Array.from(this.children).filter((c) => c !== layer) as HTMLElement[];
          this.removeAttribute('data-loading');
          const done: Promise<unknown>[] = [];
          if (this.reduced) {
            const a = this.motion(layer, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
            if (a) done.push(a.finished);
          } else {
            const top = Math.min(...boxes.map((b) => parseFloat(b.style.top) || 0), 0);
            for (const b of boxes) {
              const a = this.motion(b, [{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(1.04)', filter: 'blur(6px)' }], { duration: 420, delay: Math.min(500, ((parseFloat(b.style.top) || 0) - top) * 1.2), easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
              if (a) done.push(a.finished);
            }
            kids.forEach((k, i) => this.motion(k, [{ opacity: 0, filter: 'blur(8px)', transform: 'translateY(6px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 520, delay: 60 + i * 70, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
          }
          const end = () => {
            layer.remove();
            this.emit('reveal');
          };
          return Promise.all(done).then(end, end);
        }
      }
      return UsaSkeletonReveal as unknown as CustomElementConstructor;
    },
    { id: 'skeleton-reveal', text: css }
  );
}
