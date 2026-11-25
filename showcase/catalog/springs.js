import { C } from './make.js';

const x = { entry: 'widgets', since: '17.17' };
export const components = [
  C("usa-spring-like", "ui", "Spring like", "弹簧点赞", "A like toggle whose heart squashes, pops past full size with a ring and a burst of dots, while the count rolls to its new number.", "心形按下压扁，点亮时冲过头弹回并炸出光环和彩点，数字滚动到新值。", ['ui', 'button', 'spring', '17.17'],
    '<mo-spring-like count="128"></mo-spring-like>', undefined, x),
  C("usa-spring-rating", "ui", "Spring rating", "弹簧评分", "Stars that lift on hover and pop up one after another when chosen; halves, read-only and full keyboard support.", "悬停时星星抬起，选中后依次弹起；支持半星、只读和完整键盘操作。", ['ui', 'form', 'spring', '17.17'],
    '<mo-spring-rating value="4" show-value></mo-spring-rating>', undefined, x),
  C("usa-spring-copy", "ui", "Spring copy", "弹簧复制按钮", "Copies text to the clipboard: the icon springs away and a tick pops in, or the button shakes with a cross when it cannot.", "复制到剪贴板：图标弹走、勾弹出；无法复制时摇一摇并显示叉。", ['ui', 'button', 'spring', '17.17'],
    '<mo-spring-copy text="npm i motionary" show-text></mo-spring-copy>', undefined, x),
  C("usa-spring-tags", "ui", "Spring tags", "弹簧标签输入", "Tags pop in and shrink away; a duplicate makes the chip that already has it shake. Enter, comma or paste adds tags.", "标签弹入、缩小离场；输入重复标签时原来那枚会摇头。回车、逗号或粘贴都能添加。", ['ui', 'form', 'spring', '17.17'],
    '<mo-spring-tags value="design,motion"></mo-spring-tags>', undefined, x),
  C("usa-spring-code", "ui", "Spring code", "弹簧验证码", "One-time-code boxes: characters pop in, focus hops along, paste fills in a ripple; reject() shakes the row, accept() nods.", "验证码格子：字符弹入、焦点自动前进、粘贴依次填满；reject() 整排晃动，accept() 点头。", ['ui', 'form', 'spring', '17.17'],
    '<mo-spring-code length="6" group="3"></mo-spring-code>', undefined, x),
  C("usa-spring-list", "ui", "Spring list", "弹簧排序列表", "Drag the handles to reorder: the picked item lifts and tilts, the others spring out of the way; full keyboard reordering.", "拖动把手排序：拿起的项抬高倾斜，其他项弹开让位；键盘也能完整排序。", ['ui', 'list', 'spring', '17.17'],
    '<mo-spring-list items="Inbox|Today|Upcoming|Someday"></mo-spring-list>', undefined, x),
  C("usa-spring-swipe", "ui", "Spring swipe", "弹簧侧滑行", "A row that swipes open to reveal actions, with rubber-band ends and a flick to open or shut; a ⋯ button does the same for the keyboard.", "侧滑露出操作，拉过头有橡皮筋阻力，轻甩即可开合；⋯ 按钮给键盘使用。", ['ui', 'list', 'spring', '17.17'],
    '<mo-spring-swipe actions="Archive|Delete:danger">Weekly report is ready</mo-spring-swipe>', undefined, x),
  C("usa-spring-toasts", "ui", "Spring toasts", "弹簧通知栈", "Toasts drop in with an overshoot and pile up neatly; the pile fans out on hover or focus, and a toast can be swiped away.", "通知带过冲落下并叠成一摞；悬停或聚焦时展开，可以横向甩走。", ['ui', 'feedback', 'spring', '17.17'],
    '<mo-spring-toasts></mo-spring-toasts>', undefined, x),
  C("usa-spring-accordion", "ui", "Spring accordion", "弹簧手风琴", "Panels open on a spring that reverses smoothly mid-way, the content drifts in after it and the chevron flips with an overshoot.", "面板高度跟着弹簧走，中途反向也平滑；内容随后飘入，箭头带过冲翻转。", ['ui', 'disclosure', 'spring', '17.17'],
    '<mo-spring-accordion open="0"><section data-title="What is a spring?"><p>A target and a velocity, nothing else.</p></section><section data-title="Reduced motion"><p>Values jump to their targets.</p></section></mo-spring-accordion>', undefined, x),
  C("usa-spring-counter", "ui", "Spring counter", "弹簧数字", "Digits roll on springs to each new value, new columns grow in, and screen readers get the plain number.", "每一位数字沿弹簧滚到新值，新增位数从零宽长出，读屏只读完整数字。", ['ui', 'data', 'spring', '17.17'],
    '<mo-spring-counter value="1280" group="," from-zero></mo-spring-counter>', undefined, x),
];
