import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { list } from './kit';
import { copyText } from './kit-12';
import css from './ui-kit-12.css?raw';

export const SHARE_TARGETS = ['copy', 'x', 'linkedin', 'facebook', 'email'] as const;
export type ShareTarget = (typeof SHARE_TARGETS)[number];

const NAMES: Record<ShareTarget, string> = { copy: 'Copy link', x: 'X', linkedin: 'LinkedIn', facebook: 'Facebook', email: 'Email' };
const ICONS: Record<ShareTarget, string> = {
  copy: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  x: '<path d="M4 4l16 16M20 4 4 20"/>',
  linkedin: '<path d="M5 9v11M5 5v.5M10 20v-6a3 3 0 0 1 6 0v6M10 9v11"/>',
  facebook: '<path d="M15 4h-2a3 3 0 0 0-3 3v13M7 11h7"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
};

/** The address that shares `url` (and `title`) on `target`; `''` for copy or an unknown target or a non-http(s) url. */
export function shareUrl(target: string, url: string, title = ''): string {
  if (!/^https?:\/\//i.test(url)) return '';
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  switch (target) {
    case 'x': return `https://x.com/intent/post?url=${u}${title ? `&text=${t}` : ''}`;
    case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'email': return `mailto:?subject=${t}&body=${u}`;
    default: return '';
  }
}

/**
 * A share button. Pressing it fans out a row of targets on a spring (copy link, X, LinkedIn, Facebook, email); the
 * targets are ordinary links that open the network's own share page, and "Copy link" copies the address and draws a
 * tick. With `native`, devices that have the Web Share sheet use it instead. Esc or a click outside folds the row back.
 *
 * Attributes: `url` (this page), `share-title` (the document title), `targets` (copy, x, linkedin, email), `label` (Share),
 * `copied-label` (Link copied), `native`.
 * Events `usa:open`, `usa:close`, `usa:share` ({ target }).
 */
export interface UsaShareButtonElement extends UsaElement {
  readonly open: boolean;
  toggle(force?: boolean): void;
}

export function defineShareButton(tag = 'usa-share-button'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ShareButton extends Base {
    static get observedAttributes(): string[] { return ['url', 'share-title', 'targets', 'label', 'copied-label', 'native']; }
    private _open = false;
    private _toggle?: (force?: boolean) => void;
    get open(): boolean { return this._open; }
    toggle(force?: boolean): void { this._toggle?.(force); }
    mount(): void {
      const url = this.str('url') || (typeof location !== 'undefined' ? location.href : '');
      const title = this.str('share-title') || (typeof document !== 'undefined' ? document.title : '');
      const wanted = list(this.str('targets', 'copy, x, linkedin, email')).filter((t): t is ShareTarget => (SHARE_TARGETS as readonly string[]).includes(t));
      const root = make('div', 'usa-kit usa-share');
      const main = make('button', 'usa-share-main');
      main.type = 'button';
      main.setAttribute('aria-expanded', 'false');
      main.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/></svg>';
      main.append(make('span', 'usa-share-text', this.str('label', 'Share')));
      const row = make('div', 'usa-share-row');
      row.id = `usa-share-${Math.random().toString(36).slice(2, 8)}`;
      main.setAttribute('aria-controls', row.id);
      const live = make('span', 'usa-kit-sr');
      live.setAttribute('role', 'status');
      const items = wanted.map((t, i) => {
        const href = shareUrl(t, url, title);
        const el = t === 'copy' || !href ? make('button', 'usa-share-item') : make('a', 'usa-share-item');
        if (el instanceof HTMLButtonElement) el.type = 'button';
        else {
          (el as HTMLAnchorElement).href = href;
          if (t !== 'email') { (el as HTMLAnchorElement).target = '_blank'; (el as HTMLAnchorElement).rel = 'noopener noreferrer'; }
        }
        el.style.setProperty('--i', String(i));
        el.dataset.target = t;
        el.setAttribute('aria-label', NAMES[t]);
        el.title = NAMES[t];
        el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[t]}</svg>`;
        row.append(el);
        return el;
      });
      root.append(main, row, live);
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      const set = (open: boolean) => {
        if (open === this._open) return;
        this._open = open;
        root.toggleAttribute('data-open', open);
        main.setAttribute('aria-expanded', String(open));
        for (const el of items) el.tabIndex = open ? 0 : -1;
        this.emit(open ? 'open' : 'close');
      };
      this._toggle = (force) => set(force ?? !this._open);
      for (const el of items) el.tabIndex = -1;
      this.listen(main, 'click', async () => {
        const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
        if (this.flag('native') && typeof nav.share === 'function') {
          try {
            await nav.share({ url, title });
            this.emit('share', { target: 'native' });
          } catch { /* dismissed */ }
          return;
        }
        set(!this._open);
        if (this._open) items[0]?.focus();
      });
      let back = 0;
      for (const el of items) {
        this.listen(el, 'click', async () => {
          const t = el.dataset.target as ShareTarget;
          if (t === 'copy') {
            if (!(await copyText(url))) return;
            el.setAttribute('data-done', '');
            live.textContent = this.str('copied-label', 'Link copied');
            clearTimeout(back);
            back = window.setTimeout(() => { el.removeAttribute('data-done'); live.textContent = ''; }, 1600);
          }
          this.emit('share', { target: t });
        });
      }
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this._open) { e.preventDefault(); set(false); main.focus(); }
      });
      this.listen(document, 'pointerdown', (e: Event) => { if (this._open && !this.contains(e.target as Node)) set(false); });
      this.onCleanup(() => {
        clearTimeout(back);
        root.remove();
        this._open = false;
        this._toggle = undefined;
      });
    }
  }, { id: 'ui-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
