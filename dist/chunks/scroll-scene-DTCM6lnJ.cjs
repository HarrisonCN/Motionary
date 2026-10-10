'use strict';

var base = require('./base-vu_KhBiv.cjs');
var runtimeLink = require('./runtime-link-Bq9F9pt8.cjs');
var registry = require('./registry-IdH145NL.cjs');

var css = "usa-scroll-scene{display:block;position:relative;max-width:100%;box-sizing:border-box}usa-scroll-scene [data-scrub]{will-change:transform,opacity}usa-scroll-scene .usa-rt-missing{margin:0 0 8px;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}";

/** 'opacity: 0 -> 1; x: -80 -> 0' → [{ from: { opacity: '0', x: '-80' }, to: {...} }] */
function parseScrub(spec) {
    const from = {}, to = {};
    for (const part of spec.split(';')) {
        const m = /^\s*([\w-]+)\s*:\s*([^>]+?)\s*->\s*(.+?)\s*$/.exec(part);
        if (!m)
            continue;
        const k = m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        from[k] = m[2];
        to[k] = m[3];
    }
    return { from, to };
}
function defineScrollScene(tag = 'usa-scroll-scene') {
    return base.defineElement(tag, (Base) => {
        class UsaScrollScene extends Base {
            constructor() {
                super(...arguments);
                this.scene = null;
                this.tl = null;
                // 13.1.0: `pin` wraps this element in a spacer (and unwraps it on kill) — that move fires disconnected / connected,
                // which tore the half-built scene down without killing it and mounted a second one inside the first (44 scenes and
                // their scroll / resize listeners leaked per re-mount). Moves made by the scene itself are ignored.
                this._moving = false;
            }
            static get observedAttributes() {
                return ['start', 'end', 'scrub', 'pin', 'markers', 'stagger', 'toggle-class', 'preview'];
            }
            moving(fn) {
                this._moving = true;
                try {
                    return fn();
                }
                finally {
                    this._moving = false;
                }
            }
            connectedCallback() {
                if (!this._moving)
                    Base.prototype.connectedCallback.call(this);
            }
            disconnectedCallback() {
                if (!this._moving)
                    Base.prototype.disconnectedCallback.call(this);
            }
            get progress() {
                return this.scene?.progress ?? 0;
            }
            timeline() {
                return this.tl;
            }
            refresh() {
                this.scene?.refresh();
            }
            mount() {
                const sc = runtimeLink.runtimeModule(this, 'scroll');
                const core = sc && registry.requireModule('core'); // registered by use(scroll)
                if (!sc || !core)
                    return;
                const items = Array.from(this.querySelectorAll('[data-scrub]'));
                const stagger = this.num('stagger', 0);
                const tl = core.timeline({ paused: true });
                items.forEach((el, i) => {
                    const { from, to } = parseScrub(el.dataset.scrub || '');
                    tl.add(new core.Tween(el, { from, to, duration: Math.max(100, 1000 - stagger * (items.length - 1)), ease: this.reduced ? 'linear' : 'cubic-out', paused: true }), stagger * i);
                });
                tl.seek(0);
                this.tl = tl;
                const scrubAttr = this.getAttribute('scrub');
                const scrub = scrubAttr === null ? false : scrubAttr === '' || scrubAttr === 'true' ? true : Number(scrubAttr) || true;
                const canScroll = document.documentElement.scrollHeight > innerHeight + 2;
                if (this.flag('preview') && !canScroll) {
                    if (!this.reduced) {
                        const loop = core.timeline({ repeat: -1, yoyo: true, paused: true }).add(tl, 0);
                        loop.play();
                        this.onCleanup(() => loop.kill());
                    }
                    else
                        tl.progress = 1;
                    this.setAttribute('data-preview', '');
                    return;
                }
                // 13.1.0: an invalid start / end attribute falls back to the documented default (it threw and leaked the scene)
                const edge = (name, d) => {
                    const v = this.str(name, d);
                    try {
                        sc.resolveRule(v, 0, 0, 0);
                        return v;
                    }
                    catch {
                        console.warn(`[motionary] <${this.localName}>: invalid ${name}="${v}" — using "${d}"`);
                        return d;
                    }
                };
                this.scene = this.moving(() => sc.scrollScene({
                    trigger: this,
                    start: edge('start', 'top 85%'),
                    end: /^\s*\+=/.test(this.str('end')) ? this.str('end') : edge('end', 'bottom 35%'),
                    scrub,
                    pin: this.flag('pin'),
                    markers: this.flag('markers'),
                    toggleClass: this.str('toggle-class') || undefined,
                    animation: tl,
                    onEnter: () => this.emit('enter'),
                    onLeave: () => this.emit('leave'),
                    onUpdate: (s) => this.emit('progress', { progress: s.progress }),
                }));
                this.onCleanup(() => {
                    const scene = this.scene;
                    if (scene)
                        this.moving(() => scene.kill());
                    this.scene = null;
                    tl.kill();
                });
            }
        }
        return UsaScrollScene;
    }, { id: 'scroll-scene', text: css });
}

exports.defineScrollScene = defineScrollScene;
exports.parseScrub = parseScrub;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/chunks/scroll-scene-DTCM6lnJ.cjs.map