/**
 * 5.1 — card & click effects 2.0, registered through `registerEffect()`.
 * Card: `holo` (holographic foil following the pointer), `glare-sweep`,
 * `book-open`, `card-fan`, `topple`, `float-tilt`. Click: `shockwave`,
 * `ink-splash`, `star-burst`, `jelly-press`, `ring-ripple`, `emoji-rain`.
 */
import type { EffectDefinition } from '../fx/registry';
import { origin, spawn, overlay, PALETTE, rand, all } from './shared';

export const CARD_FX: EffectDefinition[] = [
  {
    name: 'holo',
    kind: 'card',
    description: 'Holographic foil: a rainbow sheen and sparkle that follow the pointer (persistent; bind with trigger="load").',
    reduced: 'run',
    defaults: { strength: 0.55 },
    run: (el, o: any, ctx) => {
      const [layer, remove] = overlay(el, `mix-blend-mode:color-dodge;opacity:${o.strength};background:linear-gradient(115deg,transparent 20%,#ff8bd855 35%,#8bf3ff55 45%,#fff58b55 55%,transparent 70%),repeating-linear-gradient(55deg,#ffffff10 0 2px,transparent 2px 6px);background-size:250% 250%,100% 100%;background-position:50% 50%;transition:background-position .2s ease-out`);
      if (ctx.reduced) return remove;
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / (r.width || 1)) * 100;
        const y = ((e.clientY - r.top) / (r.height || 1)) * 100;
        layer.style.backgroundPosition = `${x}% ${y}%, 0 0`;
        el.style.transform = `perspective(700px) rotateY(${(x - 50) / 8}deg) rotateX(${(50 - y) / 8}deg)`;
      };
      const leave = () => {
        layer.style.backgroundPosition = '50% 50%, 0 0';
        el.style.transform = '';
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
        leave();
        remove();
      };
    },
  },
  {
    name: 'glare-sweep',
    kind: 'card',
    description: 'A diagonal light streak sweeps across the card once.',
    defaults: { duration: 900, color: 'rgba(255,255,255,.55)' },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      const [g, remove] = overlay(el, `overflow:hidden;background:linear-gradient(105deg,transparent 35%,${o.color} 50%,transparent 65%);background-size:250% 100%`);
      const a = ctx.animate(g, [{ backgroundPosition: '150% 0' }, { backgroundPosition: '-50% 0' }], { duration: o.duration, easing: 'ease-in-out' });
      if (a) a.finished.then(remove, remove);
      else remove();
      return a;
    },
  },
  {
    name: 'book-open',
    kind: 'card',
    description: 'The card opens like a book cover around its left edge, peeks and closes.',
    defaults: { angle: 35, duration: 1100 },
    run: (el, o: any, ctx) => {
      el.style.transformOrigin = 'left center';
      return ctx.animate(el, [{ transform: 'perspective(900px) rotateY(0)' }, { transform: `perspective(900px) rotateY(-${o.angle}deg)`, offset: 0.45 }, { transform: 'perspective(900px) rotateY(0)' }], { duration: o.duration, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)' });
    },
  },
  {
    name: 'card-fan',
    kind: 'card',
    description: 'The element’s children fan out like a hand of cards, then gather.',
    defaults: { spread: 14, duration: 900 },
    run: (el, o: any, ctx) => {
      const kids = Array.from(el.children) as HTMLElement[];
      const mid = (kids.length - 1) / 2;
      return all(kids.map((k, i) => ctx.animate(k, [{ transform: 'none' }, { transform: `translateX(${(i - mid) * o.spread}px) rotate(${(i - mid) * (o.spread / 2)}deg)`, offset: 0.5 }, { transform: 'none' }], { duration: o.duration, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' })));
    },
  },
  {
    name: 'topple',
    kind: 'card',
    description: 'Tips backwards on its bottom edge and springs upright.',
    defaults: { duration: 1000 },
    run: (el, o: any, ctx) => {
      el.style.transformOrigin = 'bottom center';
      return ctx.animate(el, [{ transform: 'perspective(800px) rotateX(0)' }, { transform: 'perspective(800px) rotateX(55deg)', offset: 0.35 }, { transform: 'perspective(800px) rotateX(-12deg)', offset: 0.6 }, { transform: 'perspective(800px) rotateX(5deg)', offset: 0.8 }, { transform: 'perspective(800px) rotateX(0)' }], { duration: o.duration, easing: 'ease-out' });
    },
  },
  {
    name: 'float-tilt',
    kind: 'loop',
    description: 'Idle floating with a slow 3D sway (loop; stops under reduced motion).',
    defaults: { duration: 4200, distance: 8 },
    run: (el, o: any, ctx) => {
      const a = ctx.animate(el, [{ transform: 'translateY(0) rotateX(0) rotateY(0)' }, { transform: `translateY(-${o.distance}px) rotateX(4deg) rotateY(-5deg)` }, { transform: 'translateY(0) rotateX(0) rotateY(0)' }], { duration: o.duration, iterations: Infinity, easing: 'ease-in-out' });
      return () => a?.cancel();
    },
  },
];

export const CLICK_FX: EffectDefinition[] = [
  {
    name: 'shockwave',
    kind: 'click',
    description: 'Two expanding rings from the click point.',
    defaults: { color: '#7c5cff', size: 160, duration: 700 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      const { x, y } = origin(el, ctx);
      return all([0, 120].map((delay) => spawn(x, y, `width:${o.size}px;height:${o.size}px;margin:${-o.size / 2}px 0 0 ${-o.size / 2}px;border:3px solid ${o.color};border-radius:50%`, ctx, [{ transform: 'scale(0)', opacity: 0.9 }, { transform: 'scale(1)', opacity: 0 }], { duration: o.duration, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })));
    },
  },
  {
    name: 'ink-splash',
    kind: 'click',
    description: 'Ink blobs splatter from the click point and fade.',
    defaults: { count: 9, colors: PALETTE, duration: 800 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      const { x, y } = origin(el, ctx);
      return all(Array.from({ length: o.count }, (_, i) => {
        const s = rand(6, 22);
        const ang = rand(0, Math.PI * 2);
        const d = rand(20, 70);
        return spawn(x, y, `width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;background:${o.colors[i % o.colors.length]};border-radius:${rand(40, 50)}% ${rand(50, 60)}% ${rand(40, 60)}% ${rand(45, 55)}%`, ctx, [{ transform: 'translate(0,0) scale(.3)', opacity: 1 }, { transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d}px) scale(1)`, opacity: 0.9, offset: 0.5 }, { transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d + 8}px) scale(1.1)`, opacity: 0 }], { duration: o.duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      }));
    },
  },
  {
    name: 'star-burst',
    kind: 'click',
    description: 'Spinning stars burst outward.',
    defaults: { count: 10, colors: ['#facc15', '#fb923c', '#f472b6'], duration: 900 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      const { x, y } = origin(el, ctx);
      return all(Array.from({ length: o.count }, (_, i) => {
        const ang = (i / o.count) * Math.PI * 2;
        const d = rand(40, 80);
        const s = rand(12, 22);
        return spawn(x, y, `font-size:${s}px;line-height:1;margin:${-s / 2}px 0 0 ${-s / 2}px;color:${o.colors[i % o.colors.length]}`, ctx, [{ transform: 'translate(0,0) rotate(0) scale(.2)', opacity: 1 }, { transform: `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d}px) rotate(${rand(180, 360)}deg) scale(1)`, opacity: 0 }], { duration: o.duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }, '★');
      }));
    },
  },
  {
    name: 'jelly-press',
    kind: 'click',
    description: 'The pressed element squishes like jelly and wobbles back.',
    defaults: { duration: 650 },
    run: (el, o: any, ctx) =>
      ctx.reduced ? ctx.animate(el, [{ opacity: 1 }, { opacity: 0.7 }, { opacity: 1 }], { duration: 250 }) : ctx.animate(el, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.15,.85)', offset: 0.2 }, { transform: 'scale(.9,1.1)', offset: 0.4 }, { transform: 'scale(1.05,.95)', offset: 0.6 }, { transform: 'scale(.98,1.02)', offset: 0.8 }, { transform: 'scale(1,1)' }], { duration: o.duration, easing: 'ease-out' }),
  },
  {
    name: 'ring-ripple',
    kind: 'click',
    description: 'Concentric outlined rings ripple out like water.',
    defaults: { rings: 3, color: '#22d3ee', size: 120, duration: 1000 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      const { x, y } = origin(el, ctx);
      return all(Array.from({ length: o.rings }, (_, i) => spawn(x, y, `width:${o.size}px;height:${o.size}px;margin:${-o.size / 2}px 0 0 ${-o.size / 2}px;border:2px solid ${o.color};border-radius:50%`, ctx, [{ transform: 'scale(.1)', opacity: 0.8 }, { transform: 'scale(1)', opacity: 0 }], { duration: o.duration, delay: i * 160, easing: 'ease-out' })));
    },
  },
  {
    name: 'emoji-rain',
    kind: 'click',
    description: 'Emoji pop up and fall around the click (pass `emoji: "🎉✨💜"`).',
    defaults: { emoji: '🎉✨💜🔥', count: 14, duration: 1300 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      const { x, y } = origin(el, ctx);
      const chars = Array.from(String(o.emoji));
      return all(Array.from({ length: o.count }, (_, i) => {
        const dx = rand(-90, 90);
        return spawn(x, y, `font-size:${rand(16, 28)}px;line-height:1`, ctx, [{ transform: 'translate(0,0) scale(.4)', opacity: 0 }, { transform: `translate(${dx * 0.6}px,${rand(-90, -50)}px) scale(1)`, opacity: 1, offset: 0.35 }, { transform: `translate(${dx}px,${rand(40, 90)}px) rotate(${rand(-60, 60)}deg) scale(.9)`, opacity: 0 }], { duration: o.duration, delay: i * 25, easing: 'cubic-bezier(0.33, 0, 0.67, 1)' }, chars[i % chars.length]);
      }));
    },
  },
];
