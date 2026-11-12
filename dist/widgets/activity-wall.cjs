'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');

var css = ".usa-activity-wall{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:var(--usa-wall-gap,40px);overflow:hidden;position:relative;isolation:isolate;padding:var(--usa-wall-padding,24px);background:var(--usa-wall-background,#292929);border-radius:var(--usa-wall-radius,0);height:var(--usa-wall-height,720px);box-sizing:border-box}.usa-activity-wall>[data-column]{display:flex;flex-direction:column;align-items:center;gap:var(--usa-wall-row-gap,36px);min-width:0;transform:translateY(var(--usa-wall-offset,0px));animation:usa-activity-drift var(--usa-wall-speed,40s) linear infinite alternate;animation-play-state:paused}.usa-activity-wall>[data-column]:nth-child(even){--usa-wall-offset:32px;animation-direction:alternate-reverse}.usa-activity-wall[data-wall-animate]>[data-column]{animation-play-state:running}.usa-activity-wall[paused] .usa-activity *{animation-play-state:paused!important}.usa-activity-wall:focus-within>[data-column],.usa-activity-wall:hover>[data-column]{animation-play-state:paused!important}[data-usa-sensitivity=gentle] .usa-activity-wall>[data-column],[data-usa-sensitivity=minimal] .usa-activity-wall>[data-column],[data-usa-sensitivity=static] .usa-activity-wall>[data-column]{animation:none!important;transform:none!important}@keyframes usa-activity-drift{from{transform:translateY(var(--usa-wall-offset,0px))}to{transform:translateY(calc(var(--usa-wall-offset,0px) - 90px))}}@media(prefers-reduced-motion:reduce){.usa-activity-wall>[data-column]{animation:none!important;transform:none!important}}@media(max-width:600px){.usa-activity-wall{gap:14px;padding:14px;grid-auto-columns:minmax(180px,1fr);overflow-x:auto;scroll-snap-type:x proximity}.usa-activity-wall>[data-column]{scroll-snap-align:center}}";

function defineActivityWall(tag = 'usa-activity-wall') {
    const ctor = base.defineElement(tag, Base => {
        class ActivityWall extends Base {
            static get observedAttributes() { return ['paused', 'speed', 'label']; }
            get paused() { return this.flag('paused'); }
            set paused(value) { this.setFlag('paused', value); }
            play() { this.paused = false; }
            pause() { this.paused = true; }
            changed() { this._sync?.(); }
            mount() {
                this.classList.add('usa-activity-wall');
                this.setAttribute('role', 'region');
                let visible = typeof IntersectionObserver === 'undefined', hover = false, focus = false;
                const sync = () => {
                    this.setAttribute('aria-label', this.str('label', 'Live activity collection'));
                    this.style.setProperty('--usa-wall-speed', `${Math.max(1, this.num('speed', 40))}s`);
                    this.toggleAttribute('data-wall-animate', visible && !hover && !focus && !this.paused && !document.hidden && !this.reduced);
                };
                this._sync = sync;
                this.inView(v => { visible = v; sync(); });
                this.listen(this, 'mouseenter', () => { hover = true; sync(); });
                this.listen(this, 'mouseleave', () => { hover = false; sync(); });
                this.listen(this, 'focusin', () => { focus = true; sync(); });
                this.listen(this, 'focusout', (event) => { focus = !!event.relatedTarget && this.contains(event.relatedTarget); sync(); });
                this.listen(document, 'visibilitychange', sync);
                if (typeof matchMedia === 'function')
                    this.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', sync);
                this.onCleanup(() => { this._sync = undefined; this.removeAttribute('data-wall-animate'); });
                sync();
            }
        }
        return ActivityWall;
    }, { id: 'activity-wall', text: css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineActivityWall = defineActivityWall;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/activity-wall.cjs.map