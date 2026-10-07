export type Placement = 'top' | 'bottom' | 'left' | 'right';

/** Position a fixed `floating` element next to `anchor`, flipping when it would leave the viewport. */
export function place(floating: HTMLElement, anchor: Element, placement: Placement = 'top', gap = 8): Placement {
  const a = anchor.getBoundingClientRect();
  const f = floating.getBoundingClientRect();
  const W = window.innerWidth || 1024;
  const H = window.innerHeight || 768;
  const fits: Record<Placement, boolean> = {
    top: a.top - f.height - gap >= 0,
    bottom: a.bottom + f.height + gap <= H,
    left: a.left - f.width - gap >= 0,
    right: a.right + f.width + gap <= W,
  };
  const opposite: Record<Placement, Placement> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  const p = fits[placement] || !fits[opposite[placement]] ? placement : opposite[placement];
  let x = 0;
  let y = 0;
  if (p === 'top' || p === 'bottom') {
    x = Math.min(Math.max(4, a.left + a.width / 2 - f.width / 2), W - f.width - 4);
    y = p === 'top' ? a.top - f.height - gap : a.bottom + gap;
  } else {
    y = Math.min(Math.max(4, a.top + a.height / 2 - f.height / 2), H - f.height - 4);
    x = p === 'left' ? a.left - f.width - gap : a.right + gap;
  }
  floating.style.left = `${Math.round(x)}px`;
  floating.style.top = `${Math.round(y)}px`;
  floating.setAttribute('data-placement', p);
  return p;
}

let uid = 0;
export const nextId = (prefix: string): string => `${prefix}-${++uid}`;
