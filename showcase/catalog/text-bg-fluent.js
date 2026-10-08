// v2.8 additions to the existing Text and Background categories (no new category).
import { C, H } from './make.js';

export const components = [
  C('usa-wave-text', 'text', 'Wave text', '波浪文字',
    'Letters bob in a travelling wave — playful headlines and loading labels.', '字母随波浪依次起伏——适合俏皮标题与加载文字。',
    ['wave', 'letters'], '<usa-wave-text>Loading…</usa-wave-text>', '<usa-wave-text class="demo-big">Wave hello</usa-wave-text>'),
  C('usa-glitch', 'text', 'Glitch text', '故障文字',
    'An RGB-split, sliced glitch — always on or on hover.', 'RGB 分离与切片的故障效果——常驻或悬停触发。',
    ['glitch', 'cyberpunk'], '<usa-glitch trigger="hover">SYSTEM ERROR</usa-glitch>', '<usa-glitch class="demo-big">GLITCH</usa-glitch>',
    { controls: [{ key: 'trigger', values: ['always', 'hover'] }] }),
  C('usa-gradient-text', 'text', 'Gradient flow', '流动渐变文字',
    'Text filled with a multi-colour gradient that keeps flowing.', '以持续流动的多彩渐变填充文字。',
    ['gradient', 'background-clip'], '<usa-gradient-text colors="#7c5cff,#22d3ee,#f472b6">Gradient</usa-gradient-text>', '<usa-gradient-text class="demo-big">Flowing gradient</usa-gradient-text>'),
  C('usa-handwriting', 'text', 'Handwriting draw', '手写描绘',
    'The text draws itself stroke by stroke, then fills in — signatures, hero words.', '文字逐笔描绘后填充——适合签名与主视觉词。',
    ['SVG', 'stroke', 'signature'], '<usa-handwriting text="Thank you" size="72"></usa-handwriting>', '<usa-handwriting text="Hello" size="64"></usa-handwriting>', { replay: true }),
  C('usa-scroll-highlight', 'text', 'Scroll highlight', '滚动高亮',
    'Words light up one by one as you read down the page, or a highlighter marker sweeps behind the text.', '随阅读向下滚动，文字逐词点亮；或荧光笔在文字后扫过。',
    ['scroll', 'reading', 'marker'], '<usa-scroll-highlight>Every word lights up as you scroll.</usa-scroll-highlight>\n<usa-scroll-highlight mode="marker">Important</usa-scroll-highlight>',
    '<p class="demo-note"><usa-scroll-highlight>Scroll the page and each word of this sentence lights up in turn.</usa-scroll-highlight> <usa-scroll-highlight mode="marker">Marker mode.</usa-scroll-highlight></p>'),
  C('usa-grid-glow', 'background', 'Grid glow', '网格光晕',
    'A line grid behind the content that lights up around the pointer.', '内容背后的线条网格，指针附近会被点亮。',
    ['grid', 'pointer', 'mask'], '<usa-grid-glow size="32">\n  <h2>Hero</h2>\n</usa-grid-glow>', '<usa-grid-glow class="demo-fill"><strong class="demo-big">Grid</strong></usa-grid-glow>'),
  C('usa-blobs', 'background', 'Fluid blobs', '流体色块',
    'Soft colour blobs that slowly morph and drift — a fluid gradient backdrop.', '缓慢变形漂移的柔和色块——流体渐变背景。',
    ['blobs', 'gradient', 'blur'], '<usa-blobs colors="#7c5cff,#22d3ee,#f472b6">…</usa-blobs>', '<usa-blobs class="demo-fill"><strong class="demo-big">Blobs</strong></usa-blobs>'),
  C('usa-water-ripple', 'background', 'Water ripple', '水波涟漪',
    'Interactive water ripples on a canvas over the content: move or tap to disturb the surface.', '覆盖在内容上的交互式水波：移动或点击即可激起涟漪。',
    ['canvas', 'ripple', 'interactive'], '<usa-water-ripple>\n  <img src="lake.jpg" alt="">\n</usa-water-ripple>', '<usa-water-ripple class="demo-fill demo-water"><strong class="demo-big">Touch the water</strong></usa-water-ripple>'),
  C('usa-dot-network', 'background', 'Dot network', '点阵网络',
    'A dot grid that swells and links up with lines around the pointer.', '点阵在指针周围膨胀并以线条相连。',
    ['canvas', 'dots', 'network'], '<usa-dot-network gap="28">…</usa-dot-network>', '<usa-dot-network class="demo-fill"><strong class="demo-big">Network</strong></usa-dot-network>'),
];

export const helpers = [
  H('split-text-api', 'text', 'splitText',
    'splitText(el, { by: \'char\' | \'word\' | \'line\' }) (4.3) — Intl.Segmenter-aware (emoji, Chinese / Japanese words), keeps Arabic words whole for shaping, RTL aware, preserves inline markup. splitTimeline() turns the units into a timeline() — from start, end, center, edges or random.',
    'splitText(el, { by: \'char\' | \'word\' | \'line\' })（4.3）—— 基于 Intl.Segmenter（表情、中日文分词），阿拉伯文按词保持连写，支持 RTL，保留内联标记。splitTimeline() 把拆分单元变成 timeline() —— 可从开头、结尾、中心、两端或随机开始。',
    ['split', 'CJK', 'RTL', 'choreography', 'Intl.Segmenter'],
    "import { splitTimeline } from 'use-scroll-animate/components/text';\n\nconst { timeline } = splitTimeline(title, { by: 'char', preset: 'fade-up', from: 'center', stagger: 30 });\ntimeline.play();      // or timeline.scrub(section)",
    '<div class="demo-split"><p class="demo-split-line" data-split-a>Motion, char by char ✨</p><p class="demo-split-line" lang="zh" data-split-b>逐字编排的中文动画</p><p class="demo-split-line" dir="rtl" lang="ar" data-split-c>مرحبا بالعالم</p></div><div class="demo-row"><button type="button" class="demo-link" data-from="start">start</button><button type="button" class="demo-link" data-from="center">center</button><button type="button" class="demo-link" data-from="edges">edges</button><button type="button" class="demo-link" data-from="random">random</button></div>'),
  H('fluent-preset', 'background', 'fluentPreset',
    'Windows 11 Fluent preset: the fluent variant (Segoe UI Variable, accent, radii), a Mica-style window background, Acrylic surfaces and Reveal highlight on buttons — one call for WebView2, Electron and Tauri apps.',
    'Windows 11 Fluent 预设：fluent 风格（Segoe UI Variable、强调色、圆角）、云母风格窗口背景、亚克力表面与按钮 Reveal 光照——一次调用即可用于 WebView2、Electron 与 Tauri 应用。',
    ['Fluent', 'Mica', 'Acrylic', 'Reveal', 'WebView2'],
    "import { fluentPreset } from 'use-scroll-animate/components/background';\n\nconst off = fluentPreset({ reveal: true, mica: true });",
    '<div class="demo-stack" data-fluent-demo><div class="demo-row"><button class="demo-btn demo-btn-alt" type="button" data-fluent-reveal>Reveal</button><button class="demo-btn demo-btn-alt" type="button" data-fluent-reveal>highlight</button></div><button class="demo-link" type="button" data-fluent-toggle>Apply fluentPreset()</button></div>'),
];

export const wire = {
  'split-text-api': (stage, lib) => {
    const els = ['[data-split-a]', '[data-split-b]', '[data-split-c]'].map((s) => stage.querySelector(s));
    const sources = els.map((e) => e.textContent);
    let splits = [];
    const run = (from) => {
      splits.forEach((s) => s.revert());
      splits = [];
      els.forEach((el, i) => {
        el.textContent = sources[i];
        const { split, timeline } = lib.splitTimeline(el, { by: 'char', preset: 'fade-up', from, stagger: 35, duration: 450 });
        splits.push(split);
        timeline.play(0);
      });
    };
    stage.addEventListener('click', (e) => {
      const b = e.target.closest('[data-from]');
      if (b) run(b.dataset.from);
    });
    run('start');
  },
  'fluent-preset': (stage, lib) => {
    let off = null;
    const b = stage.querySelector('[data-fluent-toggle]');
    b.addEventListener('click', () => {
      if (off) {
        off();
        off = null;
        b.textContent = 'Apply fluentPreset()';
      } else {
        off = lib.fluentPreset({ mica: false });
        b.textContent = 'Remove fluentPreset()';
      }
    });
  },
};
