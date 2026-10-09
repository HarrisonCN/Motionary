import { defineElement, type UsaElement } from '../base';
import { pickEngine, timelineName, viewProgress } from './scroll-driven';
import css from './parallax-layers.css?raw';

/**
 * `<usa-parallax-layers range="120"><img data-depth="0.2" …><h2 data-depth="-0.4">…</h2></usa-parallax-layers>`
 * (10.4, scroll-driven 3.0) — a parallax container: each child with
 * `data-depth` (−1…1; 0 = still, positive = slower / behind, negative =
 * faster / in front) moves by `depth × range` px while the container crosses
 * the viewport. Native `view()` scroll timeline first (no script per frame),
 * JS fallback otherwise (`engine="auto | native | js"`, reflected in
 * `data-engine`); `horizontal` moves layers sideways, `pointer` adds a
 * pointer-driven tilt of the layers (`strength` px), `preview` loops the
 * motion when the page cannot scroll (thumbnails). Static under reduced
 * motion. `layers()`, `progress`; `usa:progress`.
 */
export interface UsaParallaxLayersElement extends UsaElement {
  layers(): HTMLElement[];
  readonly progress: number;
}

export function defineParallaxLayers(tag = 'usa-parallax-layers'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaParallaxLayers extends Base {
        static get observedAttributes(): string[] {
          return ['range', 'engine', 'horizontal', 'pointer', 'strength', 'preview'];
        }
        private p = 0;
        get progress(): number {
          return this.p;
        }
        layers(): HTMLElement[] {
          return Array.from(this.querySelectorAll<HTMLElement>(':scope > [data-depth], :scope > * > [data-depth]'));
        }
        mount(): void {
          const layers = this.layers();
          const range = this.num('range', 120);
          const horiz = this.flag('horizontal');
          this.style.setProperty('--usa-plx-range', String(range));
          layers.forEach((l) => l.style.setProperty('--usa-depth', String(Number(l.dataset.depth) || 0)));
          this.toggleAttribute('data-horizontal', horiz);
          if (this.reduced) {
            this.dataset.engine = 'static';
            return;
          }
          const canScroll = document.documentElement.scrollHeight > innerHeight + 2;
          if (this.flag('preview') && !canScroll) {
            this.dataset.engine = 'preview';
            const anims = layers.map((l) => {
              const d = (Number(l.dataset.depth) || 0) * range;
              const t = (v: number) => (horiz ? `${v}px 0` : `0 ${v}px`);
              return this.motion(l, [{ translate: t(d) }, { translate: t(-d) }], { duration: 3200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
            });
            this.onCleanup(() => anims.forEach((a) => a?.cancel()));
          } else {
            const eng = pickEngine(this.str('engine', 'auto'), 'view');
            this.dataset.engine = eng;
            if (eng === 'native') {
              const name = timelineName('usa-plx');
              this.style.setProperty('view-timeline', `${name} block`);
              layers.forEach((l) => {
                l.classList.add('usa-plx-native');
                (l.style as any).animationTimeline = name;
              });
              this.onCleanup(() => layers.forEach((l) => l.classList.remove('usa-plx-native')));
            }
            let raf = 0;
            const update = () => {
              raf = 0;
              this.p = viewProgress(this);
              if (eng === 'js')
                layers.forEach((l) => {
                  const v = (Number(l.dataset.depth) || 0) * range * (1 - 2 * this.p);
                  l.style.translate = horiz ? `${v.toFixed(2)}px 0` : `0 ${v.toFixed(2)}px`;
                });
              this.emit('progress', { progress: this.p });
            };
            const onScroll = () => {
              if (!raf) raf = requestAnimationFrame(update);
            };
            let visible = false;
            this.inView((v) => {
              visible = v;
              if (v) onScroll();
            }, { rootMargin: '20% 0px' });
            this.listen(window, 'scroll', () => visible && onScroll(), { passive: true });
            this.listen(window, 'resize', onScroll, { passive: true });
            this.onCleanup(() => raf && cancelAnimationFrame(raf));
            update();
          }
          if (this.flag('pointer')) {
            const s = this.num('strength', 14);
            this.listen(this, 'pointermove', (e: PointerEvent) => {
              const r = this.getBoundingClientRect();
              const dx = (e.clientX - r.left) / (r.width || 1) - 0.5, dy = (e.clientY - r.top) / (r.height || 1) - 0.5;
              layers.forEach((l) => {
                const d = Number(l.dataset.depth) || 0;
                l.style.transform = `translate(${(-dx * s * d * 2).toFixed(2)}px, ${(-dy * s * d * 2).toFixed(2)}px)`;
              });
            });
            this.listen(this, 'pointerleave', () => layers.forEach((l) => (l.style.transform = '')));
          }
          this.onCleanup(() => layers.forEach((l) => {
            l.style.translate = '';
            l.style.transform = '';
            (l.style as any).animationTimeline = '';
          }));
        }
      }
      return UsaParallaxLayers as unknown as CustomElementConstructor;
    },
    { id: 'parallax-layers', text: css }
  );
}
