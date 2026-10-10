'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var registry = require('../chunks/registry-BB1oO-lR.cjs');
var builtins = require('../chunks/builtins-Cz3iufK6.cjs');
require('../chunks/core-KIvPGg0c.cjs');
require('./tokens.cjs');
require('../chunks/fx-BaPAanPW.cjs');

function defineFx(tag = 'usa-fx') {
    return base.defineElement(tag, (Base) => class UsaFx extends Base {
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
            return registry.playEffect(this.target, this.str('effect', 'pop'), this.opts()).catch(() => undefined);
        }
        mount() {
            if (!this.style.display)
                this.style.display = 'inline-block';
            const name = this.str('effect', 'pop');
            const t = this.str('trigger', 'click');
            try {
                this.onCleanup(registry.bindEffect(this.target, name, { ...this.opts(), trigger: registry.EFFECT_TRIGGERS.includes(t) ? t : 'click', once: this.flag('once') }));
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
    registry.registerEffects(builtins.BUILTIN_EFFECTS);
}
/** Register every component of this category under its default tag (+ the built-in effects). */
function defineFxComponents() {
    registerBuiltinEffects();
    defineFx();
}

exports.EFFECT_KINDS = registry.EFFECT_KINDS;
exports.EFFECT_TRIGGERS = registry.EFFECT_TRIGGERS;
exports.bindEffect = registry.bindEffect;
exports.getEffect = registry.getEffect;
exports.hasEffect = registry.hasEffect;
exports.listEffects = registry.listEffects;
exports.playEffect = registry.playEffect;
exports.registerEffect = registry.registerEffect;
exports.registerEffects = registry.registerEffects;
exports.BUILTIN_EFFECTS = builtins.BUILTIN_EFFECTS;
exports.defineFx = defineFx;
exports.defineFxComponents = defineFxComponents;
exports.registerBuiltinEffects = registerBuiltinEffects;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.5.0/dist/components/fx.cjs.map