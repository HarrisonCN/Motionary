import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { dataNum, formatNumber, ownChildren, tween } from './kit';
import css from './ui-blocks.css?raw';

export type BillingPeriod = 'monthly' | 'yearly';

/**
 * A pricing table with a monthly / yearly switch. Switching rolls each price to its new value and the period suffix
 * crossfades; a featured plan is lifted with a badge. Each element child is one plan:
 * `<div data-name="Pro" data-monthly="12" data-yearly="120" data-featured data-badge="Popular" data-cta="Start Pro">`
 * — its own content (usually a feature list) becomes the plan's body. The switch is a native radio pair; each plan's
 * call to action is a native button.
 *
 * Attributes: `period` (monthly | yearly), `currency` ($), `label` (Billing period), `monthly-label` (Monthly),
 * `yearly-label` (Yearly), `yearly-note` (shown next to Yearly, e.g. "2 months free"), `locale`, `month-unit` (/mo), `year-unit` (/yr).
 * Events `usa:change` ({ period }), `usa:select` ({ plan, period, price }).
 */
export interface UsaPricingElement extends UsaElement {
  period: BillingPeriod;
}

export function definePricing(tag = 'usa-pricing'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Pricing extends Base {
    static get observedAttributes(): string[] { return ['period', 'currency', 'label', 'monthly-label', 'yearly-label', 'yearly-note', 'locale', 'month-unit', 'year-unit']; }
    private _sync?: () => void;
    get period(): BillingPeriod { return this.str('period') === 'yearly' ? 'yearly' : 'monthly'; }
    set period(p: BillingPeriod) { this.setAttribute('period', p === 'yearly' ? 'yearly' : 'monthly'); }
    changed(): void { this._sync?.(); }
    mount(): void {
      const plans = ownChildren(this).slice(0, 6);
      const root = make('div', 'usa-kit usa-price');
      const switcher = make('fieldset', 'usa-price-switch');
      const legend = make('legend', 'usa-sr');
      const group = uniqueId('usa-price');
      const thumb = make('span', 'usa-price-thumb');
      thumb.setAttribute('aria-hidden', 'true');
      const radios = (['monthly', 'yearly'] as const).map((value) => {
        const label = make('label', 'usa-price-opt');
        const input = make('input');
        input.type = 'radio'; input.name = group; input.value = value;
        const text = make('span', 'usa-price-opt-text');
        label.append(input, text);
        if (value === 'yearly') label.append(make('span', 'usa-price-note'));
        switcher.append(label);
        return { input, text, label };
      });
      switcher.append(legend, thumb);
      const grid = make('div', 'usa-price-grid');
      const live = make('p', 'usa-sr');
      live.setAttribute('aria-live', 'polite');
      const cards = plans.map((plan) => {
        const card = make('article', 'usa-price-card');
        const name = plan.dataset.name || 'Plan';
        card.toggleAttribute('data-featured', plan.hasAttribute('data-featured'));
        const head = make('h3', 'usa-price-name', name);
        const badge = plan.hasAttribute('data-featured') ? make('span', 'usa-price-badge', plan.dataset.badge || 'Popular') : null;
        const amount = make('p', 'usa-price-amount');
        const cur = make('span', 'usa-price-cur');
        const num = make('span', 'usa-price-num');
        const per = make('span', 'usa-price-per');
        amount.append(cur, num, per);
        const body = make('div', 'usa-price-body');
        body.append(...Array.from(plan.childNodes));
        const cta = make('button', 'usa-price-cta', plan.dataset.cta || `Choose ${name}`);
        cta.type = 'button';
        card.append(head);
        if (badge) card.append(badge);
        card.append(amount, body, cta);
        grid.append(card);
        const price = (p: BillingPeriod) => Math.max(0, dataNum(plan, p, p === 'yearly' ? dataNum(plan, 'monthly', 0) * 12 : 0));
        return { plan, name, card, num, cur, per, body, cta, price, shown: price(this.period), stop: () => {} };
      });
      root.append(switcher, grid, live);
      this.append(root);
      for (const p of plans) p.remove();
      let lastPeriod: BillingPeriod | '' = '';
      const sync = () => {
        const period = this.period, locale = this.str('locale') || undefined;
        legend.textContent = this.str('label', 'Billing period');
        radios[0].text.textContent = this.str('monthly-label', 'Monthly');
        radios[1].text.textContent = this.str('yearly-label', 'Yearly');
        const note = radios[1].label.querySelector('.usa-price-note')!;
        note.textContent = this.str('yearly-note');
        (note as HTMLElement).hidden = !this.str('yearly-note');
        radios.forEach(({ input }) => (input.checked = input.value === period));
        root.dataset.period = period;
        root.toggleAttribute('data-static', this.reduced);
        for (const c of cards) {
          c.cur.textContent = this.str('currency', '$');
          c.per.textContent = period === 'yearly' ? this.str('year-unit', '/yr') : this.str('month-unit', '/mo');
          const to = c.price(period);
          c.stop();
          const digits = Number.isInteger(to) && Number.isInteger(c.shown) ? 0 : 2;
          c.stop = tween(c.shown, to, lastPeriod && lastPeriod !== period ? 520 : 0, (v) => {
            c.shown = v;
            c.num.textContent = formatNumber(v, digits, locale);
          }, this);
        }
        if (lastPeriod && lastPeriod !== period) live.textContent = `${period === 'yearly' ? radios[1].text.textContent : radios[0].text.textContent} prices shown`;
        lastPeriod = period;
      };
      this._sync = sync;
      this.listen(switcher, 'change', (e: Event) => {
        const value = (e.target as HTMLInputElement).value === 'yearly' ? 'yearly' : 'monthly';
        this.period = value;
        this.emit('change', { period: value });
      });
      this.listen(grid, 'click', (e: Event) => {
        const c = cards.find((x) => x.cta === e.target || x.cta.contains(e.target as Node));
        if (c) this.emit('select', { plan: c.name, period: this.period, price: c.price(this.period) });
      });
      this.onCleanup(() => {
        for (const c of cards) {
          c.stop();
          c.plan.append(...Array.from(c.body.childNodes));
          this.append(c.plan);
        }
        root.remove();
        this._sync = undefined;
      });
      sync();
    }
  }, { id: 'ui-blocks', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
