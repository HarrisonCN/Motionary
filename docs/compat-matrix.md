# Compatibility matrix (frozen in 11.0)

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — the same data as each module page in [docs/runtime/](runtime/); every ✅ row is covered by the module tests and sample files. Edit the data, not this page.

From 11.0 this matrix is part of the stable API: a ✅ row is not removed or downgraded before 12.0; minors may only add rows or turn ◐ / ✕ into ✅. Totals: **147** ✅ · **16** ◐ · **25** ✕ across 24 modules.

| Module | Import | ✅ | ◐ | ✕ |
|---|---|---|---|---|
| [Runtime core](runtime/core.md) | `motionary/runtime` | 7 | 0 | 0 |
| [CSS @keyframes & WAAPI keyframes loader](runtime/format-css.md) | `motionary/runtime/format-css` | 5 | 1 | 2 |
| [Motion / Framer keyframe JSON loader](runtime/format-motion.md) | `motionary/runtime/format-motion` | 5 | 0 | 1 |
| [Scroll scenes](runtime/scroll.md) | `motionary/runtime/scroll` | 8 | 0 | 2 |
| [SVG loader: SMIL playback + path morphing](runtime/format-svg.md) | `motionary/runtime/format-svg` | 8 | 0 | 1 |
| [Text splitting](runtime/text.md) | `motionary/runtime/text` | 6 | 2 | 0 |
| [Sprite sheets & image sequences](runtime/format-sprite.md) | `motionary/runtime/format-sprite` | 5 | 1 | 2 |
| [Smooth scrolling](runtime/smooth.md) | `motionary/runtime/smooth` | 7 | 2 | 0 |
| [GIF decoder](runtime/format-gif.md) | `motionary/runtime/format-gif` | 6 | 1 | 1 |
| [APNG loader](runtime/format-apng.md) | `motionary/runtime/format-apng` | 7 | 1 | 0 |
| [Animated WebP loader](runtime/format-webp.md) | `motionary/runtime/format-webp` | 4 | 1 | 2 |
| [WebGL2 scene renderer](runtime/gl.md) | `motionary/runtime/gl` | 6 | 1 | 2 |
| [glTF 2.0 / GLB loader](runtime/format-gltf.md) | `motionary/runtime/format-gltf` | 8 | 1 | 2 |
| [OBJ / MTL loader](runtime/format-obj.md) | `motionary/runtime/format-obj` | 4 | 1 | 2 |
| [Lottie + dotLottie player](runtime/vector.md) | `motionary/runtime/vector` | 14 | 1 | 2 |
| [Official Rive runtime](runtime/rive.md) | `@rive-app/canvas` | 6 | 1 | 0 |
| [2D rigid-body physics](runtime/physics.md) | `motionary/runtime/physics` | 8 | 0 | 0 |
| [Scene JSON (motionary-scene@1)](runtime/format-scene.md) | `motionary/runtime/format-scene` | 7 | 0 | 0 |
| [Drag, inertia and snap points](runtime/drag-snap.md) | `motionary/runtime/drag-snap` | 6 | 1 | 1 |
| [glTF animation, skinning and morph targets](runtime/gltf-anim.md) | `motionary/runtime/gltf-anim` | 7 | 0 | 1 |
| [dotLottie themes + state machines](runtime/lottie-state.md) | `motionary/runtime/lottie-state` | 7 | 0 | 1 |
| [glTF decoder hooks (Draco, KTX2)](runtime/gltf-decoders.md) | `motionary/runtime/gltf-decoders` | 4 | 1 | 1 |
| [Official Draco decoder (Google)](runtime/draco3d.md) | `draco3d` | 1 | 0 | 1 |
| [Official Basis Universal transcoder (Binomial)](runtime/basis-transcoder.md) | `basis_transcoder.js` | 1 | 0 | 1 |

## Runtime core — `motionary/runtime`

| Feature | Supported | Notes |
|---|---|---|
| Plain objects (numeric props) | ✅ yes | any numeric property |
| Elements: CSS lengths, %, unitless, colours, custom properties | ✅ yes | hex, rgb(), rgba(), transparent |
| Transform shorthands x y rotate scale scaleX scaleY skewX skewY | ✅ yes | composed in that order |
| Timeline positions (<, >, +=, -=, labels) | ✅ yes |  |
| repeat / yoyo / reverse / seek / timeScale | ✅ yes |  |
| SSR / Node import | ✅ yes | no window access at import |
| Web Workers | ✅ yes | ticker falls back to setTimeout without rAF |

## CSS @keyframes & WAAPI keyframes loader — `motionary/runtime/format-css`

| Feature | Supported | Notes |
|---|---|---|
| @keyframes from / to / percentages / selector lists | ✅ yes | duplicate offsets merged, later wins |
| -webkit- / -moz- prefixed @keyframes | ✅ yes |  |
| animation-timing-function per keyframe | ✅ yes | names, cubic-bezier(), steps() |
| transform lists (translate / rotate / scale / skew) | ✅ yes | tweened as shorthands |
| matrix() / 3D transforms | ◐ partial | switch discretely at the segment midpoint |
| WAAPI array + property-indexed keyframes, offsets, easing | ✅ yes | offsets distributed like the WAAPI |
| composite: add / accumulate | ✕ no | ignored (replace) |
| @property typed interpolation | ✕ no | non-numeric values switch discretely |

## Motion / Framer keyframe JSON loader — `motionary/runtime/format-motion`

| Feature | Supported | Notes |
|---|---|---|
| initial / animate, arrays as keyframes, times | ✅ yes |  |
| transition duration / delay (s), ease names + cubic arrays | ✅ yes | easeIn/Out/InOut, circ*, back*, anticipate≈back-in-out |
| repeat (Infinity), repeatType loop / reverse / mirror | ✅ yes | mirror = reverse |
| per-property transitions | ✅ yes |  |
| type: "spring" (stiffness, damping, mass, bounce + duration) | ✅ yes | simulated into an easing curve |
| variants, gestures (whileHover…), layout animations | ✕ no | out of scope |

## Scroll scenes — `motionary/runtime/scroll`

| Feature | Supported | Notes |
|---|---|---|
| start / end rules ("top 80%", "center center", "top top+=80", end "+=600") | ✅ yes | keywords, %, px, +=/-= offsets |
| scrub: direct (true) or smoothed (ms) | ✅ yes | drives any runtime tween / timeline |
| pin (fixed in the window, transform inside a scroll container) | ✅ yes | spacer keeps the layout |
| markers | ✅ yes | start / end + viewport lines |
| onEnter / onLeave / onEnterBack / onLeaveBack / onUpdate / onToggle | ✅ yes |  |
| actions per edge (play pause resume reverse restart reset complete none) | ✅ yes | default "play none none reverse" |
| horizontal scenes, custom scroll containers | ✅ yes |  |
| snap, nested pins, pinned scroll containers | ✕ no | planned with the smooth module (10.4) |
| SSR | ✅ yes | safe to import; scenes need a window |
| Web Workers | ✕ no | needs the DOM |

## SVG loader: SMIL playback + path morphing — `motionary/runtime/format-svg`

| Feature | Supported | Notes |
|---|---|---|
| <animate> from / to / by / values, keyTimes, calcMode linear / discrete / spline + keySplines | ✅ yes |  |
| <set> | ✅ yes |  |
| <animateTransform> translate / scale / rotate / skewX / skewY | ✅ yes |  |
| <animateMotion> path / <mpath>, rotate auto / auto-reverse / angle | ✅ yes | paced along the path |
| dur, numeric begin offsets, repeatCount (incl. indefinite), repeatDur, fill freeze | ✅ yes |  |
| path morphing between any two paths (d attribute or morphPath()) | ✅ yes | resampled to N points, start points aligned |
| path parsing incl. relative commands, S/T reflections, arcs | ✅ yes | no DOM needed (SSR / workers) |
| event / syncbase begin (click, a.end), accumulate, additive="sum" | ✕ no | documented gap |
| CSS-animated SVG | ✅ yes | via motionary/runtime/format-css |

## Text splitting — `motionary/runtime/text`

| Feature | Supported | Notes |
|---|---|---|
| chars (grapheme clusters: emoji, combining marks, CJK) | ✅ yes | Intl.Segmenter when available, code points otherwise |
| words, whitespace preserved | ✅ yes |  |
| lines (grouped by rendered position) | ✅ yes | wrapped in line spans for flat text; data-line on words inside nested markup |
| nested inline markup (a, em, strong…) kept | ✅ yes |  |
| accessibility: aria-label + aria-hidden pieces, revert() | ✅ yes |  |
| --i index custom property for CSS staggers | ✅ yes |  |
| SSR / workers | ◐ partial | segment() is pure; splitText() needs a DOM |
| right-to-left line detection | ◐ partial | lines by vertical position (works for RTL; bidi runs not reordered) |

## Sprite sheets & image sequences — `motionary/runtime/format-sprite`

| Feature | Supported | Notes |
|---|---|---|
| TexturePacker JSON (hash + array) | ✅ yes | trimmed (spriteSourceSize / sourceSize) and rotated frames |
| Aseprite JSON (hash + array), per-frame duration | ✅ yes |  |
| Aseprite frameTags: forward / reverse / pingpong / pingpong_reverse | ✅ yes |  |
| plain grid sheets | ✅ yes | gridSheet(cols, rows, w, h) |
| image sequences (frame_{0001}.webp) | ✅ yes | preloading, cover-fit drawing, scrub via progress |
| multipack (several atlas images) | ✕ no | load each sheet separately |
| Aseprite slices / layers | ✕ no | frames only |
| SSR / workers | ◐ partial | parsing is pure; players need a canvas (OffscreenCanvas works) |

## Smooth scrolling — `motionary/runtime/smooth`

| Feature | Supported | Notes |
|---|---|---|
| wheel / trackpad smoothing (lerp, or duration + ease) | ✅ yes | frame-rate independent |
| window and scroll containers (wrapper), vertical / horizontal | ✅ yes |  |
| keyboard, scrollbar, find-in-page, assistive tech | ✅ yes | stay native; the smoothed target follows them |
| touch | ◐ partial | native momentum by default; touch: true smooths it |
| anchor links (#id) with offset, focus moved, URL hash kept | ✅ yes |  |
| nested scrollables, [data-smooth-ignore], ctrl+wheel zoom | ✅ yes | left native |
| prefers-reduced-motion | ✅ yes | disabled while it matches (re-enabled live) |
| scroll scenes / IntersectionObserver / CSS scroll timelines | ✅ yes | real scroll events still fire |
| SSR / workers | ◐ partial | import is safe; smoothScroll() needs a browser |

## GIF decoder — `motionary/runtime/format-gif`

| Feature | Supported | Notes |
|---|---|---|
| GIF87a / GIF89a | ✅ yes |  |
| global + local palettes, transparency | ✅ yes |  |
| interlaced frames | ✅ yes | 4-pass row order |
| disposal 0–3 (none / keep / background / previous) | ✅ yes | background clears to transparent, like browsers |
| frame delays, NETSCAPE2.0 / ANIMEXTS loop count | ✅ yes | delays ≤ 10 ms play at 100 ms, like browsers |
| truncated files | ◐ partial | decodes what is there |
| plain-text extension | ✕ no | ignored (browsers ignore it too) |
| SSR / workers | ✅ yes | decoding is pure; the player needs a (Offscreen)Canvas |

## APNG loader — `motionary/runtime/format-apng`

| Feature | Supported | Notes |
|---|---|---|
| acTL / fcTL / fdAT, frame offsets and delays | ✅ yes |  |
| dispose_op none / background / previous | ✅ yes | first-frame previous → background (spec) |
| blend_op source / over | ✅ yes |  |
| hidden default image (IDAT not part of the animation) | ✅ yes |  |
| palette / tRNS / gAMA / iCCP / sRGB / sBIT copied into frames | ✅ yes |  |
| plain (non-animated) PNG | ✅ yes | one frame |
| decoding | ✅ yes | the browser's PNG decoder (createImageBitmap), or your own { decode } |
| SSR / workers | ◐ partial | parsing is pure; decoding needs createImageBitmap (workers OK) or { decode } |

## Animated WebP loader — `motionary/runtime/format-webp`

| Feature | Supported | Notes |
|---|---|---|
| VP8X + ANIM + ANMF frames, offsets, durations, loop count | ✅ yes |  |
| lossy (VP8) with alpha (ALPH) and lossless (VP8L) frames | ✅ yes | lossy + alpha frames get their own VP8X header |
| blending on / off, dispose none / background | ✅ yes | composited on transparent, like browsers |
| still WebP (simple and extended) | ✅ yes | one frame |
| ICC / EXIF / XMP metadata | ✕ no | ignored |
| browsers without WebP decoding | ✕ no | fall back to <img> |
| SSR / workers | ◐ partial | parsing is pure; decoding needs createImageBitmap (workers OK) or { decode } |

## WebGL2 scene renderer — `motionary/runtime/gl`

| Feature | Supported | Notes |
|---|---|---|
| scene graph: nodes, TRS / matrix, hierarchy, bounds, frameNode() | ✅ yes |  |
| perspective camera, orbit controls (drag / wheel / pinch / arrow keys) | ✅ yes | auto-rotate off under reduced motion |
| ambient + up to 4 directional / point lights | ✅ yes |  |
| standard material (metallic-roughness approximation), unlit, shader | ✅ yes | sRGB in/out, Reinhard tone mapping |
| image / canvas / ImageBitmap / raw RGBA textures, mipmaps (power of two) | ✅ yes |  |
| video textures (MP4 / WebM), scroll-scrubbed video (scrubVideo) | ✅ yes | requestVideoFrameCallback; codecs depend on the browser |
| shadows, normal / occlusion / metallic-roughness maps, IBL | ✕ no | planned work beyond 11.0 |
| WebGL1 / no WebGL2 | ✕ no | createRenderer() throws a clear error |
| SSR / workers | ◐ partial | math / geometry / scene graph are pure; rendering needs WebGL2 (OffscreenCanvas works) |

## glTF 2.0 / GLB loader — `motionary/runtime/format-gltf`

| Feature | Supported | Notes |
|---|---|---|
| .gltf (external + data: URI buffers / images) and .glb | ✅ yes |  |
| scenes, node hierarchy, TRS and matrix transforms | ✅ yes |  |
| POSITION / NORMAL / TEXCOORD_0, indices, all component types, normalised ints, byteStride | ✅ yes | missing normals computed (flat) |
| primitive modes points / lines / triangles / strips / fans | ✅ yes | strips and fans converted to triangles |
| PBR metallic-roughness factors, base colour texture, emissive, alpha blend, double-sided | ✅ yes | KHR_materials_emissive_strength, KHR_materials_unlit |
| skins, morph targets, animations | ✅ yes | data kept on the nodes / geometry; played by motionary/runtime/gltf-anim (10.8) |
| sparse accessors | ✅ yes | 10.8 |
| Draco / KTX2 (Basis) compression | ✅ yes | 10.9: through the official decoders (draco3d, Basis Universal transcoder) — motionary/runtime/gltf-decoders + <usa-gl-model> |
| meshopt compression (EXT_meshopt_compression) | ✕ no | files that require it fail with a clear error |
| cameras, KHR_lights_punctual, texture transforms | ✕ no | ignored |
| SSR / workers | ◐ partial | parseGlb / gltfToNode are pure; loadGltf decodes images with createImageBitmap |

## OBJ / MTL loader — `motionary/runtime/format-obj`

| Feature | Supported | Notes |
|---|---|---|
| v / vt / vn, faces with any vertex count (fan-triangulated), negative indices | ✅ yes |  |
| o / g groups, usemtl (one mesh per material), mtllib | ✅ yes |  |
| MTL Kd, Ks + Ns (→ roughness), Ke, d / Tr, map_Kd (options stripped) | ✅ yes |  |
| missing normals | ✅ yes | computed (flat) |
| smoothing groups (s), lines (l), free-form curves / surfaces | ✕ no | ignored |
| bump / normal / specular maps, PBR MTL extensions | ✕ no | ignored |
| SSR / workers | ◐ partial | parsing is pure; loadObj fetches files and decodes textures with createImageBitmap |

## Lottie + dotLottie player — `motionary/runtime/vector`

| Feature | Supported | Notes |
|---|---|---|
| shape, solid, null, image and precomp layers; parenting; in / out points | ✅ yes | precomp time stretch + time remap |
| transforms: anchor, position (split X / Y, spatial bezier), scale, rotation, skew, opacity | ✅ yes |  |
| paths, rectangles (rounded), ellipses, stars / polygons, groups | ✅ yes |  |
| fills (non-zero / even-odd), strokes (caps, joins, dashes) | ✅ yes |  |
| linear + radial gradient fills / strokes | ✅ yes | highlight length / angle ignored |
| trim paths (individually / simultaneously) | ✅ yes |  |
| masks: add, subtract, intersect, inverted, opacity | ✅ yes |  |
| track mattes: alpha, alpha inverted | ✅ yes | luma mattes approximated by alpha |
| keyframes: per-dimension bezier easing, hold keyframes, v4 + v5 files | ✅ yes |  |
| dotLottie (.lottie): stored + deflate entries, manifest v1 / v2, several animations, embedded images | ✅ yes | deflate needs the native DecompressionStream |
| dotLottie themes + state machines | ✅ yes | 10.9: motionary/runtime/lottie-state + <usa-dotlottie> (subset) |
| markers → named segments | ✅ yes |  |
| text layers: fonts by family + style, justification, tracking, line height, fill / stroke, box text (wrapping), source-text keyframes | ✅ yes | 10.8; system / page fonts (glyph outlines in chars are not used); text animators not supported |
| expressions: time, value, wiggle, loopOut / loopIn (cycle, pingpong, offset, continue), linear / ease, valueAtTime, Math, arithmetic, var / $bm_rt | ✅ yes | 10.8 subset, own interpreter (no eval; CSP-safe); other expressions keep the keyframed value and are listed by inspectLottie() |
| 3D layers, layer effects, merge paths, repeaters | ✕ no | listed by inspectLottie() / el.unsupported |
| dotLottie themes / state machines | ✕ no | planned for 10.9 (subset) |
| SSR / workers | ◐ partial | parsing + unzip are pure; rendering needs a 2D canvas (OffscreenCanvas works) |

## Official Rive runtime — `@rive-app/canvas` (official runtime, optional peer)

| Feature | Supported | Notes |
|---|---|---|
| .riv files: artboards, linear animations | ✅ yes | played by the official runtime |
| state machines + inputs (boolean, number, trigger) | ✅ yes | el.input(name) |
| fit: contain, cover, fill, fitWidth, fitHeight, none | ✅ yes |  |
| lazy loading, clear error when the runtime is missing | ✅ yes | usa:runtime-missing |
| reduced motion | ✅ yes | no autoplay (first frame) |
| WebGL2 renderer (@rive-app/webgl2) | ◐ partial | pass its URL as runtime-src or provideRiveRuntime(() => import('@rive-app/webgl2')) |
| SSR | ✅ yes | nothing loads until the element mounts in a browser |

## 2D rigid-body physics — `motionary/runtime/physics`

| Feature | Supported | Notes |
|---|---|---|
| bodies: circle, box, convex polygon (any winding, made convex) | ✅ yes | concave shapes: split them into convex parts |
| static, dynamic and kinematic bodies; density / mass, inertia, fixed rotation | ✅ yes |  |
| collisions: sort-and-sweep broad phase, SAT narrow phase, up to 2 contact points | ✅ yes | no continuous collision detection: very fast small bodies can tunnel |
| restitution, Coulomb friction, warm-started accumulated impulses | ✅ yes |  |
| constraints: distance (rigid or spring with stiffness / damping), pin, pointer drag | ✅ yes | no revolute motors / joint limits |
| sensors, collision categories / masks, collision events, sleeping | ✅ yes |  |
| fixed time step + accumulator (same result at any frame rate) | ✅ yes |  |
| SSR / workers | ✅ yes | pure maths; world.run() needs the runtime ticker |

## Scene JSON (motionary-scene@1) — `motionary/runtime/format-scene`

| Feature | Supported | Notes |
|---|---|---|
| world: size, gravity, walls (with or without a top), solver iterations | ✅ yes |  |
| named materials (restitution, friction, density), per-body overrides | ✅ yes |  |
| bodies: circle / box / polygon, static / kinematic, velocity, angle, sensor, style | ✅ yes |  |
| constraints: distance / spring / pin between bodies or to a world point | ✅ yes |  |
| validation (lists every problem, never throws) + parseScene (throws one error) | ✅ yes |  |
| migration: unversioned scenes and the motionary-scene@0 draft → @1, with a change list | ✅ yes |  |
| save: worldToScene() (walls made by bounds() are left out) | ✅ yes |  |

## Drag, inertia and snap points — `motionary/runtime/drag-snap`

| Feature | Supported | Notes |
|---|---|---|
| pointer, touch and pen (Pointer Events), drag threshold, pointer capture, touch-action for the other axis | ✅ yes | one axis per controller (x or y) |
| velocity from the last 100 ms, inertial throw with constant deceleration | ✅ yes | off under reduced motion |
| snap points: nearest to the projected throw, a fast flick moves at least one point | ✅ yes |  |
| critically damped spring to the snap point (shared ticker) | ✅ yes | instant under reduced motion |
| bounds with rubber-band resistance | ✅ yes |  |
| clicks inside are kept; the click that ends a drag is swallowed | ✅ yes |  |
| free 2D dragging, scroll-linked snapping (CSS scroll-snap) | ✕ no | use two controllers / native scroll-snap |
| SSR / workers | ◐ partial | the maths (projectThrow, nearestSnap, rubberband, springStep, velocityTracker) is pure |

## glTF animation, skinning and morph targets — `motionary/runtime/gltf-anim`

| Feature | Supported | Notes |
|---|---|---|
| animation channels: translation, rotation, scale, weights | ✅ yes | KHR_animation_pointer is ignored |
| samplers: LINEAR (quaternions slerped), STEP, CUBICSPLINE (Hermite, in / out tangents) | ✅ yes |  |
| skins: joint hierarchy, inverse bind matrices, JOINTS_0 / WEIGHTS_0 (4 influences) | ✅ yes | CPU skinning; JOINTS_1 / WEIGHTS_1 (8 influences) not used |
| morph targets: POSITION + NORMAL deltas, mesh / node default weights, animated weights | ✅ yes | TANGENT / TEXCOORD / COLOR targets ignored |
| sparse accessors (common for morph targets) | ✅ yes | read by format-gltf |
| clip player: by name or index, loop, speed, seek, update(dt) or the shared ticker | ✅ yes | one clip at a time (no blending) |
| GPU skinning, animation blending / cross-fades, a mesh shared by several skinned nodes | ✕ no | planned work beyond 11.0 |
| SSR / workers | ✅ yes | sampling and deformation are pure; play() needs the runtime ticker |

## dotLottie themes + state machines — `motionary/runtime/lottie-state`

| Feature | Supported | Notes |
|---|---|---|
| themes: slots ("sid") + the animation’s default slot values | ✅ yes |  |
| theme rules: Color, Scalar, Vector / Position, Text; static value or keyframes; per-animation rules | ✅ yes | Image rules are ignored |
| state machines: initial state, PlaybackState (animation, autoplay, loop, speed, mode, marker segment), GlobalState transitions | ✅ yes | subset |
| guards: Numeric / String / Boolean (Equal, NotEqual, GreaterThan(OrEqual), LessThan(OrEqual)), Event | ✅ yes |  |
| interactions: PointerDown / Up / Enter / Exit, Click, OnComplete (+ keyboard Enter / Space in <usa-dotlottie>) | ✅ yes | layerName hit-testing is not done: layer-bound interactions fire for the whole canvas |
| actions: Fire, Set*, Toggle, Increment, Decrement, Reset, SetTheme, SetFrame, SetProgress, FireCustomEvent | ✅ yes |  |
| OpenUrl, blend / tweened transitions, pointer position inputs | ✕ no | OpenUrl is refused on purpose (a file must not navigate the page); listed by inspectStateMachine() |
| SSR / workers | ✅ yes | pure data + logic |

## glTF decoder hooks (Draco, KTX2) — `motionary/runtime/gltf-decoders`

| Feature | Supported | Notes |
|---|---|---|
| KHR_draco_mesh_compression (POSITION, NORMAL, TEXCOORD_0, JOINTS / WEIGHTS …, indices) | ✅ yes | decoded by the official draco3d decoder (optional peer) |
| KHR_texture_basisu (KTX2 / Basis Universal ETC1S + UASTC) | ✅ yes | transcoded to RGBA8 by the official Basis Universal transcoder (optional peer); GPU-compressed upload is not used |
| lazy loading: a decoder is fetched only when a file needs it | ✅ yes | provideGltfDecoder(kind, loader) |
| missing decoder | ✅ yes | clear error naming the extension, the package and the provide line |
| EXT_meshopt_compression, KHR_mesh_quantization | ✕ no | files that require them fail with a clear error |
| SSR / workers | ◐ partial | Draco decoding works in Node / workers; KTX2 images need ImageData (or the raw RGBA) |

## Official Draco decoder (Google) — `draco3d` (official runtime, optional peer)

| Feature | Supported | Notes |
|---|---|---|
| Draco meshes in glTF (KHR_draco_mesh_compression) | ✅ yes | decoded by draco3d 1.5.x |
| point clouds | ✕ no | triangle meshes only |

## Official Basis Universal transcoder (Binomial) — `basis_transcoder.js` (official runtime, optional peer)

| Feature | Supported | Notes |
|---|---|---|
| KTX2 textures (ETC1S / UASTC) in glTF (KHR_texture_basisu) | ✅ yes | transcoded to RGBA8 |
| standalone .basis / .ktx2 files outside glTF | ✕ no | use the transcoder directly |
