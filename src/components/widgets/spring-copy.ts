import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { micro, type MicroHandle } from '../interaction/micro';
import { hostSprings, tick } from './micro-kit-16';
import css from './spring-kit-17.css?raw';

const SVG = 'http://www.w3.org/2000/svg';
const ICONS = {
  copy: 'M9 9h10v11H9zM5 15V4h10',
  ok: 'M5 12.5l4.5 4.5L19 7.5',
  bad: 'M7 7l10 10M17 7L7 17',
};

/**
 * A copy-to-clipboard button: the copy icon springs away and a tick pops in when the text is on the clipboard, or
 * the button shakes with a cross when the browser refuses. The outcome is announced and it springs back after a
 * moment. Copies `text`, or the text of the element named by `for` (an id), or of its own `code` preview.
 *
 * Attributes: `text`, `for` (id of an element whose text or value is copied), `label` (Copy), `copied-label`
 * (Copied), `failed-label` (Couldn't copy), `show-text` (shows the text in a code style), `reset` (ms; 1600),
 * `fx` (micro behaviours; press hover focus), `disabled`, `feel`, `haptics`.
 * Events: `usa:copy` ({ ok, text }).
 */
export interface UsaSpringCopyElement extends UsaElement {
  copy(): Promise<boolean>;
}

const icon = (d: string) => {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(SVG, 'path');
  p.setAttribute('d', d);
  svg.append(p);
  return svg;
};

export function defineSpringCopy(tag = 'usa-spring-copy'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringCopy extends Base {
    static get observedAttributes(): string[] {
      return ['text', 'for', 'label', 'copied-label', 'failed-label', 'show-text', 'reset', 'fx', 'disabled', 'feel', 'haptics'];
    }
    private _copy: (() => Promise<boolean>) | null = null;
    copy(): Promise<boolean> {
      return this._copy ? this._copy() : Promise.resolve(false);
    }
    mount(): void {
      const btn = make('button', 'usa-skit usa-scopy');
      btn.type = 'button';
      btn.disabled = this.flag('disabled');
      const icons = make('span', 'usa-scopy-icons');
      const copyIcon = icon(ICONS.copy);
      const okIcon = icon(ICONS.ok);
      const badIcon = icon(ICONS.bad);
      icons.append(copyIcon, okIcon, badIcon);
      const label = this.str('label', 'Copy');
      const text = make('span', this.flag('show-text') ? 'usa-scopy-code' : 'usa-scopy-label');
      const source = () => {
        const id = this.str('for');
        const el = id ? this.ownerDocument.getElementById(id) : null;
        if (el) return 'value' in el && typeof (el as HTMLInputElement).value === 'string' ? (el as HTMLInputElement).value : el.textContent ?? '';
        return this.str('text');
      };
      text.textContent = this.flag('show-text') ? source() : label;
      if (this.flag('show-text')) btn.setAttribute('aria-label', `${label}: ${source()}`);
      btn.append(icons, text);
      const live = make('span', 'usa-skit-sr');
      live.setAttribute('aria-live', 'polite');
      this.append(btn, live);
      const handle: MicroHandle = micro(btn, this.str('fx', 'press hover focus'), { feel: this.str('feel') || undefined, haptics: this.flag('haptics') });
      const group = hostSprings(this, { c: 1, o: 0, x: 0 }, (v) => {
        copyIcon.style.transform = `scale(${Math.round(Math.max(0, v.c) * 1000) / 1000}) rotate(${Math.round((1 - Math.min(1, v.c)) * -40)}deg)`;
        const o = Math.max(0, v.o);
        okIcon.style.transform = `scale(${Math.round(o * 1000) / 1000})`;
        badIcon.style.transform = `scale(${Math.round(Math.max(0, v.x) * 1000) / 1000})`;
      });
      let timer: ReturnType<typeof setTimeout> | undefined;
      const settle = (state: 'ok' | 'bad') => {
        clearTimeout(timer);
        btn.dataset.state = state;
        group.set({ c: 0 }, { spring: 'snappy' });
        group.jump({ o: 0, x: 0 });
        group.set(state === 'ok' ? { o: 1, x: 0 } : { o: 0, x: 1 }, { spring: 'pop' });
        live.textContent = state === 'ok' ? this.str('copied-label', 'Copied') : this.str('failed-label', "Couldn't copy");
        if (!this.flag('show-text')) text.textContent = live.textContent;
        handle.feedback(state === 'ok' ? 'pop' : 'shake');
        tick(this, state === 'ok' ? 10 : [10, 50, 10]);
        const reset = this.num('reset', 1600);
        if (reset > 0)
          timer = setTimeout(() => {
            delete btn.dataset.state;
            group.set({ c: 1, o: 0, x: 0 }, { spring: 'bouncy' });
            if (!this.flag('show-text')) text.textContent = label;
          }, reset);
      };
      this._copy = async () => {
        const value = source();
        let ok = false;
        try {
          if (!value) throw new Error('[motionary] nothing to copy');
          await navigator.clipboard.writeText(value);
          ok = true;
        } catch {
          ok = false;
        }
        settle(ok ? 'ok' : 'bad');
        this.emit('copy', { ok, text: value });
        return ok;
      };
      this.listen(btn, 'click', () => {
        if (!btn.disabled) void this._copy?.();
      });
      this.onCleanup(() => {
        clearTimeout(timer);
        group.stop();
        handle.destroy();
        btn.remove();
        live.remove();
        this._copy = null;
      });
    }
  }, { id: 'spring-kit-17', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
