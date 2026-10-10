'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var runtimeLink = require('../chunks/runtime-link-CyExCzuU.cjs');
var registry = require('../chunks/registry-VKfDCYYI.cjs');

var css = "usa-text-splitter{display:block;max-width:100%}usa-text-splitter .usa-split-word{white-space:nowrap}usa-text-splitter .usa-split-char,usa-text-splitter .usa-split-word,usa-text-splitter .usa-split-line{will-change:transform,opacity}usa-text-splitter .usa-rt-missing{margin:0 0 8px;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}";

const FROM = {
    rise: { y: '0.9em', opacity: 0 },
    fade: { opacity: 0 },
    blur: { opacity: 0, filter: 'blur(8px)', scale: 1.3 },
    flip: { rotate: -90, opacity: 0, y: '0.4em' },
    wave: { y: '-0.6em', opacity: 0, scale: 0.6 },
};
const TO = {
    rise: { y: '0em', opacity: 1 },
    fade: { opacity: 1 },
    blur: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    flip: { rotate: 0, opacity: 1, y: '0em' },
    wave: { y: '0em', opacity: 1, scale: 1 },
};
function defineTextSplitter(tag = 'usa-text-splitter') {
    return base.defineElement(tag, (Base) => {
        class UsaTextSplitter extends Base {
            constructor() {
                super(...arguments);
                this.res = null;
                this.anim = null;
            }
            static get observedAttributes() {
                return ['split', 'effect', 'stagger', 'duration', 'loop', 'trigger'];
            }
            pieces() {
                const r = this.res;
                if (!r)
                    return [];
                const by = this.str('split', 'chars');
                return by === 'lines' && r.lines.length ? r.lines : by === 'words' ? r.words : r.chars;
            }
            mount() {
                const tx = runtimeLink.runtimeModule(this, 'text');
                if (!tx)
                    return;
                const by = this.str('split', 'chars');
                this.res = tx.splitText(this, { type: by === 'lines' ? 'words,lines' : by === 'words' ? 'words' : 'chars,words' });
                this.emit('split', { count: this.pieces().length });
                this.onCleanup(() => {
                    this.anim?.kill();
                    this.res?.revert();
                    this.res = null;
                });
                const trig = this.str('trigger', 'view');
                if (trig === 'load')
                    this.replay();
                else if (trig === 'hover')
                    this.listen(this, 'pointerenter', () => this.replay());
                else {
                    this.pieces().forEach((p) => (p.style.opacity = this.reduced ? '' : '0'));
                    this.inView((v) => v && !this.anim && this.replay());
                }
                if (this.flag('loop')) {
                    const id = setInterval(() => this.replay(), Math.max(2500, this.num('duration', 600) + this.num('stagger', 30) * this.pieces().length + 1500));
                    this.onCleanup(() => clearInterval(id));
                }
            }
            replay() {
                const pieces = this.pieces();
                if (!pieces.length)
                    return;
                this.anim?.kill();
                if (this.reduced) {
                    pieces.forEach((p) => (p.style.opacity = ''));
                    this.emit('done');
                    return;
                }
                const core = registry.requireModule('core');
                const fx = FROM[this.str('effect', 'rise')] ? this.str('effect', 'rise') : 'rise';
                this.anim = core.tween(pieces, { from: FROM[fx], to: TO[fx], duration: this.num('duration', 600), stagger: this.num('stagger', 30), ease: fx === 'wave' ? 'back-out' : 'cubic-out', onComplete: () => this.emit('done') });
            }
        }
        return UsaTextSplitter;
    }, { id: 'text-splitter', text: css });
}

exports.defineTextSplitter = defineTextSplitter;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/widgets/text-splitter.cjs.map