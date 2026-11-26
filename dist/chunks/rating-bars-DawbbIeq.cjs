'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var kit12 = require('./kit-12-B4H_NaC_.cjs');
var partsKit12 = require('./parts-kit-12-CKE_UdA5.cjs');

/** Total and average of star counts given from the top star down (`[five, four, three, two, one]`). */
function ratingSummary(counts) {
    const n = counts.length;
    let total = 0, sum = 0;
    counts.forEach((c, i) => {
        const v = Number.isFinite(c) && c > 0 ? c : 0;
        total += v;
        sum += v * (n - i);
    });
    return { total, average: total ? Math.round((sum / total) * 10) / 10 : 0 };
}
function defineRatingBars(tag = 'usa-rating-bars') {
    const ctor = base.defineElement(tag, Base => class RatingBars extends Base {
        static get observedAttributes() { return ['values', 'label', 'reviews-label', 'stars-label']; }
        get average() { return ratingSummary(kit12.numbers(this.str('values'), 10)).average; }
        mount() {
            const counts = kit12.numbers(this.str('values', '0,0,0,0,0'), 10);
            const top = counts.length || 5;
            const { total, average } = ratingSummary(counts);
            const reviews = this.str('reviews-label', 'reviews'), starsWord = this.str('stars-label', 'stars');
            const root = moments.make('section', 'usa-kit usa-rate');
            root.setAttribute('aria-label', this.str('label', 'Ratings'));
            const head = moments.make('div', 'usa-rate-head');
            const score = moments.make('strong', 'usa-rate-score', '0');
            score.setAttribute('aria-hidden', 'true');
            const stars = moments.make('span', 'usa-rate-stars');
            stars.setAttribute('aria-hidden', 'true');
            stars.style.setProperty('--fill', '0');
            stars.textContent = '★'.repeat(top);
            const sum = moments.make('span', 'usa-rate-sum', `${kit.formatNumber(average, 1)} / ${top} · ${kit.formatNumber(total)} ${reviews}`);
            head.append(score, stars, sum);
            const bars = moments.make('ul', 'usa-rate-bars');
            counts.forEach((c, i) => {
                const level = top - i;
                const pct = total ? Math.round((c / total) * 100) : 0;
                const li = moments.make('li');
                const b = moments.make('button', 'usa-rate-row');
                b.type = 'button';
                b.setAttribute('aria-label', `${level} ${starsWord}: ${kit.formatNumber(c)} ${reviews}, ${pct}%`);
                const track = moments.make('span', 'usa-rate-track');
                const bar = moments.make('i');
                bar.style.setProperty('--w', String(pct / 100));
                bar.style.setProperty('--i', String(i));
                track.append(bar);
                b.append(moments.make('span', 'usa-rate-level', `${level}★`), track, moments.make('span', 'usa-rate-pct', `${pct}%`));
                b.querySelectorAll('span').forEach((s) => s.setAttribute('aria-hidden', 'true'));
                li.append(b);
                bars.append(li);
                this.listen(b, 'click', () => this.emit('select', { stars: level }));
            });
            root.append(head, bars);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            let stop = () => { };
            let shown = false;
            this.inView((v) => {
                if (!v || shown)
                    return;
                shown = true;
                root.setAttribute('data-in', '');
                stop = kit.tween(0, average, 1000, (x) => {
                    score.textContent = kit.formatNumber(x, 1);
                    stars.style.setProperty('--fill', String(x / top));
                }, this);
            });
            this.onCleanup(() => { stop(); root.remove(); });
        }
    }, { id: 'parts-kit-12', text: partsKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineRatingBars = defineRatingBars;
exports.ratingSummary = ratingSummary;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/rating-bars-DawbbIeq.cjs.map