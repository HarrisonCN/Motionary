import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, ownChildren } from './kit';
import { seeded } from './kit-12';
import css from './motion-kit-12.css?raw';

/** Start position (% of the box), delay (s), duration (s) and tail length (px) of meteor `i`, the same on every load. */
export function meteorAt(i: number): { left: number; top: number; delay: number; duration: number; tail: number } {
  return {
    left: Math.round(seeded(i, 1) * 1200) / 10 - 10,
    top: Math.round(seeded(i, 2) * 400) / 10 - 20,
    delay: Math.round(seeded(i, 3) * 80) / 10,
    duration: Math.round((2.2 + seeded(i, 4) * 3.6) * 10) / 10,
    tail: Math.round(50 + seeded(i, 5) * 90),
  };
}

/**
 * A panel with shooting stars streaking across behind its content. Each meteor is a CSS-animated streak with a glowing
 * head and a fading tail; the layout is the same on every load. The streaks stop while the panel is off screen, and are
 * not drawn at all under reduced motion. The children sit on top and keep their reading order.
 *
 * Attributes: `count` (1–60; 18), `angle` (degrees; 215), `color` (#fff), `speed` (0.25–4; 1).
 */
export interface UsaMeteorsElement extends UsaElement {}

export function defineMeteors(tag = 'usa-meteors'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Meteors extends Base {
    static get observedAttributes(): string[] { return ['count', 'angle', 'color', 'speed']; }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('div', 'usa-kit usa-meteors');
      const sky = make('div', 'usa-meteors-sky');
      sky.setAttribute('aria-hidden', 'true');
      const n = Math.min(60, Math.max(1, Math.round(this.num('count', 18))));
      if (!this.reduced) {
        for (let i = 0; i < n; i++) {
          const m = meteorAt(i);
          const s = make('span', 'usa-meteor');
          s.style.cssText = `left:${m.left}%;top:${m.top}%;--delay:${m.delay}s;--dur:${m.duration}s;--tail:${m.tail}px`;
          sky.append(s);
        }
      }
      const body = make('div', 'usa-meteors-body');
      body.append(...kids);
      root.append(sky, body);
      root.style.setProperty('--angle', `${this.num('angle', 215)}deg`);
      root.style.setProperty('--speed', String(Math.min(4, Math.max(0.25, this.num('speed', 1)))));
      const c = cleanColor(this.str('color'));
      if (c) root.style.setProperty('--meteor', c);
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      this.inView((v) => root.toggleAttribute('data-paused', !v));
      this.onCleanup(() => { this.append(...kids); root.remove(); });
    }
  }, { id: 'motion-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
