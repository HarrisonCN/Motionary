import { defineElement, type UsaElement } from '../base';
import { hasModule, requireModule } from '../../runtime/registry';
import type { CoreApi } from '../../runtime/index';
import css from './motion-inspector.css?raw';

/**
 * `<usa-motion-inspector scope="#app" interval="500">` (10.2) — a live panel
 * listing the running animations under `scope` (Web Animations: CSS
 * animations / transitions, `element.animate()`, Motionary components) with
 * their target, state and progress, plus the `motionary/runtime` ticker
 * (fps, listeners) when the runtime is on the page. Pause / play all,
 * slow motion (0.25×) and per-row scrub. `refresh()`, `pauseAll()`,
 * `playAll()`, `setRate(rate)`, `animations()`; `usa:change`.
 */
export interface UsaMotionInspectorElement extends UsaElement {
  refresh(): void;
  pauseAll(): void;
  playAll(): void;
  setRate(rate: number): void;
  animations(): Animation[];
}

const label = (a: Animation): string => {
  const t = (a.effect as KeyframeEffect | null)?.target as Element | null;
  const name = (a as any).animationName || (a as any).transitionProperty || a.id || 'animate()';
  if (!t) return name;
  const cls = typeof t.className === 'string' && t.className.trim() ? '.' + t.className.trim().split(/\s+/)[0] : '';
  return `${t.localName}${t.id ? '#' + t.id : cls} · ${name}`;
};

export function defineMotionInspector(tag = 'usa-motion-inspector'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMotionInspector extends Base {
        static get observedAttributes(): string[] {
          return ['scope', 'interval'];
        }
        private rate = 1;
        animations(): Animation[] {
          const scope = this.str('scope') ? document.querySelector(this.str('scope')) : document;
          if (!scope) return [];
          const list: Animation[] = typeof (scope as any).getAnimations === 'function' ? (scope as any).getAnimations(scope === document ? undefined : { subtree: true }) : [];
          return list.filter((a) => !this.contains(((a.effect as KeyframeEffect | null)?.target as Node) || null));
        }
        pauseAll(): void {
          this.animations().forEach((a) => a.pause());
          this.refresh();
        }
        playAll(): void {
          this.animations().forEach((a) => a.play());
          this.refresh();
        }
        setRate(rate: number): void {
          this.rate = rate > 0 ? rate : 1;
          this.animations().forEach((a) => (a.playbackRate = this.rate));
          if (hasModule('core')) requireModule<CoreApi>('core').getTicker().timeScale = this.rate;
          this.querySelectorAll<HTMLElement>('[data-rate]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.rate) === this.rate)));
          this.emit('change', { rate: this.rate });
        }
        mount(): void {
          this.innerHTML = '<div class="usa-mi-bar"><strong>Motion inspector</strong><span class="usa-mi-rt" aria-live="polite"></span></div><div class="usa-mi-tools" role="toolbar" aria-label="Animation controls"><button type="button" data-act="pause">Pause all</button><button type="button" data-act="play">Play all</button><button type="button" data-rate="1" aria-pressed="true">1×</button><button type="button" data-rate="0.25" aria-pressed="false">0.25×</button></div><ol class="usa-mi-list" aria-label="Running animations"></ol>';
          this.listen(this, 'click', (e: Event) => {
            const b = (e.target as HTMLElement).closest?.('button') as HTMLElement | null;
            if (!b) return;
            if (b.dataset.act === 'pause') this.pauseAll();
            if (b.dataset.act === 'play') this.playAll();
            if (b.dataset.rate) this.setRate(Number(b.dataset.rate));
          });
          this.listen(this, 'input', (e: Event) => {
            const r = e.target as HTMLInputElement;
            const a = this.animations()[Number(r.dataset.i)];
            const d = Number(a?.effect?.getComputedTiming().duration) || 0;
            if (a && d) {
              a.pause();
              a.currentTime = (Number(r.value) / 100) * d;
            }
          });
          this.refresh();
          let id: ReturnType<typeof setInterval> | null = null;
          this.inView((v) => {
            if (v && !id) id = setInterval(() => this.refresh(), Math.max(100, this.num('interval', 500)));
            if (!v && id) {
              clearInterval(id);
              id = null;
            }
          });
          this.onCleanup(() => id && clearInterval(id));
        }
        refresh(): void {
          const list = this.querySelector('.usa-mi-list');
          if (!list) return;
          const anims = this.animations();
          const rt = this.querySelector('.usa-mi-rt') as HTMLElement;
          if (hasModule('core')) {
            const t = requireModule<CoreApi>('core').getTicker();
            rt.textContent = `runtime ${t.fps} fps · ${t.size} listener${t.size === 1 ? '' : 's'}`;
          } else rt.textContent = `${anims.length} running`;
          list.textContent = '';
          anims.slice(0, 12).forEach((a, i) => {
            const timing = a.effect?.getComputedTiming();
            const p = Math.round(((timing?.progress as number) ?? 0) * 100);
            const li = document.createElement('li');
            li.dataset.state = a.playState;
            li.innerHTML = '<span class="usa-mi-name"></span><span class="usa-mi-state"></span><input type="range" min="0" max="100" aria-label="Scrub">';
            (li.firstChild as HTMLElement).textContent = label(a);
            (li.children[1] as HTMLElement).textContent = a.playState;
            const r = li.querySelector('input') as HTMLInputElement;
            r.value = String(p);
            r.dataset.i = String(i);
            list.appendChild(li);
          });
          if (!anims.length) list.innerHTML = '<li class="usa-mi-empty">No running animations</li>';
          this.emit('change', { count: anims.length });
        }
      }
      return UsaMotionInspector as unknown as CustomElementConstructor;
    },
    { id: 'motion-inspector', text: css }
  );
}
