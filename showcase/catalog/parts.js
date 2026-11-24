import { C } from './make.js';

const x = { entry: 'widgets', since: '17.12' };
const img = 'assets/demo-photo.jpg';
export const components = [
  // UI
  C("usa-progress-tabs", "ui", "Autoplay feature tabs", "自动播放功能标签", "Feature tabs that fill a progress bar and open the next tab when it is full; pauses on hover, focus or off screen.", "功能标签页：进度条走满后自动切到下一个；悬停、聚焦或离开屏幕时暂停。", ['ui', 'tabs', '17.12'],
    '<mo-progress-tabs interval="4000"><section data-tab="Fast"><p>Ships in one tag.</p></section><section data-tab="Small"><p>A few KB each.</p></section><section data-tab="Kind"><p>Respects reduced motion.</p></section></mo-progress-tabs>', undefined, x),
  C("usa-code-tabs", "ui", "Code tabs with copy", "带复制的代码标签", "npm / pnpm / yarn tabs with a sliding underline and a copy button that turns into a tick; tabs in one group switch together.", "npm / pnpm / yarn 代码标签，下划线滑动，复制按钮变成对勾；同组标签同步切换。", ['ui', 'code', '17.12'],
    '<mo-code-tabs group="pm"><pre data-tab="npm">npm i motionary</pre><pre data-tab="pnpm">pnpm add motionary</pre><pre data-tab="yarn">yarn add motionary</pre></mo-code-tabs>', undefined, x),
  C("usa-helpful-vote", "ui", "Was this helpful?", "这篇有帮助吗", "Two thumb buttons that pop on a spring and turn into a thank-you; a No can ask what was missing.", "两个拇指按钮，点击后弹一下并变成感谢语；选“没有”时可以追问缺了什么。", ['ui', 'feedback', '17.12'],
    '<mo-helpful-vote ask-why></mo-helpful-vote>', undefined, x),
  C("usa-share-button", "click", "Share button", "分享按钮", "A share button that fans out copy link, X, LinkedIn and email on a spring; uses the system share sheet with native.", "分享按钮弹出复制链接、X、LinkedIn 和邮件；加 native 时使用系统分享面板。", ['click', 'social', '17.12'],
    '<mo-share-button url="https://example.com/post" share-title="A post"></mo-share-button>', undefined, x),
  C("usa-inline-edit", "ui", "Inline edit", "原地编辑", "Text that turns into a field when pressed; Enter saves with a flash, Escape puts it back.", "点击文字即变成输入框；回车保存并闪一下，Esc 还原。", ['ui', 'form', '17.12'],
    '<mo-inline-edit label="Project name">Untitled project</mo-inline-edit>', undefined, x),
  C("usa-tag-cloud", "text", "Tag cloud", "标签云", "Words sized by weight that rise in one by one and bob gently; hovering one dims the rest.", "按权重决定大小的词语依次浮现并轻轻浮动；悬停一个时其余变暗。", ['text', 'layout', '17.12'],
    '<mo-tag-cloud><a href="#" data-weight="9">Motion</a><a href="#" data-weight="4">Scroll</a><a href="#" data-weight="7">Spring</a><a href="#" data-weight="2">SVG</a><a href="#" data-weight="5">WebGL</a></mo-tag-cloud>', undefined, x),
  // Components
  C("usa-heatmap", "layout", "Activity heatmap", "活动热力图", "A contribution-style calendar that sweeps in; an ARIA grid with arrow keys and a tooltip per day.", "类似贡献图的日历热力图，扫入出现；ARIA 网格，方向键移动，每天有提示。", ['data', 'chart', '17.12'],
    '<mo-heatmap start="2026-01-05" values="0,2,5,1,0,3,8,4,0,0,6,2,1,9,3,0,4,7,2,5,1,0,3,6,2,8,4,1"></mo-heatmap>', undefined, x),
  C("usa-donut-chart", "svg", "Donut chart", "环形图", "Slices draw in one after another and the total counts up; the legend is real buttons.", "扇区依次画出，中间总数递增；图例是真正的按钮。", ['data', 'chart', '17.12'],
    '<mo-donut-chart values="42,28,18,12" labels="Direct,Search,Social,Email" unit="k"></mo-donut-chart>', undefined, x),
  C("usa-sortable-list", "gesture", "Sortable list", "可拖动排序列表", "Drag a grip to reorder and the others glide aside; Space, arrows and Escape do the same by keyboard.", "拖动把手排序，其余项平滑让位；键盘用空格、方向键和 Esc 操作。", ['gesture', 'list', '17.12'],
    '<mo-sortable-list><ul><li>Design</li><li>Build</li><li>Ship</li></ul></mo-sortable-list>', undefined, x),
  C("usa-zoom-lens", "gesture", "Zoom lens", "放大镜", "A round lens that follows the pointer over a product photo; arrow keys and +/− by keyboard.", "圆形放大镜跟随指针放大商品图；键盘用方向键和 +/−。", ['gesture', 'media', '17.12'],
    `<mo-zoom-lens zoom="3"><img src="${img}" alt="Product photo"></mo-zoom-lens>`, undefined, x),
  C("usa-rating-bars", "layout", "Rating summary", "评分统计", "The average counts up beside filling stars while one bar per star level grows to its share.", "平均分递增、星星填充，每个星级的条形按占比生长。", ['data', 'review', '17.12'],
    '<mo-rating-bars values="120,48,16,6,10"></mo-rating-bars>', undefined, x),
  C("usa-checklist", "ui", "Onboarding checklist", "新手清单", "Real checkboxes with a progress ring; the ring pops and the heading changes when every task is done.", "真正的复选框配进度环；全部完成时圆环弹一下，标题变化。", ['ui', 'form', '17.12'],
    '<mo-checklist label="Get started"><span>Create a project</span><span>Invite a teammate</span><span>Publish</span></mo-checklist>', undefined, x),
  // Motion
  C("usa-meteors", "background", "Meteor shower", "流星雨", "Thin meteors streak across a section behind its content; they stop off screen.", "细长流星划过区块背景，离开屏幕时停止。", ['background', 'space', '17.12'],
    '<mo-meteors count="16"><h3>Night launch</h3></mo-meteors>', undefined, x),
  C("usa-connect-beam", "svg", "Connection beams", "连接光束", "Pulses of light travel along curved lines between named parts of a diagram.", "光脉冲沿曲线在图中被命名的节点之间流动。", ['svg', 'diagram', '17.12'],
    '<mo-connect-beam links="app>api, api>db"><div style="display:flex;justify-content:space-between;gap:24px"><b data-node="app">App</b><b data-node="api">API</b><b data-node="db">DB</b></div></mo-connect-beam>', undefined, x),
  C("usa-retro-grid", "background", "Retro grid", "复古网格", "A synthwave floor grid that rolls toward you, with an optional striped sun.", "向你滚来的合成波地面网格，可加条纹太阳。", ['background', '3d', '17.12'],
    '<mo-retro-grid sun><h3>Back to 1986</h3></mo-retro-grid>', undefined, x),
  C("usa-orbit-rings", "depth", "Orbit rings", "环绕轨道", "Icons circling a center on up to three rings, kept upright; pauses on hover.", "图标在最多三条轨道上绕中心旋转并保持正立；悬停暂停。", ['depth', 'icons', '17.12'],
    '<mo-orbit-rings radius="60"><strong data-center>Core</strong><span>JS</span><span>CSS</span><span>SVG</span><span data-ring="2">GL</span><span data-ring="2">TS</span></mo-orbit-rings>', undefined, x),
  C("usa-letter-swap", "text", "Letter swap", "字母翻转", "Each letter rolls up and is replaced by itself on hover, one after another; screen readers get the word once.", "悬停时每个字母依次向上翻滚替换；读屏只读一次完整文字。", ['text', 'hover', '17.12'],
    '<mo-letter-swap><a href="#">Get started</a></mo-letter-swap>', undefined, x),
  C("usa-ripple-grid", "background", "Ripple grid", "涟漪点阵", "A dot grid where a click sends a ring of light outward; can ripple on its own.", "点阵背景，点击处向外扩散一圈光；也可自动产生涟漪。", ['background', 'canvas', '17.12'],
    '<mo-ripple-grid auto="4000"><h3>Tap anywhere</h3></mo-ripple-grid>', undefined, x),
];
