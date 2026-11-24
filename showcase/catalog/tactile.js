import { C } from './make.js';

const x = { entry: 'widgets', since: '17.9' };
export const components = [
  C("usa-squish-key", "click", "Squish key", "弹性按键", "A rubbery key that sinks while held and wobbles back past rest when let go.", "按住时下沉，松开后越过原位再回弹的软胶按键。", ['tactile', 'spring', '17.9'],
    '<mo-squish-key label="A" shape="round"></mo-squish-key> <mo-squish-key label="B" shape="round" tone="light"></mo-squish-key>', undefined, x),
  C("usa-squish-stepper", "click", "Squish stepper", "弹性步进器", "Squishy − / + keys around a rolling number; hold to repeat.", "两颗软胶加减键夹着滚动的数字，长按连续加减。", ['tactile', 'number', '17.9'],
    '<mo-squish-stepper label="Players" value="2" min="1" max="8"></mo-squish-stepper>', undefined, x),
  C("usa-analog-stick", "gesture", "Analog stick", "摇杆", "Drag the cap with a rubbery pull past the rim; it springs home when let go. Arrow keys push it too.", "拖动摇杆帽，超出边缘时有橡皮筋阻力，松手弹回中心；方向键也能推动。", ['tactile', 'gesture', 'spring', '17.9'],
    '<mo-analog-stick label="Move"></mo-analog-stick>', undefined, x),
  C("usa-transfer-button", "click", "Transfer button", "下载上传键", "A squishy download / upload key with a progress ring that turns into a tick at 100.", "带进度环的软胶下载/上传键，到 100 时箭头变成对勾。", ['tactile', 'progress', '17.9'],
    '<mo-transfer-button direction="download"></mo-transfer-button> <mo-transfer-button direction="upload"></mo-transfer-button>', undefined, x),
];

/** Demo only: fake a transfer so the ring has something to show. */
function wireTransfer(stage) {
  for (const el of stage.querySelectorAll('mo-transfer-button')) {
    el.addEventListener('usa:transfer', () => {
      if (el.hasAttribute('progress') && Number(el.getAttribute('progress')) < 100) return;
      let p = 0;
      el.setAttribute('progress', '0');
      const timer = setInterval(() => {
        p = Math.min(100, p + 4 + Math.random() * 10);
        if (!el.isConnected) { clearInterval(timer); return; }
        el.setAttribute('progress', String(Math.round(p)));
        if (p >= 100) { clearInterval(timer); setTimeout(() => el.isConnected && el.removeAttribute('progress'), 1600); }
      }, 160);
    });
  }
}
export const wire = { 'transfer-button': wireTransfer };
