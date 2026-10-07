import { C, H, K, pills } from './make.js';

export const category = K('layout', '▦', 'Layout animation', '布局动画',
  'Layout changes that animate themselves: auto-animated list and grid reflow (add, remove, sort, filter), masonry grids, and shared-element transitions between views.',
  '自动产生动画的布局变化：列表与网格重排（增、删、排序、筛选）自动动画、瀑布流网格，以及视图间的共享元素过渡。');

export const components = [
  C('usa-auto-animate', 'layout', 'Auto-animate', '自动动画',
    'Wrap a list or grid: items that are added fade in, removed ones fade out in place, and everything else glides to its new spot — on sort, filter or resize. Zero code at the call site.',
    '包裹列表或网格：新增项淡入、删除项原地淡出，其余元素在排序、筛选或尺寸变化时平滑滑到新位置。调用处零代码。',
    ['auto animate', 'reflow', 'list', 'grid', 'FLIP'],
    '<usa-auto-animate>\n  <ul class="todo">…</ul>\n</usa-auto-animate>\n\n<!-- or on any element: -->\n<script type="module">\n  import { autoAnimate } from \'use-scroll-animate/components/layout\';\n  autoAnimate(document.querySelector(\'.grid\'));\n</script>',
    `<div class="demo-row"><button type="button" class="demo-link" data-aa-add>Add</button><button type="button" class="demo-link" data-aa-shuffle>Shuffle</button><button type="button" class="demo-link" data-aa-remove>Remove</button></div><usa-auto-animate class="demo-aa">${pills(5)}</usa-auto-animate>`),
  C('usa-masonry', 'layout', 'Masonry', '瀑布流',
    'Pinterest-style masonry: items drop into the shortest column and glide when the width, the items or their sizes change. CSS columns before JS runs.',
    'Pinterest 风格瀑布流：元素落入最短的列，宽度、元素或尺寸变化时平滑移动。JS 运行前使用 CSS 多列布局。',
    ['masonry', 'pinterest', 'grid', 'gallery'],
    '<usa-masonry min="220" gap="16">\n  <img src="1.jpg" alt="…">\n  <img src="2.jpg" alt="…">\n</usa-masonry>',
    '<usa-masonry min="80" gap="8" class="demo-masonry"><div style="height:60px"></div><div style="height:100px"></div><div style="height:40px"></div><div style="height:80px"></div><div style="height:55px"></div><div style="height:90px"></div></usa-masonry>',
    { controls: [{ key: 'min', values: ['60', '80', '120'] }] }),
];

export const helpers = [
  H('shared-transition', 'layout', 'sharedTransition',
    'sharedTransition(update) — elements with the same data-shared="id" before and after update() morph into each other (View Transitions API, FLIP fallback); everything else cross-fades.',
    'sharedTransition(update) —— update() 前后具有相同 data-shared="id" 的元素相互变形（View Transitions API，FLIP 回退）；其余内容交叉淡化。',
    ['shared element', 'hero', 'view transitions', 'FLIP'],
    "import { sharedTransition } from 'use-scroll-animate/components/layout';\n\n// <img data-shared=\"photo-1\"> in the grid and in the detail view\nawait sharedTransition(() => {\n  grid.hidden = true;\n  detail.hidden = false;\n});",
    '<div class="demo-shared"><div data-shared-grid class="demo-row"><button type="button" class="demo-shared__thumb" data-shared="s1" aria-label="Open">1</button><button type="button" class="demo-shared__thumb" data-shared="s2" aria-label="Open">2</button></div><div data-shared-detail hidden><div class="demo-shared__big" data-shared-big>1</div><button type="button" class="demo-link" data-shared-back>Back</button></div></div>'),
];

export const wire = {
  'auto-animate': (stage) => {
    const box = stage.querySelector('usa-auto-animate');
    let n = box.children.length;
    stage.querySelector('[data-aa-add]').addEventListener('click', () => {
      const s = document.createElement('span');
      s.className = 'demo-pill';
      s.textContent = String(++n);
      box.insertBefore(s, box.children[Math.floor(Math.random() * (box.children.length + 1))] || null);
    });
    stage.querySelector('[data-aa-shuffle]').addEventListener('click', () => {
      [...box.children].sort(() => Math.random() - 0.5).forEach((c) => box.append(c));
    });
    stage.querySelector('[data-aa-remove]').addEventListener('click', () => box.lastElementChild?.remove());
  },
  'shared-transition': (stage, lib) => {
    const grid = stage.querySelector('[data-shared-grid]');
    const detail = stage.querySelector('[data-shared-detail]');
    const big = stage.querySelector('[data-shared-big]');
    grid.querySelectorAll('[data-shared]').forEach((t) =>
      t.addEventListener('click', () =>
        lib.sharedTransition(() => {
          big.dataset.shared = t.dataset.shared;
          big.textContent = t.textContent;
          delete t.dataset.shared;
          t.dataset.was = big.dataset.shared;
          grid.hidden = true;
          detail.hidden = false;
        }, stage)
      )
    );
    stage.querySelector('[data-shared-back]').addEventListener('click', () =>
      lib.sharedTransition(() => {
        const t = grid.querySelector(`[data-was="${big.dataset.shared}"]`);
        t.dataset.shared = big.dataset.shared;
        delete big.dataset.shared;
        grid.hidden = false;
        detail.hidden = true;
      }, stage)
    );
  },
};
