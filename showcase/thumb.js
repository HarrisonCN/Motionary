/**
 * motionary showcase — live mini-demo for one gallery component (7.5).
 * Embedded by the Animation Store cards (`thumb.html?id=<gallery id>`), so the
 * card thumbnail is the real <usa-*> element from dist/ with the same demo
 * markup and wiring as the component gallery — not a placeholder tile.
 * `mode=card` makes it non-interactive and scales it to fit the card stage.
 */
import { findComponent } from './components-catalog.js';
import { PREREQS } from './catalog/prereqs.js';
import { GSTRINGS } from './gallery-i18n.js';
import { WIRES } from './catalog/index.js';

const LOCAL = new URL('../dist/', import.meta.url).href;
const CDN = 'https://unpkg.com/motionary@8/dist/';
const q = new URLSearchParams(location.search);
const id = q.get('id') || '';
const mode = q.get('mode') || 'card';
const lang = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
const T = (k) => (GSTRINGS[lang] || GSTRINGS.en)[k] ?? GSTRINGS.en[k] ?? k;
const stage = document.getElementById('thumb-stage');
const fit = stage.parentElement;
const W = 340; // the gallery card stage the demos are designed for
const H = 240;

document.documentElement.classList.add(mode === 'card' ? 'is-card' : 'is-detail');

// 10.1: motionary/runtime + its modules (the prerequisites of runtime-powered components)
async function loadRuntime(base) {
  const ids = Object.values(PREREQS).filter((p) => p.kind === 'runtime' && p.id !== 'core').map((p) => p.id);
  const [core, ...mods] = await Promise.all([import(base + 'runtime.js'), ...ids.map((id) => import(base + 'runtime/' + id + '.js'))]);
  core.use(...mods.map((m, i) => m[ids[i].replace(/-(\w)/g, (_, c) => c.toUpperCase())]));
  return core;
}

async function loadLibrary() {
  const load = (base) => Promise.all(['components.js', 'components/effects.js', 'components/widgets.js', 'components/fx2.js', 'components/snap-carousel.js', 'components/gl-model.js', 'components/dotlottie.js'].map((f) => import(base + f).catch((e) => (/snap-carousel|gl-model|dotlottie/.test(f) ? {} : Promise.reject(e)))));
  let mods;
  try {
    await loadRuntime(LOCAL);
    mods = await load(LOCAL);
  } catch {
    mods = await load(CDN);
  }
  const lib = Object.assign({}, ...mods);
  lib.defineWidgets?.();
  lib.defineSnapCarousel?.();
  lib.defineGlModel?.();
  lib.defineDotLottie?.();
  lib.registerAllPlugins?.();
  lib.defineComponents?.();
  lib.registerAllEffects?.();
  lib.defineEffectElements?.();
  return lib;
}

/** Scale the demo so its natural (gallery-sized) box fits the frame, centred, never overflowing. */
function scaleToFit() {
  const w = innerWidth || W;
  const hgt = innerHeight || H;
  // Design width follows the frame's aspect ratio so wide frames don't letterbox
  const tw = Math.max(W, Math.round(H * (w / hgt)));
  fit.style.setProperty('--tw', `${tw}px`);
  fit.style.setProperty('--th', `${Math.round(tw * (hgt / w))}px`);
  const natW = fit.offsetWidth || tw;
  const natH = Math.max(fit.offsetHeight, 1);
  const s = Math.min(w / natW, hgt / natH) * 0.94; // a little air around the demo
  fit.style.setProperty('--ts', String(Math.round(s * 1000) / 1000));
}

async function boot() {
  const item = findComponent(id);
  if (!item) {
    stage.innerHTML = '<p class="thumb-err">Unknown component</p>';
    return;
  }
  document.title = `${item.title.en} — Motionary live preview`;
  let lib;
  try {
    lib = await loadLibrary();
  } catch (err) {
    stage.innerHTML = '<p class="thumb-err">Preview unavailable offline</p>';
    console.warn(err);
    return;
  }
  stage.innerHTML = item.demo;
  stage.dataset.id = item.id;
  if (mode === 'card') stage.querySelectorAll('a[href], button, input, select, textarea, [tabindex]').forEach((el) => el.setAttribute('tabindex', '-1'));
  try {
    WIRES[item.id]?.(stage, lib, T);
  } catch (err) {
    console.warn(err);
  }
  scaleToFit();
  new ResizeObserver(scaleToFit).observe(stage);
  addEventListener('resize', scaleToFit);
  document.documentElement.classList.add('is-ready');
  parent !== window && parent.postMessage({ type: 'motionary:thumb-ready', id }, location.origin);
}

boot();
