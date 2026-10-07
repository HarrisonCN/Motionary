/**
 * use-scroll-animate showcase — the "product" catalog.
 * Pure data (no DOM, no library import) so it can be unit-tested.
 *
 * kind:
 *  - 'preset'    one built-in preset (src/presets.ts)
 *  - 'feature'   an option / helper (stagger, exit, parallax, progressVar, engine, sequence, combo, easing)
 *  - 'framework' an adapter entry point (react, vue, svelte, solid, element)
 * recipe: which code generator / demo the item uses (see codegen.js and app.js)
 */

/** Category chips, in display order. */
export const CATEGORIES = [
  { id: 'fade', en: 'Fade', zh: '淡入' },
  { id: 'zoom', en: 'Zoom & scale', zh: '缩放' },
  { id: 'flip', en: 'Flip 3D', zh: '3D 翻转' },
  { id: 'slide', en: 'Slide', zh: '滑入' },
  { id: 'rotate', en: 'Rotate & skew', zh: '旋转与倾斜' },
  { id: 'blur', en: 'Blur', zh: '模糊' },
  { id: 'clip', en: 'Clip reveal', zh: '裁剪揭示' },
  { id: 'attention', en: 'Attention', zh: '强调' },
  { id: 'feature', en: 'Features', zh: '功能' },
  { id: 'framework', en: 'Frameworks', zh: '框架' },
];

const P = (id, category, en, zh, tags, descEn, descZh) => ({
  id,
  kind: 'preset',
  recipe: 'reveal',
  preset: id,
  category,
  title: { en, zh },
  tags,
  desc: { en: descEn, zh: descZh },
});

export const PRESET_ITEMS = [
  P('fade-in', 'fade', 'Fade in', '淡入', ['opacity'], 'The quiet classic: content simply fades into view.', '最经典的效果：内容平静地淡入。'),
  P('fade-in-up', 'fade', 'Fade in up', '上浮淡入', ['opacity', 'translate'], 'Rises 40px while fading in. The library default.', '淡入的同时上移 40px，库的默认效果。'),
  P('fade-in-down', 'fade', 'Fade in down', '下落淡入', ['opacity', 'translate'], 'Drops in from above while fading in.', '从上方落下并淡入。'),
  P('fade-in-left', 'fade', 'Fade in left', '左侧淡入', ['opacity', 'translate'], 'Glides in from the left.', '从左侧滑入并淡入。'),
  P('fade-in-right', 'fade', 'Fade in right', '右侧淡入', ['opacity', 'translate'], 'Glides in from the right.', '从右侧滑入并淡入。'),
  P('zoom-in', 'zoom', 'Zoom in', '放大进入', ['opacity', 'scale'], 'Grows from 80% to full size.', '从 80% 放大到原始尺寸。'),
  P('zoom-out', 'zoom', 'Zoom out', '缩小进入', ['opacity', 'scale'], 'Settles down from 120%.', '从 120% 缩小回原始尺寸。'),
  P('scale-up', 'zoom', 'Scale up', '弹性放大', ['opacity', 'scale'], 'Pops up from half size — great with spring easing.', '从一半大小弹出，配合 spring 缓动效果最佳。'),
  P('scale-x', 'zoom', 'Scale X', '横向展开', ['scale'], 'Unrolls horizontally — ideal for dividers and bars.', '水平展开，适合分隔线和进度条。'),
  P('scale-y', 'zoom', 'Scale Y', '纵向展开', ['scale'], 'Unrolls vertically.', '垂直展开。'),
  P('flip-x', 'flip', 'Flip X', 'X 轴翻转', ['3D', 'opacity'], 'Flips in around the X axis.', '绕 X 轴翻转进入。'),
  P('flip-y', 'flip', 'Flip Y', 'Y 轴翻转', ['3D', 'opacity'], 'Flips in around the Y axis, like a card.', '像卡片一样绕 Y 轴翻转进入。'),
  P('flip-up', 'flip', 'Flip up', '向上翻起', ['3D', 'perspective'], 'Tilts up into place with perspective.', '带透视地向上翻起就位。'),
  P('flip-down', 'flip', 'Flip down', '向下翻落', ['3D', 'perspective'], 'Tilts down into place with perspective.', '带透视地向下翻落就位。'),
  P('slide-up', 'slide', 'Slide up', '向上滑入', ['translate'], 'Slides a full height up, no fade — pair with overflow: hidden.', '整高度向上滑入，不淡入，适合配合 overflow: hidden。'),
  P('slide-down', 'slide', 'Slide down', '向下滑入', ['translate'], 'Slides a full height down.', '整高度向下滑入。'),
  P('slide-left', 'slide', 'Slide left', '从左滑入', ['translate'], 'Slides a full width in from the left.', '整宽度从左侧滑入。'),
  P('slide-right', 'slide', 'Slide right', '从右滑入', ['translate'], 'Slides a full width in from the right.', '整宽度从右侧滑入。'),
  P('rotate-in', 'rotate', 'Rotate in', '旋转进入', ['rotate', 'scale'], 'Spins half a turn while growing in.', '旋转半圈同时放大进入。'),
  P('rotate-left', 'rotate', 'Rotate left', '左旋进入', ['rotate', 'translate'], 'Swings in from the left with a slight tilt.', '带轻微倾斜从左侧摆入。'),
  P('rotate-right', 'rotate', 'Rotate right', '右旋进入', ['rotate', 'translate'], 'Swings in from the right with a slight tilt.', '带轻微倾斜从右侧摆入。'),
  P('skew-in', 'rotate', 'Skew in', '倾斜进入', ['skew', 'translate'], 'Straightens out of a 20° skew.', '从 20° 倾斜中回正。'),
  P('blur-in', 'blur', 'Blur in', '模糊淡入', ['filter', 'opacity'], 'Comes into focus from a 12px blur.', '从 12px 模糊逐渐清晰。'),
  P('blur-in-up', 'blur', 'Blur in up', '模糊上浮', ['filter', 'translate'], 'Focus pull plus a gentle rise.', '由模糊到清晰并轻轻上浮。'),
  P('clip-up', 'clip', 'Clip up', '向上揭示', ['clip-path'], 'Uncovered from the bottom edge — nothing moves.', '从底边向上揭开，元素本身不移动。'),
  P('clip-down', 'clip', 'Clip down', '向下揭示', ['clip-path'], 'Uncovered from the top edge.', '从顶边向下揭开。'),
  P('clip-left', 'clip', 'Clip left', '向左揭示', ['clip-path'], 'Uncovered from the right edge.', '从右边向左揭开。'),
  P('clip-right', 'clip', 'Clip right', '向右揭示', ['clip-path'], 'Uncovered from the left edge.', '从左边向右揭开。'),
  P('clip-circle', 'clip', 'Clip circle', '圆形揭示', ['clip-path'], 'An iris opening from the centre.', '从中心像光圈一样展开。'),
  P('bounce', 'attention', 'Bounce', '弹跳落下', ['translate', 'opacity'], 'Drops 60px — try it with heavy-bounce easing.', '下落 60px，搭配 heavy-bounce 缓动试试。'),
  P('pulse', 'attention', 'Pulse', '脉冲', ['scale'], 'A subtle 5% swell to draw the eye.', '轻微放大 5%，吸引注意力。'),
  P('swing', 'attention', 'Swing', '摆动', ['rotate'], 'Swings from -10° to 10°.', '从 -10° 摆到 10°。'),
  P('shimmer', 'attention', 'Shimmer', '闪光', ['filter', 'opacity'], 'Brightens up — good for badges and CTAs.', '亮度提升，适合徽章和按钮。'),
];

export const FEATURE_ITEMS = [
  {
    id: 'stagger',
    kind: 'feature',
    recipe: 'stagger',
    category: 'feature',
    title: { en: 'Stagger children', zh: '子元素错峰' },
    tags: ['staggerChildren', 'lists', 'grids'],
    desc: {
      en: 'Reveal a container’s children one after another. Add observeChildren to animate items appended later.',
      zh: '让容器的子元素依次出现；开启 observeChildren 后，之后追加的元素也会自动动画。',
    },
  },
  {
    id: 'exit',
    kind: 'feature',
    recipe: 'reveal',
    category: 'feature',
    title: { en: 'Exit animations', zh: '离场动画' },
    tags: ['exit', 'repeat'],
    desc: {
      en: 'Animate out when leaving the viewport and back in on re-entry — reverse of the entrance or any preset.',
      zh: '离开视口时播放离场动画，重新进入时再播放入场——可反向播放入场，也可指定任意预设。',
    },
  },
  {
    id: 'parallax',
    kind: 'feature',
    recipe: 'parallax',
    category: 'feature',
    title: { en: 'Parallax helper', zh: '视差滚动' },
    tags: ['parallax()', 'scroll-linked', '< 1 kB'],
    desc: {
      en: 'Layers drift at different speeds while they cross the viewport. Uses the individual translate property, so it composes with entrances.',
      zh: '图层在穿过视口时以不同速度移动。使用独立的 translate 属性，可与入场动画叠加。',
    },
  },
  {
    id: 'progress-var',
    kind: 'feature',
    recipe: 'progress',
    category: 'feature',
    title: { en: 'Progress CSS variable', zh: '进度 CSS 变量' },
    tags: ['progressVar', 'CSS', 'scroll-linked'],
    desc: {
      en: 'Write the element’s scroll progress (0–1) into a CSS custom property and drive any effect from plain CSS.',
      zh: '把元素的滚动进度（0–1）写入 CSS 自定义属性，用纯 CSS 驱动任意效果。',
    },
  },
  {
    id: 'engine',
    kind: 'feature',
    recipe: 'engine',
    category: 'feature',
    title: { en: 'Native scroll engine', zh: '原生滚动引擎' },
    tags: ['engine', 'css', 'auto', 'view()'],
    desc: {
      en: 'engine: "css" runs presets on the browser’s native scroll-driven timeline, off the main thread. "auto" falls back to JS where unsupported.',
      zh: 'engine: "css" 让预设运行在浏览器原生的滚动驱动时间线上，不占主线程；"auto" 在不支持时自动回退到 JS。',
    },
  },
  {
    id: 'sequence',
    kind: 'feature',
    recipe: 'sequence',
    category: 'feature',
    title: { en: 'Sequence timeline', zh: '序列时间线' },
    tags: ['sequence()', 'timeline'],
    desc: {
      en: 'Chain animations on several targets, one after another or overlapping, triggered when a section scrolls in.',
      zh: '把多个目标的动画串成时间线，可依次或重叠播放，并在区块进入视口时触发。',
    },
  },
  {
    id: 'combo',
    kind: 'feature',
    recipe: 'reveal',
    category: 'feature',
    preset: ['fade-in', 'clip-up'],
    title: { en: 'Combined presets', zh: '组合预设' },
    tags: ['animation[]', 'compose'],
    desc: {
      en: 'Pass an array of presets to combine them — transforms are chained, other properties merged.',
      zh: '传入预设数组即可组合效果——transform 会串联，其他属性会合并。',
    },
  },
  {
    id: 'spring-easing',
    kind: 'feature',
    recipe: 'reveal',
    category: 'feature',
    preset: 'scale-up',
    easing: 'spring',
    title: { en: 'Spring easings', zh: '弹簧缓动' },
    tags: ['easing', 'spring', 'cubic-bezier'],
    desc: {
      en: 'Built-in spring, soft-spring and heavy-bounce curves, any CSS easing, a cubic-bezier array or your own (t) => number.',
      zh: '内置 spring、soft-spring、heavy-bounce 曲线，也支持任意 CSS 缓动、cubic-bezier 数组或自定义 (t) => number 函数。',
    },
  },
];

export const FRAMEWORK_ITEMS = [
  {
    id: 'react',
    kind: 'framework',
    recipe: 'reveal',
    category: 'framework',
    framework: 'react',
    glyph: 'R',
    title: { en: 'React hooks', zh: 'React Hooks' },
    tags: ['/react', 'useScrollAnimate', 'useScrollStagger'],
    desc: {
      en: 'createReactHooks(React) gives you useScrollAnimate and useScrollStagger — refs in, animations out.',
      zh: 'createReactHooks(React) 提供 useScrollAnimate 与 useScrollStagger——传入 ref 即可。',
    },
  },
  {
    id: 'vue',
    kind: 'framework',
    recipe: 'reveal',
    category: 'framework',
    framework: 'vue',
    glyph: 'V',
    title: { en: 'Vue composables', zh: 'Vue 组合式函数' },
    tags: ['/vue', 'composables', 'Vue 3'],
    desc: {
      en: 'createVueComposables({ ref, onMounted, onUnmounted }) for Vue 3 — template refs, cleanup on unmount.',
      zh: 'createVueComposables({ ref, onMounted, onUnmounted })，适用于 Vue 3——模板 ref，卸载时自动清理。',
    },
  },
  {
    id: 'svelte',
    kind: 'framework',
    recipe: 'reveal',
    category: 'framework',
    framework: 'svelte',
    glyph: 'S',
    title: { en: 'Svelte actions', zh: 'Svelte Actions' },
    tags: ['/svelte', 'use:', 'Svelte 3–5'],
    desc: {
      en: 'use:scrollAnimate and use:scrollStagger actions — no svelte import needed, works in Svelte 3, 4 and 5.',
      zh: 'use:scrollAnimate 与 use:scrollStagger 动作——无需引入 svelte，兼容 Svelte 3、4、5。',
    },
  },
  {
    id: 'solid',
    kind: 'framework',
    recipe: 'reveal',
    category: 'framework',
    framework: 'solid',
    glyph: 'So',
    title: { en: 'Solid directives', zh: 'Solid 指令' },
    tags: ['/solid', 'use:', 'ref'],
    desc: {
      en: 'Typed use:scrollAnimate / use:scrollStagger directives and a useScrollAnimate() ref primitive.',
      zh: '带类型的 use:scrollAnimate / use:scrollStagger 指令，以及 useScrollAnimate() ref 原语。',
    },
  },
  {
    id: 'element',
    kind: 'framework',
    recipe: 'reveal',
    category: 'framework',
    framework: 'element',
    glyph: '</>',
    title: { en: '<scroll-animate> element', zh: '<scroll-animate> 组件' },
    tags: ['/element', 'Web Component', 'no build'],
    desc: {
      en: 'A custom element whose attributes mirror data-sa-*. Works in any framework — or none, straight from a CDN.',
      zh: '属性与 data-sa-* 一一对应的自定义元素，可用于任何框架，也可直接通过 CDN 使用。',
    },
  },
];

export const ITEMS = [...PRESET_ITEMS, ...FEATURE_ITEMS, ...FRAMEWORK_ITEMS];

export function findItem(id) {
  return ITEMS.find((item) => item.id === id) || null;
}

/** Case-insensitive search over id, titles, tags and category names. */
export function matches(item, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  const cat = CATEGORIES.find((c) => c.id === item.category);
  const hay = [item.id, item.title.en, item.title.zh, item.desc.en, item.desc.zh, ...(item.tags || []), cat?.en, cat?.zh]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((part) => hay.includes(part));
}
