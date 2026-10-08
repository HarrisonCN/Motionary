import { C, H, K } from './make.js';

export const category = K('packs', '🎁', 'Effect packs', '效果包',
  'Ready-made motion for whole page types — e-commerce, portfolio, dashboard, game UI and landing pages. Mark elements with data-role and apply a pack.',
  '面向整类页面的现成动效 —— 电商、作品集、仪表盘、游戏 UI 与落地页。用 data-role 标记元素，再套用效果包。');

const P = (name, en, zh, descEn, descZh, tags, usage, demo) =>
  C('usa-pack', 'packs', en, zh, descEn, descZh, tags, usage, demo, { id: `pack-${name}`, define: 'definePack', replay: true });

export const components = [
  P('ecommerce', 'E-commerce pack', '电商效果包',
    'Product cards reveal and lift, “Add to cart” presses and flies the product into the cart (which bumps), prices count up, badges pulse.',
    '商品卡片依次显现并悬浮抬起，“加入购物车”按下后商品飞入购物车（购物车弹跳），价格滚动计数，徽章脉动。',
    ['shop', 'cart', 'product', 'fly to cart'],
    '<usa-pack name="ecommerce">\n  <article data-role="product">\n    <img src="shoe.jpg" alt="Runner">\n    <span data-role="price">$129</span>\n    <button data-role="add-to-cart">Add to cart</button>\n  </article>\n  <a data-role="cart" href="/cart">Cart</a>\n</usa-pack>',
    '<usa-pack name="ecommerce" class="demo-pack"><div class="demo-row"><div class="demo-pack__card" data-role="product"><span class="demo-pack__thumb" data-role="thumb">👟</span><b data-role="price">$129</b><button type="button" class="demo-link" data-role="add-to-cart">Add</button></div><div class="demo-pack__card" data-role="product"><span class="demo-pack__thumb" data-role="thumb">🎧</span><b data-role="price">$249</b><button type="button" class="demo-link" data-role="add-to-cart">Add</button></div><span class="demo-pack__cart" data-role="cart" aria-label="Cart">🛒</span></div></usa-pack>'),
  P('portfolio', 'Portfolio pack', '作品集效果包',
    'Headings and projects reveal in sequence, projects lift on hover, stats count up, the contact button pulses.',
    '标题与项目依次显现，项目悬停抬起，数据滚动计数，联系按钮脉动。',
    ['portfolio', 'projects', 'case study'],
    '<usa-pack name="portfolio">\n  <h2 data-role="heading">Selected work</h2>\n  <a data-role="project" href="/work/1">…</a>\n  <b data-role="stat">120</b> clients\n  <a data-role="contact" href="mailto:…">Say hi</a>\n</usa-pack>',
    '<usa-pack name="portfolio" class="demo-pack"><h4 data-role="heading">Selected work</h4><div class="demo-row"><span class="demo-tile" data-role="project">A</span><span class="demo-tile" data-role="project">B</span></div><p><b data-role="stat">120</b> clients · <a class="demo-link" data-role="contact" href="#">Say hi</a></p></usa-pack>'),
  P('dashboard', 'Dashboard pack', '仪表盘效果包',
    'KPI cards reveal, numbers count up from zero, alerts pulse, action buttons press.',
    'KPI 卡片显现，数字从零滚动增长，告警脉动，操作按钮有按压反馈。',
    ['dashboard', 'kpi', 'admin', 'analytics'],
    '<usa-pack name="dashboard">\n  <div data-role="card">Revenue <b data-role="stat">48,210</b></div>\n  <span data-role="alert">3 incidents</span>\n</usa-pack>',
    '<usa-pack name="dashboard" class="demo-pack"><div class="demo-row"><div class="demo-pack__card" data-role="card">Revenue<b data-role="stat">$48,210</b></div><div class="demo-pack__card" data-role="card">Users<b data-role="stat">1,284</b></div><span class="demo-pill" data-role="alert">!</span></div></usa-pack>'),
  P('game', 'Game UI pack', '游戏 UI 效果包',
    'Buttons press, the score counts up and bumps, items float, a hit shakes, rewards pulse.',
    '按钮按压，分数滚动并弹跳，道具漂浮，受击抖动，奖励脉动。',
    ['game', 'score', 'hud', 'reward'],
    '<usa-pack name="game">\n  <b data-role="score">9,800</b>\n  <img data-role="item" src="gem.png" alt="Gem">\n  <button data-role="button">Play</button>\n</usa-pack>',
    '<usa-pack name="game" class="demo-pack"><div class="demo-row"><b data-role="score">9,800</b><span class="demo-pill" data-role="item">💎</span><span class="demo-pill" data-role="item">⭐</span><button type="button" class="demo-link" data-role="button">Play</button><span class="demo-pill" data-role="hit" tabindex="0">👾</span></div></usa-pack>'),
  P('landing', 'Landing page pack', '落地页效果包',
    'Hero and features reveal in sequence, features lift, logos float gently, stats count up, the CTA pulses and presses.',
    '首屏与特性依次显现，特性卡片悬停抬起，Logo 轻轻漂浮，数据滚动计数，CTA 脉动并有按压反馈。',
    ['landing', 'hero', 'marketing', 'cta'],
    '<usa-pack name="landing">\n  <header data-role="hero">…</header>\n  <section data-role="feature">…</section>\n  <a data-role="cta" href="/signup">Start free</a>\n</usa-pack>',
    '<usa-pack name="landing" class="demo-pack"><h4 data-role="hero">Ship faster</h4><div class="demo-row"><span class="demo-tile" data-role="feature">⚡</span><span class="demo-tile" data-role="feature">🔒</span></div><a class="demo-link" data-role="cta" href="#">Start free</a></usa-pack>'),
];

export const helpers = [
  H('apply-pack', 'packs', 'applyPack',
    'applyPack(name, root) applies a pack to any container without the element; returns an undo function. flyToCart(from, to) and countUp(el) are exported too.',
    'applyPack(name, root) 无需元素即可对任意容器套用效果包，返回撤销函数。另导出 flyToCart(from, to) 与 countUp(el)。',
    ['pack', 'fly to cart', 'count up'],
    "import { applyPack, flyToCart } from 'motionary/components/packs';\n\nconst undo = applyPack('ecommerce', document.querySelector('main'));\nawait flyToCart(productImage, cartIcon);",
    '<div class="demo-row"><span class="demo-pill" data-fly-from>📦</span><span class="demo-pack__cart" data-fly-to>🛒</span><button type="button" class="demo-link" data-fly-btn>Fly</button></div>'),
];

export const wire = {
  'apply-pack': (stage, lib) => {
    stage.querySelector('[data-fly-btn]').addEventListener('click', () => lib.flyToCart(stage.querySelector('[data-fly-from]'), stage.querySelector('[data-fly-to]')));
  },
};
