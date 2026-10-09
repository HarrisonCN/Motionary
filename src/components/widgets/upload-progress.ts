import { defineElement, clamp, type UsaElement } from '../base';
import css from './upload-progress.css?raw';

/**
 * `<usa-upload-progress>` (7.7) — a file row with an animated progress bar:
 * `name`, `size` (bytes → "2.4 MB"), `value` 0–100 (the bar eases to it and a
 * shine runs over it while uploading), `status` (`uploading` | `done` |
 * `error`; reaching 100 sets `done`). Done → the bar turns into a check that
 * draws itself (`usa:done`); error → the row shakes and shows `message`
 * (`usa:error`) with a Retry button (`usa:retry`). A `role="progressbar"` with
 * value text; reduced motion: no shine, no easing, no shake.
 */
export interface UsaUploadProgressElement extends UsaElement {
  value: number;
  status: 'uploading' | 'done' | 'error';
}

/** 1536 → "1.5 KB", 2_400_000 → "2.3 MB" (7.7). */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '';
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${i === 0 ? Math.round(n) : n < 10 ? n.toFixed(1) : Math.round(n)} ${u[i]}`;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineUploadProgress(tag = 'usa-upload-progress'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaUploadProgress extends Base {
        static get observedAttributes(): string[] {
          return ['name', 'size', 'value', 'status', 'message'];
        }
        private _shown = 0;
        get value(): number {
          return clamp(this.num('value', 0), 0, 100);
        }
        set value(v: number) {
          this.setAttribute('value', String(clamp(Number(v) || 0, 0, 100)));
        }
        get status(): 'uploading' | 'done' | 'error' {
          const s = this.str('status');
          return s === 'error' ? 'error' : s === 'done' || this.value >= 100 ? 'done' : 'uploading';
        }
        set status(s: 'uploading' | 'done' | 'error') {
          this.setAttribute('status', s);
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const name = this.str('name', 'file');
          const size = formatBytes(this.num('size', NaN));
          this.insertAdjacentHTML(
            'beforeend',
            `<div class="usa-up" data-usa-part><span class="usa-up-icon" aria-hidden="true">${esc((name.split('.').pop() || '').slice(0, 4).toUpperCase())}</span><div class="usa-up-main"><div class="usa-up-top"><span class="usa-up-name">${esc(name)}</span><span class="usa-up-pct"></span></div><div class="usa-up-track" role="progressbar" aria-label="Uploading ${esc(name)}" aria-valuemin="0" aria-valuemax="100"><span class="usa-up-fill"></span></div><div class="usa-up-sub"><span class="usa-up-size">${esc(size)}</span><span class="usa-up-msg" aria-live="polite"></span><button type="button" class="usa-up-retry">Retry</button></div></div><svg class="usa-up-ok" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path pathLength="1" d="M7 12.5l3.2 3.2L17 9"/></svg></div>`
          );
          this.listen(this.querySelector('.usa-up-retry') as Element, 'click', () => this.emit('retry', { name }));
          this._shown = 0;
          this.render(true);
        }
        changed(name: string): void {
          if (name === 'name' || name === 'size') return super.changed(name);
          this.render(false);
        }
        private render(first: boolean): void {
          const fill = this.querySelector('.usa-up-fill') as HTMLElement | null;
          if (!fill) return;
          const v = this.value;
          const st = this.status;
          const prevState = this.getAttribute('data-state');
          this.setAttribute('data-state', st);
          const track = this.querySelector('.usa-up-track') as HTMLElement;
          track.setAttribute('aria-valuenow', String(Math.round(v)));
          track.setAttribute('aria-valuetext', st === 'done' ? 'Complete' : st === 'error' ? 'Failed' : `${Math.round(v)}%`);
          (this.querySelector('.usa-up-pct') as HTMLElement).textContent = st === 'done' ? 'Done' : st === 'error' ? '' : `${Math.round(v)}%`;
          (this.querySelector('.usa-up-msg') as HTMLElement).textContent = st === 'error' ? this.str('message', 'Upload failed') : '';
          const from = this._shown;
          const to = st === 'done' ? 100 : v;
          fill.style.transform = `scaleX(${to / 100})`;
          if (!first && !this.reduced && from !== to) this.motion(fill, [{ transform: `scaleX(${from / 100})` }, { transform: `scaleX(${to / 100})` }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
          this._shown = to;
          if (prevState === st) return;
          if (st === 'done' && !first) this.emit('done', { name: this.str('name') });
          if (st === 'error' && !first) {
            if (!this.reduced) this.motion(this.querySelector('.usa-up') as Element, [{ transform: 'none' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 380, easing: 'ease-out' });
            this.emit('error', { name: this.str('name'), message: this.str('message', 'Upload failed') });
          }
        }
      }
      return UsaUploadProgress as unknown as CustomElementConstructor;
    },
    { id: 'upload-progress', text: css }
  );
}
