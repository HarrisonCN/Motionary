/**
 * Visual playground (v3.7) — pure data + code generation, no DOM.
 * A composition is a stack of effect layers (outermost first) wrapped
 * around some content; every layer is a `<usa-*>` element with attributes.
 */
import { VERSION_RANGE, toJsx } from './components-catalog.js';

const sel = (key, values, def = values[0]) => ({ key, type: 'select', values, def });
const num = (key, min, max, step, def) => ({ key, type: 'range', min, max, step, def });
const flag = (key, def = false) => ({ key, type: 'flag', def });
const txt = (key, def) => ({ key, type: 'text', def });

/** Composable effects: tag, category (entry point), bilingual label, controls. */
export const PLAYGROUND_EFFECTS = [
  { tag: 'usa-reveal', category: 'reveal', en: 'Scroll reveal', zh: '滚动显现', controls: [sel('effect', ['fade-up', 'fade', 'zoom-in', 'flip-up', 'blur-up', 'fade-left', 'rise']), num('duration', 200, 2000, 50, 700), num('delay', 0, 1000, 50, 0), flag('repeat', true)] },
  { tag: 'usa-tilt', category: 'interaction', en: '3D tilt', zh: '3D 倾斜', controls: [num('max', 2, 30, 1, 10), num('scale', 1, 1.15, 0.01, 1.03), flag('glare', true)] },
  { tag: 'usa-magnetic', category: 'interaction', en: 'Magnetic', zh: '磁吸', controls: [num('strength', 0.1, 1, 0.05, 0.35), num('radius', 0, 160, 10, 60)] },
  { tag: 'usa-spring', category: 'physics', en: 'Spring', zh: '弹簧', controls: [sel('effect', ['bounce-in', 'pop', 'drop', 'jelly', 'rubber-band']), sel('preset', ['bouncy', 'wobbly', 'gentle', 'stiff', 'default']), sel('trigger', ['view', 'hover', 'click'])] },
  { tag: 'usa-mask-reveal', category: 'svg', en: 'Mask reveal', zh: '遮罩揭示', controls: [sel('shape', ['circle', 'diamond', 'star', 'iris', 'wipe', 'wipe-up']), num('duration', 300, 2000, 50, 900), flag('repeat', true)] },
  { tag: 'usa-depth', category: 'depth', en: 'Depth (scene tilt)', zh: '景深（场景倾斜）', controls: [num('rotate', 0, 20, 1, 8), num('strength', 0, 80, 5, 30), sel('source', ['pointer', 'pointer orientation', 'scroll'])] },
  { tag: 'usa-swipeable', category: 'gesture', en: 'Swipeable', zh: '滑动', controls: [num('distance', 40, 240, 10, 120), sel('preset', ['default', 'wobbly', 'stiff', 'gentle'])] },
  { tag: 'usa-ripple', category: 'interaction', en: 'Click ripple', zh: '点击涟漪', controls: [txt('color', 'currentColor'), num('opacity', 0.05, 0.6, 0.01, 0.22)] },
  { tag: 'usa-shader', category: 'webgl', en: 'Shader background', zh: '着色器背景', controls: [sel('preset', ['gradient', 'plasma', 'waves', 'aurora']), num('speed', 0.2, 3, 0.1, 1)] },
  { tag: 'usa-glitch', category: 'text', en: 'Glitch text', zh: '故障文字', text: true, controls: [sel('trigger', ['always', 'hover']), num('intensity', 1, 10, 1, 3)] },
  { tag: 'usa-gradient-text', category: 'text', en: 'Gradient text', zh: '渐变文字', text: true, controls: [num('speed', 1, 12, 1, 6), num('angle', 0, 360, 15, 90)] },
];

/** Content presets for the innermost element. */
export const PLAYGROUND_CONTENT = {
  card: { en: 'Card', zh: '卡片', html: '<div class="pg-card"><h3>Hello</h3><p>Compose effects on me.</p></div>' },
  button: { en: 'Button', zh: '按钮', html: '<button type="button" class="pg-button">Get started</button>' },
  heading: { en: 'Heading', zh: '标题', html: 'Animate everything' },
  image: { en: 'Image', zh: '图片', html: '<img class="pg-img" src="assets/demo-photo.jpg" alt="Demo" width="320" height="200">' },
};

export const findEffect = (tag) => PLAYGROUND_EFFECTS.find((e) => e.tag === tag) || null;

/** A new layer with default values. */
export function newLayer(tag) {
  const fx = findEffect(tag);
  if (!fx) throw new Error(`unknown effect ${tag}`);
  return { tag, attrs: Object.fromEntries(fx.controls.map((c) => [c.key, c.def])) };
}

const attrString = (layer) => {
  const fx = findEffect(layer.tag);
  return (fx ? fx.controls : [])
    .map((c) => {
      const v = layer.attrs[c.key];
      if (c.type === 'flag') return v ? ` ${c.key}` : '';
      if (v === undefined || v === '' || String(v) === String(c.def)) return '';
      return ` ${c.key}="${String(v).replace(/"/g, '&quot;')}"`;
    })
    .join('');
};

/** HTML for a composition: layers wrap each other, outermost first. */
export function composeMarkup(state, indent = '  ') {
  const content = (PLAYGROUND_CONTENT[state.content] || PLAYGROUND_CONTENT.card).html;
  const layers = state.layers || [];
  let out = content;
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    const inner = out.split('\n').map((line) => indent + line).join('\n');
    out = `<${l.tag}${attrString(l)}>\n${inner}\n</${l.tag}>`;
  }
  return out;
}

/** Entry points the composition needs, in first-use order. */
export const categoriesOf = (state) => [...new Set((state.layers || []).map((l) => findEffect(l.tag)?.category).filter(Boolean))];

const defineFn = (cat) => `define${cat[0].toUpperCase()}${cat.slice(1)}Components`;

/** Code for every export tab: html, esm, react, vue. */
export function playgroundSnippets(state) {
  const markup = composeMarkup(state);
  const cats = categoriesOf(state);
  const ind = (s, n) => s.split('\n').map((l) => ' '.repeat(n) + l).join('\n');
  const cdn = `https://unpkg.com/use-scroll-animate@${VERSION_RANGE}/dist/components.umd.js`;
  const imports = cats.map((c) => `import { ${defineFn(c)} } from 'use-scroll-animate/components/${c}';`).join('\n');
  const calls = cats.map((c) => `${defineFn(c)}();`).join('\n');
  const jsx = toJsx(markup).replace(/<img([^>]*?[^/])>/g, '<img$1 />');
  return {
    html: `<!-- registers every <usa-*> element -->\n<script src="${cdn}"></script>\n\n${markup}`,
    esm: `${imports || "import { defineComponents } from 'use-scroll-animate/components';"}\n\n${calls || 'defineComponents();'}\n\n// HTML\n${markup.split('\n').map((l) => '// ' + l).join('\n')}`,
    react: `${imports}\nimport 'use-scroll-animate/components/jsx';\n\n${calls}\n\nexport function Hero() {\n  return (\n${ind(jsx, 4)}\n  );\n}`,
    vue: `<script setup>\n${imports}\n${calls}\n</script>\n\n<template>\n${ind(markup, 2)}\n</template>\n\n<!-- vite.config: vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('usa-') } } }) -->`,
    player: playerSnippet(state.tracks?.length ? state.tracks : DEFAULT_TRACKS),
    timeline: `<script type="module">\n  import { defineTimeline } from 'use-scroll-animate/components/timeline';\n  defineTimeline();\n</script>\n\n${timelineMarkup(state.tracks?.length ? state.tracks : DEFAULT_TRACKS)}`,
  };
}

export const PLAYGROUND_TABS = [
  { id: 'html', en: 'HTML (no build)', zh: 'HTML（免构建）' },
  { id: 'esm', en: 'ES module', zh: 'ES 模块' },
  { id: 'react', en: 'React', zh: 'React' },
  { id: 'vue', en: 'Vue', zh: 'Vue' },
  { id: 'timeline', en: '<usa-timeline>', zh: '<usa-timeline>' },
  { id: 'player', en: '<usa-player> JSON', zh: '<usa-player> JSON' },
];

// --- 4.6: keyframe track editor ------------------------------------------------
/** Presets a track can use (same names as TIMELINE_PRESETS in components/timeline). */
export const TRACK_PRESETS = ['fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'scale', 'blur', 'rotate', 'clip-up', 'clip-right'];
export const TRACK_LIMITS = { start: [0, 4000], duration: [100, 3000] };
const clampN = (v, [a, b]) => Math.min(b, Math.max(a, Math.round(Number(v) || 0)));

/** A new track: one step of a <usa-timeline>, with an absolute start time (ms). */
export function newTrack(preset = 'fade-up', start = 0, duration = 600, label = '') {
  return { preset: TRACK_PRESETS.includes(preset) ? preset : 'fade', start: clampN(start, TRACK_LIMITS.start), duration: clampN(duration, TRACK_LIMITS.duration), label: String(label).slice(0, 40) };
}

/** Tracks with valid values, ordered by start time (stable). */
export function normalizeTracks(tracks = []) {
  return tracks.map((t) => newTrack(t.preset, t.start, t.duration, t.label)).map((t, i) => [t, i]).sort((a, b) => a[0].start - b[0].start || a[1] - b[1]).map(([t]) => t);
}

/** Total length of a track list in ms. */
export const tracksDuration = (tracks = []) => tracks.reduce((m, t) => Math.max(m, t.start + t.duration), 0);

/** Track bar geometry in % of the ruler (for the editor lanes). */
export function trackBar(track, total) {
  const T = Math.max(total, 1);
  return { left: (track.start / T) * 100, width: (track.duration / T) * 100 };
}

/** Move / resize a track by a pointer delta in ms ("move" | "resize"), clamped. */
export function dragTrack(track, mode, deltaMs, snap = 50) {
  const q = (v) => Math.round(v / snap) * snap;
  return mode === 'resize' ? newTrack(track.preset, track.start, q(track.duration + deltaMs), track.label) : newTrack(track.preset, q(track.start + deltaMs), track.duration, track.label);
}

const escAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
/** Export the tracks as declarative <usa-timeline> markup (data-at = absolute ms). */
export function timelineMarkup(tracks = [], { trigger = 'view', indent = '  ' } = {}) {
  const list = normalizeTracks(tracks);
  const attrs = trigger && trigger !== 'view' ? ` trigger="${escAttr(trigger)}"` : '';
  const steps = list.map((t, i) => `${indent}<div data-tl="${t.preset}" data-at="${t.start}" data-duration="${t.duration}">${escAttr(t.label || `Step ${i + 1}`).replace(/&quot;/g, '"')}</div>`);
  return `<usa-timeline${attrs}>\n${steps.join('\n')}\n</usa-timeline>`;
}

/** 5.9: the tracks as a `use-scroll-animate/animation` JSON document for <usa-player>. */
export function tracksToAnimation(tracks = [], name = 'playground') {
  const list = normalizeTracks(tracks);
  return {
    format: 'use-scroll-animate/animation',
    version: 1,
    name,
    tracks: list.map((t, i) => ({ target: `:scope > :nth-child(${i + 1})`, preset: t.preset, start: t.start, duration: t.duration, ...(t.label ? { label: t.label } : {}) })),
  };
}

/** <usa-player> markup with the animation inline. */
export function playerSnippet(tracks = []) {
  const list = normalizeTracks(tracks);
  const json = JSON.stringify(tracksToAnimation(list), null, 2).split('\n').map((l) => '    ' + l).join('\n');
  const kids = list.map((t, i) => `  <div>${escAttr(t.label || `Step ${i + 1}`).replace(/&quot;/g, '"')}</div>`).join('\n');
  return `<script type="module">\n  import { definePlayer } from 'use-scroll-animate/components/effects';\n  definePlayer();\n</script>\n\n<usa-player trigger="view">\n${kids}\n  <script type="application/json">\n${json}\n  </script>\n</usa-player>`;
}

export const DEFAULT_TRACKS = [newTrack('fade-up', 0, 600, 'Title'), newTrack('fade-left', 300, 600, 'Subtitle'), newTrack('scale', 700, 500, 'Button')];

// --- 4.6: saved presets ---------------------------------------------------------
export const PRESET_KEY = 'usa-playground:presets';
const store = (s) => s || (typeof localStorage !== 'undefined' ? localStorage : null);

/** Saved presets: { name: encodedState }. */
export function listPresets(storage) {
  try {
    const d = JSON.parse(store(storage)?.getItem(PRESET_KEY) || '{}');
    return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  } catch {
    return {};
  }
}

/** Save the current state under a name (max 40 chars, 30 presets). Returns the list. */
export function savePreset(name, state, storage) {
  const n = String(name || '').trim().slice(0, 40);
  if (!n) return listPresets(storage);
  const all = listPresets(storage);
  all[n] = encodeState(state);
  const names = Object.keys(all);
  if (names.length > 30) delete all[names[0]];
  store(storage)?.setItem(PRESET_KEY, JSON.stringify(all));
  return all;
}

export function loadPreset(name, storage) {
  const code = listPresets(storage)[name];
  return code ? decodeState(code) : null;
}

export function deletePreset(name, storage) {
  const all = listPresets(storage);
  delete all[name];
  store(storage)?.setItem(PRESET_KEY, JSON.stringify(all));
  return all;
}

/** Portable preset file (JSON) and back (invalid → null). */
export const presetToJSON = (name, state) => JSON.stringify({ format: 'use-scroll-animate/playground', version: 2, name, state: encodeState(state) }, null, 2);
export function presetFromJSON(text) {
  try {
    const d = JSON.parse(text);
    if (d?.format !== 'use-scroll-animate/playground') return null;
    const state = decodeState(d.state);
    return state ? { name: String(d.name || 'preset'), state } : null;
  } catch {
    return null;
  }
}

/** URL-safe share string for a composition, and back (invalid input → null). */
export function encodeState(state) {
  const o = { c: state.content, l: (state.layers || []).map((l) => [l.tag, l.attrs]) };
  if (state.tracks?.length) o.t = state.tracks.map((t) => [t.preset, t.start, t.duration, t.label]);
  const json = JSON.stringify(o);
  const b64 = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : Buffer.from(json, 'utf8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeState(s) {
  try {
    const b64 = String(s).replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof atob === 'function' ? decodeURIComponent(escape(atob(b64))) : Buffer.from(b64, 'base64').toString('utf8');
    const d = JSON.parse(json);
    const layers = (d.l || []).filter(([t]) => findEffect(t)).map(([tag, attrs]) => ({ tag, attrs: { ...newLayer(tag).attrs, ...attrs } }));
    const out = { content: PLAYGROUND_CONTENT[d.c] ? d.c : 'card', layers };
    if (Array.isArray(d.t)) out.tracks = d.t.map(([p, st, du, la]) => newTrack(p, st, du, la || ''));
    return out;
  } catch {
    return null;
  }
}

/** Starting composition. */
export const DEFAULT_STATE = { content: 'card', layers: [newLayer('usa-reveal'), newLayer('usa-tilt')] };

export const PG_STRINGS = {
  en: { tracks: 'Timeline tracks', addTrack: 'Add track', playTl: 'Play timeline', presets: 'Presets', savePreset: 'Save', deletePreset: 'Delete', exportJson: 'Copy preset JSON', importJson: 'Import JSON…', presetName: 'Preset name', start: 'start', duration: 'duration', label: 'label', title: 'Playground', lead: 'Stack effects, tweak them live, and copy the code.', add: 'Add effect', content: 'Content', layers: 'Layers (outermost first)', remove: 'Remove', up: 'Move up', down: 'Move down', preview: 'Preview', replay: 'Replay', code: 'Export code', copy: 'Copy', copied: 'Copied', copyFail: 'Copy failed', share: 'Copy share link', empty: 'No effects yet — add one.', back: 'Components', reduced: 'Reduced motion is on: effects show their final state.' },
  zh: { tracks: '时间线轨道', addTrack: '添加轨道', playTl: '播放时间线', presets: '预设', savePreset: '保存', deletePreset: '删除', exportJson: '复制预设 JSON', importJson: '导入 JSON…', presetName: '预设名称', start: '开始', duration: '时长', label: '文字', title: '动效实验室', lead: '叠加效果、实时调参，并复制代码。', add: '添加效果', content: '内容', layers: '图层（由外到内）', remove: '移除', up: '上移', down: '下移', preview: '预览', replay: '重播', code: '导出代码', copy: '复制', copied: '已复制', copyFail: '复制失败', share: '复制分享链接', empty: '还没有效果 —— 添加一个吧。', back: '组件库', reduced: '已开启“减少动态效果”：效果直接显示最终状态。' },
};
