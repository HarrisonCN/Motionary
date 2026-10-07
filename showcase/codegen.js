/**
 * use-scroll-animate showcase — code generator.
 * Turns a catalog item + the options tweaked in the detail view into
 * copy-paste snippets for every entry point. Pure functions (unit-tested).
 */

export const TABS = [
  { id: 'vanilla', label: 'Vanilla', lang: 'js' },
  { id: 'react', label: 'React', lang: 'jsx' },
  { id: 'vue', label: 'Vue', lang: 'vue' },
  { id: 'svelte', label: 'Svelte', lang: 'svelte' },
  { id: 'solid', label: 'Solid', lang: 'jsx' },
  { id: 'element', label: 'HTML element', lang: 'html' },
  { id: 'cdn', label: 'CDN', lang: 'html' },
];

export const PKG = 'use-scroll-animate';
export const CDN_UMD = 'https://unpkg.com/use-scroll-animate@4/dist/index.umd.js';
export const CDN_ELEMENT = 'https://unpkg.com/use-scroll-animate@4/dist/element.umd.js';

export const INSTALL = {
  npm: `npm i ${PKG}`,
  pnpm: `pnpm add ${PKG}`,
  yarn: `yarn add ${PKG}`,
  bun: `bun add ${PKG}`,
};

export const EASINGS = [
  'ease',
  'ease-out',
  'ease-in-out',
  'linear',
  'spring',
  'soft-spring',
  'heavy-bounce',
  '[0.34, 1.56, 0.64, 1]',
];

/** Default option state for an item (what the detail view starts with). */
export function defaultState(item) {
  return {
    preset: Array.isArray(item.preset) ? item.preset : item.preset || 'fade-in-up',
    duration: item.recipe === 'stagger' ? 500 : 700,
    delay: 0,
    easing: item.easing || (item.id === 'exit' ? 'ease-out' : 'soft-spring'),
    distance: null, // null = preset default
    mode: 'once', // 'once' | 'repeat'
    exit: item.id === 'exit' ? 'reverse' : 'none', // 'none' | 'reverse' | preset
    stagger: 80,
    speed: 0.3,
    axis: 'y',
    progressMode: 'scroll',
    engine: 'css',
    viewStart: 'entry 0%',
    viewEnd: 'cover 40%',
    gap: -200,
  };
}

/* ------------------------------------------------------------------ */
/* Value formatting                                                    */
/* ------------------------------------------------------------------ */

const IDENT = /^[A-Za-z_$][\w$]*$/;

function str(s) {
  return `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Parse an easing as shown in the UI: '[a, b, c, d]' becomes an array. */
export function easingValue(easing) {
  if (Array.isArray(easing)) return easing;
  const e = String(easing).trim();
  if (e.startsWith('[')) {
    try {
      const arr = JSON.parse(e);
      if (Array.isArray(arr)) return arr;
    } catch {
      /* fall through */
    }
  }
  return e;
}

/** Serialise a JS value as a source literal (single line when short). */
export function js(value, indent = '') {
  if (value === null || value === undefined) return 'undefined';
  if (typeof value === 'string') return str(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const inner = indent + '  ';
  if (Array.isArray(value)) {
    const parts = value.map((v) => js(v, inner));
    const one = `[${parts.join(', ')}]`;
    return one.length <= 60 && !one.includes('\n') ? one : `[\n${parts.map((p) => inner + p).join(',\n')},\n${indent}]`;
  }
  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  if (!entries.length) return '{}';
  const parts = entries.map(([k, v]) => `${IDENT.test(k) ? k : str(k)}: ${js(v, inner)}`);
  const one = `{ ${parts.join(', ')} }`;
  return one.length <= 64 && !one.includes('\n') ? one : `{\n${parts.map((p) => inner + p).join(',\n')},\n${indent}}`;
}

function escAttr(v) {
  return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function attrs(list) {
  return list.map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escAttr(v)}"`)).join('');
}

/* ------------------------------------------------------------------ */
/* Animation (preset name, array, or custom keyframes with distance)   */
/* ------------------------------------------------------------------ */

const TRANSLATE_PX = /translate([XY])\((-?)(\d+(?:\.\d+)?)px\)/;

/** Default translate distance (px) of a preset, or null if it has none in px. */
export function presetDistance(presets, name) {
  if (typeof name !== 'string' || !presets || !presets[name]) return null;
  const t = presets[name].from.transform;
  const m = typeof t === 'string' ? TRANSLATE_PX.exec(t) : null;
  return m ? Number(m[3]) : null;
}

/**
 * The `animation` value for the current state: the preset name (or array),
 * or `{ from, to }` keyframes when a custom distance was chosen.
 */
export function animationValue(presets, state) {
  const name = state.preset;
  const base = presetDistance(presets, name);
  if (base === null || state.distance === null || state.distance === undefined || Number(state.distance) === base) return name;
  const from = { ...presets[name].from };
  from.transform = String(from.transform).replace(TRANSLATE_PX, (_m, axis, sign) => `translate${axis}(${sign}${Number(state.distance)}px)`);
  return { from, to: { ...presets[name].to } };
}

/** Ordered option object passed to observe()/hooks for the "reveal" recipe. */
export function revealOptions(presets, state) {
  const opts = { animation: animationValue(presets, state), duration: Number(state.duration) };
  if (Number(state.delay) > 0) opts.delay = Number(state.delay);
  const easing = easingValue(state.easing);
  if (easing !== 'ease') opts.easing = easing;
  if (state.exit && state.exit !== 'none') opts.exit = state.exit === 'reverse' ? true : state.exit;
  else if (state.mode === 'repeat') opts.repeat = true;
  return opts;
}

/** Same options as attribute pairs (`<scroll-animate>` / `data-sa-*`), or null for custom keyframes. */
function revealAttrs(opts) {
  if (opts.animation && typeof opts.animation === 'object' && !Array.isArray(opts.animation)) return null;
  const list = [];
  list.push(['animation', Array.isArray(opts.animation) ? opts.animation.join(', ') : opts.animation]);
  list.push(['duration', opts.duration]);
  if (opts.delay) list.push(['delay', opts.delay]);
  if (opts.easing !== undefined) list.push(['easing', Array.isArray(opts.easing) ? JSON.stringify(opts.easing) : opts.easing]);
  if (opts.exit === true) list.push(['exit', true]);
  else if (opts.exit) list.push(['exit', opts.exit]);
  if (opts.repeat) list.push(['repeat', true]);
  if (opts.stagger) list.push(['stagger', opts.stagger]);
  if (opts.engine) list.push(['engine', opts.engine]);
  if (opts.viewRange) list.push(['view-range', opts.viewRange.join(', ')]);
  return list;
}

const dataAttrs = (list) => [['data-sa', true], ...list.map(([k, v]) => [`data-sa-${k}`, v])];

/* ------------------------------------------------------------------ */
/* Recipes                                                             */
/* ------------------------------------------------------------------ */

function revealSnippets(opts) {
  const o = js(opts);
  const o2 = js(opts, '  ');
  const list = revealAttrs(opts);
  const custom = list === null;
  const elementTab = custom
    ? `<!-- Custom keyframes can't be written as attributes: use the JS API -->
<div class="reveal">Hello</div>

<script type="module">
  import ScrollAnimate from '${PKG}';
  ScrollAnimate.observe('.reveal', ${js(opts, '  ')});
</script>`
    : `<script type="module">
  import { defineScrollAnimate } from '${PKG}/element';
  defineScrollAnimate(); // registers <scroll-animate>
</script>

<scroll-animate${attrs(list)}>
  Hello
</scroll-animate>`;
  const cdnTab = custom
    ? `<script src="${CDN_UMD}"></script>

<div class="reveal">Hello</div>

<script>
  ScrollAnimate.default.observe('.reveal', ${js(opts, '  ')});
</script>`
    : `<script src="${CDN_UMD}"></script>

<div${attrs(dataAttrs(list))}>
  Hello
</div>

<script>
  ScrollAnimate.default.init();
</script>`;
  return {
    vanilla: `import ScrollAnimate from '${PKG}';

ScrollAnimate.observe('.reveal', ${o});`,
    react: `import React from 'react';
import { createReactHooks } from '${PKG}/react';

const { useScrollAnimate } = createReactHooks(React);

export function Reveal({ children }) {
  const ref = useScrollAnimate(${o2});
  return <div ref={ref}>{children}</div>;
}`,
    vue: `<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createVueComposables } from '${PKG}/vue';

const { useScrollAnimate } = createVueComposables({ ref, onMounted, onUnmounted });
const { animateRef } = useScrollAnimate(${o});
</script>

<template>
  <div ref="animateRef">Hello</div>
</template>`,
    svelte: `<script>
  import { scrollAnimate } from '${PKG}/svelte';
</script>

<div use:scrollAnimate={${o2}}>
  Hello
</div>`,
    solid: `import { scrollAnimate } from '${PKG}/solid';
scrollAnimate; // keep the directive import (TypeScript)

export function Reveal(props) {
  return <div use:scrollAnimate={${o2}}>{props.children}</div>;
}`,
    element: elementTab,
    cdn: cdnTab,
  };
}

function staggerSnippets(presets, state) {
  const opts = { animation: animationValue(presets, state), duration: Number(state.duration), stagger: Number(state.stagger) };
  const easing = easingValue(state.easing);
  if (easing !== 'ease') opts.easing = easing;
  const vanillaOpts = { ...opts, observeChildren: true };
  const list = revealAttrs(opts);
  const items = (attrList, tag) => [1, 2, 3].map((n) => `  <${tag}${attrs(attrList)}>Item ${n}</${tag}>`).join('\n');
  return {
    vanilla: `import { staggerChildren } from '${PKG}';

// Reveal the children one after another; observeChildren also animates items added later
const stop = staggerChildren(document.querySelector('.grid'), ${js(vanillaOpts)});`,
    react: `import React from 'react';
import { createReactHooks } from '${PKG}/react';

const { useScrollStagger } = createReactHooks(React);

export function Grid({ items }) {
  const ref = useScrollStagger(${js(vanillaOpts, '  ')});
  return <ul ref={ref}>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>;
}`,
    vue: `<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createVueComposables } from '${PKG}/vue';

const { useScrollStagger } = createVueComposables({ ref, onMounted, onUnmounted });
const { staggerRef } = useScrollStagger(${js(vanillaOpts)});
defineProps(['items']);
</script>

<template>
  <ul ref="staggerRef">
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>`,
    svelte: `<script>
  import { scrollStagger } from '${PKG}/svelte';
  export let items = [];
</script>

<ul use:scrollStagger={${js(vanillaOpts, '  ')}}>
  {#each items as item (item.id)}<li>{item.name}</li>{/each}
</ul>`,
    solid: `import { For } from 'solid-js';
import { scrollStagger } from '${PKG}/solid';
scrollStagger; // keep the directive import (TypeScript)

export function Grid(props) {
  return (
    <ul use:scrollStagger={${js(vanillaOpts, '    ')}}>
      <For each={props.items}>{(item) => <li>{item.name}</li>}</For>
    </ul>
  );
}`,
    element: list
      ? `<script type="module">
  import { defineScrollAnimate } from '${PKG}/element';
  defineScrollAnimate();
</script>

<!-- Siblings revealed in the same batch are delayed by \`stagger\` ms each -->
<div class="grid">
${items(list, 'scroll-animate')}
</div>`
      : `<!-- Custom keyframes: use staggerChildren() from the JS API -->`,
    cdn: list
      ? `<script src="${CDN_UMD}"></script>

<ul class="grid">
${items(dataAttrs(list), 'li').replace(/^ {2}/gm, '  ')}
</ul>

<script>
  ScrollAnimate.default.init();
  // or: ScrollAnimate.staggerChildren(document.querySelector('.grid'), { stagger: ${opts.stagger} });
</script>`
      : `<script src="${CDN_UMD}"></script>
<script>
  ScrollAnimate.staggerChildren(document.querySelector('.grid'), ${js(opts, '  ')});
</script>`,
  };
}

function parallaxSnippets(state) {
  const speed = Number(state.speed);
  const front = Math.round((-speed / 2) * 100) / 100;
  const back = state.axis === 'x' ? { speed, axis: 'x' } : { speed };
  const fore = state.axis === 'x' ? { speed: front, axis: 'x' } : { speed: front };
  const y = `${Math.round(speed * 200)}px`;
  return {
    vanilla: `import { parallax } from '${PKG}';

// Positive speed lags behind the scroll (background), negative moves ahead (foreground)
const stopBack = parallax('.layer-back', ${js(back)});
const stopFront = parallax('.layer-front', ${js(fore)});`,
    react: `import { useEffect, useRef } from 'react';
import { parallax } from '${PKG}';

export function Hero() {
  const back = useRef(null);
  const front = useRef(null);
  useEffect(() => {
    const stops = [parallax(back.current, ${js(back)}), parallax(front.current, ${js(fore)})];
    return () => stops.forEach((stop) => stop());
  }, []);
  return (
    <section className="hero">
      <div ref={back} className="layer-back" />
      <div ref={front} className="layer-front" />
    </section>
  );
}`,
    vue: `<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { parallax } from '${PKG}';

const back = ref(null);
const front = ref(null);
let stops = [];
onMounted(() => {
  stops = [parallax(back.value, ${js(back)}), parallax(front.value, ${js(fore)})];
});
onUnmounted(() => stops.forEach((stop) => stop()));
</script>

<template>
  <section class="hero">
    <div ref="back" class="layer-back" />
    <div ref="front" class="layer-front" />
  </section>
</template>`,
    svelte: `<script>
  import { parallax } from '${PKG}';
  // A tiny action around the helper: it returns its own cleanup
  const drift = (node, options) => ({ destroy: parallax(node, options) });
</script>

<section class="hero">
  <div class="layer-back" use:drift={${js(back)}} />
  <div class="layer-front" use:drift={${js(fore)}} />
</section>`,
    solid: `import { onCleanup, onMount } from 'solid-js';
import { parallax } from '${PKG}';

const drift = (options) => (el) => onMount(() => onCleanup(parallax(el, options)));

export function Hero() {
  return (
    <section class="hero">
      <div ref={drift(${js(back)})} class="layer-back" />
      <div ref={drift(${js(fore)})} class="layer-front" />
    </section>
  );
}`,
    element: `<script type="module">
  import { defineScrollAnimate } from '${PKG}/element';
  defineScrollAnimate();
</script>

<!-- Attribute form: the per-element \`parallax\` option (the parallax() helper is JS-only) -->
<scroll-animate progress="scroll" parallax-${state.axis}="${y}">
  <img src="hero.jpg" alt="" />
</scroll-animate>`,
    cdn: `<script src="${CDN_UMD}"></script>

<div class="layer-back"></div>
<div class="layer-front"></div>

<script>
  ScrollAnimate.parallax('.layer-back', ${js(back)});
  ScrollAnimate.parallax('.layer-front', ${js(fore)});
</script>`,
  };
}

function progressSnippets(state) {
  const opts = { progressVar: '--sa-progress', progressMode: state.progressMode };
  const css = `/* Plain CSS reads the 0–1 progress */
.progress::after {
  transform: scaleX(var(--sa-progress, 0));
  transform-origin: left;
}`;
  const progressAttr = state.progressMode === 'scroll' ? ' progress="scroll"' : ' progress="ratio"';
  return {
    vanilla: `import ScrollAnimate from '${PKG}';

ScrollAnimate.observe('.progress', ${js(opts)});

${css}`,
    react: `import React from 'react';
import { createReactHooks } from '${PKG}/react';

const { useScrollAnimate } = createReactHooks(React);

export function ReadingBar() {
  const ref = useScrollAnimate(${js(opts, '  ')});
  return <div ref={ref} className="progress" />;
}

${css}`,
    vue: `<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createVueComposables } from '${PKG}/vue';

const { useScrollAnimate } = createVueComposables({ ref, onMounted, onUnmounted });
const { animateRef } = useScrollAnimate(${js(opts)});
</script>

<template>
  <div ref="animateRef" class="progress" />
</template>

<style>
${css}
</style>`,
    svelte: `<script>
  import { scrollAnimate } from '${PKG}/svelte';
</script>

<div class="progress" use:scrollAnimate={${js(opts)}} />

<style>
${css.replace('.progress::after', ':global(.progress)::after')}
</style>`,
    solid: `import { scrollAnimate } from '${PKG}/solid';
scrollAnimate; // keep the directive import (TypeScript)

export const ReadingBar = () => <div class="progress" use:scrollAnimate={${js(opts)}} />;

${css}`,
    element: `<script type="module">
  import { defineScrollAnimate } from '${PKG}/element';
  defineScrollAnimate();
</script>

<!-- bare progress-var = --sa-progress; listen to sa:progress for the value in JS -->
<scroll-animate class="progress"${progressAttr} progress-var></scroll-animate>

<style>
${css.replace(/^/gm, '  ')}
</style>`,
    cdn: `<script src="${CDN_UMD}"></script>

<div class="progress" data-sa data-sa-progress="${state.progressMode}" data-sa-progress-var></div>

<script>
  ScrollAnimate.default.init();
</script>`,
  };
}

function engineSnippets(presets, state) {
  const opts = { animation: animationValue(presets, state), engine: state.engine };
  if (state.engine !== 'js') opts.viewRange = [state.viewStart, state.viewEnd];
  else opts.duration = Number(state.duration);
  const base = revealSnippets(opts);
  base.vanilla = `import ScrollAnimate, { supportsScrollTimeline } from '${PKG}';

// 'css': scroll-linked on a native ViewTimeline (off the main thread), JS fallback elsewhere
ScrollAnimate.observe('.reveal', ${js(opts)});

console.log('native:', supportsScrollTimeline());`;
  return base;
}

function sequenceSnippets(state) {
  const d = Number(state.duration);
  const gap = Number(state.gap);
  const at = gap ? `, { at: '${gap < 0 ? '-' : '+'}=${Math.abs(gap)}' }` : '';
  const chain = (n) => {
    const p = ' '.repeat(n);
    return `timeline({ defaults: { duration: ${d} } })
${p}  .to('.hero .title', 'fade-up')
${p}  .to('.hero .subtitle', 'fade-up'${at})
${p}  .to('.hero .cta', 'scale'${at})`;
  };
  const onView = (n, v = 'tl') => `${' '.repeat(n)}new IntersectionObserver(([e], io) => e.isIntersecting && (io.disconnect(), ${v}.play())).observe(document.querySelector('.hero'));`;
  const markup = `<section class="hero">
  <h1 class="title">Title</h1>
  <p class="subtitle">Subtitle</p>
  <a class="cta" href="#">Get started</a>
</section>`;
  const declarative = `<usa-timeline${gap < 0 ? ` overlap="${Math.abs(gap)}"` : ''} duration="${d}">
  <h1 data-tl="fade-up">Title</h1>
  <p data-tl="fade-up">Subtitle</p>
  <a data-tl="scale" href="#">Get started</a>
</usa-timeline>`;
  return {
    vanilla: `import { timeline } from '${PKG}';

// One playhead: '-=200' overlaps the previous step, '+=200' waits
const tl = ${chain(0)};
// play once when .hero scrolls in (or: tl.scrub(document.querySelector('.hero')))
${onView(0)}`,
    react: `import { useEffect } from 'react';
import { timeline } from '${PKG}';

export function Hero() {
  useEffect(() => {
    const tl = ${chain(4)};
${onView(4)}
    return () => tl.cancel();
  }, []);
  return (
${markup.replace(/^/gm, '    ').replace(/class=/g, 'className=')}
  );
}`,
    vue: `<script setup>
import { onMounted, onUnmounted } from 'vue';
import { timeline } from '${PKG}';

let tl;
onMounted(() => {
  tl = ${chain(2)};
${onView(2)}
});
onUnmounted(() => tl?.cancel());
</script>

<template>
${markup.replace(/^/gm, '  ')}
</template>`,
    svelte: `<script>
  import { onMount } from 'svelte';
  import { timeline } from '${PKG}';

  onMount(() => {
    const tl = ${chain(4)};
${onView(4)}
    return () => tl.cancel();
  });
</script>

${markup}`,
    solid: `import { onCleanup, onMount } from 'solid-js';
import { timeline } from '${PKG}';

export function Hero() {
  onMount(() => {
    const tl = ${chain(4)};
${onView(4)}
    onCleanup(() => tl.cancel());
  });
  return (
${markup.replace(/^/gm, '    ')}
  );
}`,
    element: `<!-- declarative: <usa-timeline> from use-scroll-animate/components/timeline -->
${declarative}

<script type="module">
  import { defineTimelineComponents } from '${PKG}/components/timeline';
  defineTimelineComponents();
</script>`,
    cdn: `<script src="${CDN_UMD}"></script>

${markup}

<script>
  const tl = ScrollAnimate.${chain(2)};
${onView(2)}
</script>`,
  };
}

/**
 * Snippets for every tab: `{ vanilla, react, vue, svelte, solid, element, cdn }`.
 * `presets` is the library's PRESETS map (needed for custom distances).
 */
export function generate(item, state, presets) {
  switch (item.recipe) {
    case 'stagger':
      return staggerSnippets(presets, state);
    case 'parallax':
      return parallaxSnippets(state);
    case 'progress':
      return progressSnippets(state);
    case 'engine':
      return engineSnippets(presets, state);
    case 'sequence':
      return sequenceSnippets(state);
    default:
      return revealSnippets(revealOptions(presets, state));
  }
}

/** Tab opened first in the detail view. */
export function defaultTab(item) {
  return item.framework || 'vanilla';
}

/* ------------------------------------------------------------------ */
/* Tiny syntax highlighter (returns safe HTML)                         */
/* ------------------------------------------------------------------ */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TOKENS =
  /(\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w-]*|\/>|(?<![=\-])>)|\b(import|from|export|const|let|function|return|default|new|true|false|null|undefined|of|in)\b|(\b\d+(?:\.\d+)?\b)/g;

export function highlight(code) {
  let out = '';
  let last = 0;
  code.replace(TOKENS, (m, comment, string, tag, keyword, number, offset) => {
    out += esc(code.slice(last, offset));
    const cls = comment ? 'c' : string ? 's' : tag ? 't' : keyword ? 'k' : 'n';
    out += `<span class="tk-${cls}">${esc(m)}</span>`;
    last = offset + m.length;
    return m;
  });
  return out + esc(code.slice(last));
}
