import { C, H, K } from './make.js';

export const category = K('page', '⬚', 'Page & app-wide', '页面与全局效果',
  'Effects for the whole page or app: View Transitions page changes (fade, slide, circle reveal, blinds, pixel dissolve — SPA and MPA), theme circle reveal, custom cursors, smooth scrolling, full-page snapping, loading bar, back-to-top, ambient particles / snow / stars / grain / scroll gradient, splash screen, automatic skeletons and a global motion-intensity switch.',
  '作用于整个页面或应用的效果：View Transitions 页面切换（淡入、滑动、圆形揭示、百叶窗、像素溶解——支持单页与多页）、主题圆形切换、自定义光标、平滑滚动、整屏吸附、顶部加载条、回到顶部、全局粒子 / 雪花 / 星空 / 噪点 / 滚动渐变氛围、启动屏、自动骨架屏与全局动效强度开关。');

export const components = [
  C('usa-cursor', 'page', 'Custom cursor', '自定义光标',
    'A spring-lagged ring, a comet trail, a magnetic ring that wraps buttons and links, or a soft glow following the pointer. Mouse / pen only.',
    '弹簧跟随的圆环、彗星拖尾、吸附并包裹按钮与链接的磁性光标，或跟随指针的柔光。仅鼠标 / 手写笔。',
    ['cursor', 'magnetic', 'trail', 'glow'],
    '<usa-cursor mode="magnetic" hide-native></usa-cursor>',
    '<div class="demo-row"><button class="demo-btn" type="button" data-cursor-mode="magnetic">Magnetic</button><button class="demo-btn demo-btn-alt" type="button" data-cursor-mode="trail">Trail</button><button class="demo-btn demo-btn-alt" type="button" data-cursor-mode="glow">Glow</button><button class="demo-btn demo-btn-alt" type="button" data-cursor-mode="off">Off</button></div><usa-cursor hidden></usa-cursor>'),
  C('usa-fullpage', 'page', 'Full-page sections', '整屏滚动',
    'Full-screen sections that snap one at a time, with keyboard paging, dot navigation and a usa:section event.',
    '一次吸附一屏的全屏分区，支持键盘翻页、圆点导航与 usa:section 事件。',
    ['scroll-snap', 'keyboard', 'dots'],
    '<usa-fullpage dots>\n  <section>One</section>\n  <section>Two</section>\n</usa-fullpage>',
    '<usa-fullpage class="demo-fullpage" dots><section><h3>One</h3><p>Scroll or PageDown</p></section><section><h3>Two</h3></section><section><h3>Three</h3></section></usa-fullpage>'),
  C('usa-loading-bar', 'page', 'Top loading bar', '顶部加载条',
    'A slim NProgress-style bar for route changes and fetches: loadingBar.start() trickles, done() completes and fades.',
    'NProgress 风格的细加载条，适用于路由切换与请求：loadingBar.start() 渐进，done() 完成并淡出。',
    ['loadingBar', 'route change', 'role=progressbar'],
    "<script type=\"module\">\n  import { loadingBar } from 'use-scroll-animate/components/page';\n  await loadingBar.track(fetch('/api'));\n</script>",
    '<div class="demo-row"><button class="demo-btn" type="button" data-loading="start">start()</button><button class="demo-btn demo-btn-alt" type="button" data-loading="done">done()</button></div><usa-loading-bar></usa-loading-bar>'),
  C('usa-back-to-top', 'page', 'Back to top', '回到顶部',
    'Appears after you scroll, shows reading progress as a ring and springs the page back up, then moves focus to the top.',
    '滚动后出现，用圆环显示阅读进度，以弹簧回到顶部并把焦点移回页首。',
    ['progress ring', 'a11y'],
    '<usa-back-to-top offset="400"></usa-back-to-top>',
    '<p class="demo-note">Scroll down this page — the button appears bottom-right.</p><usa-back-to-top></usa-back-to-top>'),
  C('usa-ambient', 'page', 'Ambient layer', '全局氛围',
    'A fixed page-wide layer: drifting particles, falling snow, twinkling stars, film grain or a gradient that shifts with scroll.',
    '固定在整页的氛围层：漂浮粒子、飘雪、闪烁星空、胶片噪点或随滚动变化的渐变。',
    ['snow', 'stars', 'noise', 'gradient'],
    '<usa-ambient effect="snow" density="1.2"></usa-ambient>',
    '<div class="demo-row"><select aria-label="effect" data-ambient-pick><option value="">none</option><option>snow</option><option>stars</option><option>particles</option><option>noise</option><option>gradient</option></select></div>'),
  C('usa-splash', 'page', 'Splash screen', '启动屏',
    'An app launch screen that leaves (fade, scale, slide-up, circle) once the page has loaded — never sooner than min ms.',
    '应用启动屏，在页面加载完成后离开（淡出、缩放、上滑、圆形），且不早于 min 毫秒。',
    ['launch', 'PWA', 'WebView2'],
    '<usa-splash exit="circle" min="800">\n  <img src="logo.svg" alt="">\n</usa-splash>',
    '<button class="demo-btn" type="button" data-splash>Show splash</button>'),
  C('usa-auto-skeleton', 'page', 'Auto skeleton', '自动骨架屏',
    'Set loading and every heading, paragraph, image and button inside becomes a shimmering placeholder of its own size — no extra markup.',
    '设置 loading 后，内部所有标题、段落、图片与按钮都会变成同尺寸的闪烁占位——无需额外标记。',
    ['skeleton', 'loading', 'aria-busy'],
    '<usa-auto-skeleton loading>\n  <h3>{{ title }}</h3>\n  <p>{{ body }}</p>\n</usa-auto-skeleton>',
    '<usa-auto-skeleton class="demo-wide" loading><h4>Profile card</h4><p>Ana Tanaka · Product designer</p><button class="demo-btn" type="button">Follow</button></usa-auto-skeleton><button class="demo-link" type="button" data-skel-toggle>Toggle loading</button>'),
  C('usa-motion-switch', 'page', 'Motion intensity', '动效强度',
    'Let users pick Off · Low · Normal · High for the whole app; scales every component, persists, and Off equals reduced motion.',
    '让用户为整个应用选择 关 · 低 · 正常 · 高；作用于所有组件并被记住，“关”等同于减少动态效果。',
    ['motion', 'a11y', 'setMotionIntensity'],
    '<usa-motion-switch></usa-motion-switch>\n<!-- or: setMotionIntensity(\'low\', true) -->',
    '<usa-motion-switch></usa-motion-switch>'),
];

export const helpers = [
  H('motion-sensitivity', 'page', 'setMotionSensitivity',
    'Accessibility toolkit (4.4): motion-sensitivity levels (full · gentle — no spins / zooms / parallax · minimal — fades only · static), static alternatives for every component, shared aria-live regions with announce(), and auditMotionA11y() — the rules the automated regression tests run over every element.',
    '无障碍工具（4.4）：运动敏感度分级（全部 · 温和——无旋转/缩放/视差 · 最少——仅淡入淡出 · 静态），每个组件的静态替代，共享 aria-live 区域与 announce()，以及 auditMotionA11y() —— 自动化回归测试对每个元素运行的同一套规则。',
    ['a11y', 'vestibular', 'aria-live', 'WCAG', 'reduced motion'],
    "import { setMotionSensitivity, announce, auditMotionA11y } from 'use-scroll-animate/components/a11y';\n\nsetMotionSensitivity('gentle', true);   // remembered; restoreMotionSensitivity() on load\nannounce('Added to cart');                 // shared polite live region\nconsole.table(auditMotionA11y(document.body).errors);",
    '<div class="demo-row"><span class="demo-pill" data-sens-pill>✦</span><span class="demo-pill" data-sens-pill>✦</span><span class="demo-pill" data-sens-pill>✦</span></div><div class="demo-row"><button type="button" class="demo-link" data-sens="full">full</button><button type="button" class="demo-link" data-sens="gentle">gentle</button><button type="button" class="demo-link" data-sens="minimal">minimal</button><button type="button" class="demo-link" data-sens="static">static</button><button type="button" class="demo-link" data-sens-audit>audit page</button></div><p class="demo-note" data-sens-out aria-live="polite"></p>'),
  H('motion-tokens', 'page', 'applyMotionTokens',
    'Motion design tokens (4.2): duration, easing and spring scales as CSS variables (--usa-duration-fast, --usa-easing-emphasized…) and W3C Design Tokens JSON; import from Figma Tokens or Style Dictionary. timeline() accepts token names.',
    '动效设计令牌（4.2）：时长、缓动与弹簧刻度，以 CSS 变量（--usa-duration-fast、--usa-easing-emphasized…）与 W3C 设计令牌 JSON 提供；可从 Figma Tokens 或 Style Dictionary 导入。timeline() 可直接使用令牌名。',
    ['tokens', 'design system', 'Figma', 'Style Dictionary'],
    "import { applyMotionTokens, importMotionTokens, motionVar } from 'use-scroll-animate/components/tokens';\n\napplyMotionTokens(importMotionTokens(figmaJson));\n// CSS: transition: transform var(--usa-duration-fast) var(--usa-easing-emphasized);\ntimeline().to('.card', 'fade-up', { duration: 'slow', easing: 'spring' });",
    '<div class="demo-row" data-tok-row><span class="demo-pill">1</span><span class="demo-pill">2</span><span class="demo-pill">3</span></div><div class="demo-row"><button type="button" class="demo-link" data-tok="fast">fast</button><button type="button" class="demo-link" data-tok="normal">normal</button><button type="button" class="demo-link" data-tok="slow">slow</button><select aria-label="Easing token" data-tok-ease><option>emphasized</option><option>spring</option><option>bounce</option><option>standard</option></select></div><p class="demo-note" data-tok-out></p>'),
  H('page-transition', 'page', 'pageTransition',
    'Animated route changes with the View Transitions API: fade, slide, circle reveal from the click, blinds, pixel dissolve, zoom. enableMpaTransitions() does the same across real page loads; themeTransition() circle-reveals a theme switch.',
    '基于 View Transitions API 的路由切换动画：淡入、滑动、从点击处圆形揭示、百叶窗、像素溶解、缩放。enableMpaTransitions() 用于真实页面跳转；themeTransition() 以圆形揭示切换主题。',
    ['View Transitions', 'SPA', 'MPA', 'theme'],
    "import { pageTransition, themeTransition } from 'use-scroll-animate/components/page';\n\nawait pageTransition(() => router.render(next), { effect: 'circle' });\nthemeTransition(() => document.documentElement.classList.toggle('dark'));",
    '<div class="demo-stack"><div class="demo-row"><select aria-label="effect" data-pt-pick><option>circle</option><option>fade</option><option>slide</option><option>slide-right</option><option>slide-up</option><option>blinds</option><option>pixel</option><option>zoom</option></select><button class="demo-btn" type="button" data-pt-go>Transition</button><button class="demo-btn demo-btn-alt" type="button" data-theme-go>Theme ◐</button></div><div class="demo-tile" data-pt-target>Page 1</div></div>'),
  H('smooth-scroll', 'page', 'smoothScroll',
    'Inertial wheel smoothing for the page (touch and keyboard stay native) and scrollToTarget() with spring timing. No-op under reduced motion.',
    '页面滚轮惯性平滑（触摸与键盘保持原生），以及弹簧节奏的 scrollToTarget()。减少动态效果时不生效。',
    ['smooth scroll', 'lerp', 'scrollTo'],
    "import { smoothScroll, scrollToTarget } from 'use-scroll-animate/components/page';\n\nconst stop = smoothScroll({ lerp: 0.1 });\nscrollToTarget('#pricing', { offset: 80 });",
    '<div class="demo-row"><button class="demo-btn" type="button" data-smooth>Enable smooth scroll</button><button class="demo-btn demo-btn-alt" type="button" data-scroll-to>scrollToTarget(#windows)</button></div>'),
];

export const wire = {
  'motion-sensitivity': (stage, lib) => {
    const out = stage.querySelector('[data-sens-out]');
    const frames = [{ opacity: 0, transform: 'translateY(16px) scale(0.4) rotate(-180deg)' }, { opacity: 1, transform: 'none' }];
    stage.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sens]');
      if (b) {
        const level = b.dataset.sens;
        const f = lib.adaptKeyframes(frames, level);
        stage.querySelectorAll('[data-sens-pill]').forEach((p, i) => (level === 'static' ? null : p.animate(f, { duration: 700, delay: i * 90, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'backwards' })));
        out.textContent = lib.MOTION_SENSITIVITY[level].en;
        lib.announce(`Motion: ${level}`);
      }
      if (e.target.closest('[data-sens-audit]')) {
        const r = lib.auditMotionA11y(document.querySelector('main') || document.body);
        out.textContent = `${r.errors.length} errors · ${r.warnings.length} warnings`;
      }
    });
  },
  'motion-tokens': (stage, lib) => {
    const q = (s) => stage.querySelector(s);
    stage.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tok]');
      if (!b) return;
      const ease = q('[data-tok-ease]').value;
      q('[data-tok-out]').textContent = `${lib.motionToken('duration', b.dataset.tok)}ms · ${lib.motionToken('easing', ease)}`;
      lib.timeline({ defaults: { duration: b.dataset.tok, easing: ease, stagger: 60 } }).to(stage.querySelectorAll('[data-tok-row] .demo-pill'), 'fade-up').play(0);
    });
  },
  cursor: (stage) => {
    let cur = null;
    stage.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cursor-mode]');
      if (!b) return;
      cur?.remove();
      cur = null;
      if (b.dataset.cursorMode === 'off') return;
      cur = document.createElement('usa-cursor');
      cur.setAttribute('mode', b.dataset.cursorMode);
      document.body.append(cur);
    });
  },
  'loading-bar': (stage, lib) => {
    stage.addEventListener('click', (e) => {
      const b = e.target.closest('[data-loading]');
      if (b) lib.loadingBar[b.dataset.loading]();
    });
  },
  ambient: (stage) => {
    let amb = null;
    stage.querySelector('[data-ambient-pick]').addEventListener('change', (e) => {
      amb?.remove();
      amb = null;
      if (!e.target.value) return;
      amb = document.createElement('usa-ambient');
      amb.setAttribute('effect', e.target.value);
      document.body.append(amb);
    });
  },
  splash: (stage) => {
    stage.querySelector('[data-splash]').addEventListener('click', () => {
      const s = document.createElement('usa-splash');
      s.setAttribute('exit', 'circle');
      s.setAttribute('min', '900');
      s.innerHTML = '<strong style="font-size:2rem">use-scroll-animate</strong>';
      document.body.append(s);
      s.addEventListener('usa:done', () => s.remove());
    });
  },
  'auto-skeleton': (stage) => {
    const s = stage.querySelector('usa-auto-skeleton');
    stage.querySelector('[data-skel-toggle]').addEventListener('click', () => (s.loading = !s.loading));
  },
  'page-transition': (stage, lib) => {
    const t = stage.querySelector('[data-pt-target]');
    let n = 1;
    stage.querySelector('[data-pt-go]').addEventListener('click', () =>
      lib.pageTransition(() => (t.textContent = `Page ${++n}`), { effect: stage.querySelector('[data-pt-pick]').value, fallback: t })
    );
    stage.querySelector('[data-theme-go]').addEventListener('click', () =>
      lib.themeTransition(() => document.getElementById('theme-toggle')?.click())
    );
  },
  'smooth-scroll': (stage, lib) => {
    let stop = null;
    const b = stage.querySelector('[data-smooth]');
    b.addEventListener('click', () => {
      if (stop) {
        stop();
        stop = null;
        b.textContent = 'Enable smooth scroll';
      } else {
        stop = lib.smoothScroll();
        b.textContent = 'Disable smooth scroll';
      }
    });
    stage.querySelector('[data-scroll-to]').addEventListener('click', () => lib.scrollToTarget('#windows', { offset: 60 }));
  },
};
