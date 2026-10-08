import { defineElement, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import css from './disclosure.css?raw';

/**
 * `<usa-disclosure>` (6.2) — accordion 2.0 on native `<details>`: the
 * content springs open / closed (height + fade), the chevron flips with an
 * overshoot. Children: `<details><summary>…</summary>…</details>`.
 * Attributes: `multiple` (allow several open; default: one at a time),
 * `spring` (preset, default `gentle`), `variant="cards"`. API: `openAll()`,
 * `closeAll()`, `toggle(i, force?)`. Events: `usa:toggle` (`{ index, open }`).
 * Native semantics (keyboard, find-in-page) kept. Reduced motion: instant.
 */
export interface UsaDisclosureElement extends UsaElement {
  toggle(i: number, force?: boolean): void;
  openAll(): void;
  closeAll(): void;
}

export function defineDisclosure(tag = 'usa-disclosure'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaDisclosure extends Base {
        private _anims = new WeakMap<HTMLDetailsElement, Animation>();
        get items(): HTMLDetailsElement[] {
          return Array.from(this.children).filter((c): c is HTMLDetailsElement => c.localName === 'details');
        }
        mount(): void {
          this.listen(this, 'click', (e: MouseEvent) => {
            const s = (e.target as Element).closest('summary');
            const d = s?.parentElement as HTMLDetailsElement | null;
            if (!s || !d || d.parentElement !== this) return;
            e.preventDefault();
            this.set(d, !d.open);
          });
        }
        private set(d: HTMLDetailsElement, open: boolean): void {
          if (open && !this.flag('multiple')) for (const o of this.items) if (o !== d && o.open) this.set(o, false);
          if (d.open === open && !this._anims.get(d)) return;
          const summary = d.querySelector('summary');
          const closedH = summary ? summary.offsetHeight : 0;
          const startH = d.offsetHeight;
          this._anims.get(d)?.cancel();
          if (open) d.open = true;
          const endH = open ? d.scrollHeight : closedH;
          const sp = springEasing(this.str('spring', 'gentle'));
          const a = this.reduced ? null : this.motion(d, [{ height: `${startH}px` }, { height: `${endH}px` }], { duration: Math.min(sp.duration, 700), easing: sp.easing, fill: 'forwards' });
          const body = Array.from(d.children).filter((c) => c.localName !== 'summary');
          if (open && !this.reduced) body.forEach((b) => this.motion(b, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 60, easing: 'ease-out' }));
          const done = () => {
            this._anims.delete(d);
            if (!open) d.open = false;
            a?.cancel();
          };
          if (a) {
            this._anims.set(d, a);
            a.finished.then(() => this._anims.get(d) === a && done(), () => undefined);
          } else done();
          this.emit('toggle', { index: this.items.indexOf(d), open });
        }
        toggle(i: number, force?: boolean): void {
          const d = this.items[i];
          if (d) this.set(d, force ?? !d.open);
        }
        openAll(): void {
          this.items.forEach((d) => (d.open = true));
        }
        closeAll(): void {
          this.items.forEach((d) => this.set(d, false));
        }
      }
      return UsaDisclosure as unknown as CustomElementConstructor;
    },
    { id: 'disclosure', text: css }
  );
}
