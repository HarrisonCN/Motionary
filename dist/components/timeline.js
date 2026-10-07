import { h as defineElement } from '../chunks/base-ZARFccur.js';
export { a as configureComponents, p as prefersReducedMotion } from '../chunks/base-ZARFccur.js';
import { t as timeline, T as TIMELINE_PRESETS } from '../chunks/core-Co-6AL0h.js';
export { r as resolvePosition } from '../chunks/core-Co-6AL0h.js';

var css = "usa-timeline{display:block}usa-timeline[scrub]{position:relative}@media (prefers-reduced-motion:reduce){usa-timeline [data-tl]{opacity:1 !important;transform:none !important;filter:none !important;clip-path:none !important}}";

function defineTimeline(tag = 'usa-timeline') {
    return defineElement(tag, (Base) => class UsaTimeline extends Base {
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
            const tl = (this._tl = timeline({ defaults: { duration: this.num('duration', 600), stagger: this.num('stagger', 0) } }));
            this.querySelectorAll('[data-tl]').forEach((el, i) => {
                if (el.dataset.label)
                    tl.label(el.dataset.label);
                const name = el.dataset.tl || 'fade';
                tl.to(el, TIMELINE_PRESETS[name] ? name : 'fade', {
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
            tl.seek(0);
            const trigger = this.str('trigger', 'view');
            if (trigger === 'click')
                this.listen(this, 'click', () => void this.play());
            else if (trigger === 'view') {
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

export { TIMELINE_PRESETS, defineTimeline, defineTimelineComponents, timeline };
//# sourceMappingURL=timeline.js.map
