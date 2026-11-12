'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');

var css = ":is(usa-file-tree,mo-file-tree){display:block;font:inherit}:is(usa-file-tree,mo-file-tree) details{padding-inline-start:1em;border-inline-start:1px solid currentColor}:is(usa-file-tree,mo-file-tree) summary{cursor:pointer;padding-block:.3em}:is(usa-file-tree,mo-file-tree) a{display:block;width:fit-content;margin-inline-start:1.1em;padding-block:.2em}";

/** A nested file index. Use native details/summary for folders and links for files. */
function defineFileTree(tag = 'usa-file-tree') {
    const ctor = base.defineElement(tag, Base => class extends Base {
        mount() {
            this.listen(this, 'keydown', (event) => {
                const item = event.target;
                if (!(item instanceof HTMLElement) || !item.matches('summary, a[href]') ||
                    item.closest(this.localName) !== this || event.altKey || event.ctrlKey || event.metaKey)
                    return;
                const folder = item.closest('details');
                if (!folder || !this.contains(folder))
                    return;
                if (event.key === 'ArrowRight' && item.tagName === 'SUMMARY') {
                    event.preventDefault();
                    if (!folder.open)
                        folder.open = true;
                    else
                        folder.querySelector(':scope > :not(summary) :is(summary,a[href]), :scope > a[href]')?.focus();
                }
                else if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    if (item.tagName === 'SUMMARY' && folder.open)
                        folder.open = false;
                    else {
                        const parent = item.tagName === 'SUMMARY' ? folder.parentElement?.closest('details') : folder;
                        if (parent && this.contains(parent))
                            parent.querySelector(':scope > summary')?.focus();
                    }
                }
            });
        }
    }, { id: 'file-tree', text: css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineFileTree = defineFileTree;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/file-tree.cjs.map