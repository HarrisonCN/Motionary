import { defineElement, type UsaElement } from '../base';
import { createSpring } from '../physics/spring';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren, safeImageUrl } from './kit';
import css from './motion-surfaces.css?raw';

/**
 * An editorial list where hovering a row shows its picture floating beside the pointer: the picture follows on a
 * spring, leans with the pointer's speed and crossfades between rows. Keyboard focus on a row shows the picture next
 * to that row. Each element child is one row (usually a link); its `data-image` is the picture. The picture is
 * decorative (`aria-hidden`); the rows keep their own semantics. Under reduced motion the picture appears in place
 * without following.
 *
 * Attributes: `size` (picture width in px, 80–480; 240), `tilt` (max lean in degrees, 0–20; 8), `label` (List).
 * Event `usa:change` ({ index }) when the shown row changes (-1 when none).
 */
export interface UsaHoverRevealListElement extends UsaElement {
  readonly index: number;
}

export function defineHoverRevealList(tag = 'usa-hover-reveal-list'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class HoverRevealList extends Base {
    static get observedAttributes(): string[] { return ['size', 'tilt', 'label']; }
    private _index = -1;
    get index(): number { return this._index; }
    mount(): void {
      const rows = ownChildren(this);
      const root = make('div', 'usa-kit usa-hrl');
      root.setAttribute('role', 'list');
      root.setAttribute('aria-label', this.str('label', 'List'));
      const items = rows.map((r, i) => {
        const li = make('div', 'usa-hrl-row');
        li.setAttribute('role', 'listitem');
        li.style.setProperty('--i', String(i));
        li.append(r);
        root.append(li);
        return { li, src: safeImageUrl(r.dataset.image || '') };
      });
      const float = make('div', 'usa-hrl-float');
      float.setAttribute('aria-hidden', 'true');
      const imgs = items.map(({ src }) => {
        const img = make('img', 'usa-hrl-img');
        img.alt = '';
        img.decoding = 'async';
        if (src) img.src = src;
        float.append(img);
        return img;
      });
      root.append(float);
      root.style.setProperty('--size', `${Math.min(480, Math.max(80, this.num('size', 240)))}px`);
      this.append(root);
      const tiltMax = Math.min(20, Math.max(0, this.num('tilt', 8)));
      let tx = 0, ty = 0;
      const place = () => {
        const lean = Math.max(-tiltMax, Math.min(tiltMax, sx.velocity / 120));
        float.style.transform = `translate(${sx.value}px, ${sy.value}px) translate(-50%, -50%) rotate(${lean.toFixed(2)}deg)`;
      };
      const sx = createSpring({ value: 0, spring: { stiffness: 170, damping: 20 }, onUpdate: place });
      const sy = createSpring({ value: 0, spring: { stiffness: 170, damping: 20 }, onUpdate: place });
      const show = (i: number) => {
        if (i === this._index) return;
        this._index = i;
        const on = i >= 0 && !!items[i]?.src;
        root.toggleAttribute('data-showing', on);
        imgs.forEach((img, k) => img.toggleAttribute('data-on', k === i));
        items.forEach(({ li }, k) => li.toggleAttribute('data-active', k === i));
        this.emit('change', { index: i });
      };
      const moveTo = (x: number, y: number, jump: boolean) => {
        tx = x; ty = y;
        if (jump || this.reduced) { sx.jump(tx); sy.jump(ty); place(); } else { sx.set(tx); sy.set(ty); }
      };
      let inside = false;
      this.listen(root, 'pointermove', (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        const r = root.getBoundingClientRect();
        const i = items.findIndex(({ li }) => li.contains(e.target as Node));
        moveTo(e.clientX - r.left, e.clientY - r.top, !inside || this._index < 0);
        inside = true;
        show(i);
      });
      this.listen(root, 'pointerleave', () => { inside = false; show(-1); });
      this.listen(root, 'focusin', (e: FocusEvent) => {
        const i = items.findIndex(({ li }) => li.contains(e.target as Node));
        if (i < 0) return;
        const r = root.getBoundingClientRect(), lr = items[i].li.getBoundingClientRect();
        moveTo(Math.min(r.width - 20, lr.width * 0.75), lr.top - r.top + lr.height / 2, this._index < 0);
        show(i);
      });
      this.listen(root, 'focusout', (e: FocusEvent) => { if (!root.contains(e.relatedTarget as Node)) show(-1); });
      root.toggleAttribute('data-static', this.reduced);
      this.onCleanup(() => {
        sx.stop(); sy.stop();
        this.append(...rows);
        root.remove();
        this._index = -1;
      });
    }
  }, { id: 'motion-surfaces', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
