import { defineElement, EASE_OUT, FLUENT_DECELERATE, type UsaElement } from '../base';
import css from './view-switch.css?raw';

/**
 * `<usa-view-switch>` — shows one of its children at a time (tabs, wizard
 * steps, app pages) and animates between them. Children are views; name
 * them with `data-view`, or address them by index.
 *
 * Attributes: `active` (view name or index, default the first),
 * `effect` (`fade` | `slide` (default, direction-aware — Fluent "page
 * transition") | `scale` | `drill`), `duration` (ms, 320). Inactive views
 * get `hidden` + `inert`. Event: `usa:change` (`detail.view`,
 * `detail.index`). Reduced motion: a quick fade.
 */
export interface UsaViewSwitchElement extends UsaElement {
  active: string;
  readonly views: HTMLElement[];
  show(view: string | number): Promise<void>;
}

export function defineViewSwitch(tag = 'usa-view-switch'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaViewSwitch extends Base {
        static get observedAttributes(): string[] {
          return ['active'];
        }

        private _index = -1;
        private _anims: Animation[] = [];

        get views(): HTMLElement[] {
          return Array.from(this.children) as HTMLElement[];
        }
        get active(): string {
          return this.str('active', '0');
        }
        set active(v: string) {
          this.setAttribute('active', String(v));
        }

        private indexOf(v: string | number): number {
          const views = this.views;
          const byName = views.findIndex((el) => el.dataset.view === String(v));
          if (byName >= 0) return byName;
          const n = Number(v);
          return Number.isInteger(n) && n >= 0 && n < views.length ? n : -1;
        }

        changed(): void {
          this.show(this.active);
        }

        mount(): void {
          const i = Math.max(0, this.indexOf(this.active));
          this._index = i;
          this.views.forEach((v, j) => this.setVisible(v, j === i));
        }

        private setVisible(v: HTMLElement, on: boolean): void {
          v.hidden = !on;
          v.toggleAttribute('inert', !on);
          v.toggleAttribute('data-active', on);
        }

        async show(view: string | number): Promise<void> {
          const next = this.indexOf(view);
          const prev = this._index;
          if (next < 0 || next === prev) return;
          const views = this.views;
          const from = views[prev];
          const to = views[next];
          this._index = next;
          const name = to.dataset.view ?? String(next);
          if (this.active !== name && this.active !== String(next)) this.setAttribute('active', name);
          this._anims.splice(0).forEach((a) => a.finish());
          this.setVisible(to, true);
          this.emit('change', { view: to, index: next, name });
          if (!from) return;
          const duration = this.num('duration', 320);
          const effect = this.reduced ? 'fade' : this.str('effect', 'slide');
          const dir = next > prev ? 1 : -1;
          let outF: Keyframe;
          let inF: Keyframe;
          switch (effect) {
            case 'fade':
              outF = { opacity: 0 };
              inF = { opacity: 0 };
              break;
            case 'scale':
              outF = { opacity: 0, transform: 'scale(0.96)' };
              inF = { opacity: 0, transform: 'scale(1.04)' };
              break;
            case 'drill':
              outF = { opacity: 0, transform: `scale(${dir > 0 ? 1.06 : 0.94})` };
              inF = { opacity: 0, transform: `scale(${dir > 0 ? 0.94 : 1.06})` };
              break;
            default:
              outF = { opacity: 0, transform: `translateX(${-dir * 32}px)` };
              inF = { opacity: 0, transform: `translateX(${dir * 48}px)` };
          }
          const neutral = (f: Keyframe): Keyframe => ('transform' in f ? { opacity: 1, transform: 'none' } : { opacity: 1 });
          // Outgoing view stays stacked in the same grid cell while it leaves
          from.setAttribute('data-leaving', '');
          const a = this.motion(from, [neutral(outF), outF], { duration: duration * 0.6, easing: EASE_OUT, fill: 'forwards' });
          const b = this.motion(to, [inF, neutral(inF)], { duration, delay: duration * 0.15, easing: FLUENT_DECELERATE, fill: 'backwards' });
          this._anims = [a, b].filter((x): x is Animation => !!x);
          await Promise.all(this._anims.map((x) => x.finished.catch(() => undefined)));
          from.removeAttribute('data-leaving');
          if (this._index !== prev) this.setVisible(from, false);
          a?.cancel();
        }
      },
    { id: 'view-switch', text: css }
  );
}
