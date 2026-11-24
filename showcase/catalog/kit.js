import { C } from './make.js';

const x = { entry: 'widgets', since: '17.10' };
const img = 'assets/demo-photo.jpg';
const tile = (n) => Array.from({ length: n }, (_, i) => `<img src="${img}" alt="Photo ${i + 1}" data-full="${img}">`).join('');
export const components = [
  // UI blocks
  C("usa-sidebar", "ui", "Collapsible sidebar", "可折叠侧边栏", "Navigation that folds to an icon rail; a pill glides to the current item and labels fade out as it narrows.", "可折成图标栏的导航，高亮胶囊滑到当前项，收起时文字淡出。", ['ui', 'navigation', '17.10'],
    '<mo-sidebar label="Main"><a href="#" data-icon="⌂" aria-current="page">Home</a><a href="#" data-icon="✉">Inbox</a><a href="#" data-icon="⚙">Settings</a></mo-sidebar>', undefined, x),
  C("usa-scrollspy", "page", "Scrollspy table of contents", "滚动目录", "A table of contents that follows the reader: a marker slides to the section on screen; links scroll smoothly and move focus.", "跟随阅读位置的目录：标记滑到当前小节，点击平滑滚动并移动焦点。", ['navigation', 'scroll', '17.10'],
    '<mo-scrollspy target="main" label="On this page"></mo-scrollspy>', undefined, x),
  C("usa-pricing", "ui", "Pricing table", "价格表", "Monthly / yearly switch with a sliding thumb; prices roll to the new figure and the featured plan lifts.", "月付/年付切换，滑块移动，价格滚动到新数字，推荐方案浮起。", ['ui', 'number', '17.10'],
    '<mo-pricing currency="$"><div data-name="Starter" data-monthly="0" data-yearly="0">For trying it out</div><div data-name="Pro" data-monthly="12" data-yearly="120" data-featured data-badge="Popular">For teams</div></mo-pricing>', undefined, x),
  C("usa-announcement-bar", "ui", "Announcement bar", "公告栏", "A slim bar that rolls between messages, pauses on hover or focus and can be dismissed.", "在多条消息间滚动的细横幅，悬停或聚焦时暂停，可关闭。", ['ui', 'banner', '17.10'],
    '<mo-announcement-bar dismissible><span>New: 21 components</span><a href="#">Read the changelog</a></mo-announcement-bar>', undefined, x),
  C("usa-sticky-cta", "page", "Sticky call to action", "吸底行动条", "A call-to-action bar that slides in once the reader scrolls past a point or element, and away again near the top.", "滚过某个位置或元素后滑入的行动条，回到顶部时收起。", ['page', 'scroll', '17.10'],
    '<mo-sticky-cta offset="320" dismissible><span>Ready to start?</span><a href="#">Sign up</a></mo-sticky-cta>', undefined, x),
  C("usa-bento", "layout", "Bento grid", "便当网格", "A tiled grid whose cells take spans from data-span / data-rows; tiles rise in turn and a soft spotlight follows the pointer.", "按 data-span / data-rows 排布的拼块网格，依次升起，光斑跟随指针。", ['layout', 'grid', '17.10'],
    '<mo-bento columns="3"><div data-span="2">Fast</div><div data-rows="2">Small</div><div>Typed</div><div>Accessible</div></mo-bento>', undefined, x),
  C("usa-empty-state", "svg", "Empty state", "空状态", "An illustration that draws itself, then the heading, text and actions rise in turn.", "插画线条自己画出，标题、说明和按钮依次浮现。", ['svg', 'ui', '17.10'],
    '<mo-empty-state icon="inbox" heading="No messages" description="New mail will show up here."><button type="button">Refresh</button></mo-empty-state>', undefined, x),
  // Components
  C("usa-lightbox", "gesture", "Lightbox gallery", "灯箱相册", "Thumbnails that grow into a full-screen dialog; arrows, swipe, zoom and pan, and the picture shrinks back on close.", "缩略图放大成全屏对话框，支持方向键、滑动、缩放和拖动，关闭时缩回原位。", ['gesture', 'gallery', '17.10'],
    `<mo-lightbox label="Gallery">${tile(3)}</mo-lightbox>`, undefined, x),
  C("usa-data-table", "layout", "Sortable data table", "可排序表格", "Enhances a real table: header buttons sort, a box filters, and rows glide to their new places.", "增强原生表格：表头按钮排序、搜索框过滤，行平滑移到新位置。", ['layout', 'table', '17.10'],
    '<mo-data-table filterable><table><thead><tr><th>Name</th><th>Size</th></tr></thead><tbody><tr><td>core</td><td>12.4</td></tr><tr><td>widgets</td><td>3.1</td></tr><tr><td>fx</td><td>8.8</td></tr></tbody></table></mo-data-table>', undefined, x),
  C("usa-filter-chips", "layout", "Filter chips", "筛选标签", "Toggle chips that filter a list by data-tags; leaving items fade and the rest close the gaps.", "按 data-tags 筛选列表的切换标签，离开的项淡出，其余补位。", ['layout', 'filter', '17.10'],
    '<mo-filter-chips options="UI, Motion" multiple></mo-filter-chips><ul><li data-tags="UI">Sidebar</li><li data-tags="Motion">Path motion</li></ul>', undefined, x),
  C("usa-hotspots", "ui", "Image hotspots", "图片热点", "Pulsing points on a picture; each opens a note, closes with Escape or a click outside.", "图片上的脉动热点，点开显示说明，Esc 或点击外部关闭。", ['ui', 'image', '17.10'],
    `<mo-hotspots><img src="${img}" alt="Desk"><div data-x="30" data-y="40" data-title="Lamp">Warm light.</div><div data-x="70" data-y="65" data-title="Notebook">Dotted paper.</div></mo-hotspots>`, undefined, x),
  C("usa-fan-carousel", "cards", "Fan carousel", "扇形轮播", "Cards spread like a hand of cards; the front one is centred and the rest fan out behind it.", "卡片像一手牌一样展开，当前卡片居中，其余在后面散开。", ['cards', 'carousel', '17.10'],
    '<mo-fan-carousel label="Cards"><div>One</div><div>Two</div><div>Three</div><div>Four</div></mo-fan-carousel>', undefined, x),
  C("usa-expand-cards", "cards", "Expanding cards", "伸展卡片", "A row of panels where the chosen one widens and shows its text; stacks on narrow screens.", "一排面板，选中的一块展开并显示文字；窄屏时竖向排列。", ['cards', 'layout', '17.10'],
    `<mo-expand-cards><div data-title="Coast" data-image="${img}">Morning tide.</div><div data-title="Forest" data-image="${img}">Pines.</div><div data-title="City" data-image="${img}">Night lights.</div></mo-expand-cards>`, undefined, x),
  C("usa-json-viewer", "ui", "JSON viewer", "JSON 查看器", "A keyboard-navigable tree for JSON; branches open with a soft slide and long data stays capped.", "可用键盘浏览的 JSON 树，分支展开带平滑滑动，大数据有节点上限。", ['ui', 'data', '17.10'],
    `<mo-json-viewer json='{"name":"motionary","tags":["ui","motion"],"stars":42}'></mo-json-viewer>`, undefined, x),
  // Motion
  C("usa-scroll-velocity", "page", "Scroll velocity", "滚动速度形变", "Content that skews, stretches, blurs or tilts with how fast the page scrolls, then settles.", "内容随滚动速度倾斜、拉伸、模糊或翻转，停下后回稳。", ['page', 'scroll', '17.10'],
    '<mo-scroll-velocity mode="skew"><h2>Scroll me</h2></mo-scroll-velocity>', undefined, x),
  C("usa-horizontal-scroll", "page", "Horizontal scroll section", "横向滚动段落", "Panels that travel sideways while the page scrolls down; a snap scroller on narrow screens and under reduced motion.", "页面向下滚动时面板横向移动；窄屏或减少动态效果时改为吸附横滑。", ['page', 'scroll', '17.10'],
    '<mo-horizontal-scroll panel-width="60vw" progress><section>One</section><section>Two</section><section>Three</section></mo-horizontal-scroll>', undefined, x),
  C("usa-image-trail", "gesture", "Image trail", "图片拖尾", "Pictures drop behind the pointer as it moves across the area and fade away.", "指针划过区域时身后留下一串图片并渐隐。", ['gesture', 'cursor', '17.10'],
    `<mo-image-trail>${tile(3)}<h2>Move here</h2></mo-image-trail>`, undefined, x),
  C("usa-hover-reveal-list", "cards", "Hover reveal list", "悬停显图列表", "A big link list where a picture follows the pointer on a spring and leans with its speed.", "大字链接列表，图片带弹簧跟随指针，并随速度倾斜。", ['cards', 'spring', '17.10'],
    `<mo-hover-reveal-list><a href="#" data-image="${img}">Studio</a><a href="#" data-image="${img}">Journal</a></mo-hover-reveal-list>`, undefined, x),
  C("usa-liquid-glass", "depth", "Liquid glass", "液态玻璃", "A glass pane that blurs and bends what is behind it, catches a highlight under the pointer and squashes on press.", "模糊并扭曲背景的玻璃面板，指针处有高光，按下时轻压。", ['depth', 'glass', '17.10'],
    '<mo-liquid-glass pressable><strong>Liquid glass</strong></mo-liquid-glass>', undefined, x),
  C("usa-path-motion", "svg", "Path motion", "路径运动", "Things that ride an SVG path on scroll, in view, on hover or in a loop, turning with it and drawing the trail.", "元素沿 SVG 路径运动，可随滚动、进入视野、悬停或循环播放，并转向、描出轨迹。", ['svg', 'scroll', '17.10'],
    '<mo-path-motion trigger="loop" rotate trace><span>✈</span></mo-path-motion>', undefined, x),
  C("usa-cut-reveal", "timeline", "Cut reveal", "切片转场", "Copies of the content are sliced, shredded, split or torn and fly together to reveal it.", "内容的副本被切片、切条、对半或撕开，再飞拢显出原内容。", ['timeline', 'reveal', '17.10'],
    '<mo-cut-reveal cut="slice" pieces="6"><h2>Sliced in</h2></mo-cut-reveal>', undefined, x),
];
