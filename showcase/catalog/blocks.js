import { C } from './make.js';

const x = { entry: 'widgets', since: '17.11' };
const img = 'assets/demo-photo.jpg';
const pics = (n) => Array.from({ length: n }, (_, i) => `<img src="${img}" alt="Photo ${i + 1}">`).join('');
export const components = [
  // UI blocks
  C("usa-search-bar", "ui", "Expanding search bar", "展开式搜索栏", "A search button that widens into a field; / focuses it, suggestions follow the combobox pattern.", "搜索按钮展开成输入框；按 / 聚焦，联想建议遵循组合框模式。", ['ui', 'navigation', '17.11'],
    '<mo-search-bar label="Search docs" suggestions="Sidebar, Search bar, Split pane, Scroll zoom"></mo-search-bar>', undefined, x),
  C("usa-subscribe", "ui", "Newsletter sign-up", "订阅表单", "An email pill that shakes on a bad address and morphs its button into a drawn tick when done.", "邮箱输入胶囊，地址错误时抖动，完成后按钮变成画出的对勾。", ['ui', 'form', '17.11'],
    '<mo-subscribe button-label="Subscribe"></mo-subscribe>', undefined, x),
  C("usa-download-button", "click", "Download button", "下载按钮", "A button that fills with progress, reads it out in tens and ends on a drawn tick.", "按钮内填充进度，每 10% 播报一次，完成时画出对勾。", ['click', 'progress', '17.11'],
    '<mo-download-button duration="2400"></mo-download-button>', undefined, x),
  C("usa-reveal-footer", "page", "Reveal footer", "揭开式页脚", "A footer that is uncovered from beneath the page as it rises into view.", "页脚像抽屉一样从页面下方被揭开。", ['page', 'scroll', '17.11'],
    '<mo-reveal-footer><p>© Motionary</p><a href="#">Back to top</a></mo-reveal-footer>', undefined, x),
  C("usa-shape-divider", "svg", "Shape divider", "形状分隔线", "Wave, curve, tilt, arrow, zigzag or steps between sections; layered waves can drift.", "段落之间的波浪、弧线、斜切、箭头、锯齿或台阶，叠层波浪可缓慢漂移。", ['svg', 'layout', '17.11'],
    '<mo-shape-divider shape="wave" layers="3" animate></mo-shape-divider>', undefined, x),
  C("usa-scroll-cue", "page", "Scroll cue", "向下滚动提示", "A mouse, chevrons or a falling line that invites a scroll and fades once the page moves.", "鼠标、双箭头或下落线条提示向下滚动，页面滚动后淡出。", ['page', 'scroll', '17.11'],
    '<mo-scroll-cue kind="mouse" text="Scroll"></mo-scroll-cue>', undefined, x),
  // Components
  C("usa-virtual-list", "layout", "Virtual list", "虚拟列表", "Renders only the rows on screen, so tens of thousands of items scroll smoothly.", "只渲染屏幕上的行，数万条数据也能流畅滚动。", ['layout', 'data', '17.11'],
    '<mo-virtual-list label="Items" height="240px"><ul><li>Alpha</li><li>Beta</li><li>Gamma</li><li>Delta</li></ul></mo-virtual-list>', undefined, x),
  C("usa-infinite-scroll", "layout", "Infinite scroll", "无限加载", "Asks for the next page near the end, rises new items in and keeps a Load more button.", "接近底部时请求下一页，新内容依次浮现，并保留“加载更多”按钮。", ['layout', 'scroll', '17.11'],
    '<mo-infinite-scroll auto="false"><ul><li>One</li><li>Two</li></ul></mo-infinite-scroll>', undefined, x),
  C("usa-context-menu", "ui", "Context menu", "右键菜单", "Right-click, long press or the Menu key opens an ARIA menu that grows from the pointer.", "右键、长按或菜单键打开 ARIA 菜单，从指针处展开。", ['ui', 'menu', '17.11'],
    '<mo-context-menu><div>Right-click here</div><menu><button type="button">Copy</button><button type="button">Rename</button><hr><button type="button">Delete</button></menu></mo-context-menu>', undefined, x),
  C("usa-split-pane", "layout", "Split pane", "可调分栏", "Two panes with a handle you drag or move with the arrow keys; double click springs back.", "两栏之间的手柄可拖动或用方向键调节，双击弹回原位。", ['layout', 'gesture', '17.11'],
    '<mo-split-pane position="40" height="200px"><div>Left</div><div>Right</div></mo-split-pane>', undefined, x),
  C("usa-desktop-windows", "gesture", "Desktop windows", "桌面窗口", "Draggable, stackable windows with a dock; close pops toward the dock and back.", "可拖动、可叠放的窗口与底部任务栏，关闭时缩向任务栏。", ['gesture', 'layout', '17.11'],
    '<mo-desktop-windows height="320px"><div data-title="Notes">Hello</div><div data-title="Music">Playing</div></mo-desktop-windows>', undefined, x),
  C("usa-stack-slider", "cards", "Stack slider", "叠卡滑块", "Cards stacked with the next ones peeking out; swipe or press next to send the front one away.", "卡片层叠，后面几张露出；滑动或点下一张把最前面的送走。", ['cards', 'carousel', '17.11'],
    '<mo-stack-slider label="Cards"><div>One</div><div>Two</div><div>Three</div></mo-stack-slider>', undefined, x),
  C("usa-morph-card", "cards", "Morphing card", "形变卡片", "A card that grows into its detail dialog in one shared-element morph and shrinks back.", "卡片以共享元素形变展开成详情对话框，关闭时缩回。", ['cards', 'dialog', '17.11'],
    '<mo-morph-card><div>Open me</div><div data-detail hidden><h3>Details</h3><p>More text.</p></div></mo-morph-card>', undefined, x),
  // Motion
  C("usa-scroll-zoom", "page", "Scroll zoom", "滚动放大", "A rounded media card grows to fill the screen as you scroll, then a caption rises.", "圆角媒体卡片随滚动放大到全屏，然后浮出说明文字。", ['page', 'scroll', '17.11'],
    `<mo-scroll-zoom><img src="${img}" alt="Coast"><h2>Full bleed</h2></mo-scroll-zoom>`, undefined, x),
  C("usa-scroll-bg", "page", "Scroll background", "滚动换色", "Background and text colors ease from section to section as you scroll.", "背景色和文字色随滚动逐段过渡。", ['page', 'scroll', '17.11'],
    '<mo-scroll-bg><section data-bg="#f1f0ec">One</section><section data-bg="#1b1b1a" data-fg="#f4f3ef">Two</section></mo-scroll-bg>', undefined, x),
  C("usa-image-tunnel", "depth", "Image tunnel", "图片隧道", "Pictures fly out of the distance toward you, left and right, as the page scrolls.", "随页面滚动，图片左右交替从远处飞向你。", ['depth', 'scroll', '17.11'],
    `<mo-image-tunnel>${pics(4)}</mo-image-tunnel>`, undefined, x),
  C("usa-orbit-gallery", "depth", "Orbit gallery", "环绕画廊", "Pictures on a slowly turning 3D ring; drag to spin with inertia, arrows to step.", "图片排在缓慢旋转的 3D 环上；拖动带惯性旋转，方向键逐张切换。", ['depth', 'gallery', '17.11'],
    `<mo-orbit-gallery label="Gallery">${pics(6)}</mo-orbit-gallery>`, undefined, x),
  C("usa-clothesline", "physics", "Clothesline", "晾衣绳", "Photos pegged to a sagging line that swing when the pointer brushes past.", "夹在下垂绳子上的照片，指针掠过时会摆动。", ['physics', 'spring', '17.11'],
    `<mo-clothesline><figure>${pics(1)}</figure><figure>${pics(1)}</figure><figure>${pics(1)}</figure></mo-clothesline>`, undefined, x),
  C("usa-elastic-frame", "physics", "Elastic frame", "弹性边框", "A rubber frame whose edges bow toward the pointer and wobble back.", "橡皮边框，边缘向指针鼓起，离开时回弹。", ['physics', 'spring', '17.11'],
    '<mo-elastic-frame><h3>Stretch me</h3></mo-elastic-frame>', undefined, x),
  C("usa-border-beam", "depth", "Border beam", "边框光束", "A beam of light that runs around a card's border, with an optional glow.", "一道光束沿卡片边框循环流动，可加柔光。", ['depth', 'glow', '17.11'],
    '<mo-border-beam glow><strong>New</strong></mo-border-beam>', undefined, x),
];
