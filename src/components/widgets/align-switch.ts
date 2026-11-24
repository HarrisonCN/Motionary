import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import css from './moments-ui.css?raw';

export const ALIGNMENTS = ['left', 'center', 'right'] as const;
export type Alignment = typeof ALIGNMENTS[number];

/**
 * A three-way text alignment switch: a thumb slides under the chosen icon and a small preview of lines above it
 * re-aligns with a staggered spring. A native radio group carries the choice, so arrow keys move it.
 *
 * Attributes: `value` (left | center | right, left), `label` (Text alignment), `disabled`.
 * Event `usa:change` ({ value }).
 */
export interface UsaAlignSwitchElement extends UsaElement {
  value: Alignment;
}

const NAMES: Record<Alignment, string> = { left: 'Align left', center: 'Align centre', right: 'Align right' };

export function defineAlignSwitch(tag = 'usa-align-switch'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class AlignSwitch extends Base {
    static get observedAttributes(): string[] { return ['value', 'label', 'disabled']; }
    private _sync?: () => void;
    get value(): Alignment {
      const v = this.str('value', 'left') as Alignment;
      return ALIGNMENTS.includes(v) ? v : 'left';
    }
    set value(v: Alignment) { this.setAttribute('value', String(v)); }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('fieldset', 'usa-moment usa-align');
      const legend = make('legend', 'usa-sr');
      const preview = make('span', 'usa-align-preview');
      preview.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 3; i++) {
        const line = make('i', 'usa-align-line');
        line.style.setProperty('--i', String(i));
        preview.append(line);
      }
      const track = make('span', 'usa-align-track');
      const thumb = make('span', 'usa-align-thumb');
      thumb.setAttribute('aria-hidden', 'true');
      track.append(thumb);
      const group = uniqueId('usa-align');
      const inputs = ALIGNMENTS.map((a) => {
        const option = make('label', 'usa-align-option');
        const input = make('input', 'usa-align-input');
        input.type = 'radio'; input.name = group; input.value = a;
        input.setAttribute('aria-label', NAMES[a]);
        const icon = make('span', 'usa-align-icon');
        icon.dataset.align = a;
        icon.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 3; i++) icon.append(make('i'));
        option.append(input, icon);
        track.append(option);
        return input;
      });
      root.append(legend, preview, track);
      this.append(root);
      const sync = () => {
        const value = this.value;
        legend.textContent = this.str('label', 'Text alignment');
        root.dataset.align = value;
        root.style.setProperty('--at', String(ALIGNMENTS.indexOf(value)));
        inputs.forEach((input) => { input.checked = input.value === value; });
        root.disabled = this.flag('disabled');
        root.toggleAttribute('data-static', this.reduced);
      };
      this._sync = sync;
      this.listen(track, 'change', (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!inputs.includes(input)) return;
        this.value = input.value as Alignment;
        this.emit('change', { value: this.value });
      });
      this.onCleanup(() => { root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
