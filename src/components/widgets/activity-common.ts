import { type UsaBase, type UsaElement } from '../base';

export type ActivityData = Record<string, string | number | boolean | null>;
export interface UsaActivityElement extends UsaElement {
  value: number;
  update(data: ActivityData): void;
  play(): void;
  pause(): void;
  reset(): void;
}
type Notice = 'action' | 'change' | 'tick' | 'complete';
type ActivityBase = new () => UsaBase;
interface Controller extends UsaBase, UsaActivityElement { notify(type: Notice, detail: Record<string, unknown>): void; }
export const escapeActivity = (value: unknown): string => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const activityNumber = (el: UsaBase, name: string, fallback: number, min = -Infinity, max = Infinity): number => Math.min(max, Math.max(min, el.num(name, fallback)));
export const activityTime = (seconds: number): string => `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, '0')}`;
export const activitySvg = (body: string, viewBox = '0 0 240 80', cls = ''): string => `<svg class="${cls}" viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;
export function activityBars(values: number[], color = 'currentColor', y = 56, width = 220): string {
  const step = width / values.length;
  return values.map((v, i) => `<rect class="usa-ac-bar" style="--i:${i}" x="${10 + i * step}" y="${y - v}" width="${Math.max(2, step * .5)}" height="${Math.max(2, v)}" rx="2" fill="${color}"/>`).join('');
}
export const activityButton = (action: string, label: string, icon: string, disabled = false): string => `<button type="button" data-action="${action}" aria-label="${escapeActivity(label)}"${disabled ? ' disabled' : ''}>${icon}</button>`;
export const activityIcon = (name: string): string => {
  const path = name === 'plane' ? 'M3 13l7-2V4l2-2 2 2v7l7 2v2l-7-1v5l3 2v1l-5-1-5 1v-1l3-2v-5l-7 1z'
    : name === 'heart' ? 'M12 21C8 18 2 14 2 8a5 5 0 0 1 10-2A5 5 0 0 1 22 8c0 6-6 10-10 13z'
    : name === 'play' ? 'M7 3l15 9-15 9z' : name === 'pause' ? 'M5 3h5v18H5zM15 3h5v18h-5z'
    : name === 'stop' ? 'M5 5h14v14H5z' : name === 'close' ? 'M5 5l14 14M19 5L5 19'
    : name === 'target' ? 'M12 1v5m0 12v5M1 12h5m12 0h5M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z'
    : name === 'phone' ? 'M6 3l4 5-3 3c1 3 3 5 6 6l3-3 5 4-2 4C9 22 2 15 2 5z'
    : name === 'message' ? 'M3 3h18v14H10l-6 5v-5H3z'
    : name === 'home' ? 'M2 11L12 2l10 9v11h-7v-7H9v7H2z'
    : name === 'car' ? 'M3 10l3-6h12l3 6v10h-4v-3H7v3H3zM3 11h18M6 13v2m12-2v2'
    : name === 'package' ? 'M2 6l10-5 10 5v13l-10 4-10-4zM2 6l10 5 10-5M12 11v12M7 4l10 5'
    : name === 'train' ? 'M5 2h14v16H5zM8 21l2-3m6 3l-2-3M5 11h14M8 15h1m6 0h1'
    : name === 'drop' ? 'M12 2C10 6 4 11 4 16a8 8 0 0 0 16 0c0-5-6-10-8-14z'
    : 'M4 12h16m-6-6l6 6-6 6';
  return activitySvg(`<path d="${path}" fill="${['plane', 'heart', 'play', 'pause', 'stop', 'home', 'message'].includes(name) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`, '0 0 24 24', 'usa-ac-icon');
};

/** Update in place so clocks preserve native focus and running SVG/CSS animations. */
function patchActivity(parent: Element, html: string): void {
  const template = document.createElement('template'); template.innerHTML = html;
  const patch = (target: Node, source: Node) => {
    if (target.nodeType === 3) { if (target.nodeValue !== source.nodeValue) target.nodeValue = source.nodeValue; return; }
    if (target instanceof Element && source instanceof Element) {
      for (const attr of Array.from(target.attributes)) if (!source.hasAttribute(attr.name)) target.removeAttribute(attr.name);
      for (const attr of Array.from(source.attributes)) if (target.getAttribute(attr.name) !== attr.value) target.setAttribute(attr.name, attr.value);
    }
    const incoming = Array.from(source.childNodes);
    incoming.forEach((next, index) => {
      const current = target.childNodes[index];
      if (!current) target.appendChild(next.cloneNode(true));
      else if (current.nodeType !== next.nodeType || current.nodeName !== next.nodeName) target.replaceChild(next.cloneNode(true), current);
      else patch(current, next);
    });
    while (target.childNodes.length > incoming.length) target.removeChild(target.lastChild!);
  };
  patch(parent, template.content);
}

/** Shared lifecycle; no simulation or network access. Clocks run only when explicitly enabled and visible. */
export function activityClass(Base: ActivityBase, kind: string, render: (el: UsaBase) => string, initial: number, clock?: 'elapsed' | 'remaining'): new () => Controller {
  const percentage = ['flight-status', 'transit-progress', 'delivery-tracker', 'orbit-pass', 'race-telemetry', 'ride-status'].includes(kind);
  return class Activity extends Base {
    private _paint?: () => void;
    private _initial?: number;
    get value(): number { return Math.min(percentage ? 100 : kind === 'coffee-timer' ? Math.max(1, this.num('duration', 30)) : Infinity, Math.max(0, this.num('value', initial))); }
    set value(value: number) { this.setAttribute('value', String(Number.isFinite(value) ? Math.max(0, value) : 0)); }
    update(data: ActivityData): void {
      const allowed = (this.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
      for (const [key, value] of Object.entries(data)) if (allowed.includes(key)) {
        if (value === null || value === false) this.removeAttribute(key);
        else this.setAttribute(key, value === true ? '' : String(value));
      }
    }
    play(): void { if (!this.flag('disabled')) this.setFlag('running', true); }
    pause(): void { this.setFlag('running', false); }
    reset(): void { this.pause(); this.value = this._initial ?? initial; }
    notify(type: Notice, detail: Record<string, unknown>): void { this.emit(type, detail); }
    changed(): void { this._paint?.(); }
    mount(): void {
      this._initial ??= this.value;
      this.classList.add('usa-activity'); this.dataset.activity = kind;
      this.setAttribute('role', 'group');
      this.querySelectorAll(':scope > [data-usa-activity-part]').forEach(n => n.remove());
      const part = document.createElement('div'); part.className = 'usa-ac-content'; part.setAttribute('data-usa-activity-part', ''); this.prepend(part);
      let visible = typeof IntersectionObserver === 'undefined', timer: ReturnType<typeof setInterval> | undefined, last = 0;
      const stop = () => { if (timer !== undefined) clearInterval(timer); timer = undefined; };
      const sync = () => {
        this.setAttribute('aria-label', this.str('label', kind.replace(/-/g, ' ')));
        patchActivity(part, render(this));
        const active = visible && !document.hidden && !this.flag('disabled');
        this.toggleAttribute('data-activity-animate', active && this.flag('animated') && !this.reduced);
        this.toggleAttribute('data-activity-reduced', this.reduced);
        if (clock && active && this.flag('running')) {
          if (timer === undefined) {
            last = performance.now();
            timer = setInterval(() => {
              const elapsed = Math.floor((performance.now() - last) / 1000);
              if (elapsed < 1) return;
              last += elapsed * 1000;
              const max = kind === 'coffee-timer' ? Math.max(1, this.num('duration', 30)) : Infinity;
              this.value = Math.min(max, Math.max(0, this.value + (clock === 'remaining' ? -elapsed : elapsed)));
              this.notify('tick', { value: this.value });
              if (clock === 'remaining' ? this.value === 0 : this.value >= max) { this.pause(); this.notify('complete', { value: this.value }); }
            }, 250);
          }
        } else stop();
      };
      this._paint = sync;
      this.listen(part, 'click', (event: MouseEvent) => {
        const b = (event.target as Element).closest<HTMLButtonElement>('button[data-action]');
        if (!b || !part.contains(b) || b.disabled || this.flag('disabled')) return;
        const action = b.dataset.action!;
        if (action === 'toggle') this.flag('running') ? this.pause() : this.play();
        else if (action === 'reset') this.reset();
        else if (action === 'stop') this.pause();
        this.notify('action', { action, value: this.value, running: this.flag('running') });
        this.notify('change', { value: this.value, running: this.flag('running'), action });
      });
      this.inView(v => { visible = v; sync(); });
      this.listen(document, 'visibilitychange', sync);
      if (typeof matchMedia === 'function') this.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', sync);
      this.onCleanup(() => { stop(); this._paint = undefined; this.removeAttribute('data-activity-animate'); });
      sync();
    }
  };
}
