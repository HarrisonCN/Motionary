import { defineElement, type UsaElement } from '../base';
import css from './file-drop.css?raw';

/**
 * `<usa-file-drop>` (6.9) — a file drop zone. Dragging files over it lights
 * the zone with marching-ants borders and lifts the icon; dropping (or
 * choosing via the built-in file input — click / Enter / Space) flies each
 * file into a list with a progress bar. Progress is yours to report with
 * `setProgress(index, 0–1)`, or `simulate` fakes it for demos; a finished
 * file draws a check. Attributes `accept`, `multiple`, `label`. Event
 * `usa:files` (`{ files }`). Reduced motion: no ants, lift or fly-in.
 */
export interface UsaFileDropElement extends UsaElement {
  readonly files: File[];
  setProgress(index: number, value: number): void;
  addFiles(files: ArrayLike<File>): void;
  clear(): void;
}

const size = (n: number): string => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);

export function defineFileDrop(tag = 'usa-file-drop'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaFileDrop extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'accept', 'multiple', 'simulate'];
        }
        private _files: File[] = [];
        private _depth = 0;

        get files(): File[] {
          return this._files.slice();
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const label = this.str('label', 'Drop files here or browse');
          this.insertAdjacentHTML('afterbegin', `<div class="usa-fd-zone" data-usa-part role="button" tabindex="0"><svg class="usa-fd-ants" aria-hidden="true"><rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="14"/></svg><span class="usa-fd-icon" aria-hidden="true">⇪</span><span class="usa-fd-label"></span><input type="file" hidden></div><ul class="usa-fd-list" data-usa-part aria-live="polite"></ul>`);
          const zone = this.querySelector('.usa-fd-zone') as HTMLElement;
          (zone.querySelector('.usa-fd-label') as HTMLElement).textContent = label;
          zone.setAttribute('aria-label', label);
          const input = zone.querySelector('input') as HTMLInputElement;
          if (this.str('accept', '')) input.accept = this.str('accept', '');
          input.multiple = this.flag('multiple');
          this.listen(zone, 'click', (e: Event) => e.target !== input && input.click());
          this.listen(zone, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              input.click();
            }
          });
          this.listen(input, 'change', () => input.files && this.addFiles(input.files));
          this.listen(zone, 'dragenter', (e: DragEvent) => {
            e.preventDefault();
            this._depth++;
            this.toggleAttribute('data-over', true);
          });
          this.listen(zone, 'dragover', (e: DragEvent) => e.preventDefault());
          this.listen(zone, 'dragleave', () => {
            this._depth = Math.max(0, this._depth - 1);
            if (!this._depth) this.removeAttribute('data-over');
          });
          this.listen(zone, 'drop', (e: DragEvent) => {
            e.preventDefault();
            this._depth = 0;
            this.removeAttribute('data-over');
            if (e.dataTransfer?.files?.length) this.addFiles(e.dataTransfer.files);
          });
        }

        addFiles(list: ArrayLike<File>): void {
          const ul = this.querySelector('.usa-fd-list') as HTMLElement;
          const files = Array.from(list).slice(0, this.flag('multiple') ? undefined : 1);
          if (!this.flag('multiple')) this.clear();
          const start = this._files.length;
          files.forEach((f, i) => {
            this._files.push(f);
            const li = document.createElement('li');
            li.className = 'usa-fd-item';
            li.innerHTML = '<span class="usa-fd-name"></span><span class="usa-fd-size"></span><span class="usa-fd-bar"><span class="usa-fd-fill"></span></span><svg class="usa-fd-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.8"/></svg>';
            (li.querySelector('.usa-fd-name') as HTMLElement).textContent = f.name;
            (li.querySelector('.usa-fd-size') as HTMLElement).textContent = size(f.size);
            li.setAttribute('aria-label', `${f.name}, ${size(f.size)}`);
            ul.appendChild(li);
            if (!this.reduced) this.motion(li, [{ transform: 'translateY(-28px) scale(.85)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, delay: i * 70, easing: 'cubic-bezier(.2,.9,.3,1.2)', fill: 'backwards' });
          });
          this.emit('files', { files });
          if (this.flag('simulate')) files.forEach((_, i) => this.simulate(start + i));
        }

        private simulate(i: number): void {
          let p = 0;
          const tick = () => {
            if (!this.isConnected) return;
            p = Math.min(1, p + 0.12 + Math.random() * 0.15);
            this.setProgress(i, p);
            if (p < 1) setTimeout(tick, 160);
          };
          setTimeout(tick, 200);
        }

        setProgress(index: number, value: number): void {
          const li = this.querySelectorAll('.usa-fd-item')[index] as HTMLElement | undefined;
          if (!li) return;
          const v = Math.max(0, Math.min(1, value));
          li.style.setProperty('--usa-fd-p', String(v));
          li.toggleAttribute('data-done', v >= 1);
          li.setAttribute('aria-label', `${this._files[index]?.name || ''}, ${Math.round(v * 100)}%`);
        }

        clear(): void {
          this._files = [];
          (this.querySelector('.usa-fd-list') as HTMLElement | null)?.replaceChildren();
        }
      }
      return UsaFileDrop as unknown as CustomElementConstructor;
    },
    { id: 'file-drop', text: css }
  );
}
