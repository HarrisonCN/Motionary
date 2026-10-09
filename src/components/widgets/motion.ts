import { defineElement, type UsaElement } from '../base';
import { bindMotion, parseMotion, type MotionRule } from '../dsl/index';
import css from './motion.css?raw';

/**
 * `<usa-motion rules="enter: fade-up 600ms stagger 80ms; hover: pop">` (9.0)
 * — the declarative motion DSL as an element: its `rules` (the same string
 * as `data-motion`) are bound to it, `stagger` runs them over its children.
 * Changing `rules` re-binds. `rules` / `parsed` properties; `errors` lists
 * what was skipped (unknown trigger, modifier or effect) and `usa:motion-error`
 * fires for each. Layout-neutral (`display: contents` unless styled).
 */
export interface UsaMotionElement extends UsaElement {
  readonly parsed: MotionRule[];
  readonly errors: string[];
}

export function defineMotion(tag = 'usa-motion'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMotion extends Base {
        static get observedAttributes(): string[] {
          return ['rules'];
        }
        private _errors: string[] = [];
        get parsed(): MotionRule[] {
          return parseMotion(this.str('rules')).rules;
        }
        get errors(): string[] {
          return this._errors.slice();
        }
        mount(): void {
          this._errors = [];
          this.onCleanup(
            bindMotion(this, this.str('rules'), (m) => {
              this._errors.push(m);
              this.emit('motion-error', { message: m });
            })
          );
        }
      }
      return UsaMotion as unknown as CustomElementConstructor;
    },
    { id: 'motion', text: css }
  );
}
