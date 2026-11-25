'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit15 = require('../chunks/kit-15-D1Ovwhys.cjs');
var uiKit15 = require('../chunks/ui-kit-15-D2S59TJU.cjs');

function defineComparisonTable(tag = 'usa-comparison-table') {
    const ctor = base.defineElement(tag, Base => class ComparisonTable extends Base {
        constructor() {
            super(...arguments);
            this._diff = false;
        }
        static get observedAttributes() { return ['highlight', 'badge-label', 'diff-label', 'differences', 'label']; }
        get differences() { return this._diff; }
        mount() {
            const table = this.querySelector(':scope > table');
            if (!table)
                return;
            const root = moments.make('div', 'usa-kit usa-ctable');
            root.toggleAttribute('data-static', this.reduced);
            const bar = moments.make('div', 'usa-ctable-bar');
            const toggle = moments.make('button', 'usa-ctable-diff');
            toggle.type = 'button';
            toggle.append(moments.make('span', 'usa-ctable-switch'), moments.make('span', '', this.str('diff-label', 'Only differences')));
            bar.append(toggle);
            const scroller = moments.make('div', 'usa-ctable-scroll');
            scroller.tabIndex = 0;
            scroller.setAttribute('role', 'region');
            scroller.setAttribute('aria-label', this.str('label') || table.caption?.textContent?.trim() || 'Comparison');
            table.before(root);
            scroller.append(table);
            root.append(bar, scroller);
            table.classList.add('usa-ctable-table');
            const undo = [];
            // yes / no cells
            for (const cell of Array.from(table.querySelectorAll('tbody td'))) {
                const mark = kit15.cellMark(cell.textContent || '');
                if (!mark || cell.children.length)
                    continue;
                const text = cell.textContent || '';
                const icon = moments.make('span', 'usa-ctable-mark', mark === 'yes' ? '✓' : '✕');
                icon.setAttribute('aria-hidden', 'true');
                const sr = moments.make('span', 'usa-kit-sr', text.trim());
                cell.dataset.mark = mark;
                cell.replaceChildren(icon, sr);
                undo.push(() => { cell.textContent = text; delete cell.dataset.mark; });
            }
            // the highlighted column
            const col = Math.round(this.num('highlight', 0));
            if (col > 0) {
                for (const tr of Array.from(table.rows)) {
                    const cell = tr.cells[col];
                    if (!cell)
                        continue;
                    cell.dataset.highlight = '';
                    undo.push(() => delete cell.dataset.highlight);
                }
                const head = table.tHead?.rows[0]?.cells[col] || table.rows[0]?.cells[col];
                if (head) {
                    const badge = moments.make('span', 'usa-ctable-badge', this.str('badge-label', 'Popular'));
                    head.append(badge);
                    undo.push(() => badge.remove());
                }
            }
            const body = Array.from(table.tBodies).flatMap((b) => Array.from(b.rows));
            const same = body.filter((tr) => tr.cells.length > 2 && !kit15.rowDiffers(Array.from(tr.cells).map((c) => c.textContent || '')));
            const wasHidden = same.map((tr) => tr.hidden);
            const set = (on, tell) => {
                this._diff = on;
                toggle.setAttribute('aria-pressed', String(on));
                same.forEach((tr, i) => { tr.hidden = on || wasHidden[i]; });
                root.toggleAttribute('data-differences', on);
                if (tell)
                    this.emit('filter', { differences: on, hidden: on ? same.length : 0 });
            };
            set(this.flag('differences'), false);
            toggle.disabled = !same.length;
            this.listen(toggle, 'click', () => set(!this._diff, true));
            this.onCleanup(() => {
                same.forEach((tr, i) => { tr.hidden = wasHidden[i]; });
                undo.reverse().forEach((f) => f());
                table.classList.remove('usa-ctable-table');
                if (!table.className)
                    table.removeAttribute('class');
                root.replaceWith(table);
                this._diff = false;
            });
        }
    }, { id: 'ui-kit-15', text: uiKit15.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineComparisonTable = defineComparisonTable;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/comparison-table.cjs.map