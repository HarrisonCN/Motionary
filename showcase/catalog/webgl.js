import { C, H, K } from './make.js';

const IMG = '<img src="assets/demo-photo.jpg" alt="Abstract demo photo" width="640" height="400">';

export const category = K('webgl', '◈', 'Canvas & WebGL', 'Canvas 与 WebGL',
  'Lightweight GPU effects on a single-quad runner: shader backgrounds, GPU particles, post-processing, hover image distortion and liquid ripple images. Render only while visible, DPR ≤ 2, and fall back gracefully without WebGL.',
  '基于单四边形渲染器的轻量 GPU 效果：着色器背景、GPU 粒子、后期处理、悬停图片扭曲与液体涟漪图片。仅在可见时渲染，DPR ≤ 2，不支持 WebGL 时优雅降级。');

export const components = [
  C('usa-shader', 'webgl', 'Shader background', '着色器背景',
    'A GPU shader behind your content: gradient, plasma, waves or aurora presets — or your own fragment shader in a <script type="x-shader/x-fragment">. Falls back to the CSS background.',
    '内容背后的 GPU 着色器：gradient、plasma、waves、aurora 预设 —— 或在 <script type="x-shader/x-fragment"> 中写自己的片元着色器。不支持时回退为 CSS 背景。',
    ['shader', 'webgl', 'gradient', 'background', 'glsl'],
    '<usa-shader preset="aurora" speed="1">\n  <h1>Hero title</h1>\n</usa-shader>\n\n<usa-shader>\n  <script type="x-shader/x-fragment">\n    void main() { gl_FragColor = vec4(v_uv, 0.5 + 0.5 * sin(u_time), 1.0); }\n  </script>\n</usa-shader>',
    '<usa-shader preset="plasma" class="demo-gl"><div class="demo-gl__label">GPU shader</div></usa-shader>',
    { controls: [{ key: 'preset', values: ['gradient', 'plasma', 'waves', 'aurora'] }, { key: 'speed', values: ['0.5', '1', '2'] }] }),
  C('usa-distort', 'webgl', 'Hover distortion', '悬停扭曲',
    'The image bulges and splits into RGB around the pointer. Without WebGL (or a cross-origin image without CORS) it falls back to a gentle CSS zoom.',
    '图片在指针周围鼓起并分离 RGB 通道。不支持 WebGL（或跨域图片无 CORS）时回退为柔和的 CSS 放大。',
    ['hover', 'distortion', 'rgb split', 'image'],
    '<usa-distort>\n  <img src="photo.jpg" alt="…">\n</usa-distort>',
    `<usa-distort class="demo-gl">${IMG}</usa-distort>`),
  C('usa-liquid', 'webgl', 'Liquid image', '液体图片',
    'Click or tap to send water ripples through the image; hover adds a gentle wobble. The plain image stays when WebGL is unavailable.',
    '点击或轻触让水波涟漪穿过图片；悬停时轻微晃动。不支持 WebGL 时保留原图。',
    ['ripple', 'liquid', 'water', 'image'],
    '<usa-liquid strength="1">\n  <img src="photo.jpg" alt="…">\n</usa-liquid>',
    `<usa-liquid class="demo-gl">${IMG}</usa-liquid>`),
  C('usa-shader', 'webgl', 'GPU particles', 'GPU 粒子',
    'Particle presets (4.8) on the same single quad — snow, fireflies, a warp starfield, bokeh and rain — computed procedurally in the shader (no buffers, no per-particle JS). Adaptive: resolution steps down when fps drops, frame rate is capped on battery saver.',
    '粒子预设（4.8），同样运行在单四边形上 —— 雪花、萤火虫、星际穿越、散景与雨 —— 全部在着色器中程序化生成（无缓冲区、无逐粒子 JS）。自适应：帧率下降时降低分辨率，省电模式下限制帧率。',
    ['particles', 'snow', 'stars', 'bokeh', 'battery'],
    '<usa-shader preset="snow">\n  <h1>Winter sale</h1>\n</usa-shader>\n<!-- fireflies · stars · bokeh · rain; quality="high" disables adaptive quality -->',
    '<usa-shader preset="snow" class="demo-gl"><div class="demo-gl__label">GPU particles</div></usa-shader>',
    { id: 'shader-particles', controls: [{ key: 'preset', values: ['snow', 'fireflies', 'stars', 'bokeh', 'rain'] }] }),
  C('usa-post-fx', 'webgl', 'Post-processing', '后期处理',
    'Chainable GPU passes over an image (4.8): vignette, grain, chromatic aberration, scanlines, CRT, bloom, pixelate, duotone and glitch, with one intensity. Without WebGL the image gets an approximate CSS filter.',
    '图片上的可串联 GPU 后期（4.8）：暗角、胶片颗粒、色差、扫描线、CRT、泛光、像素化、双色调与故障，统一强度参数。不支持 WebGL 时以近似的 CSS 滤镜回退。',
    ['post-processing', 'vignette', 'crt', 'bloom', 'glitch'],
    '<usa-post-fx effects="vignette grain" intensity="0.6">\n  <img src="photo.jpg" alt="…">\n</usa-post-fx>',
    `<usa-post-fx class="demo-gl" effects="crt chromatic">${IMG}</usa-post-fx>`,
    { controls: [{ key: 'effects', values: ['crt chromatic', 'vignette grain', 'bloom vignette', 'duotone grain', 'pixelate', 'scanlines glitch'] }, { key: 'intensity', values: ['0.3', '0.6', '1'] }] }),
];

export const helpers = [
  H('gl-quad', 'webgl', 'glQuad',
    'glQuad(canvas, fragment) compiles one fragment shader on a full-canvas quad (u_time, u_resolution, u_mouse, u_tex) and returns { render, resize, texture, dispose } — or null so you can fall back.',
    'glQuad(canvas, fragment) 在全画布四边形上编译一个片元着色器（u_time、u_resolution、u_mouse、u_tex），返回 { render, resize, texture, dispose } —— 不支持时返回 null 以便回退。',
    ['webgl', 'glsl', 'canvas', 'fallback'],
    "import { glQuad, supportsWebGL } from 'use-scroll-animate/components/webgl';\n\nconst q = supportsWebGL() && glQuad(canvas, 'void main(){ gl_FragColor = vec4(v_uv, 1., 1.); }');\nif (q) requestAnimationFrame(function loop(t) { q.render({ time: t / 1000 }); requestAnimationFrame(loop); });\nelse canvas.classList.add('fallback');",
    '<canvas class="demo-gl demo-gl--canvas" data-gl-canvas aria-hidden="true"></canvas><p class="demo-note" data-gl-status aria-live="polite"></p>'),
];

export const wire = {
  'gl-quad': (stage, lib, T) => {
    const c = stage.querySelector('[data-gl-canvas]');
    const q = lib.glQuad(c, 'void main(){vec2 u=v_uv-u_mouse;float d=length(u);gl_FragColor=vec4(.5+.5*cos(u_time+d*12.+vec3(0.,2.,4.)),1.);}');
    stage.querySelector('[data-gl-status]').textContent = q ? 'WebGL ✓' : 'WebGL unavailable → fallback';
    if (!q || lib.prefersReducedMotion()) return q && q.render({ time: 0 });
    let m = [0.5, 0.5];
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      m = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    });
    const loop = (t) => {
      if (!c.isConnected) return q.dispose();
      q.render({ time: t / 1000, mouse: m });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },
};
