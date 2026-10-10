# `<usa-fx>` — Attention seekers

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

<usa-fx> plays any registered effect on its child: pulse, pop, jelly, wiggle, heartbeat, bounce, flash (≤ 2 per second), tada, shake. Click the button.

- **Category:** fx · **since** 5.0 · **changed in** 5.1, 5.9, 6.0
- **Import:** `import { defineFx } from 'motionary/components/fx'` then `defineFx();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `effect`, `trigger`, `options`, `self`, `once`
- **Events:** —
- **Slots:** —
- **Methods:** `play()`
- **Source:** [src/components/fx/fx-el.ts](../../src/components/fx/fx-el.ts)

## Minimal example

```html
<usa-fx effect="jelly" trigger="click">
  <button>Press me</button>
</usa-fx>
```

## ES module

```js
import { defineFx } from 'motionary/components/fx';

defineFx(); // registers <usa-fx>

/* then use it in your HTML:
<usa-fx effect="jelly" trigger="click">
  <button>Press me</button>
</usa-fx>
*/
```

## Variants

### Attention seekers

<usa-fx> plays any registered effect on its child: pulse, pop, jelly, wiggle, heartbeat, bounce, flash (≤ 2 per second), tada, shake. Click the button.

```html
<usa-fx effect="jelly" trigger="click">
  <button>Press me</button>
</usa-fx>
```

### Click effects

Registered click effects — burst, confetti and ink ripple — start at the pointer.

```html
<usa-fx effect="confetti">
  <button>Celebrate</button>
</usa-fx>
```

### Entrances on scroll

Every timeline preset is also an enter effect: trigger="enter" plays it when the element scrolls into view (once).

```html
<usa-fx effect="fade-up" trigger="enter">
  <h2>Hello</h2>
</usa-fx>
```

### Holographic card

5.1: a rainbow foil sheen and 3D tilt follow the pointer (trigger="load" keeps it on). Under reduced motion the sheen stays static.

```html
<usa-fx effect="holo" trigger="load">
  <article class="card">…</article>
</usa-fx>
```

### Card moves

5.1: glare sweep, book-open peek, card fan (children spread like a hand of cards), topple-and-spring — hover the card.

```html
<usa-fx effect="glare-sweep" trigger="hover">
  <article class="card">…</article>
</usa-fx>
```

### Click effects 2.0

5.1: shockwave rings, ink splash, spinning star burst, jelly press, water ring ripple and emoji rain — all from the click point.

```html
<usa-fx effect="shockwave">
  <button>Boom</button>
</usa-fx>
```

### Bounce & physics

5.2: spring-solved bounce-in, rubber band, drop-and-bounce under gravity, damped bell swing — click the button.

```html
<usa-fx effect="drop-bounce" trigger="enter">
  <img src="badge.svg" alt="New">
</usa-fx>
```

### Gravity text

5.2: every character drops in under gravity and bounces, staggered; the text keeps an aria-label.

```html
<usa-fx effect="gravity-text" trigger="enter">
  <h2>Falling letters</h2>
</usa-fx>
```

### Elastic hover & spring follow

5.2: elastic-hover lifts with a springy overshoot; spring-follow chases the pointer across its parent (both persistent, trigger="load").

```html
<usa-fx effect="spring-follow" trigger="load">
  <span class="dot"></span>
</usa-fx>
```

### Page transitions

5.3: curtain, iris (closes on the click point), pixel dissolve and venetian blinds — cover the page, call onCovered() (swap your route there), then reveal. Reduced motion: a quick cross-fade.

```html
<usa-fx effect="iris">
  <a href="/next">Next page</a>
</usa-fx>

<script type="module">
  playEffect(document.body, 'curtain', { onCovered: () => router.go('/next') });
</script>
```

### Velocity skew & edge glow

5.3: velocity-skew leans the element with scroll speed; edge-glow lights the viewport edge you scroll toward; spotlight dims everything but a circle at the pointer (all persistent, trigger="load") — scroll the page.

```html
<usa-fx effect="velocity-skew" trigger="load">
  <section class="gallery">…</section>
</usa-fx>
```

### Generative backgrounds

5.5: flow field, Voronoi cells, mesh gradient, starfield, metaballs and topographic contours on Canvas 2D — rendered only while visible, with adaptive quality; one static frame under reduced motion.

```html
<usa-fx effect="mesh-gradient" trigger="load" self class="hero">
  <h1>Hello</h1>
</usa-fx>
```

### Sound-reactive backgrounds

5.6: spectrum bars, pulse rings and a waveform ring driven by a Web Audio analyser (microphone, <audio>/<video> or a MediaStream via enableAudio()). They idle gently until audio is enabled; skipped under reduced motion.

```html
<usa-fx effect="spectrum-bars" trigger="load" self options='{"mirror":true}'>
  <h2>Now playing</h2>
</usa-fx>
```

### Cursor trails

5.7: comet trail, rainbow ribbon, sparkle stars, magnetic dot grid and an easing spotlight — scoped to the element, mouse / pen only by default (touch: true to opt in), off under reduced motion.

```html
<usa-fx effect="comet-trail" trigger="load" self>
  <section class="hero">…</section>
</usa-fx>
```

### Micro-interactions

5.8: 23 small interactions that also do the UI work — like / favourite / bookmark toggles (aria-pressed), copy to clipboard with "Copied ✓", password show / hide, download & submit progress (aria-busy), counters, upvote, clap, emoji reactions, refresh spin, trash, input shake (aria-invalid)…

```html
<usa-fx effect="like-heart" trigger="click">
  <button aria-pressed="false">♥ <span data-count="12">12</span></button>
</usa-fx>
```

### GPU backgrounds

6.2: WebGL2 shaders — fluid (swirls around the pointer), smoke, fire, ink in water and fireflies — with a Canvas 2D fallback when WebGL2 is missing or the context is lost. Renders only while visible, adapts its resolution; one still frame under reduced motion.

```html
<usa-fx effect="fluid" trigger="load" self class="hero">
  <h1>Hello</h1>
</usa-fx>
```

### Sakura, leaves & splash

6.2: cherry-blossom petals and autumn leaves drift down behind the content (Canvas 2D), and splash throws water droplets from the click point.

```html
<usa-fx effect="sakura" trigger="load" self class="hero">
  <h1>Spring</h1>
</usa-fx>
```

### Splash click

6.2: a ring plus droplets that arc out of the click point and fall with gravity.

```html
<usa-fx effect="splash">
  <button>Splash</button>
</usa-fx>
```

### Text effects 3.0

6.3: flip-chars (per-character 3D flip), neon-write (a neon sign switching on letter by letter), particle-text (particles assemble into the glyphs) and glitch-text (RGB-split slices). Screen readers get the plain text.

```html
<usa-fx effect="flip-chars" trigger="enter">
  <h1>Motionary</h1>
</usa-fx>
```

### Liquid & breathing text

6.3: liquid-text ripples the glyphs with an animated SVG displacement filter; font-breathe sends a variable-font weight wave through the text. Both are skipped under reduced motion.

```html
<usa-fx effect="liquid-text" trigger="loop">
  <h1>Liquid</h1>
</usa-fx>
```

### Text cursor trail

6.3: the letters of a word fall off the pointer as it moves over the element (option text, color, spacing).

```html
<usa-fx effect="text-trail" trigger="load" options='{"text":"HELLO"}'>
  <section class="hero">…</section>
</usa-fx>
```

### Dynamic light, lens & shadow

6.4: light-follow (a point light with a specular hot spot), refraction (a glass lens that bends and magnifies what is behind it) and pointer-shadow (the pointer is the light — a real-time cast shadow). Fixed lighting under reduced motion.

```html
<usa-fx effect="light-follow" trigger="load">
  <div class="card">…</div>
</usa-fx>
```

### Brushed metal & pearl

6.4: brushed-metal (fine lines with an anisotropic sheen that turns with the pointer) and pearlescent (a nacre / holographic film whose hues shift as you move).

```html
<usa-fx effect="brushed-metal" trigger="load">
  <div class="card">…</div>
</usa-fx>
```

### Volumetric light (god rays)

6.4: light shafts fan out from a source point and slowly sweep, drawn additively on Canvas 2D; renders only while visible, one still frame under reduced motion.

```html
<usa-fx effect="god-rays" trigger="load" self class="hero">
  <h1>Dawn</h1>
</usa-fx>
```

### 3D depth, product spin & orbit

6.5: depth-stack (layers separate in Z and parallax as the card tilts), product-spin (drag to turn with inertia, idle turntable) and orbit-camera (the camera orbits the 3D layers while you scroll).

```html
<usa-fx effect="depth-stack" trigger="load">
  <div class="card">
    <img data-depth="1" src="bg.png" alt="">
    <h3 data-depth="3">Title</h3>
  </div>
</usa-fx>
```

### Thick card flip

6.5: card-flip-3d turns a card over to its back face (the second child) with a lift and visible thickness; the faces swap aria-hidden.

```html
<usa-fx effect="card-flip-3d">
  <div class="card">
    <div>Front</div>
    <div>Back</div>
  </div>
</usa-fx>
```

### Origami unfold

6.5: origami unfolds the element panel by panel like folded paper (enter effect; skipped under reduced motion).

```html
<usa-fx effect="origami" trigger="enter">
  <article>…</article>
</usa-fx>
```

### Path morph & stroke draw

6.6: path-morph flows an SVG path between any shapes (resampled points, so different commands morph smoothly); stroke-draw draws every stroke of an SVG, then fades the fills in.

```html
<usa-fx effect="path-morph" trigger="loop" options='{"paths":["M…","M…"]}'>
  <svg viewBox="0 0 100 100"><path d="M…"/></svg>
</usa-fx>
```

### Liquid blob button

6.6: blob-button puts a liquid blob behind the element that wobbles and bulges toward the pointer.

```html
<usa-fx effect="blob-button" trigger="load">
  <button>Get started</button>
</usa-fx>
```

### SVG filter reveal & icon swap

6.6: noise-reveal condenses the element out of SVG turbulence (an SVG-filter transition); icon-swap cycles child icons with a gooey blur-scale-rotate morph.

```html
<usa-fx effect="noise-reveal" trigger="enter">
  <img src="hero.jpg" alt="…">
</usa-fx>
<usa-fx effect="icon-swap">
  <button><span>☀️</span><span>🌙</span></button>
</usa-fx>
```

### Transitions 2.0: ripple dissolve & liquid wipe

6.7: ripple-dissolve grows a circle from the pointer; liquid-wipe sweeps a wavy edge across. pageTransition() runs them inside the View Transitions API; crossDocumentTransitions() gives an MPA the same look.

```html
<usa-fx effect="ripple-dissolve" trigger="click" options='{"mode":"in"}'>
  <section>…</section>
</usa-fx>
<script type="module">
  import { pageTransition } from 'motionary/components/fx-transitions';
  pageTransition(() => render(next), 'liquid-wipe');
</script>
```

### Shatter & mosaic flip

6.7: shatter breaks the element into triangular shards that fly together (in) or apart (out); mosaic-flip turns a grid of tiles over in a diagonal wave.

```html
<usa-fx effect="shatter" trigger="click" options='{"mode":"in","pieces":16}'>
  <img src="photo.jpg" alt="…">
</usa-fx>
```

### Page curl & camera dolly

6.7: page-curl turns the element like a book page around its left edge with a moving shade; camera-dolly moves it in from depth with a depth-of-field blur.

```html
<usa-fx effect="page-curl" trigger="enter">
  <article>…</article>
</usa-fx>
```

### Rain on glass & snowfall

6.8: rain-glass — droplets grow on a window pane and run down leaving trails; snowfall — flakes drift down and pile up along the bottom edge.

```html
<usa-fx effect="rain-glass" trigger="load">
  <header class="hero">…</header>
</usa-fx>
```

### Safe lightning & fog

6.8: lightning — branching bolts at most once every 2.5 s or more, glow capped at 22 % and no flash at all under reduced motion (WCAG 2.3.1 safe); fog — layered banks drifting.

```html
<usa-fx effect="lightning" trigger="load" options='{"interval":4}'>
  <section>…</section>
</usa-fx>
```

### Aurora & day / night cycle

6.8: aurora-veil — curtains of northern lights over a starry sky; day-cycle — dawn, day, dusk and night with the sun and moon on an arc (or a fixed hour).

```html
<usa-fx effect="day-cycle" trigger="load" options='{"cycle":30}'>
  <section>…</section>
</usa-fx>
```

### Cloth & rope (Verlet)

6.8: cloth hangs from the top edge and ripples as the pointer passes through; rope swings a weight that the pointer can push. Built on the exported VerletWorld.

```html
<usa-fx effect="cloth" trigger="load">
  <div class="banner">…</div>
</usa-fx>
```

### Soft body & magnet

6.8: soft-body makes the element wobble like jelly as the pointer moves over it; magnet pulls its children toward the pointer on springs.

```html
<usa-fx effect="soft-body" trigger="load">
  <button>Wobble</button>
</usa-fx>
```

### Pinball bumpers

6.8: balls fall through glowing round bumpers that light up on a hit; click to drop another ball.

```html
<usa-fx effect="pinball" trigger="load">
  <section>…</section>
</usa-fx>
```

### Focus ring draw & marching ants

6.9: focus-draw draws a rounded ring around the element and fades it; marching-ants keeps a dashed selection border marching (drop targets, selections).

```html
<usa-fx effect="focus-draw" trigger="click">
  <input placeholder="Email">
</usa-fx>
```

### Success check & highlight sweep

6.9: success-check draws a check over the element on a soft green disc; highlight-sweep sweeps a highlighter stroke behind its text.

```html
<usa-fx effect="success-check" trigger="click">
  <button>Save</button>
</usa-fx>
```

### Oscilloscope & radial spectrum

7.1: waveform-scope draws the waveform as a glowing oscilloscope line; radial-spectrum puts the spectrum around a circle that breathes with the bass. Live analyser (enableAudio / <usa-audio>) or a synthetic signal.

```html
<usa-fx effect="radial-spectrum" trigger="load">
  <section class="now-playing">…</section>
</usa-fx>
```

### Mirrored spectrum & sound particles

7.1: spectrum-mirror — mirrored bars with a floor reflection; sound-particles — particles launched by the bass, coloured by pitch.

```html
<usa-fx effect="spectrum-mirror" trigger="load">
  <header>…</header>
</usa-fx>
```

### Beat bounce & vinyl spin

7.1: beat-bounce pumps the element with the bass; vinyl-spin turns it like a record at 33⅓ rpm, faster when the music is loud.

```html
<usa-fx effect="vinyl-spin" trigger="load">
  <img class="cover" src="album.jpg" alt="…">
</usa-fx>
```

### Bars grow & dots pop

7.2: entrances for any existing chart (SVG or HTML) — bars-grow grows [data-bar] / rect bars from the baseline in a stagger; dots-pop pops scatter / line points in.

```html
<usa-fx effect="bars-grow" trigger="enter">
  <svg viewBox="0 0 100 50">…<rect …/></svg>
</usa-fx>
```

### Line draw & ring sweep

7.2: line-draw draws every SVG path / polyline / line then fades area fills in; ring-sweep sweeps donut arcs around from 12 o'clock.

```html
<usa-fx effect="line-draw" trigger="enter">
  <svg …><polyline points="…" /></svg>
</usa-fx>
```

### Sankey flow & number roll

7.2: sankey-flow runs dashes along the links to show direction and volume (static under reduced motion); number-roll counts [data-value] figures up with locale formatting.

```html
<usa-fx effect="sankey-flow" trigger="load">
  <svg …><path data-flow d="…" /></svg>
</usa-fx>
```

### Fly to cart & badge pop

7.3: fly-to-cart sends a ghost of the product on an arc into any [data-cart] target, which bumps when it lands; badge-pop pops a sale badge in with a wobble.

```html
<usa-fx effect="fly-to-cart" trigger="click" options='{"to":"#cart"}'>
  <img src="shoe.jpg" alt="">
</usa-fx>
<span id="cart">🛒</span>
```

### Price flip & stock pulse

7.3: price-flip flips a price like a split-flap board from data-from to its text; stock-pulse rings “only 3 left” with a soft urgency glow (static under reduced motion).

```html
<usa-fx effect="price-flip" trigger="enter"><span data-from="129.00">$89.00</span></usa-fx>
<usa-fx effect="stock-pulse" trigger="load"><b>Only 3 left</b></usa-fx>
```

### Typing dots & message in

7.4: typing-dots adds the bouncing “…” to any element; message-in pops a chat bubble in from its side (data-side="right" for your own).

```html
<usa-fx effect="typing-dots" trigger="load"><span class="bubble"></span></usa-fx>
<usa-fx effect="message-in" trigger="enter"><p class="bubble" data-side="right">On my way!</p></usa-fx>
```

### Reaction burst & read receipt

7.4: reaction-burst floats the emoji up in a fan on click; read-receipt draws ✓✓ and turns them blue; mention-glow sweeps a highlight behind an @mention.

```html
<usa-fx effect="reaction-burst" trigger="click"><button>❤️</button></usa-fx>
<usa-fx effect="read-receipt" trigger="enter"><span>Seen</span></usa-fx>
```

### Achievement unlock & level up

7.5: achievement-unlock slides a toast in with a light sweep and pops its icon; level-up scales the element with a ring shockwave; xp-gain floats “+50 XP”.

```html
<usa-fx effect="achievement-unlock" trigger="enter"><div class="toast"><span data-icon>🏆</span> First win!</div></usa-fx>
<usa-fx effect="xp-gain" trigger="enter"><b data-xp="50">Quest done</b></usa-fx>
```

### Chest open & coin burst

7.5: chest-open flips the lid and throws sparks; coin-burst arcs coins up out of the element and lets them fall away.

```html
<usa-fx effect="chest-open" trigger="click"><div class="chest"><span data-lid>🟫</span>📦</div></usa-fx>
<usa-fx effect="coin-burst" trigger="click"><button>Claim</button></usa-fx>
```

### Route draw & globe spin

7.6: route-draw draws every SVG path / polyline (or [data-route]) along its length, one after another; globe-spin turns the element in like a globe coming round.

```html
<usa-fx effect="route-draw" trigger="enter">
  <svg viewBox="0 0 200 80"><path d="M10 70 C60 10 120 90 190 20"/></svg>
</usa-fx>
```

### Pin drop & marker pulse

7.6: pin-drop lands the element on its spot with a squash and a shadow; marker-pulse sends beacon rings out of it.

```html
<usa-fx effect="pin-drop" trigger="enter"><span class="pin">📍</span></usa-fx>
<usa-fx effect="marker-pulse" trigger="hover"><span class="dot"></span></usa-fx>
```

### Field shake & success

7.7: field-shake shakes an element with a red outline flash (the invalid cue); field-success pulses a green glow and pops a check badge on its corner.

```html
<usa-fx effect="field-shake" trigger="click"><input placeholder="Wrong!"></usa-fx>
<usa-fx effect="field-success" trigger="click"><input value="All good"></usa-fx>
```

### Form cascade & floating labels

7.7: form-cascade slides a form's fields and buttons in one after another; label-float raises every label inside and settles it, like floating labels.

```html
<usa-fx effect="form-cascade" trigger="enter">
  <form>…fields…</form>
</usa-fx>
```

### Streaming text & thinking glow

7.8: stream-text reveals text word by word like a streamed LLM reply with a blinking caret; thinking-glow breathes a drifting colour glow round an element while a model works.

```html
<usa-fx effect="stream-text" trigger="enter"><p>Here is a streamed answer…</p></usa-fx>
<usa-fx effect="thinking-glow" trigger="loop"><div class="bubble">Thinking…</div></usa-fx>
```

### Voice wave & generating skeleton

7.8: voice-wave bounces an element's children like voice level bars; gen-skeleton covers content with a shimmering skeleton, then dissolves to reveal it.

```html
<usa-fx effect="voice-wave" trigger="click"><div class="bars"><i></i><i></i><i></i></div></usa-fx>
<usa-fx effect="gen-skeleton" trigger="enter"><img src="generated.png" alt=""></usa-fx>
```

### Fireworks & lantern rise

8.1: firework-burst sends rockets of sparks out of an element in festive colours; lantern-rise floats an element up and sways it in like a Lunar New Year lantern.

```html
<usa-fx effect="firework-burst" trigger="click"><button>Celebrate</button></usa-fx>
<usa-fx effect="lantern-rise" trigger="enter"><img src="lantern.png" alt=""></usa-fx>
```

### Christmas snow & spooky float

8.1: xmas-snow drifts snowflakes down over an element in a loop; spooky-float wobbles and flickers an element like a Halloween ghost.

```html
<usa-fx effect="xmas-snow" trigger="loop"><div class="card">Season’s greetings</div></usa-fx>
<usa-fx effect="spooky-float" trigger="hover"><span>👻</span></usa-fx>
```

### CRT power-on & pixelate

8.2: crt-power switches an element on like an old CRT — a bright line opens into the picture; pixelate-in resolves it from blocky pixels like an 8-bit sprite.

```html
<usa-fx effect="crt-power" trigger="enter"><img src="screen.png" alt=""></usa-fx>
<usa-fx effect="pixelate-in" trigger="enter"><img src="sprite.png" alt=""></usa-fx>
```

### VHS glitch & Y2K shine

8.2: vhs-glitch jitters an element with VHS tracking noise and an RGB split; y2k-shine sweeps a chrome highlight across it with a little bounce.

```html
<usa-fx effect="vhs-glitch" trigger="hover"><h2>REWIND</h2></usa-fx>
<usa-fx effect="y2k-shine" trigger="click"><button>Shiny</button></usa-fx>
```

### Vine growth & bloom

8.3: vine-grow grows SVG paths along their length like a vine and pops leaves in along the way; bloom unfolds an element’s children from the centre like petals.

```html
<usa-fx effect="vine-grow" trigger="enter"><svg viewBox="0 0 200 80"><path d="M5 75 C60 10 120 90 195 10"/><circle data-leaf cx="70" cy="40" r="6"/></svg></usa-fx>
<usa-fx effect="bloom" trigger="enter"><div class="flower"><i></i><i></i><i></i></div></usa-fx>
```

### Water drop & breathe

8.3: water-drop dips an element like a drop hitting water and sends concentric ripples out; breathe slowly morphs its shape and scale like a living blob.

```html
<usa-fx effect="water-drop" trigger="click"><button>Drop</button></usa-fx>
<usa-fx effect="breathe" trigger="loop"><div class="blob"></div></usa-fx>
```

### HUD frame & scanline

8.4: hud-frame draws corner brackets in around an element and sweeps a scan bar across it like a HUD locking on; scanline-sweep runs a bright scanline down it.

```html
<usa-fx effect="hud-frame" trigger="enter"><div class="card">Target</div></usa-fx>
<usa-fx effect="scanline-sweep" trigger="click"><button>Scan</button></usa-fx>
```

### Hologram & data decode

8.4: hologram gives an element a flickering translucent cyan look with drifting scan bands; data-decode resolves text from random glyphs to the real characters, left to right.

```html
<usa-fx effect="hologram" trigger="loop"><div class="badge">HOLO</div></usa-fx>
<usa-fx effect="data-decode" trigger="enter"><h2>ACCESS GRANTED</h2></usa-fx>
```

### Paper fold & crumple

8.5: paper-unfold unfolds an element like a folded sheet of paper with a soft crease shadow; crumple scrunches it up like paper and springs it back flat.

```html
<usa-fx effect="paper-unfold" trigger="enter"><div class="letter">Dear reader…</div></usa-fx>
<usa-fx effect="crumple" trigger="click"><button>Crumple</button></usa-fx>
```

### Pencil sketch & watercolor

8.5: pencil-sketch draws the SVG strokes inside in with a slightly wobbly pencil, one after another; watercolor bleeds an element in like wet paint spreading from the middle, then dries.

```html
<usa-fx effect="pencil-sketch" trigger="enter"><svg viewBox="0 0 100 60"><path d="M5 55 L50 5 L95 55 Z"/></svg></usa-fx>
<usa-fx effect="watercolor" trigger="enter"><img src="flower.jpg" alt=""></usa-fx>
```

### Neon ignite & pulse

8.6: neon-ignite powers an element on like a neon tube — a few stuttering flickers, then a steady glow; neon-pulse keeps a slow breathing neon glow around it.

```html
<usa-fx effect="neon-ignite" trigger="enter" color="#f0abfc"><h2>OPEN</h2></usa-fx>
<usa-fx effect="neon-pulse" trigger="loop"><button>Play</button></usa-fx>
```

### Glass frost & soft press

8.6: glass-frost condenses an element out of frosted glass with a shine passing over it; neu-press gives it a soft neumorphic press — the raised shadow flips inset and pops back.

```html
<usa-fx effect="glass-frost" trigger="enter"><div class="glass-card">…</div></usa-fx>
<usa-fx effect="neu-press" trigger="click"><button class="neu">Press</button></usa-fx>
```

### Swipe & pinch hints

8.7: swipe-hint sends a ghost fingertip across an element that nudges along, teaching “swipe me”; pinch-hint pinches two ghost fingertips out while the element zooms.

```html
<usa-fx effect="swipe-hint" trigger="enter" direction="left"><div class="card">…</div></usa-fx>
<usa-fx effect="pinch-hint" trigger="enter"><img src="map.png" alt=""></usa-fx>
```

### Depth-in & tilt wobble

8.7: depth-in flies an element’s children in from different depths like parallax layers settling; tilt-wobble gives it a 3D wobble as if the phone was tilted.

```html
<usa-fx effect="depth-in" trigger="enter"><div data-depth="3">Back</div><div data-depth="1">Front</div></usa-fx>
<usa-fx effect="tilt-wobble" trigger="click"><button>Wobble</button></usa-fx>
```

### Portal open & orbit-in

8.8: portal-open expands a ring of light and brings the content through from depth; orbit-in swings an element in around the vertical axis like a spatial window placed beside you.

```html
<usa-fx effect="portal-open" trigger="enter" color="#a78bfa"><img src="world.jpg" alt=""></usa-fx>
<usa-fx effect="orbit-in" trigger="enter" from="right"><div class="panel">…</div></usa-fx>
```

### Spatial float & depth pop

8.8: spatial-float keeps an element gently floating in depth with a breathing shadow; depth-pop pops it forward towards the viewer and settles it back.

```html
<usa-fx effect="spatial-float" trigger="loop"><div class="window">…</div></usa-fx>
<usa-fx effect="depth-pop" trigger="click"><button>Pop</button></usa-fx>
```

### Dolly-in & pan reveal

9.1: dolly-in pushes the camera in — the element starts large and soft and settles sharp; pan-reveal pans across it while a wipe uncovers it.

```html
<usa-fx effect="dolly-in" trigger="enter"><img src="hero.jpg" alt=""></usa-fx>
<usa-fx effect="pan-reveal" trigger="enter" from="right"><img src="city.jpg" alt=""></usa-fx>
```

### Letterbox & rack focus

9.1: letterbox slides cinema bars in, holds, then opens up to reveal the element; rack-focus pulls focus from the first child to the others and back.

```html
<usa-fx effect="letterbox" trigger="enter"><img src="scene.jpg" alt=""></usa-fx>
<usa-fx effect="rack-focus" trigger="click"><div><b>Near</b><b>Far</b></div></usa-fx>
```

### Icon pop

9.2: icon-pop gives an icon a sticker-like pop with a ring burst; lottie-play replays a Lottie animation on any trigger.

```html
<usa-fx effect="icon-pop" trigger="click" color="#f43f5e"><button aria-label="Like">♥</button></usa-fx>
```

### Halftone & kaleido

9.3: halftone-in prints an element in through a growing halftone dot screen; kaleido turns a kaleidoscopic overlay over it.

```html
<usa-fx effect="halftone-in" trigger="enter" dot="10"><img src="poster.jpg" alt=""></usa-fx>
<usa-fx effect="kaleido" trigger="loop"><div class="tile">…</div></usa-fx>
```

### Mesh drift & grain

9.3: mesh-drift puts a seeded, slowly drifting mesh gradient behind an element; grain-flicker lays animated film grain over it.

```html
<usa-fx effect="mesh-drift" trigger="loop" seed="4" palette="ocean"><section class="hero">…</section></usa-fx>
```

### Film burn & jump cut

9.4: film-burn burns a warm light leak across an element as it appears; jump-cut snaps it through two hard edits (zoom, reframe) and back.

```html
<usa-fx effect="film-burn" trigger="enter"><img src="still.jpg" alt=""></usa-fx>
<usa-fx effect="jump-cut" trigger="click"><figure>…</figure></usa-fx>
```

### Motion-safe attention

9.5: effects that never move anything — focus-glow pulses a focus-ring glow, color-pulse flashes a colour, safe-fade fades in, underline-sweep grows an underline — so attention cues stay safe for vestibular disorders.

```html
<usa-fx effect="focus-glow" trigger="click"><button>Notice me</button></usa-fx>
<usa-fx effect="underline-sweep" trigger="hover"><a href="#">Read more</a></usa-fx>
```

### GPU lift & idle reveal

9.6: gpu-lift is a compositor-only hover lift (transform + opacity only, never layout or paint); idle-reveal waits for an idle moment before fading content in.

```html
<usa-fx effect="gpu-lift" trigger="hover"><article class="card">…</article></usa-fx>
<usa-fx effect="idle-reveal" trigger="enter"><aside>…</aside></usa-fx>
```
