import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick, uid } from './micro-kit-16';
import { islandShape, frameOnce } from './fling-kit-19';
import css from './fling-kit-19.css?raw';

/**
 * A pill that morphs into a card and back on one spring: width, height and corner radius move together and overshoot
 * a little, the compact content fades out as the expanded content grows in. A press while it is compact plays a short
 * squash (`pulse()`), as when a notification arrives. The compact face is a real button with `aria-expanded`;
 * Escape, the close button or a press outside collapse it and focus returns to the button.
 *
 * Content: the child with `data-compact` is the compact face, the rest is the expanded card. Attributes: `expanded`
 * (present to open), `label` (the button's accessible name when the compact face has no text), `close` (the close
 * button's name; Collapse), `feel`, `haptics`. Set the expanded width with `--usa-island-width` and the colours with
 * `--usa-island-bg` / `--usa-island-ink`.
 * Events: `usa:toggle` ({ expanded }).
 */
export interface UsaSpringIslandElement extends UsaElement {
  expanded: boolean;
  expand(): void;
  collapse(): void;
  toggle(): void;
  /** A short squash, as a notification arriving. */
  pulse(): void;
}

export function defineSpringIsland(tag = 'usa-spring-island'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringIsland extends Base {
    static get observedAttributes(): string[] {
      return ['expanded', 'label', 'close', 'feel', 'haptics'];
    }
    private _open = false;
    private _seen?: boolean;
    private _source: { compact: Node[]; card: Node[] } | null = null;
    private _set: ((open: boolean, user: boolean) => void) | null = null;
    private _pulse: (() => void) | null = null;
    get expanded(): boolean {
      return this._open;
    }
    set expanded(v: boolean) {
      if (this._set) this._set(!!v, false);
      else this._open = !!v;
    }
    expand(): void {
      this.expanded = true;
    }
    collapse(): void {
      this.expanded = false;
    }
    toggle(): void {
      this.expanded = !this._open;
    }
    pulse(): void {
      this._pulse?.();
    }
    mount(): void {
      if (!this._source) {
        const nodes = [...this.childNodes];
        const isCompact = (n: Node) => n.nodeType === 1 && (n as Element).hasAttribute('data-compact');
        this._source = { compact: nodes.filter(isCompact), card: nodes.filter((n) => !isCompact(n)) };
        nodes.forEach((n) => n.parentNode === this && this.removeChild(n));
      }
      const attr = this.hasAttribute('expanded');
      if (attr !== this._seen) {
        this._seen = attr;
        this._open = attr;
      }
      const root = make('div', 'usa-fkit usa-island');
      const pill = make('div', 'usa-island-pill');
      const face = make('button', 'usa-island-compact');
      face.type = 'button';
      face.append(...this._source.compact.map((n) => n.cloneNode(true)));
      if (!face.textContent?.trim()) face.setAttribute('aria-label', this.str('label', 'Show more'));
      const panel = make('div', 'usa-island-panel');
      panel.id = uid('usa-island');
      panel.setAttribute('role', 'group');
      panel.setAttribute('aria-label', this.str('label', '') || face.textContent?.trim() || 'Details');
      face.setAttribute('aria-controls', panel.id);
      const shut = make('button', 'usa-island-close', '×');
      shut.type = 'button';
      shut.setAttribute('aria-label', this.str('close', 'Collapse'));
      panel.append(...this._source.card.map((n) => n.cloneNode(true)), shut);
      pill.append(face, panel);
      root.append(pill);
      this.append(root);

      let small = { w: 0, h: 0 };
      let big = { w: 0, h: 0 };
      const measure = () => {
        small = { w: face.offsetWidth || 120, h: face.offsetHeight || 36 };
        const room = root.clientWidth || 360;
        panel.style.maxWidth = `${room}px`;
        big = { w: Math.min(room, panel.offsetWidth || 300), h: panel.offsetHeight || 160 };
      };
      measure();
      const group = hostSprings(this, { t: this._open ? 1 : 0, sx: 1, sy: 1 }, (v) => {
        const s = islandShape(v.t, small, big);
        pill.style.width = `${s.width}px`;
        pill.style.height = `${s.height}px`;
        pill.style.borderRadius = `${s.radius}px`;
        pill.style.transform = v.sx === 1 && v.sy === 1 ? '' : `scale(${Math.round(v.sx * 1000) / 1000}, ${Math.round(v.sy * 1000) / 1000})`;
        const t = Math.min(1, Math.max(0, v.t));
        face.style.opacity = String(Math.round(Math.max(0, 1 - t * 2.4) * 1000) / 1000);
        const p = Math.max(0, (t - 0.3) / 0.7);
        panel.style.opacity = String(Math.round(p * 1000) / 1000);
        panel.style.transform = `scale(${Math.round((0.94 + 0.06 * p) * 1000) / 1000})`;
      });
      const paint = () => {
        face.setAttribute('aria-expanded', String(this._open));
        face.toggleAttribute('inert', this._open);
        panel.toggleAttribute('inert', !this._open);
        panel.setAttribute('aria-hidden', String(!this._open));
        root.toggleAttribute('data-expanded', this._open);
      };
      const set = (open: boolean, user: boolean) => {
        if (open === this._open) return;
        const hadFocus = this.contains(document.activeElement);
        this._open = open;
        measure();
        paint();
        group.set({ t: open ? 1 : 0 }, { spring: open ? { duration: 620, bounce: 0.24 } : { duration: 440, bounce: 0.12 } });
        if (user) tick(this, 6);
        if (open && user) shut.focus({ preventScroll: true });
        else if (!open && hadFocus) face.focus({ preventScroll: true });
        this.emit('toggle', { expanded: open });
      };
      this._set = set;
      this._pulse = () => {
        if (this._open) return;
        group.impulse({ sx: 2.2, sy: -1.6 }, { duration: 520, bounce: 0.5 });
        tick(this, [6, 40, 6]);
      };
      paint();
      group.jump({ t: this._open ? 1 : 0 });

      this.listen(face, 'click', () => set(true, true));
      this.listen(shut, 'click', () => set(false, true));
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this._open) {
          e.preventDefault();
          set(false, true);
        }
      });
      this.listen(document, 'pointerdown', (e: PointerEvent) => {
        if (this._open && !this.contains(e.target as Node)) set(false, false);
      });
      if (typeof ResizeObserver !== 'undefined') {
        const later = frameOnce(() => {
          measure();
          if (!group.animating) group.jump({ t: this._open ? 1 : 0 });
        }, this);
        const ro = new ResizeObserver(() => later.ask());
        ro.observe(root);
        ro.observe(panel);
        this.onCleanup(() => {
          ro.disconnect();
          later.cancel();
        });
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._set = null;
        this._pulse = null;
      });
    }
  }, { id: 'fling-kit-19', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
