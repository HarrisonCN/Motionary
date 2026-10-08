/**
 * 5.8 — micro-interaction library (23 effects, registered through
 * `registerEffect()`). Each one does the small piece of UI work as well as the
 * motion — toggling `aria-pressed`, swapping a label, bumping a count, copying
 * to the clipboard — so the state change still happens under reduced motion;
 * only the animation is dropped (`ctx.animate` returns `null` there).
 *
 * Click: `copy-success`, `toggle-morph`, `password-reveal`, `favorite-star`,
 * `like-heart`, `bookmark-flip`, `download-progress`, `submit-loading`,
 * `send-plane`, `add-to-cart`, `counter-bump`, `upvote`, `clap`,
 * `emoji-react`, `refresh-spin`, `trash-shake`, `check-toggle`.
 * Attention: `input-shake`, `error-flash`, `success-check`, `nudge-hint`,
 * `focus-pulse`, `notify-badge`.
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { origin, spawn, overlay, rand, all } from './shared';

const saved = new WeakMap<HTMLElement, string>();

/** Toggle `aria-pressed` (or set it) and return the new state. */
export function togglePressed(el: HTMLElement, force?: boolean): boolean {
  const on = force ?? el.getAttribute('aria-pressed') !== 'true';
  el.setAttribute('aria-pressed', String(on));
  return on;
}

/** Swap `el`'s label for `ms` (polite live region), then restore it. */
export function swapLabel(el: HTMLElement, text: string, ms: number): Promise<void> {
  if (!saved.has(el)) saved.set(el, el.innerHTML);
  el.setAttribute('aria-live', 'polite');
  el.textContent = text;
  return new Promise((r) =>
    setTimeout(() => {
      el.innerHTML = saved.get(el)!;
      saved.delete(el);
      el.removeAttribute('aria-live');
      r();
    }, ms)
  );
}

/** Add `delta` to the number in `[data-count]` (or `el`), keeping it in `data-count`. Returns the new value. */
export function bumpCount(el: HTMLElement, delta: number, ctx?: EffectContext): number {
  const t = el.querySelector<HTMLElement>('[data-count]') || el;
  const n = (Number(t.dataset.count ?? (t.textContent || '').replace(/[^\d.-]/g, '')) || 0) + delta;
  t.dataset.count = String(n);
  t.textContent = String(n);
  ctx?.animate(t, [{ transform: `translateY(${delta > 0 ? 60 : -60}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.2,1.4,.4,1)' });
  return n;
}

const pop = (el: HTMLElement, ctx: EffectContext, s = 1.25, d = 380) =>
  ctx.animate(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})`, offset: 0.4 }, { transform: 'scale(1)' }], { duration: d, easing: 'cubic-bezier(.2,1.4,.4,1)' });

/** A few glyphs flying out of the pointer / centre. */
function burst(el: HTMLElement, ctx: EffectContext, glyph: string, color: string, n = 6, rise = false): Promise<unknown> {
  const { x, y } = origin(el, ctx);
  return all(
    Array.from({ length: n }, (_, i) => {
      const a = rise ? -Math.PI / 2 + rand(-0.6, 0.6) : (i / n) * Math.PI * 2;
      const d = rand(28, 56);
      return spawn(x - 7, y - 7, `font-size:14px;line-height:1;color:${color}`, ctx,
        [{ transform: 'translate(0,0) scale(.4)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(1)`, opacity: 0 }],
        { duration: rand(500, 750), easing: 'cubic-bezier(.2,.8,.3,1)' }, glyph);
    })
  );
}

const click = (name: string, description: string, defaults: Record<string, unknown>, run: EffectDefinition['run']): EffectDefinition => ({ name, kind: 'click', description, defaults, run });
const attn = (name: string, description: string, defaults: Record<string, unknown>, run: EffectDefinition['run']): EffectDefinition => ({ name, kind: 'attention', description, defaults, run });

export const MICRO_FX: EffectDefinition[] = [
  click('copy-success', 'Copies `text` (or `data-copy` / the target of `for`) to the clipboard and swaps the label to "Copied ✓".', { text: '', label: 'Copied ✓', ms: 1500 }, (el, o: any, ctx) => {
    const src = el.getAttribute('for') ? document.getElementById(el.getAttribute('for')!) : null;
    const text = o.text || el.dataset.copy || (src as HTMLInputElement | null)?.value || src?.textContent || '';
    navigator.clipboard?.writeText(text).catch(() => undefined);
    pop(el, ctx, 1.08);
    return swapLabel(el, o.label, o.ms);
  }),
  click('toggle-morph', 'Toggles `aria-pressed` with a squash-and-stretch morph.', {}, (el, _o, ctx) => {
    const on = togglePressed(el);
    return ctx.animate(el, [{ transform: 'scale(1,1)' }, { transform: `scale(${on ? 1.15 : 0.85},${on ? 0.85 : 1.15})`, offset: 0.35 }, { transform: 'scale(1,1)' }], { duration: 360, easing: 'ease-out' });
  }),
  click('password-reveal', 'Shows / hides the password input (`for` id, or the previous input) with an eye blink.', { show: 'Hide password', hide: 'Show password' }, (el, o: any, ctx) => {
    const input = (el.getAttribute('for') ? document.getElementById(el.getAttribute('for')!) : el.previousElementSibling) as HTMLInputElement | null;
    if (!input || !('type' in input)) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    togglePressed(el, show);
    el.setAttribute('aria-label', show ? o.show : o.hide);
    return ctx.animate(el, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)', offset: 0.5 }, { transform: 'scaleY(1)' }], { duration: 240, easing: 'ease-in-out' });
  }),
  click('favorite-star', 'Toggles a favourite: the star pops and throws little stars (`color`).', { color: '#facc15' }, (el, o: any, ctx) => {
    const on = togglePressed(el);
    return Promise.all([pop(el, ctx, on ? 1.35 : 0.85)?.finished, on ? burst(el, ctx, '★', o.color) : null]);
  }),
  click('like-heart', 'Toggles a like: the heart beats and hearts float up (`color`).', { color: '#ff5c8a' }, (el, o: any, ctx) => {
    const on = togglePressed(el);
    return Promise.all([pop(el, ctx, on ? 1.3 : 0.9)?.finished, on ? burst(el, ctx, '♥', o.color, 5, true) : null]);
  }),
  click('bookmark-flip', 'Toggles a bookmark with a 3D flip.', {}, (el, _o, ctx) => {
    togglePressed(el);
    return ctx.animate(el, [{ transform: 'perspective(400px) rotateY(0)' }, { transform: 'perspective(400px) rotateY(180deg)' }, { transform: 'perspective(400px) rotateY(360deg)' }], { duration: 520, easing: 'ease-in-out' });
  }),
  click('download-progress', 'Fills a progress bar over `duration` ms, then shows "Done ✓" (`aria-busy` while running; fires `usa-done`).', { duration: 1600, label: 'Done ✓', color: '#34d399' }, (el, o: any, ctx) => {
    if (el.getAttribute('aria-busy') === 'true') return;
    el.setAttribute('aria-busy', 'true');
    const [bar, remove] = overlay(el, `background:${o.color}55;transform-origin:left;transform:scaleX(0)`);
    const a = ctx.animate(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: o.duration, easing: 'linear', fill: 'forwards' });
    const done = a ? a.finished.catch(() => undefined) : Promise.resolve();
    return done.then(() => {
      remove();
      el.removeAttribute('aria-busy');
      el.dispatchEvent(new CustomEvent('usa-done', { bubbles: true }));
      return swapLabel(el, o.label, 1400);
    });
  }),
  click('submit-loading', 'Shows "Sending…" with pulsing dots for `duration` ms, then "Sent ✓" (`aria-busy`, `usa-done`).', { duration: 1200, loading: 'Sending…', label: 'Sent ✓' }, (el, o: any, ctx) => {
    if (el.getAttribute('aria-busy') === 'true') return;
    el.setAttribute('aria-busy', 'true');
    const t = swapLabel(el, o.loading, o.duration);
    const a = ctx.animate(el, [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }], { duration: 600, iterations: Math.max(1, Math.round(o.duration / 600)) });
    return t.then(() => {
      a?.cancel();
      el.removeAttribute('aria-busy');
      el.dispatchEvent(new CustomEvent('usa-done', { bubbles: true }));
      return swapLabel(el, o.label, 1400);
    });
  }),
  click('send-plane', 'A paper plane ✈ takes off from the button.', { color: '#22d3ee' }, (el, o: any, ctx) => {
    const r = el.getBoundingClientRect();
    pop(el, ctx, 0.92, 200);
    return spawn(r.left + r.width / 2 - 8, r.top + r.height / 2 - 8, `font-size:16px;color:${o.color}`, ctx,
      [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(40px,-10px) rotate(-10deg)', opacity: 1, offset: 0.4 }, { transform: 'translate(160px,-90px) rotate(-25deg)', opacity: 0 }],
      { duration: 800, easing: 'ease-in' }, '✈')?.finished;
  }),
  click('add-to-cart', 'Bumps `[data-count]` by one and floats a "+1" (`text`).', { text: '+1', color: '#34d399' }, (el, o: any, ctx) => {
    bumpCount(el, 1, ctx);
    const { x, y } = origin(el, ctx);
    return spawn(x - 10, y - 10, `font:700 14px system-ui;color:${o.color}`, ctx, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-40px)', opacity: 0 }], { duration: 700, easing: 'ease-out' }, o.text)?.finished;
  }),
  click('counter-bump', 'Adds `step` to `[data-count]` with a rolling number.', { step: 1 }, (el, o: any, ctx) => void bumpCount(el, Number(o.step) || 1, ctx)),
  click('upvote', 'Toggles an upvote: the arrow nudges up and `[data-count]` ±1.', {}, (el, _o, ctx) => {
    const on = togglePressed(el);
    bumpCount(el, on ? 1 : -1, ctx);
    return ctx.animate(el, [{ transform: 'translateY(0)' }, { transform: `translateY(${on ? -6 : 4}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 320, easing: 'cubic-bezier(.2,1.4,.4,1)' });
  }),
  click('clap', 'Counts claps in `[data-count]` with a 👏 burst on every press.', {}, (el, _o, ctx) => {
    bumpCount(el, 1, ctx);
    return Promise.all([pop(el, ctx, 1.15, 240)?.finished, burst(el, ctx, '👏', 'inherit', 3, true)]);
  }),
  click('emoji-react', 'Pops one `emoji` up from the pointer (reaction button).', { emoji: '🎉' }, (el, o: any, ctx) => burst(el, ctx, o.emoji, 'inherit', 1, true)),
  click('refresh-spin', 'Spins the icon one turn (`turns`).', { turns: 1 }, (el, o: any, ctx) => ctx.animate(el, [{ transform: 'rotate(0)' }, { transform: `rotate(${360 * o.turns}deg)` }], { duration: 600 * o.turns, easing: 'cubic-bezier(.4,0,.2,1)' })),
  click('trash-shake', 'Shakes, then drops and fades (`remove: true` removes the element afterwards).', { remove: false }, (el, o: any, ctx) => {
    const a = ctx.animate(el, [{ transform: 'none', opacity: 1 }, { transform: 'rotate(-6deg)', offset: 0.15 }, { transform: 'rotate(6deg)', offset: 0.3 }, { transform: 'rotate(0)', offset: 0.45, opacity: 1 }, { transform: 'translateY(30px) scale(.8)', opacity: 0 }], { duration: 650, easing: 'ease-in', fill: 'forwards' });
    const end = () => (o.remove ? el.remove() : a?.cancel());
    return a ? a.finished.then(end, end) : void end();
  }),
  click('check-toggle', 'Toggles a check mark (`aria-checked` for role=checkbox, else `aria-pressed`) that scales in.', {}, (el, _o, ctx) => {
    const attr = el.getAttribute('role') === 'checkbox' ? 'aria-checked' : 'aria-pressed';
    const on = el.getAttribute(attr) !== 'true';
    el.setAttribute(attr, String(on));
    return ctx.animate(el, on ? [{ transform: 'scale(.6)' }, { transform: 'scale(1.15)', offset: 0.6 }, { transform: 'scale(1)' }] : [{ transform: 'scale(1)' }, { transform: 'scale(.85)' }, { transform: 'scale(1)' }], { duration: 280, easing: 'ease-out' });
  }),
  attn('input-shake', 'Shakes an invalid field side to side and sets `aria-invalid` (`color` outline flash).', { color: '#ff5c8a' }, (el, o: any, ctx) => {
    el.setAttribute('aria-invalid', 'true');
    const prev = el.style.outline;
    el.style.outline = `2px solid ${o.color}`;
    setTimeout(() => (el.style.outline = prev), 900);
    return ctx.animate(el, [0, -8, 8, -6, 6, -3, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 420, easing: 'ease-out' });
  }),
  attn('error-flash', 'Flashes the element red once (no more than one flash per call).', { color: '#ff5c8a' }, (el, o: any, ctx) => ctx.animate(el, [{ boxShadow: `0 0 0 0 ${o.color}00` }, { boxShadow: `0 0 0 4px ${o.color}`, offset: 0.3 }, { boxShadow: `0 0 0 0 ${o.color}00` }], { duration: 700 })),
  attn('success-check', 'A green ✓ badge pops over the element and fades.', { color: '#34d399' }, (el, o: any, ctx) => {
    const [b, remove] = overlay(el, `display:grid;place-items:center;font:700 22px system-ui;color:#fff;background:${o.color}d0`);
    b.textContent = '✓';
    const a = ctx.animate(b, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)', offset: 0.3 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 1100, easing: 'ease-out' });
    return a ? a.finished.then(remove, remove) : void setTimeout(remove, 900);
  }),
  attn('nudge-hint', 'A small sideways nudge that says "try me" (`distance`).', { distance: 6 }, (el, o: any, ctx) => ctx.animate(el, [0, o.distance, 0, o.distance / 2, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 700, easing: 'ease-in-out' })),
  attn('focus-pulse', 'A ring pulses around the element to draw focus to it (`color`).', { color: '#7c5cff' }, (el, o: any, ctx) => ctx.animate(el, [{ boxShadow: `0 0 0 0 ${o.color}aa` }, { boxShadow: `0 0 0 12px ${o.color}00` }], { duration: 900, iterations: 2, easing: 'ease-out' })),
  attn('notify-badge', 'Bumps the badge count (`[data-count]`, `step`) with a pop — for new notifications.', { step: 1 }, (el, o: any, ctx) => {
    bumpCount(el, Number(o.step) || 1, ctx);
    return pop(el, ctx, 1.3, 320);
  }),
];
