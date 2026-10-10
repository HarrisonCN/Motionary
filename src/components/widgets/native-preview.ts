import { defineElement, type UsaElement } from '../base';
import { arrowIndex, nextId } from './shared';
import { toFlutter, toReactNative, entranceFrom } from '../native/index';
import { parseMotion } from '../dsl/index';
import css from './native-preview.css?raw';

/**
 * `<usa-native-preview rules="enter: fade-up 500ms smooth stagger 80ms; click: pop" platform="ios">`
 * (9.8) — preview web motion as it will feel on a phone and get the native
 * code: a device frame (iOS or Android chrome) whose children replay the
 * entrance with the rule's curve (Replay), press with a spring, and code
 * tabs with the generated React Native and Flutter source. `platform`,
 * `name`; `replay()`, `code(platform)`; `usa:replay`.
 */
export interface UsaNativePreviewElement extends UsaElement {
  replay(): void;
  code(platform: 'react-native' | 'flutter'): string;
}

export function defineNativePreview(tag = 'usa-native-preview'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaNativePreview extends Base {
        static get observedAttributes(): string[] {
          return ['rules', 'platform', 'name'];
        }
        code(platform: 'react-native' | 'flutter'): string {
          const opts = { name: this.str('name', 'MotionView') };
          return platform === 'flutter' ? toFlutter(this.str('rules'), opts) : toReactNative(this.str('rules'), opts);
        }
        private items(): HTMLElement[] {
          return Array.from(this.querySelectorAll<HTMLElement>(':scope > .usa-np-device > .usa-np-screen > *'));
        }
        mount(): void {
          const plat = this.str('platform') === 'android' ? 'android' : 'ios';
          this.setAttribute('data-platform', plat);
          if (!this.querySelector(':scope > .usa-np-device')) {
            const kids = Array.from(this.childNodes);
            // 13.1.0: Replay sits next to the tab list, not in it (a tablist may only own tabs — axe aria-required-children);
            // the code is the tabs' tabpanel
            const id = nextId('usa-np');
            this.insertAdjacentHTML('afterbegin', `<div class="usa-np-device"><span class="usa-np-notch" aria-hidden="true"></span><div class="usa-np-screen"></div></div><div class="usa-np-side"><div class="usa-np-bar"><div role="tablist" aria-label="Native code"><button type="button" role="tab" id="${id}-rn" aria-controls="${id}-code" data-p="react-native">React Native</button><button type="button" role="tab" id="${id}-fl" aria-controls="${id}-code" data-p="flutter">Flutter</button></div><button type="button" class="usa-np-replay">Replay</button></div><pre class="usa-np-code" id="${id}-code" role="tabpanel" tabindex="0"><code></code></pre></div>`);
            const scr = this.querySelector('.usa-np-screen') as HTMLElement;
            kids.forEach((k) => scr.appendChild(k));
          }
          let cur: 'react-native' | 'flutter' = 'react-native';
          const tabs = Array.from(this.querySelectorAll<HTMLElement>('[role=tab][data-p]'));
          const show = () => {
            tabs.forEach((t) => {
              const on = t.dataset.p === cur;
              t.setAttribute('aria-selected', String(on));
              t.tabIndex = on ? 0 : -1;
              if (on) this.querySelector('.usa-np-code')?.setAttribute('aria-labelledby', t.id);
            });
            const c = this.querySelector('.usa-np-code code');
            if (c) c.textContent = this.code(cur);
          };
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const i = tabs.indexOf(e.target as HTMLElement);
            const j = i < 0 ? -1 : arrowIndex(e, i, tabs.length);
            if (j < 0) return;
            e.preventDefault();
            cur = tabs[j].dataset.p as typeof cur;
            show();
            tabs[j].focus();
          });
          this.listen(this, 'click', (e: Event) => {
            const t = e.target as HTMLElement;
            const tab = t.closest?.('[data-p]') as HTMLElement | null;
            if (tab) {
              cur = tab.dataset.p as typeof cur;
              show();
            }
            if (t.closest?.('.usa-np-replay')) this.replay();
          });
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            const it = (e.target as Element).closest?.('.usa-np-screen > *');
            if (it && !this.reduced) this.motion(it, [{ transform: 'scale(1)' }, { transform: 'scale(.92)', offset: 0.35 }, { transform: 'scale(1.03)', offset: 0.75 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
          });
          show();
          let seen = false;
          this.inView((v) => {
            if (v && !seen) {
              seen = true;
              this.replay();
            }
          });
        }
        replay(): void {
          const r = parseMotion(this.str('rules')).rules.find((x) => x.trigger === 'enter' || x.trigger === 'load');
          if (!r || this.reduced) return;
          const f = entranceFrom(r.effect);
          this.items().forEach((el, i) =>
            this.motion(el, [{ opacity: f.opacity, transform: `translate(${f.x}px, ${f.y}px) scale(${f.scale})` }, { opacity: 1, transform: 'none' }], { duration: r.duration ?? 600, delay: (r.delay || 0) + (r.stagger || 0) * i, easing: r.easing || 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' })
          );
          this.emit('replay');
        }
      }
      return UsaNativePreview as unknown as CustomElementConstructor;
    },
    { id: 'native-preview', text: css }
  );
}
