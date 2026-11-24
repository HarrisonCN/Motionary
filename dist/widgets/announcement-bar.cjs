'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-D8ZWl5Wc.cjs');
var uiBlocks = require('../chunks/ui-blocks-DKqRP2UQ.cjs');

function defineAnnouncementBar(tag = 'usa-announcement-bar') {
    const ctor = base.defineElement(tag, Base => class AnnouncementBar extends Base {
        constructor() {
            super(...arguments);
            this._index = 0;
        }
        static get observedAttributes() { return ['interval', 'dismissible', 'label', 'close-label', 'tone']; }
        get index() { return this._index; }
        dismiss() { this._dismiss?.(); }
        next() { this._go?.(this._index + 1); }
        previous() { this._go?.(this._index - 1); }
        mount() {
            const msgs = kit.ownChildren(this);
            const root = moments.make('section', 'usa-kit usa-ann');
            root.setAttribute('aria-label', this.str('label', 'Announcements'));
            root.dataset.tone = ['accent', 'warning'].includes(this.str('tone')) ? this.str('tone') : 'neutral';
            const track = moments.make('div', 'usa-ann-track');
            const slides = msgs.map((m, i) => {
                const s = moments.make('div', 'usa-ann-msg');
                s.append(m);
                s.hidden = i !== 0;
                track.append(s);
                return s;
            });
            root.append(track);
            const rotating = msgs.length > 1;
            let paused = false, hold = false, timer = 0;
            const pauseBtn = moments.make('button', 'usa-ann-btn usa-ann-pause');
            pauseBtn.type = 'button';
            if (rotating)
                root.append(pauseBtn);
            const close = moments.make('button', 'usa-ann-btn usa-ann-close');
            close.type = 'button';
            close.setAttribute('aria-label', this.str('close-label', 'Dismiss'));
            close.append(moments.make('span', 'usa-ann-x'));
            if (this.flag('dismissible'))
                root.append(close);
            this.append(root);
            root.toggleAttribute('data-static', this.reduced);
            const show = (i) => {
                if (!slides.length)
                    return;
                const n = slides.length, to = ((i % n) + n) % n, from = this._index;
                if (to === from)
                    return;
                this._index = to;
                const dir = i > from ? 1 : -1;
                const a = slides[from], b = slides[to];
                b.hidden = false;
                if (this.reduced)
                    a.hidden = true;
                else {
                    this.motion(b, [{ transform: `translateY(${dir * 100}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
                    const out = this.motion(a, [{ transform: 'none', opacity: 1 }, { transform: `translateY(${-dir * 100}%)`, opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
                    if (out)
                        out.finished.then(() => (a.hidden = this._index !== from), () => { });
                    else
                        a.hidden = true;
                }
                this.emit('change', { index: to });
            };
            this._go = show;
            const schedule = () => {
                clearTimeout(timer);
                if (!rotating || paused || hold)
                    return;
                const ms = Math.min(20000, Math.max(2500, this.num('interval', 5000)));
                timer = window.setTimeout(() => { show(this._index + 1); schedule(); }, ms);
            };
            const syncPause = () => {
                pauseBtn.setAttribute('aria-label', paused ? 'Play announcements' : 'Pause announcements');
                pauseBtn.setAttribute('aria-pressed', String(paused));
                root.toggleAttribute('data-paused', paused);
            };
            this.listen(pauseBtn, 'click', () => { paused = !paused; syncPause(); schedule(); });
            const holdOn = () => { hold = true; clearTimeout(timer); };
            const holdOff = () => { hold = root.matches(':hover') || root.contains(document.activeElement); schedule(); };
            this.listen(root, 'pointerenter', holdOn);
            this.listen(root, 'pointerleave', holdOff);
            this.listen(root, 'focusin', holdOn);
            this.listen(root, 'focusout', () => setTimeout(holdOff));
            this._dismiss = () => {
                clearTimeout(timer);
                const done = () => { this.hidden = true; this.emit('dismiss'); };
                const h = root.offsetHeight;
                const a = this.reduced ? null : this.motion(root, [{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' }], { duration: 320, easing: 'cubic-bezier(.4,0,.2,1)' });
                if (a)
                    a.finished.then(done, done);
                else
                    done();
            };
            this.listen(close, 'click', () => this._dismiss?.());
            this.inView((visible) => { hold = !visible || root.matches(':hover'); schedule(); });
            this.onCleanup(() => {
                clearTimeout(timer);
                this.append(...msgs);
                root.remove();
                this._go = this._dismiss = undefined;
                this._index = 0;
            });
            syncPause();
            schedule();
        }
    }, { id: 'ui-blocks', text: uiBlocks.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineAnnouncementBar = defineAnnouncementBar;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/announcement-bar.cjs.map