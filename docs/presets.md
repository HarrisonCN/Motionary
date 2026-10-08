# Presets

`motionary` ships **214 scroll-reveal presets**: 33 in the core (always available) and **181 extended presets** added in 6.1 ("Scroll presets 2.0").

```js
import ScrollAnimate from 'motionary';
import 'motionary/presets/extended'; // registers the extended set (≈ 4 kB gzip, separate entry)

ScrollAnimate.observe('.card', { animation: 'bounce-in-up', duration: 900 });
```

```html
<!-- No build: the UMD core, then the extended set (registers itself) -->
<script src="https://unpkg.com/motionary@6/dist/index.umd.js"></script>
<script src="https://unpkg.com/motionary@6/dist/presets-extended.umd.js"></script>
<div data-sa data-sa-animation="clip-diamond">…</div>
<script>ScrollAnimate.default.init();</script>
```

Every preset works everywhere a preset name is accepted: `animation` / `exit` options, `data-sa-animation`, the framework hooks (`useScrollAnimate`, `use:scrollAnimate`, …), `<scroll-animate animation="…">`, and `<usa-reveal effect="…">` / `<usa-stagger effect="…">` (any registered preset name that is not one of their own effects).

All presets animate only `transform`, `opacity`, `filter` and `clip-path` (plus a constant `transform-origin`), and are skipped entirely under `prefers-reduced-motion: reduce` (the element is simply shown). Presets marked **keyframes** use intermediate `frames` (overshoot, bounce, glitch); they play as written and are ignored when presets are combined in an array.

**Scroll-linked (`scrub-*`)** presets are designed for the native engine across the whole crossing: `{ engine: 'css', viewRange: ['cover 0%', 'cover 100%'] }` (`data-sa-engine="css" data-sa-view-range="cover 0%, cover 100%"`). Played as a one-shot reveal they end on their last frame (e.g. `scrub-fade-through` ends transparent).

**Stagger-ready (`stagger-*`)** presets use small distances that stay calm across long lists: `staggerChildren(list, { animation: 'stagger-pop', stagger: 60 })`.

## Fade (19)

| Preset | Set | What it does |
|---|---|---|
| `fade-in` | core | The quiet classic: content simply fades into view. |
| `fade-in-up` | core | Rises 40px while fading in. The library default. |
| `fade-in-down` | core | Drops in from above while fading in. |
| `fade-in-left` | core | Glides in from the left. |
| `fade-in-right` | core | Glides in from the right. |
| `fade-in-up-sm` | extended | Rises a subtle 16px — calm body copy. |
| `fade-in-down-sm` | extended | Settles down 16px. |
| `fade-in-left-sm` | extended | Nudges in 16px from the left. |
| `fade-in-right-sm` | extended | Nudges in 16px from the right. |
| `fade-in-up-lg` | extended | A long 120px rise for hero blocks. |
| `fade-in-down-lg` | extended | Drops 120px from above. |
| `fade-in-left-lg` | extended | Travels 120px in from the left. |
| `fade-in-right-lg` | extended | Travels 120px in from the right. |
| `fade-in-up-left` | extended | Glides in diagonally (-40px, +40px). |
| `fade-in-up-right` | extended | Glides in diagonally (+40px, +40px). |
| `fade-in-down-left` | extended | Glides in diagonally (-40px, -40px). |
| `fade-in-down-right` | extended | Glides in diagonally (+40px, -40px). |
| `fade-in-scale` | extended | Rises 20px from 95% — the "card appears" default. |
| `fade-in-half` | extended | Starts half visible — for content that should never vanish. |

## Zoom & scale (23)

| Preset | Set | What it does |
|---|---|---|
| `zoom-in` | core | Grows from 80% to full size. |
| `zoom-out` | core | Settles down from 120%. |
| `scale-up` | core | Pops up from half size — great with spring easing. |
| `scale-x` | core | Unrolls horizontally — ideal for dividers and bars. |
| `scale-y` | core | Unrolls vertically. |
| `zoom-in-up` | extended | Grows from 60% while rising 60px. |
| `zoom-in-down` | extended | Grows from 60% while dropping in. |
| `zoom-in-left` | extended | Grows in from the left. |
| `zoom-in-right` | extended | Grows in from the right. |
| `zoom-out-up` | extended | Shrinks from 140% while rising. |
| `zoom-out-down` | extended | Shrinks from 140% while dropping in. |
| `zoom-out-left` | extended | Shrinks in from the left. |
| `zoom-out-right` | extended | Shrinks in from the right. |
| `zoom-in-big` | extended | Grows all the way from nothing. |
| `zoom-out-big` | extended | Lands from double size, like a stamp. |
| `zoom-bounce` | extended · keyframes | Overshoots to 110%, dips, settles. |
| `zoom-in-rotate` | extended | Grows from 50% while untwisting 30°. |
| `scale-x-left` | extended | Unrolls left → right — underlines, bars. |
| `scale-x-right` | extended | Unrolls right → left. |
| `scale-y-top` | extended | Unrolls downwards like a blind. |
| `scale-y-bottom` | extended | Grows upwards — chart bars. |
| `stretch-x` | extended | Snaps back from a wide, flat stretch. |
| `stretch-y` | extended | Snaps back from a tall, thin stretch. |

## Flip 3D (22)

| Preset | Set | What it does |
|---|---|---|
| `flip-x` | core | Flips in around the X axis. |
| `flip-y` | core | Flips in around the Y axis, like a card. |
| `flip-up` | core | Tilts up into place with perspective. |
| `flip-down` | core | Tilts down into place with perspective. |
| `flip-x-reverse` | extended | Flips in around X from the other side. |
| `flip-y-reverse` | extended | Flips in around Y from the other side. |
| `flip-y-full` | extended | A full 180° card turn into place. |
| `flip-diagonal` | extended | Turns in around the ↘ diagonal. |
| `flip-diagonal-reverse` | extended | Turns in around the ↗ diagonal. |
| `flip-left` | extended | Hinged on the left edge, swings open toward you. |
| `flip-right` | extended | Hinged on the right edge. |
| `unfold-down` | extended | Unfolds from the top edge like a letter. |
| `unfold-up` | extended | Unfolds upwards from the bottom edge. |
| `door-open-left` | extended | A door swinging open on left hinges — no fade. |
| `door-open-right` | extended | A door swinging open on right hinges. |
| `fold-in` | extended | Unfolds from a flat, tilted strip. |
| `flip-x-bounce` | extended · keyframes | Flips in around X, overshoots and rocks to rest. |
| `flip-y-bounce` | extended · keyframes | Flips in around Y, overshoots and rocks to rest. |
| `swing-in-top` | extended · keyframes | Swings down from the top edge, then sways. |
| `swing-in-bottom` | extended · keyframes | Swings up from the bottom edge. |
| `swing-in-left` | extended · keyframes | Swings in on the left edge. |
| `swing-in-right` | extended · keyframes | Swings in on the right edge. |

## Slide (20)

| Preset | Set | What it does |
|---|---|---|
| `slide-up` | core | Slides a full height up, no fade — pair with overflow: hidden. |
| `slide-down` | core | Slides a full height down. |
| `slide-left` | core | Slides a full width in from the left. |
| `slide-right` | core | Slides a full width in from the right. |
| `slide-up-spring` | extended · keyframes | Slides a full height up, overshoots 8%, settles. |
| `slide-down-spring` | extended · keyframes | Slides down with a small overshoot. |
| `slide-left-spring` | extended · keyframes | Slides in from the left and springs back. |
| `slide-right-spring` | extended · keyframes | Slides in from the right and springs back. |
| `slide-up-sm` | extended | Slides 30% of its height — no fade. |
| `slide-down-sm` | extended | Slides 30% of its height — no fade. |
| `back-in-up` | extended · keyframes | Arrives small from below, then scales to full size. |
| `back-in-down` | extended · keyframes | Arrives small from above, then scales up. |
| `back-in-left` | extended · keyframes | Arrives small from the left, then scales up. |
| `back-in-right` | extended · keyframes | Arrives small from the right, then scales up. |
| `light-speed-in-left` | extended · keyframes | Streaks in skewed, brakes hard and straightens. |
| `light-speed-in-right` | extended · keyframes | Streaks in skewed, brakes hard and straightens. |
| `rise-in` | extended | Rises 80px from slightly smaller — weightless. |
| `sink-in` | extended | Sinks 80px into place from slightly larger. |
| `float-in-up` | extended · keyframes | Drifts up with a slight tilt, like a leaf in reverse. |
| `float-in-down` | extended · keyframes | Drifts down and rocks gently to rest. |

## Rotate & skew (20)

| Preset | Set | What it does |
|---|---|---|
| `rotate-in` | core | Spins half a turn while growing in. |
| `rotate-left` | core | Swings in from the left with a slight tilt. |
| `rotate-right` | core | Swings in from the right with a slight tilt. |
| `skew-in` | core | Straightens out of a 20° skew. |
| `roll-in-left` | extended | Rolls in from the left like a wheel. |
| `roll-in-right` | extended | Rolls in from the right. |
| `spiral-in` | extended | One and a half turns while growing from a point. |
| `spiral-in-reverse` | extended | Spirals in clockwise. |
| `spin-in` | extended | A full turn while fading in — no scaling. |
| `rotate-in-up-left` | extended | Pivots 45° around its left-bottom corner. |
| `rotate-in-up-right` | extended | Pivots 45° around its right-bottom corner. |
| `rotate-in-down-left` | extended | Pivots 45° around its left-bottom corner. |
| `rotate-in-down-right` | extended | Pivots 45° around its right-bottom corner. |
| `skew-in-left` | extended | Straightens out of a 30° skew from the left. |
| `skew-in-y` | extended | Rises out of a vertical 12° shear. |
| `shear-in` | extended | Untwists from a two-axis shear. |
| `shear-in-reverse` | extended | The mirror-image shear. |
| `twist-in` | extended | Rotates, skews and grows at once. |
| `tilt-in-left` | extended | Rises 30px out of an 8° tilt. |
| `tilt-in-right` | extended | Rises out of a clockwise tilt. |

## Blur & mask (14)

| Preset | Set | What it does |
|---|---|---|
| `blur-in` | core | Comes into focus from a 12px blur. |
| `blur-in-up` | core | Focus pull plus a gentle rise. |
| `blur-in-down` | extended | Focus pull while travelling 40px. |
| `blur-in-left` | extended | Focus pull while travelling 40px. |
| `blur-in-right` | extended | Focus pull while travelling 40px. |
| `blur-in-strong` | extended | A heavy 24px defocus resolving. |
| `blur-in-zoom` | extended | Settles from 120% while focusing — cinematic. |
| `blur-in-scale` | extended | Grows from 80% while focusing. |
| `blur-in-x` | extended | Horizontal smear that snaps into focus. |
| `mask-up` | extended | Rises inside its own box — the classic headline reveal. |
| `mask-down` | extended | Drops in, clipped to its own box. |
| `mask-left` | extended | Slides left, clipped to its own box. |
| `mask-right` | extended | Slides right, clipped to its own box. |
| `blur-mask-up` | extended | Masked rise with a focus pull. |

## Clip reveal (22)

| Preset | Set | What it does |
|---|---|---|
| `clip-up` | core | Uncovered from the bottom edge — nothing moves. |
| `clip-down` | core | Uncovered from the top edge. |
| `clip-left` | core | Uncovered from the right edge. |
| `clip-right` | core | Uncovered from the left edge. |
| `clip-circle` | core | An iris opening from the centre. |
| `clip-circle-top` | extended | A circle grows from 50% 0%. |
| `clip-circle-bottom` | extended | A circle grows from 50% 100%. |
| `clip-circle-left` | extended | A circle grows from 0% 50%. |
| `clip-circle-right` | extended | A circle grows from 100% 50%. |
| `clip-circle-corner` | extended | A circle grows from 0% 0%. |
| `clip-ellipse` | extended | An elliptical iris that follows the box shape. |
| `clip-diamond` | extended | A diamond opening from the centre. |
| `clip-split-x` | extended | Opens from a vertical centre line, like curtains. |
| `clip-split-y` | extended | Opens from a horizontal centre line. |
| `clip-box` | extended | A rectangle grows from the centre. |
| `clip-pill` | extended | A rounded pill that squares off as it opens. |
| `clip-blinds` | extended | Four horizontal slats open together. |
| `clip-blinds-x` | extended | Four vertical slats open together. |
| `clip-diagonal` | extended | Wipes in from the top-left corner. |
| `clip-diagonal-reverse` | extended | Wipes in from the bottom-right corner. |
| `clip-slant-right` | extended | A slanted edge sweeps left → right. |
| `clip-slant-left` | extended | A slanted edge sweeps right → left. |

## Bounce & elastic (17)

| Preset | Set | What it does |
|---|---|---|
| `bounce-in` | extended · keyframes | Pops from 30% with a springy wobble. |
| `bounce-in-up` | extended · keyframes | Arrives 120px away, overshoots and bounces to rest. |
| `bounce-in-down` | extended · keyframes | Arrives 120px away, overshoots and bounces to rest. |
| `bounce-in-left` | extended · keyframes | Arrives 120px away, overshoots and bounces to rest. |
| `bounce-in-right` | extended · keyframes | Arrives 120px away, overshoots and bounces to rest. |
| `elastic-in` | extended · keyframes | Springs from zero to 120% and rings out. |
| `elastic-in-x` | extended · keyframes | Stretches out horizontally and twangs to rest. |
| `rubber-in` | extended · keyframes | Squashes and stretches like a rubber band. |
| `jello-in` | extended · keyframes | Wobbles in like jelly on a plate. |
| `wobble-in` | extended · keyframes | Wobbles side to side before standing still. |
| `tada-in` | extended · keyframes | Grows with a celebratory shimmy. |
| `heartbeat-in` | extended · keyframes | Two beats, then rest — great for likes and badges. |
| `drop-in` | extended · keyframes | Falls 150px and bounces on the floor. |
| `pop-in` | extended · keyframes | A quick pop past 112% — snappy UI feedback. |
| `squash-in` | extended · keyframes | Lands with cartoon squash and stretch. |
| `shake-in` | extended · keyframes | Arrives with a damped horizontal shake. |
| `swing-in` | extended · keyframes | Hangs from the top and swings to rest. |

## Color & light (14)

| Preset | Set | What it does |
|---|---|---|
| `brightness-in` | extended | Fades in from an overexposed flash. |
| `darken-in` | extended | Lights up out of black — no fade. |
| `color-in` | extended | Black & white blooms into colour. |
| `saturate-in` | extended | Oversaturated colour settles to normal. |
| `hue-in` | extended | Colours spin half the wheel into place. |
| `sepia-in` | extended | An old photo developing into the present. |
| `invert-in` | extended | A negative that develops into the positive. |
| `contrast-in` | extended | Emerges from flat grey. |
| `exposure-in` | extended | Blown-out highlights pulled back. |
| `vintage-in` | extended | Soft, warm film look sharpening up. |
| `blur-bright-in` | extended | A glowing blur resolving. |
| `shadow-lift` | extended | Lifts off the page and casts a soft shadow. |
| `neon-glow-in` | extended · keyframes | Flares up in violet neon and keeps a soft glow. |
| `glow-in` | extended | Arrives wrapped in white light that fades away. |

## Depth & perspective (10)

| Preset | Set | What it does |
|---|---|---|
| `perspective-in-up` | extended | Tilts up out of the floor plane. |
| `perspective-in-down` | extended | Tilts down from the ceiling plane. |
| `perspective-in-left` | extended | Swings in from a left-hand wall. |
| `perspective-in-right` | extended | Swings in from a right-hand wall. |
| `depth-push` | extended | Flies back from in front of the screen. |
| `depth-pull` | extended | Approaches from deep in the scene. |
| `depth-in-up` | extended | Rises up out of the depths. |
| `swoop-in-left` | extended | Swoops around from behind on the left. |
| `swoop-in-right` | extended | Swoops around from behind on the right. |
| `card-tilt-in` | extended | A product card turning to face you. |

## Glitch & special (9)

| Preset | Set | What it does |
|---|---|---|
| `glitch-in` | extended · keyframes | Tears in with jittering slices, then locks. |
| `glitch-in-color` | extended · keyframes | Jitters through hue shifts before settling. |
| `typewriter` | extended | Uncovered left → right in 16 hard steps — one line of text. |
| `typewriter-lines` | extended | Uncovered top → bottom in 5 steps — a paragraph line by line. |
| `hinge-in` | extended · keyframes | Swings up on a top-left hinge and wobbles shut. |
| `flicker-in` | extended · keyframes | Two soft flickers, like a neon tube warming up. |
| `scan-in` | extended · keyframes | A bright scan line passes top → bottom. |
| `materialize` | extended | Condenses out of glowing haze. |
| `teleport-in` | extended · keyframes | Beams in as a bright sliver, then snaps to shape. |

## Attention (4)

| Preset | Set | What it does |
|---|---|---|
| `bounce` | core | Drops 60px — try it with heavy-bounce easing. |
| `pulse` | core | A subtle 5% swell to draw the eye. |
| `swing` | core | Swings from -10° to 10°. |
| `shimmer` | core | Brightens up — good for badges and CTAs. |

## Stagger-ready (8)

| Preset | Set | What it does |
|---|---|---|
| `stagger-fade-up` | extended | A tiny 12px rise that reads well 20 items deep. |
| `stagger-pop` | extended | Each item pops from 85% — icon grids. |
| `stagger-rise` | extended | Soft rise for card lists. |
| `stagger-slide` | extended | Rows slide in from the right — menus, tables. |
| `stagger-flip` | extended | Items flip down one after another like a departures board. |
| `stagger-blur` | extended | Light focus pull per item. |
| `stagger-zoom` | extended | Items settle down from 115%. |
| `stagger-drop` | extended | Tags and chips tumble in. |

## Scroll-linked (12)

| Preset | Set | What it does |
|---|---|---|
| `scrub-parallax-up` | extended | Drifts upward faster than the page as you scroll. |
| `scrub-parallax-down` | extended | Lags behind the page — a background layer. |
| `scrub-rotate` | extended | Tilts from -25° to 25° as it crosses the viewport. |
| `scrub-spin` | extended | One full turn per viewport crossing — badges, logos. |
| `scrub-scale` | extended | Grows from 70% to 110% with scroll. |
| `scrub-shrink` | extended | Shrinks as it scrolls past — hero images. |
| `scrub-pan-left` | extended | Pans right → left with vertical scroll. |
| `scrub-pan-right` | extended | Pans left → right with vertical scroll. |
| `scrub-tilt` | extended | Pitches forward as it passes — 3D cards. |
| `scrub-fade-through` | extended · keyframes | Fades in, holds through the middle, fades out. |
| `scrub-blur-through` | extended · keyframes | Sharp only while centred — depth-of-field. |
| `scrub-reveal-x` | extended | Uncovered left → right in step with scroll. |
