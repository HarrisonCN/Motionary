/**
 * motionary showcase — damped motion (17.18).
 *
 * The showcase pages dogfood the library's springs for their own chrome:
 *
 *   - every <details> (the "</> Code" drawers, prerequisite panels …) opens and closes on a damped spring
 *     (`springAllDetails()` from motionary/components/interaction): the height settles with a short overshoot,
 *     the code drifts in after it, the chevron flips with a little bounce, and a second click mid-way reverses
 *     from where it is;
 *   - `expandBox(box, open)` does the same for boxes toggled with `hidden` (the component gallery's code box);
 *   - cards rise in on a spring, a few at a time, as they scroll into view (and when a Collections tab opens);
 *   - wheel scrolling glides with damping (motionary/runtime/smooth; touch, keyboard and nested scrollers stay native);
 *   - `springEase()` gives the spring as a CSS easing + duration for the detail sheet and view transitions;
 *   - `dragToDismiss()` lets a sheet be pulled down against rubber-band resistance and springs it back or closes it.
 *
 * Everything is off under prefers-reduced-motion, and nothing is hidden before the library has loaded: if the
 * import fails the pages behave exactly as before. `localStorage['motionary:damped'] = 'off'` turns it off.
 */
const LOCAL = new URL('../dist/', import.meta.url).href;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const optedOut = () => {
  try { return localStorage.getItem('motionary:damped') === 'off'; } catch { return false; }
};

let libPromise;
/** The library modules this file uses, from the local build (null when they cannot be loaded). */
export function damped() {
  return (libPromise ||= (async () => {
    try {
      const [interaction, physics] = await Promise.all([import(LOCAL + 'components/interaction.js'), import(LOCAL + 'components/physics.js')]);
      return { ...interaction, ...physics };
    } catch {
      return null;
    }
  })());
}

const FALLBACK = { easing: 'cubic-bezier(0.22, 1.2, 0.36, 1)', duration: 520 };
const eases = new Map();
/** A spring as { easing, duration } for el.animate() / CSS, once the library is loaded (a close bezier before). */
export function springEase(spring = { duration: 520, bounce: 0.16 }) {
  const key = JSON.stringify(spring);
  return eases.get(key) || FALLBACK;
}
async function prime(lib, springs) {
  for (const s of springs) {
    const { easing, duration } = lib.microEasing(s);
    eases.set(JSON.stringify(s), { easing, duration: Math.round(duration) });
  }
}

/** Open or close a box toggled with `hidden` on the damped spring (instant before the library loads). */
export async function expandBox(box, open) {
  const lib = await damped();
  if (!lib || typeof lib.springExpand !== 'function' || reduced() || optedOut()) {
    box.hidden = !open;
    return open;
  }
  try {
    return await lib.springExpand(box, open);
  } catch {
    box.hidden = !open;
    return open;
  }
}

/* ------------------------------------------------------------------ */
/* Cards rise in on a spring                                          */
/* ------------------------------------------------------------------ */

const CARDS = '.card, .ccard, .col-card, .col-look, main article';
// browse cards rise into place; a demo section (main article) only fades in, so the live widgets inside it never
// move under the pointer and never sit inside a transform (which would trap their fixed-position menus)
const BROWSE = '.card, .ccard, .col-card, .col-look';
const RISE = [{ opacity: 0, translate: '0 26px', scale: '0.97' }, { opacity: 1, translate: '0 0', scale: '1' }];
const FADE = [{ opacity: 0 }, { opacity: 1 }];

function rise(list) {
  const { easing, duration } = springEase({ duration: 620, bounce: 0.18 });
  list.slice(0, 24).forEach((node, i) => {
    node.animate(node.matches(BROWSE) ? RISE : FADE, { id: 'mo-rise', duration, easing, delay: Math.min(i, 8) * 55, fill: 'backwards' });
  });
}

/* A card that is still rising holds a transform, and a transform turns it into the
   containing block of any position:fixed overlay inside it (a context menu, a popover).
   So the moment someone reaches into a card, its rise jumps to the end: on the click itself
   (never on the press, or the button would move between press and release and the click
   would be lost), a right click, a key, or keyboard focus. */
function settleOnReach(root = document) {
  let pressed = false;
  const settle = (e) => {
    if (e.type === 'focusin' && pressed) return;
    for (let n = e.target; n && n.nodeType === 1; n = n.parentElement) {
      if (!n.matches(CARDS)) continue;
      for (const a of n.getAnimations?.() || []) if (a.id === 'mo-rise') a.finish();
    }
  };
  const opts = { capture: true, passive: true };
  root.addEventListener('pointerdown', () => (pressed = true), opts);
  for (const type of ['pointerup', 'pointercancel']) root.addEventListener(type, () => setTimeout(() => (pressed = false)), opts);
  for (const type of ['click', 'contextmenu', 'focusin', 'keydown']) root.addEventListener(type, settle, opts);
}

function revealCards(root = document) {
  if (typeof IntersectionObserver === 'undefined') return;
  const seen = new WeakSet();
  let batch = [];
  let queued = false;
  const flush = () => {
    queued = false;
    const list = batch;
    batch = [];
    list.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    rise(list);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      batch.push(e.target);
    }
    if (batch.length && !queued) {
      queued = true;
      requestAnimationFrame(flush);
    }
  }, { rootMargin: '0px 0px -6% 0px' });
  const watch = (scope) => {
    for (const node of scope.querySelectorAll?.(CARDS) || []) {
      if (seen.has(node) || node.parentElement?.closest(CARDS) || node.closest('#detail, [data-mo-rise="off"]')) continue;
      seen.add(node);
      io.observe(node);
    }
  };
  watch(root);
  settleOnReach(root);
  new MutationObserver((records) => {
    for (const r of records) {
      // a Collections tab that opens again: its cards spring in once more
      if (r.type === 'attributes' && r.target.classList?.contains('col-panel') && !r.target.hidden) {
        rise([...r.target.querySelectorAll('.col-card, .col-look')].filter((n) => n.getBoundingClientRect().top < innerHeight));
        continue;
      }
      for (const n of r.addedNodes) if (n.nodeType === 1) watch(n.matches?.(CARDS) ? n.parentElement || n : n);
    }
  }).observe(root.body || root, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
}

/* ------------------------------------------------------------------ */
/* Pull a sheet down to close it                                      */
/* ------------------------------------------------------------------ */

/**
 * The sheet follows a downward drag that starts on `handle` (a selector inside it) with rubber-band resistance
 * upward. Let go past a third of its height, or flick it down, and `onClose()` runs with the sheet left where it
 * was dropped (the caller clears `style.translate` once it has closed); otherwise it springs back with its velocity.
 */
export function dragToDismiss(sheet, handle, onClose) {
  let start = null;
  const onDown = (e) => {
    if (e.button !== 0 || reduced() || optedOut()) return;
    if (!e.target.closest?.(handle) || e.target.closest('button, a, input, select, textarea, [role="tab"], [contenteditable]')) return;
    start = { y: e.clientY, last: e.clientY, lt: performance.now(), v: 0, id: e.pointerId, moved: false };
  };
  const offset = () => parseFloat(String(sheet.style.translate).split(' ')[1]) || 0;
  const onMove = (e) => {
    if (!start || e.pointerId !== start.id) return;
    const dy = e.clientY - start.y;
    if (!start.moved && Math.abs(dy) < 6) return;
    if (!start.moved) {
      start.moved = true;
      sheet.setPointerCapture?.(e.pointerId);
      sheet.getAnimations().forEach((a) => a.cancel());
      sheet.dataset.moPulling = '';
    }
    const now = performance.now();
    start.v = ((e.clientY - start.last) / Math.max(1, now - start.lt)) * 1000;
    start.last = e.clientY;
    start.lt = now;
    const h = sheet.getBoundingClientRect().height || innerHeight;
    // free downward, rubber band upward
    const y = dy > 0 ? dy : -(1 - 1 / ((-dy * 0.55) / h + 1)) * h * 0.25;
    sheet.style.translate = `0 ${Math.round(y * 10) / 10}px`;
    (sheet.parentElement || sheet).style.setProperty('--mo-pull', String(Math.round(Math.max(0, Math.min(1, y / (h / 3))) * 1000) / 1000));
  };
  const onUp = async (e) => {
    if (!start || e.pointerId !== start.id) return;
    const s = start;
    start = null;
    if (!s.moved) return;
    delete sheet.dataset.moPulling;
    const h = sheet.getBoundingClientRect().height || innerHeight;
    const y = offset();
    (sheet.parentElement || sheet).style.removeProperty('--mo-pull');
    if (y > h / 3 || (s.v > 900 && y > 24)) {
      onClose();
      return;
    }
    sheet.style.translate = '';
    const p = springEase({ duration: 460, bounce: 0.24 });
    sheet.animate([{ translate: `0 ${y}px` }, { translate: '0 0' }], { duration: p.duration, easing: p.easing });
  };
  sheet.addEventListener('pointerdown', onDown);
  sheet.addEventListener('pointermove', onMove, { passive: true });
  sheet.addEventListener('pointerup', onUp);
  sheet.addEventListener('pointercancel', onUp);
  return () => {
    sheet.removeEventListener('pointerdown', onDown);
    sheet.removeEventListener('pointermove', onMove);
    sheet.removeEventListener('pointerup', onUp);
    sheet.removeEventListener('pointercancel', onUp);
  };
}

/* ------------------------------------------------------------------ */
/* Damped wheel scrolling                                             */
/* ------------------------------------------------------------------ */

async function glide() {
  if (document.querySelector('mo-smooth-scroll, usa-smooth-scroll, mo-fullpage, usa-fullpage, [data-mo-smooth="off"]')) return;
  try {
    const [rt, sm] = await Promise.all([import(LOCAL + 'runtime.js'), import(LOCAL + 'runtime/smooth.js')]);
    rt.use(sm.smooth);
    // the glide writes scrollTop every frame: CSS smooth scrolling would fight it
    const style = document.createElement('style');
    style.textContent = 'html.usa-smooth{scroll-behavior:auto!important}';
    document.head.append(style);
    if (sm.allSmooth().length) return; // the page runs its own
    sm.smoothScroll({ lerp: 0.11, anchors: false });
  } catch { /* the native scroll stays */ }
}

/* ------------------------------------------------------------------ */
/* Start                                                              */
/* ------------------------------------------------------------------ */

let started = false;
/** Turn the damped motion on for this page (runs once; the module calls it itself in the browser). */
export async function startDamped() {
  if (started || typeof document === 'undefined' || typeof matchMedia !== 'function' || optedOut() || /jsdom/i.test(navigator.userAgent)) return;
  started = true;
  const lib = await damped();
  if (!lib) return;
  await prime(lib, [{ duration: 520, bounce: 0.16 }, { duration: 620, bounce: 0.18 }, { duration: 560, bounce: 0.2 }, { duration: 380, bounce: 0 }, { duration: 460, bounce: 0.24 }]);
  // view transitions (the store's card → detail sheet) settle on the same spring
  const vt = springEase({ duration: 560, bounce: 0.2 });
  document.documentElement.style.setProperty('--mo-spring-ease', vt.easing);
  document.documentElement.style.setProperty('--mo-spring-dur', `${vt.duration}ms`);
  lib.springAllDetails(document);
  document.documentElement.dataset.moDamped = '';
  if (reduced()) return;
  revealCards(document);
  if (!matchMedia('(pointer: coarse)').matches) void glide();
}

if (typeof document !== 'undefined' && typeof matchMedia === 'function') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void startDamped(), { once: true });
  else void startDamped();
}
