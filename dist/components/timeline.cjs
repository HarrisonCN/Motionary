'use strict';

var base = require('../chunks/base-CXx7jZ-o.cjs');
var core = require('../chunks/core-DXqZm5Il.cjs');

var css = "usa-timeline{display:block}usa-timeline[scrub]{position:relative}@media (prefers-reduced-motion:reduce){usa-timeline [data-tl]{opacity:1 !important;transform:none !important;filter:none !important;clip-path:none !important}}";

function defineTimeline(tag = 'usa-timeline') {
    return base.defineElement(tag, (Base) => class UsaTimeline extends Base {
        constructor() {
            super(...arguments);
            this._tl = null;
        }
        static get observedAttributes() {
            return ['scrub', 'trigger', 'overlap'];
        }
        get timeline() {
            return this._tl;
        }
        play() {
            return this._tl ? this._tl.play(0).then(() => void this.emit('complete')) : Promise.resolve();
        }
        reverse() {
            return this._tl ? this._tl.reverse() : Promise.resolve();
        }
        seek(to) {
            this._tl?.seek(to);
        }
        mount() {
            const overlap = this.num('overlap', 0);
            const tl = (this._tl = core.timeline({ defaults: { duration: this.num('duration', 600), stagger: this.num('stagger', 0) } }));
            this.querySelectorAll('[data-tl]').forEach((el, i) => {
                if (el.dataset.label)
                    tl.label(el.dataset.label);
                const name = el.dataset.tl || 'fade';
                tl.to(el, core.TIMELINE_PRESETS[name] ? name : 'fade', {
                    at: el.dataset.at ?? (i && overlap ? `-=${overlap}` : undefined),
                    duration: el.dataset.duration ? Number(el.dataset.duration) : undefined,
                });
            });
            this.onCleanup(() => tl.cancel());
            if (this.reduced) {
                tl.seek(tl.duration);
                return;
            }
            if (this.flag('scrub')) {
                this.onCleanup(tl.scrub(this, { smooth: 0.2 }));
                return;
            }
            const trigger = this.str('trigger', 'view');
            if (trigger === 'click') {
                // 4.0.1: show the finished composition until the first click
                // (it used to sit invisible at t=0); Enter / Space replay it too.
                tl.seek(tl.duration);
                this.listen(this, 'click', () => void this.play());
                this.listen(this, 'keydown', (e) => {
                    if (e.target === this && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        void this.play();
                    }
                });
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                return;
            }
            tl.seek(0);
            if (trigger === 'view') {
                let played = false;
                this.inView((v) => {
                    if (v && (!played || this.flag('repeat'))) {
                        played = true;
                        void this.play();
                    }
                    else if (!v && this.flag('repeat'))
                        tl.seek(0);
                }, { threshold: 0.2 });
            }
        }
        unmount() {
            this._tl = null;
        }
    }, { id: 'timeline', text: css });
}

/**
 * use-scroll-animate/components/timeline — choreography (v3.1).
 * `timeline()` chains, overlaps, labels, seeks, reverses and scroll-scrubs
 * WAAPI animations on one playhead; `<usa-timeline>` builds one from
 * `data-tl` children.
 */
/** Register every component of this category under its default tag. */
function defineTimelineComponents() {
    defineTimeline();
}

exports.configureComponents = base.configureComponents;
exports.prefersReducedMotion = base.prefersReducedMotion;
exports.TIMELINE_PRESETS = core.TIMELINE_PRESETS;
exports.resolvePosition = core.resolvePosition;
exports.timeline = core.timeline;
exports.defineTimeline = defineTimeline;
exports.defineTimelineComponents = defineTimelineComponents;
//# sourceMappingURL=timeline.cjs.map
