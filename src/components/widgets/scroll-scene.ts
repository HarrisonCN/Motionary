import { defineElement, type UsaElement } from '../base';
import { runtimeModule } from './runtime-link';
import { requireModule } from '../../runtime/registry';
import type { CoreApi } from '../../runtime/index';
import type { ScrollApi, ScrollScene } from '../../runtime/scroll';
import type { Timeline } from '../../runtime/tween';
import css from './scroll-scene.css?raw';

/**
 * `<usa-scroll-scene start="top 80%" end="bottom 20%" scrub="120" pin markers>`
 * (10.2) — a scroll-linked scene powered by **`motionary/runtime/scroll`**
 * (requires `use(scroll)` first). Each child with `data-scrub="opacity: 0 -> 1;
 * x: -80 -> 0; rotate: -8deg -> 0deg"` is tweened across the scene; `stagger`
 * (ms of the scene's 1000 ms timeline) offsets the children. `scrub` = `true`
 * (direct) or a smoothing time in ms; without `scrub` the timeline plays on
 * enter and reverses on leave-back. `pin`, `markers`, `toggle-class`.
 * When the page cannot scroll (e.g. a thumbnail), `preview` loops the scene.
 * `progress` (read-only), `refresh()`, `timeline()`; `usa:progress`, `usa:enter`, `usa:leave`.
 */
export interface UsaScrollSceneElement extends UsaElement {
  readonly progress: number;
  refresh(): void;
  timeline(): Timeline | null;
}

/** 'opacity: 0 -> 1; x: -80 -> 0' → [{ from: { opacity: '0', x: '-80' }, to: {...} }] */
export function parseScrub(spec: string): { from: Record<string, string>; to: Record<string, string> } {
  const from: Record<string, string> = {}, to: Record<string, string> = {};
  for (const part of spec.split(';')) {
    const m = /^\s*([\w-]+)\s*:\s*([^>]+?)\s*->\s*(.+?)\s*$/.exec(part);
    if (!m) continue;
    const k = m[1].replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    from[k] = m[2];
    to[k] = m[3];
  }
  return { from, to };
}

export function defineScrollScene(tag = 'usa-scroll-scene'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaScrollScene extends Base {
        static get observedAttributes(): string[] {
          return ['start', 'end', 'scrub', 'pin', 'markers', 'stagger', 'toggle-class', 'preview'];
        }
        private scene: ScrollScene | null = null;
        private tl: Timeline | null = null;
        get progress(): number {
          return this.scene?.progress ?? 0;
        }
        timeline(): Timeline | null {
          return this.tl;
        }
        refresh(): void {
          this.scene?.refresh();
        }
        mount(): void {
          const sc = runtimeModule<ScrollApi>(this, 'scroll');
          const core = sc && requireModule<CoreApi>('core'); // registered by use(scroll)
          if (!sc || !core) return;
          const items = Array.from(this.querySelectorAll<HTMLElement>('[data-scrub]'));
          const stagger = this.num('stagger', 0);
          const tl = core.timeline({ paused: true });
          items.forEach((el, i) => {
            const { from, to } = parseScrub(el.dataset.scrub || '');
            tl.add(new core.Tween(el, { from, to, duration: Math.max(100, 1000 - stagger * (items.length - 1)), ease: this.reduced ? 'linear' : 'cubic-out', paused: true }), stagger * i);
          });
          tl.seek(0);
          this.tl = tl;
          const scrubAttr = this.getAttribute('scrub');
          const scrub = scrubAttr === null ? false : scrubAttr === '' || scrubAttr === 'true' ? true : Number(scrubAttr) || true;
          const canScroll = document.documentElement.scrollHeight > innerHeight + 2;
          if (this.flag('preview') && !canScroll) {
            if (!this.reduced) {
              const loop = core.timeline({ repeat: -1, yoyo: true, paused: true }).add(tl, 0);
              loop.play();
              this.onCleanup(() => loop.kill());
            } else tl.progress = 1;
            this.setAttribute('data-preview', '');
            return;
          }
          this.scene = sc.scrollScene({
            trigger: this,
            start: this.str('start', 'top 85%'),
            end: this.str('end', 'bottom 35%'),
            scrub,
            pin: this.flag('pin'),
            markers: this.flag('markers'),
            toggleClass: this.str('toggle-class') || undefined,
            animation: tl,
            onEnter: () => this.emit('enter'),
            onLeave: () => this.emit('leave'),
            onUpdate: (s) => this.emit('progress', { progress: s.progress }),
          });
          this.onCleanup(() => {
            this.scene?.kill();
            this.scene = null;
            tl.kill();
          });
        }
      }
      return UsaScrollScene as unknown as CustomElementConstructor;
    },
    { id: 'scroll-scene', text: css }
  );
}
