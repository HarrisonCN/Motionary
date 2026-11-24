import { f as defineElement, I as queryAttr, r as raf, b as caf } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { o as ownChildren, c as cleanColor } from './kit-DugHPVcq.js';
import { c as css } from './motion-kit-BZDRzzob.js';

/** Index of the section whose box spans the line `line` px from the viewport top (the last one above it otherwise). */
function sectionAt(tops, line) {
    let at = 0;
    for (let i = 0; i < tops.length; i++)
        if (tops[i] <= line)
            at = i;
    return at;
}
function defineScrollBg(tag = 'usa-scroll-bg') {
    const ctor = defineElement(tag, Base => class ScrollBg extends Base {
        constructor() {
            super(...arguments);
            this._index = -1;
        }
        static get observedAttributes() { return ['target', 'line']; }
        get index() { return Math.max(0, this._index); }
        mount() {
            const sections = ownChildren(this);
            const target = queryAttr(this.str('target') || null) ?? this;
            const was = { bg: target.style.backgroundColor, fg: target.style.color, cls: target.classList.contains('usa-sbg') };
            target.classList.add('usa-sbg');
            target.toggleAttribute('data-sbg-static', this.reduced);
            const line = Math.min(1, Math.max(0, this.num('line', 0.5)));
            let pending = 0;
            this._index = -1;
            const update = () => {
                pending = 0;
                if (!sections.length)
                    return;
                const i = sectionAt(sections.map((s) => s.getBoundingClientRect().top), window.innerHeight * line);
                if (i === this._index)
                    return;
                this._index = i;
                const bg = cleanColor(sections[i].dataset.bg || ''), fg = cleanColor(sections[i].dataset.fg || '');
                target.style.backgroundColor = bg;
                target.style.color = fg;
                this.emit('change', { index: i, color: bg });
            };
            const queue = () => { if (!pending)
                pending = raf(update, this); };
            this.listen(window, 'scroll', queue, { passive: true });
            this.listen(window, 'resize', queue, { passive: true });
            this.onCleanup(() => {
                if (pending)
                    caf(pending);
                target.style.backgroundColor = was.bg;
                target.style.color = was.fg;
                if (!was.cls)
                    target.classList.remove('usa-sbg');
                target.removeAttribute('data-sbg-static');
                if (!target.className)
                    target.removeAttribute('class');
                if (!target.getAttribute('style'))
                    target.removeAttribute('style');
            });
            update();
        }
    }, { id: 'motion-kit', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineScrollBg as d, sectionAt as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/scroll-bg-DPoFf5QF.js.map