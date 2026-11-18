import { C } from './make.js';

export const components = [
  C("usa-lens-stack", "depth", "Lens assembly", "镜组拆解", "Separate seven coaxial lens sections with a horizontal drag.", "横向拖动，将七组镜片和镜筒沿光轴展开。", ['Three.js', 'gesture', '17.8'],
    '<mo-lens-stack value="42"></mo-lens-stack>', undefined, { entry: 'widgets', since: '17.8', requires: ['spatial-instruments'] }),
  C("usa-iris-diaphragm", "depth", "Iris diaphragm", "机械光圈", "Pivot nine overlapping blades to vary the opening.", "拖动九片交叠的叶片，观察通光孔径变化。", ['Three.js', 'gesture', '17.8'],
    '<mo-iris-diaphragm value="45"></mo-iris-diaphragm>', undefined, { entry: 'widgets', since: '17.8', requires: ['spatial-instruments'] }),
  C("usa-contour-relief", "depth", "Contour relief", "立体等高线", "Lift thirteen contour plates to study the relief in perspective.", "拉开十三层等高线，观察山体的高差。", ['Three.js', 'gesture', '17.8'],
    '<mo-contour-relief value="35"></mo-contour-relief>', undefined, { entry: 'widgets', since: '17.8', requires: ['spatial-instruments'] }),
  C("usa-fx", "fx", "Iris reveal", "光圈揭幕", "Open a polygonal aperture from the center of the surface.", "从卡面中央逐步打开多边形光圈。", ['optics', 'effect', '17.8'],
    '<mo-fx effect="iris-reveal" trigger="click"><button type="button">Iris reveal</button></mo-fx>', undefined, { id: 'fx-iris-reveal', define: 'defineFx', reg: ['fx-spatial', 'registerSpatialPack'], since: '17.8' }),
  C("usa-fx", "fx", "Shutter catch", "快门回弹", "A quick vertical compression and rebound.", "沿纵向轻压，经过一次超调后回稳。", ['optics', 'effect', '17.8'],
    '<mo-fx effect="shutter-catch" trigger="click"><button type="button">Shutter catch</button></mo-fx>', undefined, { id: 'fx-shutter-catch', define: 'defineFx', reg: ['fx-spatial', 'registerSpatialPack'], since: '17.8' }),
  C("usa-fx", "fx", "Detent tick", "刻度卡位", "A short lateral nudge that settles like a dial detent.", "短促的侧向位移，模拟拨盘进入刻度。", ['optics', 'effect', '17.8'],
    '<mo-fx effect="detent-tick" trigger="click"><button type="button">Detent tick</button></mo-fx>', undefined, { id: 'fx-detent-tick', define: 'defineFx', reg: ['fx-spatial', 'registerSpatialPack'], since: '17.8' }),
];
