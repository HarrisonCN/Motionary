import { C } from './make.js';

const x = { entry: 'widgets', since: '17.14' };
export const components = [
  C("usa-icon-picker", "ui", "Icon picker", "图标选择器", "Search 753 line icons by name or category, filter with chips, walk the grid with arrow keys and pick one; it can copy the name, an <mo-icon> tag or the svg.", "按名称或类别搜索 753 个线条图标，用分类标签筛选，方向键浏览网格并选中；可复制名称、<mo-icon> 标签或 svg。", ['ui', 'icons', '17.14'],
    '<mo-icon-picker value="heart" copy="tag" height="260"></mo-icon-picker>', undefined, x),
  C("usa-icon", "svg", "Icon", "图标", "One of 753 original line icons in the text colour, with twelve motions (spin, pulse, beat, bounce, wiggle, shake, ring, float, flip, draw, pop, blink) on loop, hover, click or view.", "753 个原创线条图标之一，随文字颜色；可加 12 种动效（旋转、脉冲、心跳、弹跳、摇摆、抖动、铃响、漂浮、翻转、描线、弹出、闪烁），循环、悬停、点击或进入视口时播放。", ['svg', 'icons', '17.14'],
    '<p style="display:flex;gap:18px;flex-wrap:wrap;font-size:28px;margin:0"><mo-icon name="bell" motion="ring" trigger="loop" size="32" label="Notifications"></mo-icon><mo-icon name="heart" motion="beat" trigger="loop" size="32" color="#e11d48"></mo-icon><mo-icon name="refresh" motion="spin" trigger="loop" size="32"></mo-icon><mo-icon name="sparkles" motion="pulse" trigger="loop" size="32" color="#a855f7"></mo-icon><mo-icon name="send" motion="float" trigger="loop" size="32"></mo-icon><mo-icon name="settings" motion="draw" trigger="loop" size="32"></mo-icon></p>', undefined, x),
];
