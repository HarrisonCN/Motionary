import { C } from './make.js';

const x = { entry: 'widgets', since: '17.15' };
export const components = [
  // UI
  C("usa-radial-menu", "click", "Radial menu", "环形菜单", "A round button fans its own child buttons out on a circle; arrow keys go round, Escape closes.", "圆形按钮把子按钮沿圆弧展开；方向键环绕切换，Esc 关闭。", ['ui', 'menu', '17.15'],
    '<mo-radial-menu label="Share" spread="180" start="-180" radius="76"><button aria-label="Copy link">🔗</button><button aria-label="Email">✉️</button><button aria-label="Message">💬</button><button aria-label="Save">⭐</button></mo-radial-menu>', undefined, x),
  C("usa-hover-card", "ui", "Hover card", "悬停卡片", "A preview card opens when the pointer rests on a trigger or it takes focus, and stays while the pointer moves onto it.", "指针停在触发元素上或获得焦点时弹出预览卡片，移到卡片上也不会消失。", ['ui', 'popover', '17.15'],
    '<mo-hover-card><a data-trigger href="#">@mei</a><div data-card><strong>Mei Chen</strong><p>Designs motion for the web. 1.2k followers.</p></div></mo-hover-card>', undefined, x),
  C("usa-toggle-group", "ui", "Toggle group", "切换按钮组", "A row of toggle buttons, one at a time or several, with arrow-key focus and an optional hidden input.", "一排切换按钮，可单选或多选，方向键移动焦点，可带隐藏输入框。", ['ui', 'form', '17.15'],
    '<mo-toggle-group options="Day,Week,Month" value="Week" required></mo-toggle-group>', undefined, x),
  C("usa-time-picker", "ui", "Time picker", "时间选择器", "Hour and minute spin buttons with step snapping, typed digits and an optional AM / PM switch.", "时、分两个旋钮按步长对齐，可直接输入数字，可切换上午 / 下午。", ['ui', 'form', '17.15'],
    '<mo-time-picker value="09:30" step="15"></mo-time-picker>', undefined, x),
  C("usa-color-swatches", "ui", "Colour swatches", "色板选择", "Pick a colour from round or square swatches; the check turns black or white to stay readable.", "从圆形或方形色块中选一个颜色；勾号自动用黑色或白色，保证看得清。", ['ui', 'form', '17.15'],
    '<mo-color-swatches colors="#1f2937,#e11d48,#2563eb,#16a34a,#f5f5f4" names="Graphite,Rose,Ocean,Forest,Chalk" value="#2563eb"></mo-color-swatches>', undefined, x),
  C("usa-calendar-strip", "ui", "Calendar strip", "日期横条", "A week of day buttons with paging, today marked and dots on busy days; arrow keys page past the ends.", "一周的日期按钮，可前后翻页，标出今天和有安排的日子；方向键走到头会自动翻页。", ['ui', 'date', '17.15'],
    '<mo-calendar-strip value="2026-03-11" marks="2026-03-10,2026-03-13"></mo-calendar-strip>', undefined, x),
  C("usa-comparison-table", "layout", "Comparison table", "对比表", "A plain table gets check marks, a highlighted column with a badge, a sticky first column and an only-differences switch.", "普通表格自动加上勾叉、带徽标的高亮列、固定首列和“只看差异”开关。", ['ui', 'pricing', '17.15'],
    '<mo-comparison-table highlight="2"><table><thead><tr><th>Feature</th><th>Free</th><th>Pro</th></tr></thead><tbody><tr><td>Projects</td><td>3</td><td>Unlimited</td></tr><tr><td>Export</td><td>yes</td><td>yes</td></tr><tr><td>Team seats</td><td>no</td><td>yes</td></tr></tbody></table></mo-comparison-table>', undefined, x),
  // Data
  C("usa-radial-bars", "svg", "Radial bars", "环形进度条", "Concentric three-quarter rings draw in like an activity tracker; the legend picks a ring.", "同心的四分之三圆环像运动记录一样画入；点图例可突出某一环。", ['data', 'chart', '17.15'],
    '<mo-radial-bars values="72,48,90" labels="Move,Exercise,Stand" unit="%"></mo-radial-bars>', undefined, x),
  C("usa-bar-race", "layout", "Bar chart race", "排名赛跑图", "Bars glide past each other frame by frame as the ranking changes; it plays in view and can be scrubbed.", "随着排名变化，横条逐帧滑动换位；进入视野自动播放，也可拖动进度。", ['data', 'chart', '17.15'],
    '<mo-bar-race labels="Alpha,Beta,Gamma,Delta" frames="2023|2024|2025" values="10,14,8,6; 18,15,16,9; 22,17,26,15"></mo-bar-race>', undefined, x),
  C("usa-bullet-chart", "layout", "Bullet chart", "子弹图", "Each measure as a bar against a target line over poor / fair / good bands; met targets get a check.", "每项指标一根条，对照目标线和差 / 中 / 好三档背景；达标的打勾。", ['data', 'chart', '17.15'],
    '<mo-bullet-chart values="82,54,96" targets="75,70,90" labels="Revenue,Profit,Satisfaction" max="100"></mo-bullet-chart>', undefined, x),
  C("usa-slope-chart", "svg", "Slope chart", "斜率图", "Lines from before to after show rises and falls; end labels never overlap and each item reports its change.", "从“之前”连到“之后”的线显示升降；两端标签不重叠，每项给出变化百分比。", ['data', 'chart', '17.15'],
    '<mo-slope-chart before="42,35,28,20" after="38,44,25,31" labels="Chrome,Safari,Firefox,Edge" from-label="2024" to-label="2025"></mo-slope-chart>', undefined, x),
  C("usa-dot-plot", "layout", "Dot plot", "点图", "A dot per item on a shared scale, or a dumbbell joining two series to show the gap.", "每项一个点落在同一刻度上，或用哑铃连起两个系列显示差距。", ['data', 'chart', '17.15'],
    '<mo-dot-plot values="52,61,47,70" compare="58,66,59,72" labels="North,South,East,West" series="2024,2025"></mo-dot-plot>', undefined, x),
];
