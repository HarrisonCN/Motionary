import { C } from './make.js';

const x = { entry: 'widgets', since: '17.9' };
export const components = [
  C("usa-eclipse-toggle", "ui", "Eclipse toggle", "日食开关", "A sun slides behind a moon as the switch turns on; a native switch button underneath.", "打开时月亮滑过太阳形成日食；底层是原生开关按钮。", ['switch', 'moment', '17.9'],
    '<mo-eclipse-toggle label="Night mode"></mo-eclipse-toggle>', undefined, x),
  C("usa-hue-orbit", "ui", "Hue orbit", "色相轨道", "Pick a hue from dots on a ring; the ring turns the short way to bring the pick to the top.", "在环上点选色相，圆环沿较短方向转动，把选中色转到顶部。", ['color', 'radio', 'moment', '17.9'],
    '<mo-hue-orbit label="Accent colour" hue="210"></mo-hue-orbit>', undefined, x),
  C("usa-notch-slider", "ui", "Notch slider", "刻度吸附滑块", "A native range with detents: crossing a notch pops it, letting go near one snaps to it.", "带刻度的原生滑块：划过刻度会轻跳，在刻度附近松手会吸附过去。", ['range', 'detent', 'moment', '17.9'],
    '<mo-notch-slider label="Exposure" min="-2" max="2" step="0.1" notches="5" value="0" unit=" EV"></mo-notch-slider>', undefined, x),
  C("usa-bulge-volume", "ui", "Bulge volume", "鼓起音量条", "A vertical pill that swells around the finger while you drag the level.", "拖动调节音量时，竖条会在手指处鼓起，松手后弹回。", ['range', 'gesture', 'moment', '17.9'],
    '<mo-bulge-volume label="Volume" value="60"></mo-bulge-volume>', undefined, x),
  C("usa-copy-button", "ui", "Copy button", "复制按钮", "Two squares redraw into a tick and the label rolls to Copied; only success and length leave the element.", "复制时两个方块重绘成对勾，文字滚动为已复制；事件只带结果和长度。", ['clipboard', 'moment', '17.9'],
    '<mo-copy-button text="npm i motionary"></mo-copy-button>', undefined, x),
  C("usa-tile-relay", "ui", "Tile relay", "接力加载", "A highlight is handed from tile to tile around a small grid; pure CSS, paused off screen.", "高亮在小方格间接力传递的加载指示；纯 CSS，离屏时暂停。", ['loading', 'moment', '17.9'],
    '<mo-tile-relay size="3" label="Loading photos"></mo-tile-relay>', undefined, x),
];
