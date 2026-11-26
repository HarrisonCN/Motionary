import { C } from './make.js';

const x = { entry: 'widgets', since: '17.18' };
export const components = [
  C("usa-spring-collapse", "ui", "Spring collapse", "阻尼折叠面板", "One collapsible panel whose height opens on a damped spring with a short settle; the content drifts in and a second click reverses from where it is.", "单个折叠面板：高度沿阻尼弹簧展开并轻轻回稳，内容随后飘入，中途再点会从当前位置反向。", ['ui', 'disclosure', 'spring', 'damped', '17.18'],
    '<mo-spring-collapse label="What does damped mean?"><p>The motion overshoots a little, then settles instead of stopping dead.</p></mo-spring-collapse>', undefined, x),
  C("usa-read-more", "ui", "Read more", "阻尼展开全文", "Long text clamped to a few lines that unfolds on a damped spring while the fade melts away; no button when the text already fits.", "长文本先显示几行，点开后沿阻尼弹簧展开、底部渐隐随之消失；文字放得下时不显示按钮。", ['ui', 'text', 'disclosure', 'damped', '17.18'],
    '<mo-read-more lines="2"><p>Springs carry their speed into every change, so a panel that opens, closes and opens again never jumps. The height overshoots by a hair and settles, which reads as weight rather than as a stop. Under reduced motion it simply switches.</p></mo-read-more>', undefined, x),
  C("usa-spring-sheet", "ui", "Spring sheet", "阻尼底部抽屉", "A bottom sheet with snap points: it follows the finger, stretches past its top, and a release is carried by its speed to a snap or closed.", "带吸附点的底部抽屉：跟手拖动，拉过顶部有橡皮筋阻力，松手按速度停到吸附点或关闭。", ['ui', 'overlay', 'gesture', 'damped', '17.18'],
    '<mo-spring-sheet snaps="0.45, 0.9" style="--usa-dsheet-height:300px"><p>Page content</p><div data-sheet><h3>Filters</h3><p>Drag the handle, or flick it down to close.</p></div></mo-spring-sheet>', undefined, x),
  C("usa-spring-pager", "ui", "Spring pager", "阻尼分页器", "Pages that slide on a damped spring: rubber-band ends, one page per flick, dots that stretch toward the page they head for.", "沿阻尼弹簧滑动的分页：两端有橡皮筋阻力，一次轻甩翻一页，圆点会朝目标页拉长。", ['ui', 'carousel', 'gesture', 'damped', '17.18'],
    '<mo-spring-pager label="Tips"><div style="padding:28px;background:#eef2ff;border-radius:14px">Drag me</div><div style="padding:28px;background:#ecfdf5;border-radius:14px">Flick to turn</div><div style="padding:28px;background:#fff7ed;border-radius:14px">Ends stretch</div></mo-spring-pager>', undefined, x),
  C("usa-elastic-scroll", "ui", "Elastic scroll", "弹性滚动区", "A native scroll area whose ends stretch like rubber on wheel and touch and spring back with a damped settle; fires an edge event for pull-to-refresh.", "原生滚动区，滚轮或手指拉过两端时像橡皮一样伸长，再阻尼回弹；拉够距离会发出 edge 事件，可做下拉刷新。", ['ui', 'scroll', 'gesture', 'damped', '17.18'],
    '<mo-elastic-scroll height="180px"><p>Scroll to the end, then keep going.</p><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p></mo-elastic-scroll>', undefined, x),
  C("usa-spring-stack", "ui", "Spring stack", "阻尼卡片堆叠", "A pile of cards that unrolls into a list in a soft cascade, each card on its own slightly later spring, and gathers back behind the first.", "叠成一摞的卡片，展开时每张沿各自稍慢一点的弹簧依次落位，收起时重新收回到第一张后面。", ['ui', 'list', 'feedback', 'damped', '17.18'],
    '<mo-spring-stack><div><strong>Build passed</strong><br><small>2 min ago</small></div><div><strong>New comment</strong><br><small>5 min ago</small></div><div><strong>Deploy queued</strong><br><small>8 min ago</small></div></mo-spring-stack>', undefined, x),
];
