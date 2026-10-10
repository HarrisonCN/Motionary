import { defineElement, type UsaElement } from '../base';
import { keyClick } from '../key-click';
import { defineLottie } from './lottie';
import css from './lottie-icon.css?raw';

/**
 * `<usa-lottie-icon name="heart" trigger="click">` (9.2) — an animated icon
 * set shipped as tiny Lottie files and played by `<usa-lottie>`: `heart`
 * (beat), `bell` (swing), `check` (draw-in), `spinner` (spin), `star`
 * (twinkle), `bolt` (zap). `trigger` click (default) · hover · enter ·
 * loop; `size` (px, 32), `color`, `label` (otherwise decorative). The JSON
 * of each is exported as `LOTTIE_ICONS` — the same format designers export
 * from After Effects. Reduced motion: static icon.
 */
export interface UsaLottieIconElement extends UsaElement {
  play(): void;
}

const fill = (r: number, g: number, b: number) => ({ ty: 'fl', c: { k: [r, g, b, 1] } });
const sh = (v: number[][], c = true) => ({ ty: 'sh', ks: { k: { v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), c } } });
const anim = (keys: [number, number[]][]) => ({ a: 1, k: keys.map(([t, s]) => ({ t, s })) });
const L = (nm: string, shapes: unknown[], ks: Record<string, unknown>) => ({ nm, ks: { a: { k: [24, 24] }, p: { k: [24, 24] }, ...ks }, shapes });
const icon = (layers: unknown[], op = 30) => ({ v: '5.7.0', fr: 30, ip: 0, op, w: 48, h: 48, layers });

/** The built-in Lottie icon set (9.2). */
export const LOTTIE_ICONS: Record<string, unknown> = {
  heart: icon([L('heart', [sh([[24, 40], [8, 25], [7, 15], [15, 8], [24, 14], [33, 8], [41, 15], [40, 25]]), fill(0.96, 0.25, 0.37)], { s: anim([[0, [100, 100]], [7, [135, 135]], [14, [90, 90]], [22, [108, 108]], [30, [100, 100]]]) })]),
  bell: icon([L('bell', [sh([[24, 6], [34, 14], [35, 30], [40, 35], [8, 35], [13, 30], [14, 14]]), { ty: 'el', p: { k: [24, 39] }, s: { k: [8, 8] } }, fill(0.98, 0.75, 0.14)], { a: { k: [24, 6] }, p: { k: [24, 6] }, r: anim([[0, [0]], [6, [-20]], [12, [16]], [18, [-10]], [24, [5]], [30, [0]]]) })]),
  check: icon([
    L('tick', [sh([[14, 25], [21, 32], [35, 17], [32, 14], [21, 26], [17, 22]]), fill(1, 1, 1)], { s: anim([[0, [0, 0]], [10, [0, 0]], [20, [115, 115]], [28, [100, 100]]]) }),
    L('disc', [{ ty: 'el', p: { k: [24, 24] }, s: { k: [40, 40] } }, fill(0.13, 0.77, 0.37)], { s: anim([[0, [0, 0]], [10, [110, 110]], [16, [100, 100]]]) }),
  ]),
  spinner: icon([L('arc', [sh([[24, 4], [38, 10], [44, 24], [40, 24], [35, 13], [24, 8]]), fill(0.31, 0.27, 0.9)], { r: anim([[0, [0]], [30, [360]]]) })]),
  star: icon([L('star', [sh([[24, 4], [29, 18], [44, 18], [32, 27], [36, 42], [24, 33], [12, 42], [16, 27], [4, 18], [19, 18]]), fill(0.98, 0.8, 0.08)], { r: anim([[0, [0]], [15, [72]], [30, [72]]]), s: anim([[0, [100, 100]], [8, [70, 70]], [18, [120, 120]], [30, [100, 100]]]) })]),
  bolt: icon([L('bolt', [sh([[27, 4], [12, 27], [22, 27], [19, 44], [36, 19], [26, 19]]), fill(0.55, 0.36, 0.96)], { o: anim([[0, [100]], [4, [20]], [8, [100]], [12, [30]], [16, [100]]]), s: anim([[0, [100, 100]], [6, [120, 120]], [16, [100, 100]]]) })], 20),
};

export function defineLottieIcon(tag = 'usa-lottie-icon'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaLottieIcon extends Base {
        static get observedAttributes(): string[] {
          return ['name', 'size', 'color', 'label', 'trigger'];
        }
        private lottie(): (HTMLElement & { json: unknown; play(): void; stop(): void }) | null {
          return this.querySelector(':scope > usa-lottie');
        }
        mount(): void {
          if (typeof customElements !== 'undefined' && !customElements.get('usa-lottie')) defineLottie();
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const name = LOTTIE_ICONS[this.str('name')] ? this.str('name') : 'heart';
          this.setAttribute('data-name', name);
          const label = this.str('label');
          if (label) {
            this.setAttribute('role', 'img');
            this.setAttribute('aria-label', label);
          } else this.setAttribute('aria-hidden', 'true');
          this.style.setProperty('--usa-li-size', `${Math.max(12, this.num('size', 32))}px`);
          let json = LOTTIE_ICONS[name];
          if (this.hasAttribute('color')) {
            const m = this.str('color').match(/^#?([0-9a-f]{6})$/i);
            if (m) {
              const n = parseInt(m[1], 16);
              const c = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
              json = JSON.parse(JSON.stringify(json).replace(/"ty":"fl","c":\{"k":\[[^\]]*\]\}/g, `"ty":"fl","c":{"k":${JSON.stringify(c)}}`));
            }
          }
          const lt = document.createElement('usa-lottie') as HTMLElement & { json: unknown };
          lt.setAttribute('data-usa-part', '');
          if (this.str('trigger') === 'loop') lt.setAttribute('loop', '');
          lt.json = json;
          this.appendChild(lt);
          const t = this.str('trigger', 'click');
          if (t === 'hover') this.listen(this, 'pointerenter', () => this.play());
          else if (t === 'enter') this.inView((v) => v && this.play(), { threshold: 0.5 });
          else if (t === 'loop') this.inView((v) => (v ? this.play() : this.lottie()?.stop()));
          else {
            this.listen(this, 'click', () => this.play());
            keyClick(this as any);
          }
        }
        play(): void {
          const l = this.lottie();
          if (!l || this.reduced) return;
          if (this.str('trigger') !== 'loop') l.stop();
          l.play();
        }
      }
      return UsaLottieIcon as unknown as CustomElementConstructor;
    },
    { id: 'lottie-icon', text: css }
  );
}
