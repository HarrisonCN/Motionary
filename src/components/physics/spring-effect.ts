import { defineElement, type UsaElement } from '../base';
import { springEasing, type SpringInput } from './spring';
import css from './spring-effect.css?raw';

export const SPRING_EFFECTS = ['bounce-in', 'pop', 'drop', 'jelly', 'rubber-band'] as const;
export type SpringEffect = (typeof SPRING_EFFECTS)[number];

/** Entrance effects start hidden; attention effects (jelly, rubber-band) play on visible content. */
const ENTRANCE = /*#__PURE__*/ new Set<string>(['bounce-in', 'pop', 'drop']);

/** Keyframes of a spring effect (entrances use spring timing, attention effects fixed frames). */
export function springEffectKeyframes(effect: string, reduced = false): Keyframe[] {
  if (reduced) return ENTRANCE.has(effect) ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 1 }];
  switch (effect) {
    case 'pop':
      return [{ opacity: 0, transform: 'scale(0.5)' }, { opacity: 1, transform: 'scale(1)' }];
    case 'drop':
      return [{ opacity: 0, transform: 'translate3d(0, -120%, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }];
    case 'jelly':
      return [
        { transform: 'scale3d(1, 1, 1)' },
        { transform: 'scale3d(1.25, 0.75, 1)', offset: 0.3 },
        { transform: 'scale3d(0.75, 1.25, 1)', offset: 0.4 },
        { transform: 'scale3d(1.15, 0.85, 1)', offset: 0.5 },
        { transform: 'scale3d(0.95, 1.05, 1)', offset: 0.65 },
        { transform: 'scale3d(1.05, 0.95, 1)', offset: 0.75 },
        { transform: 'scale3d(1, 1, 1)' },
      ];
    case 'rubber-band':
      return [
        { transform: 'scale3d(1, 1, 1)' },
        { transform: 'scale3d(1.3, 0.7, 1)', offset: 0.3 },
        { transform: 'scale3d(0.8, 1.2, 1)', offset: 0.45 },
        { transform: 'scale3d(1.1, 0.9, 1)', offset: 0.6 },
        { transform: 'scale3d(0.97, 1.03, 1)', offset: 0.8 },
        { transform: 'scale3d(1, 1, 1)' },
      ];
    default:
      return [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1)' }];
  }
}

const DEFAULT_PRESET: Record<string, string> = { 'bounce-in': 'bouncy', pop: 'wobbly', drop: 'bouncy' };

/**
 * `<usa-spring>` — spring / bounce effects on its content.
 *
 * Attributes: `effect` (`bounce-in` default, `pop`, `drop`, `jelly`,
 * `rubber-band`), `trigger` (`view` default, `hover`, `click`, `manual`),
 * `preset` (`gentle`, `wobbly`, `stiff`, `bouncy`, …) or `stiffness` /
 * `damping` / `mass`, `delay` (ms), `duration` (ms, attention effects; 900),
 * `repeat` (replay every time it re-enters the view), `block`.
 * Events: `usa:complete`. Reduced motion: entrances fade, attention effects do nothing.
 */
export interface UsaSpringElement extends UsaElement {
  effect: string;
  play(): Promise<void>;
  reset(): void;
}

export function defineSpring(tag = 'usa-spring'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaSpring extends Base {
        static get observedAttributes(): string[] {
          return ['effect', 'trigger', 'repeat', 'stiffness', 'damping', 'mass', 'preset', 'duration', 'delay'];
        }

        private _anim: Animation | null = null;

        get effect(): string {
          return this.str('effect', 'bounce-in');
        }
        set effect(v: string) {
          this.setAttribute('effect', v);
        }

        private config(): SpringInput {
          if (this.hasAttribute('stiffness') || this.hasAttribute('damping') || this.hasAttribute('mass'))
            return { stiffness: this.num('stiffness', 170), damping: this.num('damping', 26), mass: this.num('mass', 1) };
          return this.str('preset', DEFAULT_PRESET[this.effect] || 'wobbly');
        }

        mount(): void {
          const trigger = this.str('trigger', 'view');
          const entrance = ENTRANCE.has(this.effect);
          if (trigger === 'view') {
            if (entrance) this.setAttribute('data-state', 'hidden');
            this.inView((visible) => {
              if (visible) this.play();
              else if (this.flag('repeat') && entrance) this.reset();
            }, { threshold: 0.15 });
          } else {
            if (trigger === 'hover') this.listen(this, 'pointerenter', () => this.play());
            if (trigger === 'click') {
              this.listen(this, 'click', () => this.play());
              this.listen(this, 'keydown', (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && this.play());
            }
          }
        }

        unmount(): void {
          this._anim?.cancel();
          this._anim = null;
        }

        reset(): void {
          this._anim?.cancel();
          this._anim = null;
          if (ENTRANCE.has(this.effect)) this.setAttribute('data-state', 'hidden');
        }

        async play(): Promise<void> {
          const effect = this.effect;
          const reduced = this.reduced;
          this._anim?.cancel();
          this.setAttribute('data-state', 'playing');
          const frames = springEffectKeyframes(effect, reduced);
          const timing: KeyframeAnimationOptions = ENTRANCE.has(effect) && !reduced
            ? springEasing(this.config())
            : { duration: reduced ? 250 : this.num('duration', 900), easing: 'ease-out' };
          const a = this.motion(this, frames, { ...timing, delay: this.num('delay', 0), fill: 'backwards' });
          this._anim = a;
          if (a) {
            try {
              await a.finished;
            } catch {
              return;
            }
            if (this._anim !== a) return;
          }
          this._anim = null;
          this.setAttribute('data-state', 'done');
          this.emit('complete', { effect });
        }
      },
    { id: 'spring', text: css }
  );
}
