'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');

var css = "usa-title-sequence{display:block;background:var(--mo-title-bg,#181716);color:var(--mo-title-color,#faf6ed);padding:clamp(1rem,4vw,3rem)}usa-title-sequence summary{font:italic clamp(1.5rem,5vw,3.5rem)/1.15 Georgia,serif;cursor:pointer;padding:.35em 0;border-block-end:1px solid currentColor}usa-title-sequence details>:not(summary){max-width:62ch;line-height:1.55}";

/** Film intertitles. Put a heading in each details/summary and use its body for the credits. */
function defineTitleSequence(tag = 'usa-title-sequence') {
    return base.defineElement(tag, Base => class extends Base {
        mount() {
            this.listen(this, 'toggle', (event) => {
                const card = event.target;
                if (!(card instanceof HTMLDetailsElement) || !card.open || card.parentElement !== this)
                    return;
                for (const sibling of this.querySelectorAll(':scope > details[open]')) {
                    if (sibling !== card)
                        sibling.open = false;
                }
                if (!this.reduced)
                    for (const panel of Array.from(card.children)) {
                        if (panel.tagName !== 'SUMMARY')
                            this.motion(panel, [{ clipPath: 'circle(0%)' }, { clipPath: 'circle(75%)' }], { duration: 420, easing: 'ease-out' });
                    }
            }, { capture: true });
        }
    }, { id: 'title-sequence', text: css });
}

exports.defineTitleSequence = defineTitleSequence;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.3.0/dist/widgets/title-sequence.cjs.map