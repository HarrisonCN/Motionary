import { C, H, K } from './make.js';

export const category = K('ui', '▤', 'UI components & variants', 'UI 组件与风格变体',
  'Animated app components — tabs with a sliding indicator, drawers, bottom sheets, pull-to-refresh, FAB speed dial, auto-hide navbar, slider, rating, popover, badge, avatar stack — and six style variants for every component: minimal, neon, glass, brutalist, fluent, material.',
  '带动画的应用组件——滑动指示条标签页、抽屉、底部面板、下拉刷新、悬浮按钮菜单、自动隐藏导航栏、滑块、评分、气泡卡片、徽标、头像组——以及适用于所有组件的六种风格：极简、霓虹、玻璃、粗野、Fluent、Material。');

const V = { key: 'variant', values: ['', 'minimal', 'neon', 'glass', 'brutalist', 'fluent', 'material'] };

export const components = [
  C('usa-tabs', 'ui', 'Tabs', '标签页',
    'Accessible tabs whose indicator slides between tabs with a spring; panels slide in from the direction you moved. Line or pill indicator.',
    '无障碍标签页，指示条以弹簧在标签间滑动；面板从切换方向滑入。线条或胶囊指示条。',
    ['role=tablist', 'indicator', 'keyboard'],
    '<usa-tabs>\n  <nav><button data-tab>One</button><button data-tab>Two</button></nav>\n  <section data-panel>…</section>\n  <section data-panel>…</section>\n</usa-tabs>',
    '<usa-tabs class="demo-wide" indicator="pill"><nav><button data-tab>Overview</button><button data-tab>Specs</button><button data-tab>Reviews</button></nav><section data-panel>Spring-driven indicator.</section><section data-panel>Arrow keys, Home and End.</section><section data-panel>★★★★★</section></usa-tabs>',
    { controls: [{ key: 'indicator', values: ['pill', 'line'] }, V] }),
  C('usa-drawer', 'ui', 'Drawer', '抽屉',
    'A side panel that springs in, drags / swipes closed, traps the page behind a backdrop and returns focus on close. Left, right, top or bottom.',
    '以弹簧滑入的侧边面板，可拖拽 / 滑动关闭，背景遮罩，关闭后焦点返回。支持左、右、上、下。',
    ['swipe', 'modal', 'Esc'],
    '<button onclick="nav.open = true">Menu</button>\n<usa-drawer id="nav" side="left" label="Navigation">…</usa-drawer>',
    '<div class="demo-row"><button class="demo-btn" type="button" data-open-drawer="left">Left drawer</button><button class="demo-btn demo-btn-alt" type="button" data-open-drawer="right">Right drawer</button></div><usa-drawer side="left" label="Demo drawer"><h3>Drawer</h3><p>Drag me closed, press Esc or tap outside.</p><button class="demo-btn" type="button" data-close>Close</button></usa-drawer>'),
  C('usa-bottom-sheet', 'ui', 'Bottom sheet', '底部面板',
    'A draggable sheet with snap points, inertia and drag-down-to-dismiss — the iOS / Android pattern for web and Windows web-view apps.',
    '带吸附点、惯性与下拉关闭的可拖拽面板——iOS / Android 风格，适用于网页与 Windows 网页视图应用。',
    ['snap points', 'inertia', 'drag'],
    '<usa-bottom-sheet snap="0.4,0.9" label="Filters">…</usa-bottom-sheet>',
    '<button class="demo-btn" type="button" data-open-sheet>Open sheet</button><usa-bottom-sheet snap="0.35,0.8" start="0" label="Demo sheet"><h3>Bottom sheet</h3><p>Drag the handle between the two snap points, or down to close.</p><button class="demo-btn" type="button" data-close>Done</button></usa-bottom-sheet>'),
  C('usa-pull-refresh', 'ui', 'Pull to refresh', '下拉刷新',
    'Pull down at the top of a list: the spinner stretches in with rubber-band resistance; release past the threshold to refresh.',
    '在列表顶部下拉：加载圈以橡皮筋阻尼拉出；超过阈值松手即刷新。',
    ['rubber-band', 'usa:refresh'],
    '<usa-pull-refresh style="height: 300px">\n  <ul>…</ul>\n</usa-pull-refresh>\n<script>el.addEventListener(\'usa:refresh\', async (e) => { await load(); e.detail.done(); });</script>',
    '<usa-pull-refresh class="demo-scroll"><ul class="demo-list"><li>Pull me down ↓</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul></usa-pull-refresh>'),
  C('usa-fab', 'ui', 'FAB speed dial', '悬浮按钮菜单',
    'A floating action button whose actions fan out with a staggered spring: up, down, left, right or radial.',
    '悬浮操作按钮，子操作以错峰弹簧展开：上、下、左、右或扇形。',
    ['speed dial', 'stagger', 'aria-expanded'],
    '<usa-fab direction="up">\n  <button aria-label="Create">＋</button>\n  <button aria-label="Photo">📷</button>\n  <button aria-label="Note">📝</button>\n</usa-fab>',
    '<div class="demo-fab-wrap"><usa-fab position="inline" direction="radial"><button type="button" aria-label="Create">＋</button><button class="demo-pill" type="button" aria-label="Photo">📷</button><button class="demo-pill" type="button" aria-label="Note">📝</button><button class="demo-pill" type="button" aria-label="Link">🔗</button></usa-fab></div>',
    { controls: [{ key: 'direction', values: ['radial', 'up', 'left', 'right', 'down'] }, V] }),
  C('usa-navbar', 'ui', 'Auto-hide navbar', '自动隐藏导航栏',
    'Hides while you scroll down, slides back on the first scroll up; shrink makes it compact once scrolled. This page’s demo scrolls an inner box.',
    '向下滚动时隐藏，一旦向上滚动立即滑回；shrink 在滚动后变得更紧凑。本页示例滚动的是内部容器。',
    ['sticky', 'scroll', 'shrink'],
    '<usa-navbar shrink>\n  <header>…</header>\n</usa-navbar>',
    '<div class="demo-scroll demo-nav-scroll" id="demo-nav-scroller"><usa-navbar shrink target="#demo-nav-scroller" class="demo-navbar"><strong>App bar</strong></usa-navbar><ul class="demo-list"><li>Scroll down ↓</li><li>…</li><li>…</li><li>…</li><li>…</li><li>…</li><li>Scroll up ↑</li></ul></div>'),
  C('usa-slider', 'ui', 'Slider', '滑块',
    'A form-associated range slider: spring-following thumb, value bubble, full keyboard support (arrows, Page Up/Down, Home/End).',
    '可参与表单的滑块：弹簧跟随的滑钮、数值气泡、完整键盘支持（方向键、PageUp/Down、Home/End）。',
    ['role=slider', 'form', 'bubble'],
    '<usa-slider name="volume" value="40" bubble label="Volume"></usa-slider>',
    '<usa-slider class="demo-wide" value="40" bubble label="Volume"></usa-slider>',
    { controls: [V] }),
  C('usa-rating', 'ui', 'Rating', '评分',
    'Stars with hover preview and a springy pop; keyboard (arrows, number keys), form value, read-only mode.',
    '带悬停预览与弹跳效果的星级评分；支持键盘（方向键、数字键）、表单值与只读模式。',
    ['stars', 'role=slider'],
    '<usa-rating value="4" name="stars"></usa-rating>',
    '<div class="demo-stack"><usa-rating value="4"></usa-rating><usa-rating value="3" icon="♥" max="5" readonly style="--usa-rating-on:#f43f5e"></usa-rating></div>'),
  C('usa-popover', 'ui', 'Popover', '气泡卡片',
    'Click-to-open panel that springs from its trigger; Esc / outside click closes, focus returns.',
    '点击打开、从触发元素弹出的面板；Esc 或点击外部关闭，焦点返回。',
    ['dialog', 'aria-expanded'],
    '<usa-popover>\n  <button>Share</button>\n  <div data-popover>…</div>\n</usa-popover>',
    '<usa-popover><button class="demo-btn" type="button">Share ▾</button><div data-popover><p>Copy link · Email · Embed</p></div></usa-popover>',
    { controls: [V] }),
  C('usa-badge', 'ui', 'Badge', '徽标',
    'Count or dot badge that bumps with a spring when its value changes; 99+ capping, optional pulse.',
    '数字或圆点徽标，数值变化时以弹簧跳动；超过 99 显示 99+，可选脉冲。',
    ['count', 'pulse', 'role=status'],
    '<usa-badge value="3">\n  <button>Inbox</button>\n</usa-badge>',
    '<div class="demo-row"><usa-badge value="3" data-badge-demo><button class="demo-btn" type="button">Inbox +1</button></usa-badge><usa-badge dot pulse><span class="demo-pill">🔔</span></usa-badge><usa-badge value="120"><span class="demo-pill">✉</span></usa-badge></div>'),
  C('usa-avatar-stack', 'ui', 'Avatar stack', '头像组',
    'Overlapping avatars that spread apart with a spring on hover; extras collapse into “+N”.',
    '重叠的头像在悬停时以弹簧展开；多余的折叠为“+N”。',
    ['avatars', 'group'],
    '<usa-avatar-stack max="4">\n  <img src="a.jpg" alt="Ana">\n  …\n</usa-avatar-stack>',
    '<usa-avatar-stack max="4" size="40" label="Team">' + ['A', 'B', 'C', 'D', 'E', 'F'].map((t, i) => `<span class="demo-avatar" style="--h:${i * 55}">${t}</span>`).join('') + '</usa-avatar-stack>'),
];

export const helpers = [
  H('variants', 'ui', 'setVariant',
    'Six style variants for every component: variant="minimal | neon | glass | brutalist | fluent | material" on an element, data-usa-variant on any ancestor, or setVariant() for the whole app.',
    '适用于所有组件的六种风格：在元素上设置 variant="minimal | neon | glass | brutalist | fluent | material"，在任意祖先上设置 data-usa-variant，或用 setVariant() 作用于整个应用。',
    ['minimal', 'neon', 'glass', 'brutalist', 'fluent', 'material'],
    "import { setVariant } from 'motionary/components/ui';\n\nsetVariant('fluent'); // whole app (Windows 11 look)\n// or per element:\n// <usa-slider variant=\"neon\"></usa-slider>",
    '<div class="demo-stack demo-variants" data-variant-demo><div class="demo-row"><select aria-label="variant" data-variant-pick><option>neon</option><option>minimal</option><option>glass</option><option>brutalist</option><option>fluent</option><option>material</option></select></div><div class="demo-row" data-usa-variant="neon"><usa-switch checked>Switch</usa-switch><usa-checkbox checked>Check</usa-checkbox></div><usa-slider value="60" data-usa-variant="neon" label="Demo"></usa-slider></div>'),
];

export const wire = {
  drawer: (stage) => {
    const d = stage.querySelector('usa-drawer');
    stage.querySelectorAll('[data-open-drawer]').forEach((b) =>
      b.addEventListener('click', () => {
        d.setAttribute('side', b.dataset.openDrawer);
        d.open = true;
      })
    );
  },
  'bottom-sheet': (stage) => {
    const s = stage.querySelector('usa-bottom-sheet');
    stage.querySelector('[data-open-sheet]').addEventListener('click', () => (s.open = true));
  },
  'pull-refresh': (stage) => {
    stage.querySelector('usa-pull-refresh').addEventListener('usa:refresh', (e) => setTimeout(e.detail.done, 1200));
  },
  badge: (stage) => {
    const b = stage.querySelector('[data-badge-demo]');
    b.addEventListener('click', () => (b.value = String(Number(b.value || 0) + 1)));
  },
  variants: (stage) => {
    const pick = stage.querySelector('[data-variant-pick]');
    pick.addEventListener('change', () => stage.querySelectorAll('[data-usa-variant]').forEach((el) => el.setAttribute('data-usa-variant', pick.value)));
  },
};
