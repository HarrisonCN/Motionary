import { defineElement, type UsaElement } from '../base';
import { runtimeModule } from './runtime-link';
import type { DragSnapApi, DragSnap } from '../../runtime/drag-snap';
import css from './snap-carousel.css?raw';

/**
 * `<usa-snap-carousel>` (10.8) — a drag / swipe carousel with inertia and
 * snap points on **`motionary/runtime/drag-snap`** (requires `use(dragSnap)`
 * before it mounts). Each child is a slide; slides keep their own width
 * (CSS `--usa-sc-size`, default 80 %), so several can be visible ("peek").
 *
 * Its own entry point — `motionary/components/snap-carousel` — and **not**
 * part of `motionary/components/widgets` or `motionary/components/lite`
 * (10.8+ components ship as individual entry points so the bundles stay put).
 *
 * Attributes: `align` (start · center, default center), `gap` (px, default
 * 16), `index` (start slide), `autoplay` (ms; pauses on hover, focus, press,
 * off screen and under reduced motion; wraps), `no-controls`, `no-dots`,
 * `label` (accessible name, default "Carousel"). Keyboard: ←/→, Home / End
 * on the focused viewport. Without the runtime module the slides stay a
 * native CSS scroll-snap strip (plus the clear notice).
 *
 * API: `index`, `length`, `controller` (the DragSnap), `next()`, `prev()`,
 * `goTo(i, animate = true)`; `usa:change` { index, from }.
 */
export interface UsaSnapCarouselElement extends UsaElement {
  index: number;
  readonly length: number;
  readonly controller: DragSnap | null;
  next(): void;
  prev(): void;
  goTo(i: number, animate?: boolean): void;
}

export function defineSnapCarousel(tag = 'usa-snap-carousel'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSnapCarousel extends Base {
        static get observedAttributes(): string[] {
          return ['align', 'gap', 'autoplay', 'no-controls', 'no-dots', 'label', 'index'];
        }
        private slides: HTMLElement[] = [];
        private ds: DragSnap | null = null;
        private cur = 0;
        private sync: (() => void) | null = null;
        get length(): number {
          return this.slides.length;
        }
        get index(): number {
          return this.cur;
        }
        set index(v: number) {
          this.goTo(v);
        }
        get controller(): DragSnap | null {
          return this.ds;
        }
        next(): void {
          this.goTo(this.cur + 1 >= this.length ? 0 : this.cur + 1);
        }
        prev(): void {
          this.goTo(this.cur - 1 < 0 ? this.length - 1 : this.cur - 1);
        }
        goTo(i: number, animate = true): void {
          const n = Math.max(0, Math.min(this.length - 1, Math.round(i)));
          if (this.ds) this.ds.snapTo(n, animate && !this.reduced);
          else {
            this.slides[n]?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
            this.set(n);
          }
        }
        private set(n: number): void {
          if (n === this.cur && this.dataset.ready !== undefined) return this.sync?.();
          const from = this.cur;
          this.cur = n;
          this.sync?.();
          if (from !== n) this.emit('change', { index: n, from });
        }
        mount(): void {
          // structure first (works without the runtime as a CSS scroll-snap strip)
          let vp = this.querySelector<HTMLElement>(':scope > .usa-sc-viewport');
          let track = vp?.querySelector<HTMLElement>(':scope > .usa-sc-track') || null;
          if (!vp || !track) {
            vp = document.createElement('div');
            vp.className = 'usa-sc-viewport';
            track = document.createElement('div');
            track.className = 'usa-sc-track';
            for (const c of Array.from(this.children)) if (c instanceof HTMLElement && !c.matches('.usa-rt-missing, .usa-sc-ui')) track.append(c);
            vp.append(track);
            this.append(vp);
          }
          this.querySelectorAll(':scope > .usa-sc-ui').forEach((x) => x.remove());
          this.slides = Array.from(track.children) as HTMLElement[];
          const N = this.slides.length;
          this.setAttribute('role', 'region');
          this.setAttribute('aria-roledescription', 'carousel');
          this.setAttribute('aria-label', this.str('label', 'Carousel'));
          vp.tabIndex = 0;
          vp.setAttribute('aria-label', `${this.str('label', 'Carousel')} — use the arrow keys`);
          this.style.setProperty('--usa-sc-gap', `${this.num('gap', 16)}px`);
          this.slides.forEach((s, i) => {
            s.setAttribute('role', 'group');
            s.setAttribute('aria-roledescription', 'slide');
            s.setAttribute('aria-label', `${i + 1} of ${N}`);
          });
          const live = document.createElement('p');
          live.className = 'usa-sc-ui usa-sc-live';
          live.setAttribute('aria-live', 'polite');
          this.append(live);
          let prevB: HTMLButtonElement | null = null, nextB: HTMLButtonElement | null = null;
          if (!this.flag('no-controls') && N > 1) {
            const mk = (cls: string, label: string, glyph: string, fn: () => void) => {
              const b = document.createElement('button');
              b.type = 'button';
              b.className = `usa-sc-ui usa-sc-nav ${cls}`;
              b.setAttribute('aria-label', label);
              b.textContent = glyph;
              this.listen(b, 'click', fn);
              this.append(b);
              return b;
            };
            prevB = mk('usa-sc-prev', 'Previous slide', '‹', () => this.goTo(this.cur - 1));
            nextB = mk('usa-sc-next', 'Next slide', '›', () => this.goTo(this.cur + 1));
          }
          const dots: HTMLButtonElement[] = [];
          if (!this.flag('no-dots') && N > 1) {
            const nav = document.createElement('div');
            nav.className = 'usa-sc-ui usa-sc-dots';
            nav.setAttribute('role', 'group');
            nav.setAttribute('aria-label', 'Choose a slide');
            this.slides.forEach((_, i) => {
              const d = document.createElement('button');
              d.type = 'button';
              d.className = 'usa-sc-dot';
              d.setAttribute('aria-label', `Go to slide ${i + 1}`);
              this.listen(d, 'click', () => this.goTo(i));
              nav.append(d);
              dots.push(d);
            });
            this.append(nav);
          }
          let announce = false;
          this.sync = () => {
            dots.forEach((d, i) => d.setAttribute('aria-current', String(i === this.cur)));
            if (prevB) prevB.disabled = this.cur <= 0;
            if (nextB) nextB.disabled = this.cur >= N - 1;
            this.slides.forEach((s, i) => s.toggleAttribute('data-active', i === this.cur));
            if (announce) live.textContent = `Slide ${this.cur + 1} of ${N}`;
          };
          this.listen(vp, 'keydown', (e: KeyboardEvent) => {
            const k = e.key;
            const to = k === 'ArrowRight' ? this.cur + 1 : k === 'ArrowLeft' ? this.cur - 1 : k === 'Home' ? 0 : k === 'End' ? N - 1 : null;
            if (to === null) return;
            e.preventDefault();
            announce = true;
            this.goTo(to);
          });
          this.listen(this, 'click', (e: Event) => {
            if ((e.target as Element)?.closest?.('.usa-sc-nav, .usa-sc-dot')) announce = true;
          }, { capture: true });
          const DS = runtimeModule<DragSnapApi>(this, 'drag-snap');
          const start = Math.max(0, Math.min(N - 1, this.num('index', 0)));
          this.cur = start;
          if (!DS) {
            this.sync();
            return;
          }
          this.dataset.ready = '';
          const center = this.str('align', 'center') !== 'start';
          const measure = (): number[] => {
            const vw = vp!.clientWidth;
            const max = Math.max(0, track!.scrollWidth - vw);
            return this.slides.map((s) => {
              const p = -(s.offsetLeft - (center ? (vw - s.offsetWidth) / 2 : 0));
              return center ? p : Math.max(-max, Math.min(0, p));
            });
          };
          const apply = (p: number) => (track!.style.transform = `translate3d(${p.toFixed(2)}px,0,0)`);
          const ds = DS.createDragSnap(track, {
            axis: 'x',
            snap: measure(),
            reducedMotion: this.reduced,
            onUpdate: apply,
            onSnap: (i) => this.set(i),
            onDragStart: () => this.toggleAttribute('data-dragging', true),
            onDragEnd: () => this.toggleAttribute('data-dragging', false),
          });
          this.ds = ds;
          ds.snapTo(start, false);
          this.set(start);
          this.onCleanup(() => {
            ds.dispose();
            this.ds = null;
            track!.style.transform = '';
          });
          const remeasure = () => ds.setSnapPoints(measure());
          this.listen(window, 'resize', remeasure, { passive: true });
          if (typeof ResizeObserver === 'function') {
            const ro = new ResizeObserver(remeasure);
            ro.observe(vp);
            this.onCleanup(() => ro.disconnect());
          }
          // autoplay: paused on hover / focus / press / off screen; never under reduced motion
          const every = this.num('autoplay', 0);
          if (every > 0 && N > 1 && !this.reduced) {
            let hold = 0, seen = true;
            const h = (d: number) => () => (hold = Math.max(0, hold + d));
            this.listen(this, 'pointerenter', h(1));
            this.listen(this, 'pointerleave', h(-1));
            this.listen(this, 'focusin', h(1));
            this.listen(this, 'focusout', h(-1));
            this.inView((v) => (seen = v));
            const t = setInterval(() => {
              if (!hold && seen && !ds.dragging) this.goTo(this.cur + 1 >= N ? 0 : this.cur + 1);
            }, Math.max(1200, every));
            this.onCleanup(() => clearInterval(t));
          }
        }
        unmount(): void {
          this.removeAttribute('data-ready');
          this.removeAttribute('data-dragging');
        }
      }
      return UsaSnapCarousel as unknown as CustomElementConstructor;
    },
    { id: 'snap-carousel', text: css }
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-snap-carousel': UsaSnapCarouselElement;
  }
}
