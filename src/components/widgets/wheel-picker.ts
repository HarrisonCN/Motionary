import { defineElement, raf, caf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { wheelIndex, wheelTilt } from './kit-13';
import css from './ui-kit-13.css?raw';

/**
 * Drum-style wheels like a phone's time picker, built from the native `select` children (one wheel per select). Each
 * wheel scrolls and snaps to a row, the rows lean back in 3D the further they are from the centre, and the select
 * underneath is kept in sync, so forms and `change` listeners keep working. Each wheel is a `spinbutton`: arrow keys,
 * Page Up / Down, Home and End move it, and its value is read out. Clicking a row picks it.
 *
 * Attributes: `label` (Picker), `rows` (visible rows, odd, 3–9; 5).
 * Event `usa:change` ({ index, values }) where `index` is the wheel that moved and `values` the selected values.
 */
export interface UsaWheelPickerElement extends UsaElement {
  readonly values: string[];
}

export function defineWheelPicker(tag = 'usa-wheel-picker'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class WheelPicker extends Base {
    static get observedAttributes(): string[] { return ['label', 'rows']; }
    private _selects: HTMLSelectElement[] = [];
    get values(): string[] { return this._selects.map((s) => s.value); }
    mount(): void {
      const selects = (this._selects = Array.from(this.querySelectorAll<HTMLSelectElement>(':scope select')));
      const root = make('div', 'usa-kit usa-wheel');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Picker'));
      const rows = Math.max(3, Math.min(9, Math.round(this.num('rows', 5)) | 1));
      root.style.setProperty('--rows', String(rows));
      root.toggleAttribute('data-static', this.reduced);
      const hiddenWas = selects.map((s) => s.hidden);
      const tabWas = selects.map((s) => s.getAttribute('tabindex'));
      const frames: number[] = [];
      const wheels = selects.map((sel, w) => {
        sel.hidden = true;
        sel.tabIndex = -1;
        const opts = Array.from(sel.options);
        const col = make('div', 'usa-wheel-col');
        const view = make('div', 'usa-wheel-view');
        view.setAttribute('role', 'spinbutton');
        view.tabIndex = 0;
        const lab = sel.getAttribute('aria-label') || (sel.labels?.[0]?.textContent ?? '').trim() || sel.name || `${w + 1}`;
        view.setAttribute('aria-label', lab);
        view.setAttribute('aria-valuemin', '0');
        view.setAttribute('aria-valuemax', String(Math.max(0, opts.length - 1)));
        view.id = uniqueId('usa-wheel');
        const list = make('div', 'usa-wheel-list');
        list.setAttribute('aria-hidden', 'true');
        const items = opts.map((o, i) => {
          const it = make('div', 'usa-wheel-item', o.textContent || o.value);
          it.dataset.i = String(i);
          if (o.disabled) it.setAttribute('data-disabled', '');
          list.append(it);
          return it;
        });
        view.append(list);
        col.append(view);
        return { sel, opts, view, list, items, current: Math.max(0, sel.selectedIndex) };
      });
      const band = make('div', 'usa-wheel-band');
      band.setAttribute('aria-hidden', 'true');
      root.append(...wheels.map((w) => w.view.parentElement as HTMLElement), band);
      this.append(root);
      const rowH = (w: (typeof wheels)[number]) => w.items[0]?.offsetHeight || 36;
      const paint = (w: (typeof wheels)[number]) => {
        const h = rowH(w);
        const pos = w.view.scrollTop / h;
        w.items.forEach((it, i) => {
          const off = i - pos;
          it.style.transform = this.reduced ? '' : `rotateX(${-wheelTilt(off)}deg)`;
          it.style.opacity = String(Math.max(0.15, 1 - Math.abs(off) * 0.28));
          it.toggleAttribute('data-on', i === w.current);
        });
      };
      const set = (wi: number, i: number, scroll = true, fire = true) => {
        const w = wheels[wi];
        let k = Math.max(0, Math.min(w.opts.length - 1, i));
        // skip disabled options in the direction of travel
        const dir = k >= w.current ? 1 : -1;
        while (w.opts[k]?.disabled && k + dir >= 0 && k + dir < w.opts.length) k += dir;
        if (w.opts[k]?.disabled) return;
        const changed = k !== w.current || w.sel.selectedIndex !== k;
        w.current = k;
        w.view.setAttribute('aria-valuenow', String(k));
        w.view.setAttribute('aria-valuetext', w.opts[k]?.textContent || w.opts[k]?.value || '');
        if (scroll) w.view.scrollTo?.({ top: k * rowH(w), behavior: this.reduced ? 'auto' : 'smooth' });
        if (scroll && !w.view.scrollTo) w.view.scrollTop = k * rowH(w);
        paint(w);
        if (changed && fire) {
          w.sel.selectedIndex = k;
          w.sel.dispatchEvent(new Event('input', { bubbles: true }));
          w.sel.dispatchEvent(new Event('change', { bubbles: true }));
          this.emit('change', { index: wi, values: this.values });
        }
      };
      wheels.forEach((w, wi) => {
        let settle = 0;
        this.listen(w.view, 'scroll', () => {
          if (frames[wi]) caf(frames[wi]);
          frames[wi] = raf(() => { frames[wi] = 0; paint(w); }, this);
          clearTimeout(settle);
          settle = window.setTimeout(() => {
            const k = wheelIndex(w.view.scrollTop, rowH(w), w.opts.length);
            if (k !== w.current) set(wi, k, Math.abs(w.view.scrollTop - k * rowH(w)) > 1);
          }, 90);
        }, { passive: true });
        this.onCleanup(() => clearTimeout(settle));
        this.listen(w.list, 'click', (e: MouseEvent) => {
          const it = (e.target as Element).closest?.('.usa-wheel-item') as HTMLElement | null;
          if (it) { set(wi, Number(it.dataset.i)); w.view.focus({ preventScroll: true }); }
        });
        this.listen(w.view, 'keydown', (e: KeyboardEvent) => {
          const page = Math.max(1, Math.floor(rows / 2));
          const map: Record<string, number> = { ArrowDown: w.current + 1, ArrowUp: w.current - 1, PageDown: w.current + page, PageUp: w.current - page, Home: 0, End: w.opts.length - 1 };
          if (!(e.key in map)) return;
          e.preventDefault();
          set(wi, map[e.key]);
        });
        this.listen(w.sel, 'change', () => { if (w.sel.selectedIndex !== w.current) set(wi, w.sel.selectedIndex, true, false); });
        set(wi, w.current, false, false);
        w.view.scrollTop = w.current * rowH(w);
        paint(w);
      });
      this.onCleanup(() => {
        frames.forEach((f) => f && caf(f));
        root.remove();
        selects.forEach((s, i) => {
          s.hidden = hiddenWas[i];
          if (tabWas[i] === null) s.removeAttribute('tabindex'); else s.setAttribute('tabindex', tabWas[i] as string);
        });
      });
    }
  }, { id: 'ui-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
