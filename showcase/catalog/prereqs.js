/**
 * 10.1+: the single source of truth for component prerequisites — Motionary's
 * own `motionary/runtime` modules and (from 10.6) official third-party runtimes
 * for formats we cannot implement ourselves. Pure data (no DOM): read by the
 * gallery cards, the Store (badge + detail), scripts/gen-runtime-docs.mjs (docs
 * pages + README section), scripts/gen-manifest.mjs (AI manifest) and
 * scripts/check-peer-docs.mjs (CI: all five places must carry every item).
 */
export const RUNTIME_CDN = 'https://cdn.jsdelivr.net/npm/motionary@10/dist/';
export const DOCS_BASE = 'https://github.com/HarrisonCN/Motionary/blob/main/';

const iife = (id) => (id === 'core' ? `${RUNTIME_CDN}runtime.iife.js` : `${RUNTIME_CDN}runtime/${id}.iife.js`);
const esm = (id) => (id === 'core' ? `${RUNTIME_CDN}runtime.js` : `${RUNTIME_CDN}runtime/${id}.js`);
const camel = (id) => id.replace(/-(\w)/g, (_, c) => c.toUpperCase());

/** A `motionary/runtime/<id>` module entry. */
const R = (id, title, summary, budget, exports, compat, example) => ({
  kind: 'runtime',
  id,
  label: id === 'core' ? 'motionary/runtime' : `motionary/runtime/${id}`,
  title,
  summary,
  install: 'npm i motionary',
  importPath: id === 'core' ? 'motionary/runtime' : `motionary/runtime/${id}`,
  import: id === 'core' ? "import { use } from 'motionary/runtime';" : `import { use } from 'motionary/runtime';\nimport { ${camel(id)} } from 'motionary/runtime/${id}';`,
  register: id === 'core' ? 'use();' : `use(${camel(id)});`,
  cdn: id === 'core' ? `<script src="${iife('core')}"></script>` : `<script src="${iife('core')}"></script>\n<script src="${iife(id)}"></script>`,
  cdnEsm: esm(id),
  order: id === 'core'
    ? 'Import motionary/runtime and call use() once at start-up, before any runtime-powered component mounts. CDN: the IIFE registers itself (window.MotionaryRuntime).'
    : `Register the core first, then the module: use(${camel(id)}) also registers the core. CDN: load runtime.iife.js, then ${id === 'core' ? '' : `runtime/${id}.iife.js`} (it registers itself).`,
  docs: `docs/runtime/${id}.md`,
  budget,
  exports,
  compat,
  example,
});

export const PREREQS = {
  core: R('core', 'Runtime core', 'Shared ticker (one rAF loop), tween + timeline engine with easing, module registry with clear errors.', 5632,
    ['use', 'requireModule', 'hasModule', 'getTicker', 'tween', 'timeline', 'Tween', 'Timeline', 'EASES', 'parseEase', 'cubicBezier', 'steps', 'RuntimeModuleError'],
    [
      ['Plain objects (numeric props)', 'yes', 'any numeric property'],
      ['Elements: CSS lengths, %, unitless, colours, custom properties', 'yes', 'hex, rgb(), rgba(), transparent'],
      ['Transform shorthands x y rotate scale scaleX scaleY skewX skewY', 'yes', 'composed in that order'],
      ['Timeline positions (<, >, +=, -=, labels)', 'yes', ''],
      ['repeat / yoyo / reverse / seek / timeScale', 'yes', ''],
      ['SSR / Node import', 'yes', 'no window access at import'],
      ['Web Workers', 'yes', 'ticker falls back to setTimeout without rAF'],
    ],
    "import { use, tween, timeline } from 'motionary/runtime';\nuse();\ntween('.box', { to: { x: 120, opacity: 1 }, duration: 500, ease: 'back-out' });\ntimeline().to('.a', { to: { y: -20 } }).to('.b', { to: { scale: 1.2 } }, '<+=100');"),
  'format-css': R('format-css', 'CSS @keyframes & WAAPI keyframes loader', 'Import CSS @keyframes text or live CSSKeyframesRule objects and Web Animations API keyframes (array or property-indexed) into a runtime timeline.', 2560,
    ['formatCss', 'parseKeyframes', 'fromCssRule', 'fromWaapi', 'toWaapi', 'playKeyframes'],
    [
      ['@keyframes from / to / percentages / selector lists', 'yes', 'duplicate offsets merged, later wins'],
      ['-webkit- / -moz- prefixed @keyframes', 'yes', ''],
      ['animation-timing-function per keyframe', 'yes', 'names, cubic-bezier(), steps()'],
      ['transform lists (translate / rotate / scale / skew)', 'yes', 'tweened as shorthands'],
      ['matrix() / 3D transforms', 'partial', 'switch discretely at the segment midpoint'],
      ['WAAPI array + property-indexed keyframes, offsets, easing', 'yes', 'offsets distributed like the WAAPI'],
      ['composite: add / accumulate', 'no', 'ignored (replace)'],
      ['@property typed interpolation', 'no', 'non-numeric values switch discretely'],
    ],
    "import { use } from 'motionary/runtime';\nimport { formatCss, parseKeyframes, playKeyframes } from 'motionary/runtime/format-css';\nuse(formatCss);\nconst [pulse] = parseKeyframes('@keyframes pulse { from { opacity: .4 } 50% { opacity: 1; transform: scale(1.1) } to { opacity: .4 } }');\nplayKeyframes(document.querySelector('.dot'), pulse, { duration: 1200, repeat: -1 });"),
  'format-motion': R('format-motion', 'Motion / Framer keyframe JSON loader', 'Play Motion / Framer-style { initial, animate, transition } JSON (arrays as keyframes, times, repeatType, springs) with the runtime.', 2560,
    ['formatMotion', 'fromMotion', 'playMotion', 'springEase', 'motionEase'],
    [
      ['initial / animate, arrays as keyframes, times', 'yes', ''],
      ['transition duration / delay (s), ease names + cubic arrays', 'yes', 'easeIn/Out/InOut, circ*, back*, anticipate≈back-in-out'],
      ['repeat (Infinity), repeatType loop / reverse / mirror', 'yes', 'mirror = reverse'],
      ['per-property transitions', 'yes', ''],
      ['type: "spring" (stiffness, damping, mass, bounce + duration)', 'yes', 'simulated into an easing curve'],
      ['variants, gestures (whileHover…), layout animations', 'no', 'out of scope'],
    ],
    "import { use } from 'motionary/runtime';\nimport { formatMotion, playMotion } from 'motionary/runtime/format-motion';\nuse(formatMotion);\nplayMotion(document.querySelector('.card'), { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 180, damping: 14 } });"),
};

/** `Requires: motionary/runtime + …` */
export const requiresLabel = (ids = []) => (ids.length ? 'Requires: ' + ids.map((id) => PREREQS[id]?.label || id).join(' + ') : '');

/** The four prerequisite items for a component card (install, import + registration order, CDN, minimal example). */
export function prereqFor(item) {
  const mods = (item.requires || []).map((id) => {
    const p = PREREQS[id];
    if (!p) throw new Error(`unknown prerequisite "${id}" on ${item.tag || item.id}`);
    return p;
  });
  if (!mods.length) return null;
  const runtime = mods.filter((m) => m.kind === 'runtime');
  const peers = mods.filter((m) => m.kind === 'peer');
  const install = [...new Set(mods.map((m) => m.install))].join(' && ');
  const imports = [...new Set(mods.flatMap((m) => m.import.split('\n')))];
  const regs = runtime.length ? [`use(${runtime.filter((m) => m.id !== 'core').map((m) => camel(m.id)).join(', ')});`] : [];
  for (const p of peers) regs.push(p.register);
  const define = item.define ? `import { ${item.define} } from 'motionary/components/${item.entry || item.category}';` : '';
  const code = [...imports, define, '', ...regs, item.define ? `${item.define}(); // registers <${item.tag}> — after the prerequisites` : ''].filter((l, i, a) => l || a[i - 1]).join('\n').trim();
  const cdnLines = [...new Set(mods.flatMap((m) => m.cdn.split('\n')))];
  return {
    badge: requiresLabel(item.requires),
    modules: mods.map((m) => m.label),
    install,
    importAndRegister: code,
    order: mods.map((m) => m.order).join(' '),
    cdn: [...cdnLines, '<!-- then the component bundles -->', `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`, `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`].join('\n'),
    example: item.usage,
    docs: mods.map((m) => DOCS_BASE + m.docs),
  };
}
