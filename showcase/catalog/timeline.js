import { C, H, K } from './make.js';

export const category = K('timeline', '⏱', 'Timeline & choreography', '时间线与编排',
  'One playhead for many animations: chain, overlap, labels, stagger, seek, reverse and scroll-scrub — as a JS API or declaratively with data-tl children.',
  '一个播放头驱动多段动画：串联、重叠、标签、错峰、跳转、倒放与滚动擦洗 —— 可用 JS API，也可用 data-tl 子元素声明式编写。');

export const components = [
  C('usa-timeline', 'timeline', 'Timeline', '时间线',
    'Every data-tl child becomes a step in document order. data-at (\'-=200\', \'<\', \'label+=100\') overlaps or aligns steps; scrub ties progress to scroll; trigger view / click / manual.',
    '每个 data-tl 子元素按文档顺序成为一步。data-at（\'-=200\'、\'<\'、\'label+=100\'）用于重叠或对齐；scrub 让进度跟随滚动；trigger 支持 view / click / manual。',
    ['choreography', 'sequence', 'scrub', 'labels', 'overlap'],
    '<usa-timeline overlap="150">\n  <h2 data-tl="fade-up">Title</h2>\n  <p data-tl="blur">Subtitle</p>\n  <button data-tl="scale" data-at="<+=100">CTA</button>\n</usa-timeline>',
    '<usa-timeline trigger="click" overlap="150" duration="500" tabindex="0"><div class="demo-row"><span class="demo-pill" data-tl="fade-up">1</span><span class="demo-pill" data-tl="scale">2</span><span class="demo-pill" data-tl="rotate">3</span><span class="demo-tile" data-tl="clip-right">Tap to replay</span></div></usa-timeline>',
    { controls: [{ key: 'overlap', values: ['0', '150', '300'] }], replay: true }),
];

export const helpers = [
  H('timeline-api', 'timeline', 'timeline',
    'Chain .to() steps with positions (\'-=200\' overlap, \'<\' with previous, labels), then play(), reverse(), seek(), progress() or scrub(section) with scroll. Reduced motion jumps to the end.',
    '用位置参数串联 .to() 步骤（\'-=200\' 重叠、\'<\' 与上一步同时、标签），再 play()、reverse()、seek()、progress()，或用 scrub(section) 跟随滚动。减少动态效果时直接跳到结尾。',
    ['timeline', 'scrub', 'seek', 'reverse'],
    "import { timeline } from 'motionary/components/timeline';\n\nconst tl = timeline({ defaults: { duration: 500 } })\n  .to('.title', 'fade-up')\n  .label('cards')\n  .to('.card', 'scale', { stagger: 80, at: '-=200' })\n  .to('.cta', 'blur', { at: 'cards+=400' });\n\ntl.play();\n// or: tl.scrub(document.querySelector('.hero'))",
    '<div class="demo-row"><span class="demo-pill" data-tl-a>A</span><span class="demo-pill" data-tl-b>B</span><span class="demo-pill" data-tl-c>C</span></div><div class="demo-row"><button type="button" class="demo-link" data-tl-play>Play</button><button type="button" class="demo-link" data-tl-rev>Reverse</button><input type="range" min="0" max="100" value="0" aria-label="Scrub" data-tl-range></div>'),
  H('scrub-native', 'timeline', 'supportsNativeScrub',
    'tl.scrub(el) ties a timeline to scroll. 4.1 runs it on the browser\'s native ScrollTimeline / ViewTimeline (off the main thread) and falls back to a rAF listener elsewhere; { source: \'scroll\' } follows a scroll container. Scroll inside the box.',
    'tl.scrub(el) 让时间线跟随滚动。4.1 起优先使用浏览器原生 ScrollTimeline / ViewTimeline（不占主线程），不支持时回退到 rAF 监听；{ source: \'scroll\' } 跟随滚动容器。请在框内滚动。',
    ['scroll-driven', 'ScrollTimeline', 'ViewTimeline', 'fallback'],
    "const stop = timeline({ defaults: { duration: 400 } })\n  .to('.a', 'fade-up')\n  .to('.b', 'scale', { at: '-=200' })\n  .scrub(box, { source: 'scroll' });\n\nstop.native; // true on Chromium 115+",
    '<div class="demo-scrub" data-scrub-box tabindex="0" aria-label="Scrollable demo"><div class="demo-scrub-pin"><span class="demo-pill" data-s1>1</span><span class="demo-pill" data-s2>2</span><span class="demo-pill" data-s3>3</span></div><div class="demo-scrub-track"></div></div><p class="demo-note" data-scrub-out></p>'),
];

export const wire = {
  'scrub-native': (stage, lib) => {
    const q = (s) => stage.querySelector(s);
    const stop = lib.timeline({ defaults: { duration: 400 } })
      .to(q('[data-s1]'), 'fade-up')
      .to(q('[data-s2]'), 'scale', { at: '-=200' })
      .to(q('[data-s3]'), 'rotate', { at: '-=200' })
      .scrub(q('[data-scrub-box]'), { source: 'scroll' });
    q('[data-scrub-out]').textContent = stop.native ? 'native ScrollTimeline ✓' : 'JS fallback';
  },
  'timeline-api': (stage, lib) => {
    const q = (s) => stage.querySelector(s);
    const tl = lib.timeline({ defaults: { duration: 500 }, onUpdate: (p) => (q('[data-tl-range]').value = String(Math.round(p * 100))) })
      .to(q('[data-tl-a]'), 'fade-up')
      .to(q('[data-tl-b]'), 'scale', { at: '-=250' })
      .to(q('[data-tl-c]'), 'rotate', { at: '<+=100' });
    tl.seek(0);
    q('[data-tl-play]').addEventListener('click', () => tl.play(0));
    q('[data-tl-rev]').addEventListener('click', () => tl.reverse());
    q('[data-tl-range]').addEventListener('input', (e) => tl.progress(Number(e.target.value) / 100));
  },
};
