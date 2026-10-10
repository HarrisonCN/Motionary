import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { playEffect, bindEffect, EFFECT_TRIGGERS, registerEffects } from '../chunks/registry-CYojuxi5.js';
export { EFFECT_KINDS, getEffect, hasEffect, listEffects, registerEffect } from '../chunks/registry-CYojuxi5.js';
import { B as BUILTIN_EFFECTS } from '../chunks/builtins-Simwbnqg.js';
import '../chunks/core-BOCM9zD5.js';
import './tokens.js';
import '../chunks/fx-DUteojZx.js';

function defineFx(tag = 'usa-fx') {
    return defineElement(tag, (Base) => class UsaFx extends Base {
        static get observedAttributes() {
            return ['effect', 'trigger', 'options', 'self', 'once'];
        }
        get target() {
            return this.flag('self') ? this : (this.firstElementChild || this);
        }
        opts() {
            try {
                return JSON.parse(this.str('options', '{}')) || {};
            }
            catch {
                return {};
            }
        }
        play() {
            return playEffect(this.target, this.str('effect', 'pop'), this.opts()).catch(() => undefined);
        }
        mount() {
            if (!this.style.display)
                this.style.display = 'inline-block';
            const name = this.str('effect', 'pop');
            const t = this.str('trigger', 'click');
            try {
                this.onCleanup(bindEffect(this.target, name, { ...this.opts(), trigger: EFFECT_TRIGGERS.includes(t) ? t : 'click', once: this.flag('once') }));
                this.removeAttribute('data-unknown');
            }
            catch {
                this.setAttribute('data-unknown', name); // not registered (yet)
            }
        }
    });
}

/**
 * motionary/components/fx — unified plugin-style effects (5.0).
 * `registerEffect({ name, kind, run })`, `playEffect(el, name)`,
 * `bindEffect(el, name, { trigger })`, `<usa-fx effect trigger>`. Built-ins:
 * every timeline preset (`enter`), `pulse` · `pop` · `jelly` · `wiggle` ·
 * `heartbeat` · `bounce` · `flash` · `tada` · `shake` (attention),
 * `burst` · `confetti` · `ripple` (click). More packs: `motionary/components/effects`.
 */
/** Register the built-in effects (idempotent; `defineFxComponents()` calls it). */
function registerBuiltinEffects() {
    registerEffects(BUILTIN_EFFECTS);
}
/** Register every component of this category under its default tag (+ the built-in effects). */
function defineFxComponents() {
    registerBuiltinEffects();
    defineFx();
}

export { BUILTIN_EFFECTS, EFFECT_TRIGGERS, bindEffect, defineFx, defineFxComponents, playEffect, registerBuiltinEffects, registerEffects };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.1.0/dist/components/fx.js.map