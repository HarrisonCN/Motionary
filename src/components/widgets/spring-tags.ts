import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { feedback } from '../interaction/micro';
import { hostSprings, tick } from './micro-kit-16';
import { addTags, parseTags } from './spring-kit-17';
import css from './spring-kit-17.css?raw';

const SVG = 'http://www.w3.org/2000/svg';

/**
 * A tag field where every chip is a spring: new tags pop in, removed ones shrink away, and a duplicate makes the
 * chip that already has it shake. Enter, comma or a paste with commas adds tags; Backspace in the empty field
 * first marks the last chip and then removes it. Each chip's × button removes it, and every change is announced.
 *
 * Attributes: `value` (comma-separated tags), `label` (accessible name; Tags), `placeholder` (Add a tag…), `max`
 * (most tags), `max-length` (characters per tag; 40), `name` (adds a hidden input with the comma-joined tags),
 * `disabled`, `feel`, `haptics`.
 * Events: `usa:change` ({ tags, added, removed }), `usa:reject` ({ text, reason: 'duplicate' | 'full' }).
 */
export interface UsaSpringTagsElement extends UsaElement {
  tags: string[];
  addTag(text: string): string[];
  removeTag(index: number): void;
}

export function defineSpringTags(tag = 'usa-spring-tags'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringTags extends Base {
    static get observedAttributes(): string[] {
      return ['value', 'label', 'placeholder', 'max', 'max-length', 'name', 'disabled', 'feel', 'haptics'];
    }
    private _tags: string[] = [];
    private _seen?: string | null;
    private _api: { add(t: string): string[]; remove(i: number): void; set(t: string[]): void } | null = null;
    get tags(): string[] {
      return this._tags.slice();
    }
    set tags(v: string[]) {
      const list = Array.isArray(v) ? v.map(String) : parseTags(String(v ?? ''));
      if (this._api) this._api.set(list);
      else this._tags = addTags([], list.join(',')).tags;
    }
    addTag(text: string): string[] {
      return this._api ? this._api.add(text) : [];
    }
    removeTag(index: number): void {
      this._api?.remove(index);
    }
    mount(): void {
      const max = this.num('max', Infinity);
      const maxLength = this.num('max-length', 40);
      const attr = this.getAttribute('value');
      if (attr !== this._seen) {
        this._seen = attr;
        this._tags = addTags([], attr ?? '', max, maxLength).tags;
      }
      const disabled = this.flag('disabled');
      const label = this.str('label', 'Tags');
      const root = make('div', 'usa-skit usa-stags');
      root.toggleAttribute('data-disabled', disabled);
      const list = make('ul', 'usa-stags-list');
      list.setAttribute('aria-label', label);
      const input = make('input', 'usa-stags-input');
      input.type = 'text';
      input.disabled = disabled;
      input.placeholder = this.str('placeholder', 'Add a tag…');
      input.setAttribute('aria-label', label);
      input.enterKeyHint = 'enter';
      root.append(list, input);
      const meta = make('span', 'usa-skit usa-stags-meta');
      meta.setAttribute('aria-live', 'polite');
      const hidden = this.str('name') ? make('input') : null;
      if (hidden) {
        hidden.type = 'hidden';
        hidden.name = this.str('name');
      }
      this.append(root, meta, ...(hidden ? [hidden] : []));

      type Chip = { el: HTMLLIElement; text: string; key: string };
      let chips: Chip[] = [];
      let seq = 0;
      const springs = new Map<string, { el: HTMLElement; out: boolean }>();
      const group = hostSprings(this, {}, (v) => {
        for (const [k, c] of springs) {
          const s = v[k];
          if (s === undefined) continue;
          c.el.style.transform = `scale(${Math.round(Math.max(0, s) * 1000) / 1000})`;
          c.el.style.opacity = String(Math.round(Math.min(1, Math.max(0, s)) * 100) / 100);
        }
      }, {
        onRest: () => {
          for (const [k, c] of [...springs]) if (c.out && group.get(k) <= 0.01) {
            c.el.remove();
            springs.delete(k);
          }
        },
      });
      const sync = () => {
        if (hidden) hidden.value = this._tags.join(',');
        meta.textContent = '';
      };
      const chip = (text: string, pop: boolean): Chip => {
        const key = `t${++seq}`;
        const li = make('li', 'usa-stags-chip');
        li.append(make('span', 'usa-stags-text', text));
        const x = make('button', 'usa-stags-x');
        x.type = 'button';
        x.disabled = disabled;
        x.setAttribute('aria-label', `Remove ${text}`);
        const svg = document.createElementNS(SVG, 'svg');
        svg.setAttribute('viewBox', '0 0 12 12');
        svg.setAttribute('aria-hidden', 'true');
        const p = document.createElementNS(SVG, 'path');
        p.setAttribute('d', 'M2 2l8 8M10 2l-8 8');
        svg.append(p);
        x.append(svg);
        li.append(x);
        list.append(li);
        const c = { el: li, text, key };
        springs.set(key, { el: li, out: false });
        group.jump({ [key]: pop ? 0.3 : 1 });
        if (pop) group.set({ [key]: 1 }, { spring: 'pop' });
        else group.set({ [key]: 1 }, { spring: 'instant' });
        return c;
      };
      const render = () => {
        list.textContent = '';
        springs.clear();
        chips = this._tags.map((t) => chip(t, false));
        sync();
      };
      render();
      const reject = (text: string, reason: 'duplicate' | 'full', at = -1) => {
        if (at >= 0 && chips[at]) {
          chips[at].el.setAttribute('data-dup', '');
          feedback(chips[at].el, 'shake', { feel: this.str('feel') || undefined });
          const el = chips[at].el;
          setTimeout(() => el.removeAttribute('data-dup'), 700);
        } else feedback(root, 'shake', { feel: this.str('feel') || undefined });
        tick(this, [10, 50, 10]);
        meta.textContent = reason === 'duplicate' ? `${text} is already added` : 'No more tags can be added';
        this.emit('reject', { text, reason });
      };
      const add = (raw: string): string[] => {
        const r = addTags(this._tags, raw, max, maxLength);
        if (r.added.length) {
          this._tags = r.tags;
          for (const t of r.added) chips.push(chip(t, true));
          sync();
          meta.textContent = `Added ${r.added.join(', ')}`;
          tick(this, 6);
          this.emit('change', { tags: this._tags.slice(), added: r.added, removed: [] });
        }
        if (r.duplicate >= 0 && !r.added.length) reject(parseTags(raw)[0] ?? raw, 'duplicate', r.duplicate);
        else if (r.full) reject(raw, 'full');
        return r.added;
      };
      const remove = (i: number) => {
        const c = chips[i];
        if (!c) return;
        chips.splice(i, 1);
        this._tags.splice(i, 1);
        const s = springs.get(c.key);
        if (s) s.out = true;
        c.el.setAttribute('aria-hidden', 'true');
        c.el.querySelector('button')?.setAttribute('tabindex', '-1');
        group.set({ [c.key]: 0 }, { spring: 'snappy' });
        if (!group.animating) {
          c.el.remove();
          springs.delete(c.key);
        }
        sync();
        meta.textContent = `Removed ${c.text}`;
        this.emit('change', { tags: this._tags.slice(), added: [], removed: [c.text] });
      };
      this._api = {
        add,
        remove,
        set: (t) => {
          this._tags = addTags([], t.join(','), max, maxLength).tags;
          render();
        },
      };
      this.listen(list, 'click', (e: MouseEvent) => {
        const x = (e.target as Element).closest?.('.usa-stags-x');
        if (!x || disabled) return;
        const i = chips.findIndex((c) => c.el.contains(x));
        remove(i);
        input.focus();
      });
      this.listen(root, 'click', (e: MouseEvent) => {
        if (e.target === root) input.focus();
      });
      let armed = false;
      this.listen(input, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
          if (e.isComposing) return;
          e.preventDefault();
          if (input.value.trim()) {
            if (add(input.value).length || !parseTags(input.value).length) input.value = '';
          }
          return;
        }
        if (e.key === 'Backspace' && !input.value && chips.length) {
          e.preventDefault();
          const last = chips[chips.length - 1];
          if (!armed) {
            armed = true;
            last.el.setAttribute('data-dup', '');
            feedback(last.el, 'nudge', { feel: this.str('feel') || undefined });
            meta.textContent = `Press Backspace again to remove ${last.text}`;
          } else {
            armed = false;
            remove(chips.length - 1);
          }
          return;
        }
        if (armed) {
          armed = false;
          chips[chips.length - 1]?.el.removeAttribute('data-dup');
        }
      });
      this.listen(input, 'paste', (e: ClipboardEvent) => {
        const text = e.clipboardData?.getData('text') ?? '';
        if (!/[,\n，]/.test(text)) return;
        e.preventDefault();
        add(text);
      });
      this.listen(input, 'blur', () => {
        if (armed) {
          armed = false;
          chips[chips.length - 1]?.el.removeAttribute('data-dup');
        }
      });
      this.onCleanup(() => {
        group.stop();
        root.remove();
        meta.remove();
        hidden?.remove();
        this._api = null;
      });
    }
  }, { id: 'spring-kit-17', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
