'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var motionKit13 = require('../chunks/motion-kit-13-CQF_2Unb.cjs');

function defineShuffleGrid(tag = 'usa-shuffle-grid') {
    const ctor = base.defineElement(tag, Base => class ShuffleGrid extends Base {
        static get observedAttributes() { return ['interval', 'columns', 'gap', 'pause-label', 'play-label']; }
        shuffle() { this._shuffle?.(); }
        mount() {
            const tiles = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-shuffle');
            root.style.setProperty('--cols', String(Math.max(2, Math.min(10, Math.round(this.num('columns', 4))))));
            root.style.setProperty('--gap', `${Math.max(0, Math.min(60, this.num('gap', 10)))}px`);
            root.toggleAttribute('data-static', this.reduced);
            const grid = moments.make('div', 'usa-shuffle-grid');
            const cells = tiles.map((t) => {
                const cell = moments.make('div', 'usa-shuffle-cell');
                cell.append(t);
                grid.append(cell);
                return cell;
            });
            const toggle = moments.make('button', 'usa-shuffle-toggle');
            toggle.type = 'button';
            root.append(grid);
            if (!this.reduced && cells.length > 1)
                root.append(toggle);
            this.append(root);
            let seed = 1;
            const doShuffle = () => {
                if (cells.length < 2)
                    return;
                const before = kit.measure(cells);
                const next = kit13.shuffleOrder(cells.length, ++seed);
                cells.forEach((c, i) => (c.style.order = String(next[i])));
                kit.flip(before, cells, 620);
                this.emit('shuffle', { order: next.slice() });
            };
            this._shuffle = doShuffle;
            let userPaused = false;
            let hold = false;
            let visible = false;
            const paint = () => {
                toggle.textContent = userPaused ? '▶' : '❚❚';
                toggle.setAttribute('aria-label', userPaused ? this.str('play-label', 'Play') : this.str('pause-label', 'Pause'));
                toggle.setAttribute('aria-pressed', String(userPaused));
            };
            paint();
            const interval = Math.max(800, this.num('interval', 2800));
            let timer = 0;
            if (!this.reduced && cells.length > 1) {
                timer = window.setInterval(() => { if (!userPaused && !hold && visible && !document.hidden)
                    doShuffle(); }, interval);
                this.listen(root, 'pointerenter', () => (hold = true));
                this.listen(root, 'pointerleave', () => (hold = false));
                this.listen(root, 'focusin', () => (hold = true));
                this.listen(root, 'focusout', (e) => { if (!root.contains(e.relatedTarget))
                    hold = false; });
                this.listen(toggle, 'click', () => { userPaused = !userPaused; paint(); });
                this.inView((v) => (visible = v));
            }
            this.onCleanup(() => {
                clearInterval(timer);
                for (const t of tiles)
                    this.append(t);
                root.remove();
                this._shuffle = undefined;
            });
        }
    }, { id: 'motion-kit-13', text: motionKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineShuffleGrid = defineShuffleGrid;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/shuffle-grid.cjs.map