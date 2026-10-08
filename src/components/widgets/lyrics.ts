import { defineElement, type UsaElement } from '../base';
import { ownChildren } from './shared';
import css from './lyrics.css?raw';

/**
 * `<usa-lyrics>` (7.1) — synced karaoke lyrics. Lines come from `[data-t]`
 * children (start time in seconds) or LRC text (`[mm:ss.xx] line`) in a
 * `<script type="text/plain">` child. Set `time` (s) — or `for` the id of an
 * `<audio>` / `<video>` / `<usa-music-player>` to follow — and the active
 * line glows and scrolls to the centre while a highlight sweeps across it
 * word by word; past lines dim. Click a line to emit `usa:seek` (`{ time }`).
 * Reduced motion: no sweep or smooth scroll — the active line just switches.
 */
export interface UsaLyricsElement extends UsaElement {
  time: number;
  readonly lines: { t: number; text: string }[];
}

/** Parse LRC text into sorted `{ t, text }` lines. */
export function parseLRC(src: string): { t: number; text: string }[] {
  const out: { t: number; text: string }[] = [];
  for (const raw of src.split(/\r?\n/)) {
    const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    const text = raw.replace(/\[[^\]]*\]/g, '').trim();
    for (const m of stamps) out.push({ t: Number(m[1]) * 60 + Number(m[2]), text });
  }
  return out.sort((a, b) => a.t - b.t);
}

export function defineLyrics(tag = 'usa-lyrics'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaLyrics extends Base {
        private _lines: { t: number; text: string }[] = [];
        private _time = 0;
        private _active = -1;
        private _raf = 0;

        get lines(): { t: number; text: string }[] {
          return this._lines.slice();
        }
        get time(): number {
          return this._time;
        }
        set time(v: number) {
          this._time = Math.max(0, Number(v) || 0);
          this.update();
        }

        mount(): void {
          const lrc = this.querySelector(':scope > script[type="text/plain"]');
          if (lrc?.textContent) this._lines = parseLRC(lrc.textContent);
          else this._lines = ownChildren(this).filter((c) => c.hasAttribute('data-t')).map((c) => ({ t: Number(c.dataset.t) || 0, text: c.textContent?.trim() || '' }));
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          ownChildren(this).forEach((c) => c.localName !== 'script' && (c.hidden = true));
          const list = document.createElement('ol');
          list.className = 'usa-ly-list';
          list.setAttribute('data-usa-part', '');
          this._lines.forEach((l, i) => {
            const li = document.createElement('li');
            li.className = 'usa-ly-line';
            li.dataset.i = String(i);
            li.textContent = l.text || '♪';
            list.appendChild(li);
          });
          this.appendChild(list);
          this.setAttribute('role', 'region');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Lyrics'));
          this.listen(list, 'click', (e: Event) => {
            const li = (e.target as HTMLElement).closest?.('.usa-ly-line') as HTMLElement | null;
            if (li) this.emit('seek', { time: this._lines[Number(li.dataset.i)].t });
          });
          this._active = -1;
          const src = this.str('for', '') ? document.getElementById(this.str('for', '')) : null;
          if (src && typeof requestAnimationFrame === 'function') {
            const f = () => {
              const t = (src as unknown as { currentTime?: number }).currentTime;
              if (typeof t === 'number' && Math.abs(t - this._time) > 0.01) this.time = t;
              this._raf = requestAnimationFrame(f);
            };
            this._raf = requestAnimationFrame(f);
            this.onCleanup(() => cancelAnimationFrame(this._raf));
          }
          this.update();
        }

        /** Index of the line playing at `t`. */
        lineAt(t: number): number {
          let i = -1;
          for (let k = 0; k < this._lines.length && this._lines[k].t <= t; k++) i = k;
          return i;
        }

        private update(): void {
          const i = this.lineAt(this._time);
          const items = this.querySelectorAll<HTMLElement>('.usa-ly-line');
          const cur = this._lines[i];
          const next = this._lines[i + 1];
          const k = cur ? Math.min(1, (this._time - cur.t) / Math.max(0.3, (next ? next.t : cur.t + 4) - cur.t)) : 0;
          if (items[i]) items[i].style.setProperty('--usa-ly-k', this.reduced ? '1' : k.toFixed(3));
          if (i === this._active) return;
          this._active = i;
          items.forEach((li, j) => {
            li.toggleAttribute('data-active', j === i);
            li.toggleAttribute('data-past', j < i);
            if (j === i) li.setAttribute('aria-current', 'true');
            else li.removeAttribute('aria-current');
          });
          const list = this.querySelector('.usa-ly-list') as HTMLElement | null;
          const li = items[i];
          if (list && li) {
            const top = li.offsetTop - list.clientHeight / 2 + li.offsetHeight / 2;
            if (typeof list.scrollTo === 'function') list.scrollTo({ top, behavior: this.reduced ? 'auto' : 'smooth' });
            else list.scrollTop = top;
          }
        }
      }
      return UsaLyrics as unknown as CustomElementConstructor;
    },
    { id: 'lyrics', text: css }
  );
}
