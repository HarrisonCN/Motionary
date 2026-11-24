import { defineElement, now, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren, safeImageUrl } from './kit';
import css from './motion-surfaces.css?raw';

/**
 * An area where moving the pointer leaves a trail of pictures: every `distance` px a picture pops up under the
 * pointer, tilted a little, and shrinks away after `life` ms. The pictures come from the element's `<img>` children
 * (in turn); its other children are the area's real content and stay on top. The trail is decorative
 * (`aria-hidden`); it does nothing for touch scrolling or under reduced motion.
 *
 * Attributes: `distance` (px between pictures, 20–400; 90), `life` (ms, 200–3000; 900), `max` (pictures at once,
 * 1–30; 10), `size` (picture width in px, 40–480; 160).
 */
export type UsaImageTrailElement = UsaElement;

export function defineImageTrail(tag = 'usa-image-trail'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ImageTrail extends Base {
    static get observedAttributes(): string[] { return ['distance', 'life', 'max', 'size']; }
    mount(): void {
      const kids = ownChildren(this);
      const pool = kids.filter((k) => k.matches('img')) as HTMLImageElement[];
      const content = kids.filter((k) => !pool.includes(k as HTMLImageElement));
      const sources = pool.map((img) => safeImageUrl(img.currentSrc || img.src)).filter(Boolean);
      const root = make('div', 'usa-kit usa-trail');
      const layer = make('div', 'usa-trail-layer');
      layer.setAttribute('aria-hidden', 'true');
      const body = make('div', 'usa-trail-content');
      body.append(...content);
      root.append(layer, body);
      for (const img of pool) img.remove();
      this.append(root);
      const distance = Math.min(400, Math.max(20, this.num('distance', 90)));
      const life = Math.min(3000, Math.max(200, this.num('life', 900)));
      const max = Math.round(Math.min(30, Math.max(1, this.num('max', 10))));
      root.style.setProperty('--size', `${Math.min(480, Math.max(40, this.num('size', 160)))}px`);
      let last: { x: number; y: number } | null = null, n = 0, z = 1, lastT = 0;
      const live: HTMLImageElement[] = [];
      const spawn = (x: number, y: number, dx: number, dy: number) => {
        if (!sources.length) return;
        const img = make('img', 'usa-trail-img');
        img.alt = '';
        img.decoding = 'async';
        img.draggable = false;
        img.src = sources[n++ % sources.length];
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        img.style.zIndex = String(z++);
        const tilt = Math.max(-14, Math.min(14, dx * 0.15)) + (Math.random() * 6 - 3);
        layer.append(img);
        live.push(img);
        while (live.length > max) live.shift()!.remove();
        const a = this.motion(img, [
          { transform: `translate(-50%, -50%) translate(${-dx * 0.4}px, ${-dy * 0.4}px) rotate(${tilt}deg) scale(.4)`, opacity: 0 },
          { transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`, opacity: 1, offset: 0.18 },
          { transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`, opacity: 1, offset: 0.6 },
          { transform: `translate(-50%, -50%) translateY(14px) rotate(${tilt}deg) scale(.6)`, opacity: 0 },
        ], { duration: life, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
        const drop = () => { img.remove(); const i = live.indexOf(img); if (i >= 0) live.splice(i, 1); };
        if (a) a.finished.then(drop, drop); else drop();
      };
      this.listen(root, 'pointermove', (e: PointerEvent) => {
        if (this.reduced || e.pointerType === 'touch') return;
        const r = root.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (!last) { last = { x, y }; return; }
        const dx = x - last.x, dy = y - last.y;
        const t = now();
        if (Math.hypot(dx, dy) < distance || t - lastT < 30) return;
        lastT = t;
        spawn(x, y, dx, dy);
        last = { x, y };
      }, { passive: true });
      this.listen(root, 'pointerleave', () => (last = null));
      this.onCleanup(() => {
        for (const img of live) img.remove();
        this.append(...content, ...pool);
        root.remove();
      });
    }
  }, { id: 'motion-surfaces', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
