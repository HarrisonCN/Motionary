import { animateWithMotion, type UsaBase } from '../base';

const NS = 'http://www.w3.org/2000/svg';
export const GLYPHS = ['sun', 'moon', 'check', 'heart', 'play', 'pause', 'spark', 'power'] as const;
type Point = [number, number];
const flights = /*#__PURE__*/ new WeakMap<SVGSVGElement, Animation[]>();

/** Fixed-size point clouds: no canvas, network assets, timers or idle render loop. */
function points(name: string): Point[] {
  const out: Point[] = [];
  for (let y = -22; y <= 22; y += 3) for (let x = -22; x <= 22; x += 3) {
    const r = Math.hypot(x, y), a = Math.atan2(y, x);
    const inside = name === 'moon' ? r < 21 && Math.hypot(x - 9, y + 8) > 19
      : name === 'check' ? Math.min(Math.hypot(x + 12 - (y + 2), 0), 99) < 4 && x < -2 && y > -3 && y < 14 || Math.abs(y + x - 4) < 4 && x > -5 && x < 22
      : name === 'heart' ? ((x / 22) ** 2 + (-y / 22) ** 2 - .7) ** 3 - (x / 22) ** 2 * (-y / 22) ** 3 < 0
      : name === 'play' ? x > -12 && x < 20 && Math.abs(y) < (20 - x) * .65
      : name === 'pause' ? Math.abs(y) < 20 && Math.abs(x) > 5 && Math.abs(x) < 15
      : name === 'spark' ? Math.abs(x) + Math.abs(y) * .7 < 19 && (Math.abs(x) < 6 || Math.abs(y) < 6)
      : name === 'power' ? r > 14 && r < 21 && y > -13 || Math.abs(x) < 4 && y < 4 && y > -23
      : r < 11 || r > 16 && r < 23 && Math.cos(a * 8) > .55;
    if (inside) out.push([x + 32, y + 32]);
  }
  return Array.from({ length: 64 }, (_, i) => out[Math.floor(i * out.length / 64)] || [32, 32]);
}

export function glyph(owner: UsaBase): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('usa-lu-glyph');
  for (let i = 0; i < 64; i++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', String(.85 + (i % 3) * .18));
    svg.append(c);
  }
  if (typeof matchMedia === 'function') owner.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', () => { if (owner.reduced) stopGlyph(svg); });
  owner.onCleanup(() => stopGlyph(svg));
  return svg;
}

export function stopGlyph(svg: SVGSVGElement): void {
  flights.get(svg)?.forEach(a => a.cancel());
  flights.delete(svg);
}

export function morphGlyph(svg: SVGSVGElement, name: string, animate: boolean, owner: UsaBase): void {
  const old = Array.from(svg.children, c => getComputedStyle(c).transform);
  stopGlyph(svg);
  const target = points(name);
  const active: Animation[] = [];
  Array.from(svg.children).forEach((c, i) => {
    const [x, y] = target[i];
    const end = `translate(${x}px, ${y}px)`;
    (c as SVGElement).style.transform = end;
    if (!animate || owner.reduced) return;
    const a = animateWithMotion(c, [
      { transform: old[i] === 'none' ? end : old[i], opacity: 1 },
      { transform: `translate(${32 + Math.cos(i * 2.4) * (16 + i % 15)}px, ${32 + Math.sin(i * 2.4) * (16 + i % 15)}px)`, opacity: .3, offset: .4 },
      { transform: end, opacity: 1 },
    ], { duration: 620, delay: (i % 8) * 9, easing: 'cubic-bezier(.22,.8,.2,1)' });
    if (a) active.push(a);
  });
  flights.set(svg, active);
}

export function luminousTheme(el: UsaBase): void {
  el.classList.add('usa-luminous');
  el.dataset.luTheme = el.str('theme') === 'light' ? 'light' : 'dark';
}
