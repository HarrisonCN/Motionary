import { defineElement, type UsaElement } from '../base';
import { pickEngine, timelineName, commonAncestor, scrollProgress } from './scroll-driven';
import css from './scroll-ring.css?raw';

/**
 * `<usa-scroll-ring label back-to-top></usa-scroll-ring>` (10.4, scroll-driven
 * 3.0) — a circular scroll-progress indicator for the page or for any scroll
 * container (`for=".article"`, looked up next to the ring first). Native
 * `animation-timeline: scroll()` first (the ring then animates off the main
 * thread, no script per frame); a small passive JS loop where scroll
 * timelines are missing (`engine="auto | native | js"`, the one in use is
 * reflected in `data-engine`). `label` shows the percentage, `back-to-top`
 * makes it a button that scrolls the target back to the start, `size`,
 * `thickness`, `horizontal`, `preview` (demo: glides the tracked container
 * back and forth while visible). `progress` (0–1); `usa:progress` on change
 * (whole percents), `usa:top`.
 */
export interface UsaScrollRingElement extends UsaElement {
  readonly progress: number;
  readonly engine: 'native' | 'js';
}

const NS = 'http://www.w3.org/2000/svg';

export function defineScrollRing(tag = 'usa-scroll-ring'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaScrollRing extends Base {
        static get observedAttributes(): string[] {
          return ['for', 'engine', 'label', 'back-to-top', 'size', 'thickness', 'horizontal', 'preview'];
        }
        private p = 0;
        private eng: 'native' | 'js' = 'js';
        get progress(): number {
          return this.p;
        }
        get engine(): 'native' | 'js' {
          return this.eng;
        }
        private target(): Element {
          const sel = this.str('for', 'page');
          if (sel === 'page') return document.scrollingElement || document.documentElement;
          return this.parentElement?.querySelector(sel) || document.querySelector(sel) || document.scrollingElement || document.documentElement;
        }
        mount(): void {
          const size = this.num('size', 56), th = this.num('thickness', 5), r = (size - th) / 2, C = 2 * Math.PI * r;
          this.style.setProperty('--usa-ring-size', size + 'px');
          this.style.setProperty('--usa-ring-c', String(C));
          const svg = document.createElementNS(NS, 'svg');
          svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
          svg.setAttribute('aria-hidden', 'true');
          svg.innerHTML = `<circle class="usa-ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${th}" fill="none"/><circle class="usa-ring-bar" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${th}" fill="none" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
          const bar = svg.lastElementChild as SVGCircleElement;
          const label = document.createElement('span');
          label.className = 'usa-ring-label';
          label.setAttribute('aria-hidden', 'true');
          const host = this.flag('back-to-top') ? document.createElement('button') : document.createElement('span');
          host.className = 'usa-ring';
          if (host instanceof HTMLButtonElement) {
            host.type = 'button';
            host.setAttribute('aria-label', 'Back to top');
          }
          host.append(svg, ...(this.flag('label') ? [label] : []));
          this.replaceChildren(host);
          this.setAttribute('role', host instanceof HTMLButtonElement ? 'group' : 'progressbar');
          if (!(host instanceof HTMLButtonElement)) {
            this.setAttribute('aria-valuemin', '0');
            this.setAttribute('aria-valuemax', '100');
            this.setAttribute('aria-label', this.getAttribute('aria-label') || 'Scroll progress');
          }
          const tgt = this.target();
          const isDoc = tgt === document.scrollingElement || tgt === document.documentElement;
          const horiz = this.flag('horizontal');
          const scrollEv: EventTarget = isDoc ? window : tgt;
          this.eng = pickEngine(this.str('engine', 'auto'));
          this.dataset.engine = this.eng;
          if (this.eng === 'native') {
            const axis = horiz ? 'inline' : 'block';
            if (isDoc) (bar.style as any).animationTimeline = `scroll(root ${axis})`;
            else {
              const name = timelineName('usa-ring');
              (tgt as HTMLElement).style.setProperty('scroll-timeline', `${name} ${axis}`);
              (commonAncestor(this, tgt) as HTMLElement).style.setProperty('timeline-scope', name);
              (bar.style as any).animationTimeline = name;
              this.onCleanup(() => {
                (tgt as HTMLElement).style.removeProperty('scroll-timeline');
                (commonAncestor(this, tgt) as HTMLElement).style.removeProperty('timeline-scope');
              });
            }
            bar.classList.add('usa-ring-native');
          }
          let raf = 0, lastPct = -1;
          const update = () => {
            raf = 0;
            this.p = scrollProgress(tgt, horiz);
            const pct = Math.round(this.p * 100);
            if (this.eng === 'js') bar.setAttribute('stroke-dashoffset', String(C * (1 - this.p)));
            if (pct !== lastPct) {
              lastPct = pct;
              label.textContent = pct + '%';
              if (!(host instanceof HTMLButtonElement)) this.setAttribute('aria-valuenow', String(pct));
              this.toggleAttribute('data-complete', pct >= 100);
              this.emit('progress', { progress: this.p, percent: pct });
            }
          };
          const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
          };
          this.listen(scrollEv, 'scroll', onScroll, { passive: true });
          this.listen(window, 'resize', onScroll, { passive: true });
          this.onCleanup(() => raf && cancelAnimationFrame(raf));
          update();
          if (host instanceof HTMLButtonElement)
            this.listen(host, 'click', () => {
              const opts: ScrollToOptions = { [horiz ? 'left' : 'top']: 0, behavior: this.reduced ? 'auto' : 'smooth' };
              (isDoc ? window : (tgt as HTMLElement)).scrollTo(opts);
              this.emit('top');
            });
          if (this.flag('preview') && !isDoc && !this.reduced) {
            let dir = 1, timer: ReturnType<typeof setTimeout> | null = null, user = false;
            const el = tgt as HTMLElement;
            const glide = () => {
              if (user) return;
              const max = horiz ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
              el.scrollTo({ [horiz ? 'left' : 'top']: dir > 0 ? max : 0, behavior: 'smooth' });
              dir = -dir;
              timer = setTimeout(glide, 2200);
            };
            this.inView((v) => {
              if (timer) clearTimeout(timer);
              timer = v ? setTimeout(glide, 300) : null;
            });
            const stopDemo = () => (user = true);
            this.listen(el, 'wheel', stopDemo, { passive: true });
            this.listen(el, 'touchstart', stopDemo, { passive: true });
            this.onCleanup(() => timer && clearTimeout(timer));
          }
        }
      }
      return UsaScrollRing as unknown as CustomElementConstructor;
    },
    { id: 'scroll-ring', text: css }
  );
}
