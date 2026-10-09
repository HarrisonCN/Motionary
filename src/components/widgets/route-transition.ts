import { defineElement, type UsaElement } from '../base';
import css from './route-transition.css?raw';

/**
 * `<usa-route-transition effect="slide" cross-document>` (10.3, View
 * Transitions 2.0) — a route container: same-origin link clicks (and
 * `[data-to]` buttons) swap its content with the matching element of the
 * target page (fetched) or of an inline `<template data-route="/about">`,
 * animated with the View Transitions API when available (`engine="auto"`),
 * or with the Web Animations fallback (`engine="waapi"`). Elements with
 * `data-shared="hero"` morph between routes (shared-element transitions via
 * `view-transition-name`). `cross-document` opts the whole site into native
 * cross-document (MPA) view transitions. `effect` (fade | slide | zoom),
 * `selector` (element to take from fetched pages, default this element's
 * id), `history` (push | replace | off). `navigate(url)`, `current`;
 * `usa:navigate` (cancelable), `usa:navigated`.
 */
export interface UsaRouteTransitionElement extends UsaElement {
  navigate(url: string, opts?: { history?: 'push' | 'replace' | 'off' }): Promise<boolean>;
  readonly current: string;
}

const KF: Record<string, [Keyframe[], Keyframe[]]> = {
  fade: [[{ opacity: 1 }, { opacity: 0 }], [{ opacity: 0 }, { opacity: 1 }]],
  slide: [[{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-24px)' }], [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }]],
  zoom: [[{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }]],
};
let crossDocDone = false;

export function defineRouteTransition(tag = 'usa-route-transition'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaRouteTransition extends Base {
        static get observedAttributes(): string[] {
          return ['effect', 'engine', 'cross-document'];
        }
        private cur = '';
        get current(): string {
          return this.cur;
        }
        private shared(root: ParentNode = this): void {
          root.querySelectorAll<HTMLElement>('[data-shared]').forEach((el) => ((el.style as any).viewTransitionName = `usa-${el.dataset.shared}`));
        }
        mount(): void {
          this.cur = this.str('current', typeof location !== 'undefined' ? location.pathname : '/');
          if (this.flag('cross-document') && !crossDocDone && typeof document !== 'undefined') {
            crossDocDone = true;
            const st = document.createElement('style');
            st.dataset.usaRoute = '';
            st.textContent = '@view-transition{navigation:auto}';
            document.head.appendChild(st);
          }
          this.shared();
          const scopeAll = this.str('links', 'inside') === 'document';
          const onClick = (e: MouseEvent) => {
            const t = e.target as Element;
            const btn = t.closest?.('[data-to]') as HTMLElement | null;
            if (btn && this.contains(btn)) {
              e.preventDefault();
              this.navigate(btn.dataset.to!, { history: 'off' });
              return;
            }
            const a = t.closest?.('a[href]') as HTMLAnchorElement | null;
            if (!a || (!scopeAll && !this.contains(a)) || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.dataset.noRoute !== undefined) return;
            const u = new URL(a.href, location.href);
            if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
            e.preventDefault();
            this.navigate(u.pathname + u.search);
          };
          this.listen(scopeAll ? document : this, 'click', onClick);
          this.listen(window, 'popstate', () => {
            if (this.str('history', 'push') !== 'off') this.navigate(location.pathname + location.search, { history: 'off' });
          });
        }
        private async content(url: string): Promise<{ html: string; title?: string } | null> {
          const tpl = Array.from(this.querySelectorAll<HTMLTemplateElement>('template[data-route]')).find((t) => t.dataset.route === url);
          if (tpl) return { html: tpl.innerHTML };
          if (typeof fetch !== 'function') return null;
          const res = await fetch(url, { headers: { accept: 'text/html' } });
          if (!res.ok) return null;
          const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
          const sel = this.str('selector') || (this.id ? `#${this.id}` : this.localName);
          const el = doc.querySelector(sel);
          return el ? { html: el.innerHTML, title: doc.title } : null;
        }
        async navigate(url: string, opts: { history?: 'push' | 'replace' | 'off' } = {}): Promise<boolean> {
          if (!this.emit('navigate', { url, from: this.cur })) return false;
          const next = await this.content(url);
          if (!next) {
            if (!this.querySelector(`template[data-route="${url}"]`) && typeof location !== 'undefined' && /^\//.test(url) && opts.history !== 'off') location.assign(url);
            return false;
          }
          const templates = Array.from(this.querySelectorAll('template[data-route]'));
          const swap = () => {
            this.innerHTML = next.html;
            templates.forEach((t) => this.appendChild(t));
            this.shared();
            if (next.title) document.title = next.title;
          };
          const hist = opts.history || this.str('history', 'push');
          if (hist !== 'off' && typeof history !== 'undefined') history[hist === 'replace' ? 'replaceState' : 'pushState']({ usaRoute: url }, '', url);
          const engine = this.str('engine', 'auto');
          const fx = KF[this.str('effect', 'fade')] || KF.fade;
          const vt = (document as any).startViewTransition;
          if (this.reduced) swap();
          else if (engine !== 'waapi' && typeof vt === 'function') await vt.call(document, swap).finished.catch(() => undefined);
          else {
            const out = this.motion(this, fx[0], { duration: 160, easing: 'ease-in', fill: 'forwards' });
            // never wait longer than the exit animation: `finished` can stall (background tabs, test DOMs, cancelled effects)
            if (out) await Promise.race([out.finished.catch(() => undefined), new Promise((r) => setTimeout(r, 200))]);
            swap();
            out?.cancel();
            this.motion(this, fx[1], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
          }
          this.cur = url;
          this.emit('navigated', { url });
          return true;
        }
      }
      return UsaRouteTransition as unknown as CustomElementConstructor;
    },
    { id: 'route-transition', text: css }
  );
}
