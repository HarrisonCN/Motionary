import { C } from './make.js';

const x = { entry: 'widgets', since: '17.16' };
export const components = [
  C("usa-micro", "interaction", "Micro", "微交互容器", "Wraps anything with spring micro-interactions: press, hover, lift, magnetic, tilt, glow, squish, drag and focus, in any mix, plus feedback impulses.", "给任意内容加上弹簧微交互：按压、悬停、抬升、磁吸、倾斜、光晕、挤压、拖拽、聚焦，可任意组合，还有反馈冲量。", ['interaction', 'spring', '17.16'],
    '<mo-micro fx="press lift glow" feel="bouncy"><button type="button" style="padding:14px 22px;border:0;border-radius:14px;background:#4f46e5;color:#fff;font:inherit">Press me</button></mo-micro>', undefined, x),
  C("usa-micro-switch", "ui", "Micro switch", "弹簧开关", "A switch whose knob carries its speed: it stretches as it travels, can be dragged with rubber-band ends and flicked.", "旋钮带着速度移动：滑动时拉长，可拖动、两端有橡皮筋阻力，轻甩即可切换。", ['ui', 'form', 'spring', '17.16'],
    '<mo-micro-switch label="Wi-Fi" checked></mo-micro-switch>', undefined, x),
  C("usa-micro-checkbox", "ui", "Micro checkbox", "弹簧复选框", "The box squashes under the finger, fills with a springy pop and then draws its tick; supports indeterminate.", "按下时方框被压扁，松开后弹性填色再画出勾；支持半选状态。", ['ui', 'form', 'spring', '17.16'],
    '<mo-micro-checkbox label="Remember me" checked></mo-micro-checkbox>', undefined, x),
  C("usa-micro-input", "ui", "Micro input", "弹簧输入框", "The label floats on a spring, the focus line grows from where you clicked, and an invalid value shakes once with an announced message.", "标签弹性上浮，焦点线从点击处展开；输入无效时轻摇一次并读出提示。", ['ui', 'form', 'spring', '17.16'],
    '<mo-micro-input label="Email" type="email" required success hint="We never share it."></mo-micro-input>', undefined, x),
  C("usa-micro-button", "ui", "Micro button", "状态按钮", "An action button that folds into a spinner while working, pops a tick on success or shakes on failure, then springs back.", "执行时收成转圈，成功弹出勾、失败摇一摇，然后弹回原样。", ['ui', 'button', 'spring', '17.16'],
    '<mo-micro-button label="Save" success-label="Saved" error-label="Retry"></mo-micro-button>', undefined, x),
  C("usa-micro-slider", "ui", "Micro slider", "弹簧滑块", "The thumb settles onto the nearest step, squashes with its speed and shows a value bubble; dragging past an end stretches the track like rubber.", "滑块落到最近的刻度，随速度挤压，拖动时显示数值；拖出两端时轨道像橡皮一样拉伸。", ['ui', 'form', 'spring', '17.16'],
    '<mo-micro-slider label="Volume" value="40" step="5" unit="%"></mo-micro-slider>', undefined, x),
  C("usa-micro-segmented", "ui", "Micro segmented", "弹簧分段控件", "The pill slides on two springs: the leading edge is quick, the trailing edge slow, so it stretches toward the new choice.", "选中块由两根弹簧带动：前沿快、后沿慢，滑动时会向新选项拉伸。", ['ui', 'form', 'spring', '17.16'],
    '<mo-micro-segmented label="View" options="List,Board,Calendar" value="Board"></mo-micro-segmented>', undefined, x),
  C("usa-micro-stepper", "ui", "Micro stepper", "弹簧步进器", "Digits roll on a spring, held buttons speed up, and at a limit the number leans against it and springs back.", "数字弹性滚动，长按越来越快；到达上下限时数字顶一下再弹回。", ['ui', 'form', 'spring', '17.16'],
    '<mo-micro-stepper label="Guests" value="2" min="1" max="12"></mo-micro-stepper>', undefined, x),
];
