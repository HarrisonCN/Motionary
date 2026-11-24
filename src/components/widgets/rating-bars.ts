import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { formatNumber, tween } from './kit';
import { numbers } from './kit-12';
import css from './parts-kit-12.css?raw';

/** Total and average of star counts given from the top star down (`[five, four, three, two, one]`). */
export function ratingSummary(counts: readonly number[]): { total: number; average: number } {
  const n = counts.length;
  let total = 0, sum = 0;
  counts.forEach((c, i) => {
    const v = Number.isFinite(c) && c > 0 ? c : 0;
    total += v;
    sum += v * (n - i);
  });
  return { total, average: total ? Math.round((sum / total) * 10) / 10 : 0 };
}

/**
 * A review summary: the average score counts up beside a row of stars that fill to it, and one bar per star level grows
 * to its share, top to bottom, when the block scrolls into view. Each bar is a button (for "show only 4-star reviews"),
 * reading for example "4 stars: 120 reviews, 31%".
 *
 * Attributes: `values` (counts from the top star down; 5 numbers for a 5-star scale), `label` (Ratings), `reviews-label`
 * (reviews), `stars-label` (stars).
 * Event `usa:select` ({ stars }).
 */
export interface UsaRatingBarsElement extends UsaElement {
  readonly average: number;
}

export function defineRatingBars(tag = 'usa-rating-bars'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class RatingBars extends Base {
    static get observedAttributes(): string[] { return ['values', 'label', 'reviews-label', 'stars-label']; }
    get average(): number { return ratingSummary(numbers(this.str('values'), 10)).average; }
    mount(): void {
      const counts = numbers(this.str('values', '0,0,0,0,0'), 10);
      const top = counts.length || 5;
      const { total, average } = ratingSummary(counts);
      const reviews = this.str('reviews-label', 'reviews'), starsWord = this.str('stars-label', 'stars');
      const root = make('section', 'usa-kit usa-rate');
      root.setAttribute('aria-label', this.str('label', 'Ratings'));
      const head = make('div', 'usa-rate-head');
      const score = make('strong', 'usa-rate-score', '0');
      score.setAttribute('aria-hidden', 'true');
      const stars = make('span', 'usa-rate-stars');
      stars.setAttribute('aria-hidden', 'true');
      stars.style.setProperty('--fill', '0');
      stars.textContent = '★'.repeat(top);
      const sum = make('span', 'usa-rate-sum', `${formatNumber(average, 1)} / ${top} · ${formatNumber(total)} ${reviews}`);
      head.append(score, stars, sum);
      const bars = make('ul', 'usa-rate-bars');
      counts.forEach((c, i) => {
        const level = top - i;
        const pct = total ? Math.round((c / total) * 100) : 0;
        const li = make('li');
        const b = make('button', 'usa-rate-row');
        b.type = 'button';
        b.setAttribute('aria-label', `${level} ${starsWord}: ${formatNumber(c)} ${reviews}, ${pct}%`);
        const track = make('span', 'usa-rate-track');
        const bar = make('i');
        bar.style.setProperty('--w', String(pct / 100));
        bar.style.setProperty('--i', String(i));
        track.append(bar);
        b.append(make('span', 'usa-rate-level', `${level}★`), track, make('span', 'usa-rate-pct', `${pct}%`));
        b.querySelectorAll('span').forEach((s) => s.setAttribute('aria-hidden', 'true'));
        li.append(b);
        bars.append(li);
        this.listen(b, 'click', () => this.emit('select', { stars: level }));
      });
      root.append(head, bars);
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      let stop = () => {};
      let shown = false;
      this.inView((v) => {
        if (!v || shown) return;
        shown = true;
        root.setAttribute('data-in', '');
        stop = tween(0, average, 1000, (x) => {
          score.textContent = formatNumber(x, 1);
          stars.style.setProperty('--fill', String(x / top));
        }, this);
      });
      this.onCleanup(() => { stop(); root.remove(); });
    }
  }, { id: 'parts-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
