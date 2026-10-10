'use strict';

var base = require('../chunks/base-vu_KhBiv.cjs');
var shared = require('../chunks/shared-Bf72wLyt.cjs');

var css = "usa-stories{display:block;position:relative;overflow:hidden;border-radius:var(--usa-radius,16px);background:#111;color:#fff;aspect-ratio:9/14;max-height:520px;user-select:none;-webkit-user-select:none;touch-action:manipulation}usa-stories>:not([data-usa-part]){position:absolute;inset:0;opacity:0;transition:opacity .35s ease,transform .5s cubic-bezier(.22,1,.36,1);transform:scale(1.04);pointer-events:none;box-sizing:border-box}usa-stories>[data-active]:not([data-usa-part]){opacity:1;transform:none;pointer-events:auto}usa-stories>img:not([data-usa-part]){width:100%;height:100%;object-fit:cover}.usa-stories-bars{position:absolute;z-index:3;top:8px;left:8px;right:48px;display:flex;gap:4px}.usa-stories-bar{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.35);overflow:hidden}.usa-stories-bar>i{display:block;height:100%;width:100%;background:#fff;transform-origin:left;transform:scaleX(0)}.usa-stories-bar[data-done]>i{transform:scaleX(1)}.usa-stories-toggle{position:absolute;z-index:3;top:2px;right:6px;width:36px;height:30px;border:0;background:none;color:#fff;font:700 14px/1 system-ui;cursor:pointer;border-radius:8px}.usa-stories-toggle:focus-visible{outline:2px solid #fff}@media (prefers-reduced-motion:reduce){usa-stories>*{transition:none!important;transform:none!important}}";

function defineStories(tag = 'usa-stories') {
    return base.defineElement(tag, (Base) => {
        class UsaStories extends Base {
            constructor() {
                super(...arguments);
                this._i = 0;
                this._items = [];
                this._bars = [];
                this._fill = null;
                this._btn = null;
            }
            static get observedAttributes() {
                return ['duration', 'loop'];
            }
            get index() {
                return this._i;
            }
            mount() {
                shared.dropParts(this);
                this._items = shared.ownChildren(this);
                const bars = shared.part('div', 'usa-stories-bars', { 'aria-hidden': 'true' });
                this._bars = this._items.map(() => {
                    const b = shared.part('div', 'usa-stories-bar', {}, '<i></i>');
                    bars.append(b);
                    return b;
                });
                this._btn = shared.part('button', 'usa-stories-toggle', { type: 'button' });
                this.listen(this._btn, 'click', (e) => {
                    e.stopPropagation();
                    this.hasAttribute('paused') ? this.play() : this.pause();
                });
                this.append(bars, this._btn);
                this.setAttribute('role', 'region');
                this.setAttribute('aria-roledescription', 'stories');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', 'Stories');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (this.reduced)
                    this.setAttribute('paused', '');
                let held = false;
                let downAt = 0;
                this.listen(this, 'pointerdown', (e) => {
                    if (e.target.closest('button,a'))
                        return;
                    downAt = performance.now();
                    held = !this.hasAttribute('paused');
                    if (held)
                        this._fill?.pause();
                });
                this.listen(this, 'pointerup', (e) => {
                    if (e.target.closest('button,a') || !downAt)
                        return;
                    const long = performance.now() - downAt > 350;
                    downAt = 0;
                    if (held && !this.hasAttribute('paused'))
                        this._fill?.play();
                    if (long)
                        return;
                    const r = this.getBoundingClientRect();
                    e.clientX - r.left < r.width / 3 ? this.prev() : this.next();
                });
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'ArrowRight')
                        this.next();
                    else if (e.key === 'ArrowLeft')
                        this.prev();
                    else if (e.key === ' ')
                        (e.preventDefault(), this.hasAttribute('paused') ? this.play() : this.pause());
                });
                this.onCleanup(() => this._fill?.cancel());
                this.goTo(Math.min(this._i, Math.max(0, this._items.length - 1)), true);
            }
            label() {
                if (this._btn) {
                    const p = this.hasAttribute('paused');
                    this._btn.textContent = p ? '▶' : '❚❚';
                    this._btn.setAttribute('aria-label', p ? 'Play stories' : 'Pause stories');
                }
            }
            goTo(i, initial = false) {
                const n = this._items.length;
                if (!n)
                    return;
                if (i >= n && !this.flag('loop')) {
                    this.emit('end');
                    this.pause();
                    return;
                }
                const t = ((i % n) + n) % n;
                const changed = t !== this._i || initial;
                this._i = t;
                this._items.forEach((s, k) => {
                    s.toggleAttribute('data-active', k === t);
                    s.setAttribute('aria-hidden', String(k !== t));
                });
                this._bars.forEach((b, k) => b.toggleAttribute('data-done', k < t));
                this._fill?.cancel();
                const fillEl = this._bars[t]?.firstElementChild;
                this._fill = fillEl ? fillEl.animate?.([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: Math.max(800, this.num('duration', 5000)), fill: 'forwards' }) ?? null : null;
                if (this._fill) {
                    const a = this._fill;
                    a.onfinish = () => this._fill === a && this.goTo(this._i + 1);
                    if (this.hasAttribute('paused'))
                        a.pause();
                }
                this.label();
                if (changed && !initial)
                    this.emit('change', { index: t });
            }
            next() {
                this.goTo(this._i + 1);
            }
            prev() {
                this.goTo(Math.max(0, this._i - 1));
            }
            pause() {
                this.setAttribute('paused', '');
                this._fill?.pause();
                this.label();
            }
            play() {
                this.removeAttribute('paused');
                if (this._fill?.playState === 'finished')
                    this.goTo(this._i + 1 >= this._items.length ? 0 : this._i + 1);
                else
                    this._fill?.play();
                this.label();
            }
        }
        return UsaStories;
    }, { id: 'stories', text: css });
}

exports.defineStories = defineStories;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/widgets/stories.cjs.map