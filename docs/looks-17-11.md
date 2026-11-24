# Looks (17.11, extended in 17.14)

1020 ready-made styles for the kit widgets: twenty palettes combined with seventeen treatments in each of three
families, so 340 looks for UI, 340 for components and 340 for motion. 17.11 shipped nine treatments over twelve palettes
(324 looks); 17.14 added eight palettes and eight treatments per family (696 more, 232 per family). A treatment is more than a color: it sets borders, corner
radius, shadows, glow, frosted glass, type, picture filters, picture frames and loop speed. Every combination is checked
in the unit tests for readable text (WCAG AA) on its own background.

The looks only set `--mo-kit-*` custom properties (plus the text color and, for some treatments, the font family), so
they work on any widget that reads the kit tokens, not only on the family they were tuned for, and any token can still be
overridden next to a look.

## Use

```js
import { adoptLooks, applyLook } from 'motionary/components/widgets';

adoptLooks();                 // every look (or adoptLooks('ui') for one family)
// <mo-subscribe look="neon-ocean"></mo-subscribe>  or  data-mo-look="neon-ocean" on any ancestor

applyLook(document.querySelector('mo-split-pane'), 'frosted-grape'); // adopts just that one rule
```

`look` and `data-mo-look` both work and can sit on the widget or any ancestor; the nearest one wins. Dark looks
(`lookInfo(name).dark`: most `midnight`, `ember`, `aurora` and `velvet` looks, and every neon, terminal, luxe, synth,
cyber, console, dusk, noir, film, blueprint, blockbuster, thermal and nightvision look) set light text, so put them on something with a dark background: `lookInfo(name).bg` is the color each
look was tuned on.

| Export | What it does |
|---|---|
| `adoptLooks(family?)` | Adds the rules for every look, or one family's, to the document once. |
| `applyLook(el, name)` | Sets `data-mo-look` on `el` and adopts only that look's rule; `null` removes it; false for an unknown name. |
| `lookNames(family?)` | The names, in treatment then palette order. |
| `lookInfo(name)` | Family, treatment, palette, `dark`, `bg` and every value the look sets, or null. |
| `lookTokens(name)` | The custom properties, as `{ '--mo-kit-ink': '#…', … }`. |
| `lookRule(name)`, `looksCss(family?)` | The CSS text, for server rendering or a static stylesheet. |
| `LOOK_PALETTES`, `LOOK_TREATMENTS`, `LOOK_FAMILIES` | The data the looks are built from. |

## Tokens

The kit stylesheets read these, so you can also set any of them by hand:

| Token | Used for |
|---|---|
| `--mo-kit-ink`, `--mo-kit-paper`, `--mo-kit-accent`, `--mo-kit-on-accent`, `--mo-kit-soft`, `--mo-kit-line` | Text, surfaces, accent, tinted fills, borders. |
| `--mo-kit-radius` | Corner radius (cards and dialogs add a little to it). |
| `--mo-kit-border-width`, `--mo-kit-border-style`, `--mo-kit-dash` | Borders, and the dash pattern of drawn outlines. |
| `--mo-kit-shadow`, `--mo-kit-glow` | Drop shadow of raised surfaces, and an extra glow ring (both box-shadow lists). |
| `--mo-kit-backdrop` | Backdrop filter of floating surfaces (frosted glass). |
| `--mo-kit-cta`, `--mo-kit-on-cta` | Background (a color or a gradient) and text of the main buttons. |
| `--mo-kit-ok`, `--mo-kit-bad` | Success and error states. |
| `--mo-kit-media-filter`, `--mo-kit-media-radius`, `--mo-kit-frame` | Picture filter, picture corners and photo frames in the motion widgets. |
| `--mo-kit-speed`, `--mo-kit-beam-a`, `--mo-kit-beam-b` | Speed of the border beam's loop (2 is twice as fast) and its two colors. |

## Palettes

| Palette | Ink | Paper | Accent | Second accent |
|---|---|---|---|---|
| `indigo` | `#18181b` | `#ffffff` | `#4f46e5` | `#a855f7` |
| `ocean` | `#0c2a3e` | `#f0f9ff` | `#0369a1` | `#22d3ee` |
| `forest` | `#14281d` | `#f3f8f2` | `#15803d` | `#a3e635` |
| `sunset` | `#3b1d0e` | `#fff7ed` | `#c2410c` | `#fb7185` |
| `rose` | `#3f0d1f` | `#fff1f5` | `#be123c` | `#f472b6` |
| `grape` | `#2a1240` | `#faf5ff` | `#7c3aed` | `#e879f9` |
| `amber` | `#2f2104` | `#fffbeb` | `#b45309` | `#facc15` |
| `slate` | `#0f172a` | `#f8fafc` | `#475569` | `#94a3b8` |
| `mint` | `#062a24` | `#f0fdfa` | `#0f766e` | `#34d399` |
| `coral` | `#3a1410` | `#fff5f2` | `#c43d1c` | `#ffb703` |
| `midnight` | `#e2e8f0` | `#0b1020` | `#818cf8` | `#22d3ee` |
| `ember` | `#fef3c7` | `#1c1210` | `#fb923c` | `#f87171` |
| `cherry` | `#3b0a0f` | `#fff5f5` | `#b91c1c` | `#fca5a5` |
| `olive` | `#1f2410` | `#f9faf1` | `#4d6b0f` | `#bef264` |
| `cobalt` | `#0b1640` | `#f3f6ff` | `#1d4ed8` | `#60a5fa` |
| `plum` | `#2b0b2a` | `#fdf4fb` | `#a21caf` | `#f0abfc` |
| `sand` | `#2b2418` | `#fbf8f1` | `#8a5a1f` | `#e7c98b` |
| `teal` | `#042f2e` | `#effcfa` | `#0e7490` | `#5eead4` |
| `aurora` | `#e0f2fe` | `#06121f` | `#a78bfa` | `#34d399` |
| `velvet` | `#fce7f3` | `#1a0b16` | `#f472b6` | `#fbbf24` |

`midnight`, `ember`, `aurora` and `velvet` are dark palettes. The last eight were added in 17.14.

## UI (page blocks): 340 looks

Tuned for `mo-search-bar`, `mo-subscribe`, `mo-download-button`, `mo-reveal-footer`, `mo-shape-divider` and `mo-scroll-cue`.

| Treatment | Effect | Looks |
|---|---|---|
| `solid` | Filled surfaces, a soft drop shadow, the default shape. | `solid-indigo` `solid-ocean` `solid-forest` `solid-sunset` `solid-rose` `solid-grape` `solid-amber` `solid-slate` `solid-mint` `solid-coral` `solid-midnight` `solid-ember` `solid-cherry` `solid-olive` `solid-cobalt` `solid-plum` `solid-sand` `solid-teal` `solid-aurora` `solid-velvet` |
| `outline` | Two-pixel accent outlines, no shadow, accent buttons. | `outline-indigo` `outline-ocean` `outline-forest` `outline-sunset` `outline-rose` `outline-grape` `outline-amber` `outline-slate` `outline-mint` `outline-coral` `outline-midnight` `outline-ember` `outline-cherry` `outline-olive` `outline-cobalt` `outline-plum` `outline-sand` `outline-teal` `outline-aurora` `outline-velvet` |
| `soft` | Tinted fills with no borders and a colored shadow. | `soft-indigo` `soft-ocean` `soft-forest` `soft-sunset` `soft-rose` `soft-grape` `soft-amber` `soft-slate` `soft-mint` `soft-coral` `soft-midnight` `soft-ember` `soft-cherry` `soft-olive` `soft-cobalt` `soft-plum` `soft-sand` `soft-teal` `soft-aurora` `soft-velvet` |
| `glass` | Translucent frosted panels (backdrop blur) over a tinted backdrop. | `glass-indigo` `glass-ocean` `glass-forest` `glass-sunset` `glass-rose` `glass-grape` `glass-amber` `glass-slate` `glass-mint` `glass-coral` `glass-midnight` `glass-ember` `glass-cherry` `glass-olive` `glass-cobalt` `glass-plum` `glass-sand` `glass-teal` `glass-aurora` `glass-velvet` |
| `neon` | Dark surfaces, bright accent lines and a colored glow. | `neon-indigo` `neon-ocean` `neon-forest` `neon-sunset` `neon-rose` `neon-grape` `neon-amber` `neon-slate` `neon-mint` `neon-coral` `neon-midnight` `neon-ember` `neon-cherry` `neon-olive` `neon-cobalt` `neon-plum` `neon-sand` `neon-teal` `neon-aurora` `neon-velvet` |
| `brutal` | Square corners, thick ink borders, a hard offset shadow, monospace type. | `brutal-indigo` `brutal-ocean` `brutal-forest` `brutal-sunset` `brutal-rose` `brutal-grape` `brutal-amber` `brutal-slate` `brutal-mint` `brutal-coral` `brutal-midnight` `brutal-ember` `brutal-cherry` `brutal-olive` `brutal-cobalt` `brutal-plum` `brutal-sand` `brutal-teal` `brutal-aurora` `brutal-velvet` |
| `paper` | Warm paper, dashed rules, serif type (stays light on the dark palettes). | `paper-indigo` `paper-ocean` `paper-forest` `paper-sunset` `paper-rose` `paper-grape` `paper-amber` `paper-slate` `paper-mint` `paper-coral` `paper-midnight` `paper-ember` `paper-cherry` `paper-olive` `paper-cobalt` `paper-plum` `paper-sand` `paper-teal` `paper-aurora` `paper-velvet` |
| `gradient` | Gradient buttons and fills with a soft accent glow. | `gradient-indigo` `gradient-ocean` `gradient-forest` `gradient-sunset` `gradient-rose` `gradient-grape` `gradient-amber` `gradient-slate` `gradient-mint` `gradient-coral` `gradient-midnight` `gradient-ember` `gradient-cherry` `gradient-olive` `gradient-cobalt` `gradient-plum` `gradient-sand` `gradient-teal` `gradient-aurora` `gradient-velvet` |
| `terminal` | Near-black screen, monospace type, a thin glowing frame. | `terminal-indigo` `terminal-ocean` `terminal-forest` `terminal-sunset` `terminal-rose` `terminal-grape` `terminal-amber` `terminal-slate` `terminal-mint` `terminal-coral` `terminal-midnight` `terminal-ember` `terminal-cherry` `terminal-olive` `terminal-cobalt` `terminal-plum` `terminal-sand` `terminal-teal` `terminal-aurora` `terminal-velvet` |
| `clay` | Claymorphism: puffy tinted surfaces, very round corners, inner highlights and a colored drop shadow. | `clay-indigo` `clay-ocean` `clay-forest` `clay-sunset` `clay-rose` `clay-grape` `clay-amber` `clay-slate` `clay-mint` `clay-coral` `clay-midnight` `clay-ember` `clay-cherry` `clay-olive` `clay-cobalt` `clay-plum` `clay-sand` `clay-teal` `clay-aurora` `clay-velvet` |
| `neumorph` | Soft UI: surfaces the color of the background, raised by a light and a dark shadow, no borders. | `neumorph-indigo` `neumorph-ocean` `neumorph-forest` `neumorph-sunset` `neumorph-rose` `neumorph-grape` `neumorph-amber` `neumorph-slate` `neumorph-mint` `neumorph-coral` `neumorph-midnight` `neumorph-ember` `neumorph-cherry` `neumorph-olive` `neumorph-cobalt` `neumorph-plum` `neumorph-sand` `neumorph-teal` `neumorph-aurora` `neumorph-velvet` |
| `retro` | Nineties desktop: gray chrome, beveled outset borders, square corners, navy buttons, Tahoma. | `retro-indigo` `retro-ocean` `retro-forest` `retro-sunset` `retro-rose` `retro-grape` `retro-amber` `retro-slate` `retro-mint` `retro-coral` `retro-midnight` `retro-ember` `retro-cherry` `retro-olive` `retro-cobalt` `retro-plum` `retro-sand` `retro-teal` `retro-aurora` `retro-velvet` |
| `pill` | Fully round pills with a thin accent outline and a small colored shadow. | `pill-indigo` `pill-ocean` `pill-forest` `pill-sunset` `pill-rose` `pill-grape` `pill-amber` `pill-slate` `pill-mint` `pill-coral` `pill-midnight` `pill-ember` `pill-cherry` `pill-olive` `pill-cobalt` `pill-plum` `pill-sand` `pill-teal` `pill-aurora` `pill-velvet` |
| `editorial` | Magazine: black rules on off-white, square corners, black buttons, a display serif. | `editorial-indigo` `editorial-ocean` `editorial-forest` `editorial-sunset` `editorial-rose` `editorial-grape` `editorial-amber` `editorial-slate` `editorial-mint` `editorial-coral` `editorial-midnight` `editorial-ember` `editorial-cherry` `editorial-olive` `editorial-cobalt` `editorial-plum` `editorial-sand` `editorial-teal` `editorial-aurora` `editorial-velvet` |
| `sketch` | Hand-drawn: wobbly ink outlines, an offset ink shadow and a handwriting font. | `sketch-indigo` `sketch-ocean` `sketch-forest` `sketch-sunset` `sketch-rose` `sketch-grape` `sketch-amber` `sketch-slate` `sketch-mint` `sketch-coral` `sketch-midnight` `sketch-ember` `sketch-cherry` `sketch-olive` `sketch-cobalt` `sketch-plum` `sketch-sand` `sketch-teal` `sketch-aurora` `sketch-velvet` |
| `luxe` | Black and gold: near-black surfaces, gold accent and hairlines, a classic serif. | `luxe-indigo` `luxe-ocean` `luxe-forest` `luxe-sunset` `luxe-rose` `luxe-grape` `luxe-amber` `luxe-slate` `luxe-mint` `luxe-coral` `luxe-midnight` `luxe-ember` `luxe-cherry` `luxe-olive` `luxe-cobalt` `luxe-plum` `luxe-sand` `luxe-teal` `luxe-aurora` `luxe-velvet` |
| `synth` | Synthwave: deep purple, hot pink accent, neon gradient buttons and a pink and cyan glow. | `synth-indigo` `synth-ocean` `synth-forest` `synth-sunset` `synth-rose` `synth-grape` `synth-amber` `synth-slate` `synth-mint` `synth-coral` `synth-midnight` `synth-ember` `synth-cherry` `synth-olive` `synth-cobalt` `synth-plum` `synth-sand` `synth-teal` `synth-aurora` `synth-velvet` |

## Components (interface parts): 340 looks

Tuned for `mo-virtual-list`, `mo-infinite-scroll`, `mo-context-menu`, `mo-split-pane`, `mo-desktop-windows`, `mo-stack-slider` and `mo-morph-card`.

| Treatment | Effect | Looks |
|---|---|---|
| `flat` | No shadow, hairline borders, accent buttons. | `flat-indigo` `flat-ocean` `flat-forest` `flat-sunset` `flat-rose` `flat-grape` `flat-amber` `flat-slate` `flat-mint` `flat-coral` `flat-midnight` `flat-ember` `flat-cherry` `flat-olive` `flat-cobalt` `flat-plum` `flat-sand` `flat-teal` `flat-aurora` `flat-velvet` |
| `elevated` | Borderless cards on deep layered shadows. | `elevated-indigo` `elevated-ocean` `elevated-forest` `elevated-sunset` `elevated-rose` `elevated-grape` `elevated-amber` `elevated-slate` `elevated-mint` `elevated-coral` `elevated-midnight` `elevated-ember` `elevated-cherry` `elevated-olive` `elevated-cobalt` `elevated-plum` `elevated-sand` `elevated-teal` `elevated-aurora` `elevated-velvet` |
| `outlined` | Accent-tinted outlines, no shadow. | `outlined-indigo` `outlined-ocean` `outlined-forest` `outlined-sunset` `outlined-rose` `outlined-grape` `outlined-amber` `outlined-slate` `outlined-mint` `outlined-coral` `outlined-midnight` `outlined-ember` `outlined-cherry` `outlined-olive` `outlined-cobalt` `outlined-plum` `outlined-sand` `outlined-teal` `outlined-aurora` `outlined-velvet` |
| `frosted` | Heavier frosted glass with a tinted backdrop. | `frosted-indigo` `frosted-ocean` `frosted-forest` `frosted-sunset` `frosted-rose` `frosted-grape` `frosted-amber` `frosted-slate` `frosted-mint` `frosted-coral` `frosted-midnight` `frosted-ember` `frosted-cherry` `frosted-olive` `frosted-cobalt` `frosted-plum` `frosted-sand` `frosted-teal` `frosted-aurora` `frosted-velvet` |
| `cyber` | Dark panels, sharp corners, double glow lines, monospace type. | `cyber-indigo` `cyber-ocean` `cyber-forest` `cyber-sunset` `cyber-rose` `cyber-grape` `cyber-amber` `cyber-slate` `cyber-mint` `cyber-coral` `cyber-midnight` `cyber-ember` `cyber-cherry` `cyber-olive` `cyber-cobalt` `cyber-plum` `cyber-sand` `cyber-teal` `cyber-aurora` `cyber-velvet` |
| `blocky` | Ink borders with a hard accent-colored offset shadow. | `blocky-indigo` `blocky-ocean` `blocky-forest` `blocky-sunset` `blocky-rose` `blocky-grape` `blocky-amber` `blocky-slate` `blocky-mint` `blocky-coral` `blocky-midnight` `blocky-ember` `blocky-cherry` `blocky-olive` `blocky-cobalt` `blocky-plum` `blocky-sand` `blocky-teal` `blocky-aurora` `blocky-velvet` |
| `pastel` | Light candy tints and very round corners (light on every palette). | `pastel-indigo` `pastel-ocean` `pastel-forest` `pastel-sunset` `pastel-rose` `pastel-grape` `pastel-amber` `pastel-slate` `pastel-mint` `pastel-coral` `pastel-midnight` `pastel-ember` `pastel-cherry` `pastel-olive` `pastel-cobalt` `pastel-plum` `pastel-sand` `pastel-teal` `pastel-aurora` `pastel-velvet` |
| `window` | Desktop-window chrome: gray title bars, big soft shadow, system font. | `window-indigo` `window-ocean` `window-forest` `window-sunset` `window-rose` `window-grape` `window-amber` `window-slate` `window-mint` `window-coral` `window-midnight` `window-ember` `window-cherry` `window-olive` `window-cobalt` `window-plum` `window-sand` `window-teal` `window-aurora` `window-velvet` |
| `console` | Dark developer console with monospace type. | `console-indigo` `console-ocean` `console-forest` `console-sunset` `console-rose` `console-grape` `console-amber` `console-slate` `console-mint` `console-coral` `console-midnight` `console-ember` `console-cherry` `console-olive` `console-cobalt` `console-plum` `console-sand` `console-teal` `console-aurora` `console-velvet` |
| `tonal` | Material-style tonal fills: accent-tinted surfaces, no borders, no shadow. | `tonal-indigo` `tonal-ocean` `tonal-forest` `tonal-sunset` `tonal-rose` `tonal-grape` `tonal-amber` `tonal-slate` `tonal-mint` `tonal-coral` `tonal-midnight` `tonal-ember` `tonal-cherry` `tonal-olive` `tonal-cobalt` `tonal-plum` `tonal-sand` `tonal-teal` `tonal-aurora` `tonal-velvet` |
| `acrylic` | Fluent-style acrylic: strong blur and a slight brighten over a tinted backdrop, small radius, Segoe UI. | `acrylic-indigo` `acrylic-ocean` `acrylic-forest` `acrylic-sunset` `acrylic-rose` `acrylic-grape` `acrylic-amber` `acrylic-slate` `acrylic-mint` `acrylic-coral` `acrylic-midnight` `acrylic-ember` `acrylic-cherry` `acrylic-olive` `acrylic-cobalt` `acrylic-plum` `acrylic-sand` `acrylic-teal` `acrylic-aurora` `acrylic-velvet` |
| `cupertino` | iOS-style: 13px corners, half-pixel hairlines, a soft two-step shadow, the system font. | `cupertino-indigo` `cupertino-ocean` `cupertino-forest` `cupertino-sunset` `cupertino-rose` `cupertino-grape` `cupertino-amber` `cupertino-slate` `cupertino-mint` `cupertino-coral` `cupertino-midnight` `cupertino-ember` `cupertino-cherry` `cupertino-olive` `cupertino-cobalt` `cupertino-plum` `cupertino-sand` `cupertino-teal` `cupertino-aurora` `cupertino-velvet` |
| `compact` | Dense tooling: 4px corners, one-pixel borders, no shadow, ink buttons, Inter. | `compact-indigo` `compact-ocean` `compact-forest` `compact-sunset` `compact-rose` `compact-grape` `compact-amber` `compact-slate` `compact-mint` `compact-coral` `compact-midnight` `compact-ember` `compact-cherry` `compact-olive` `compact-cobalt` `compact-plum` `compact-sand` `compact-teal` `compact-aurora` `compact-velvet` |
| `skeuo` | Skeuomorphic: glossy gradient buttons, a top highlight and a stacked drop shadow. | `skeuo-indigo` `skeuo-ocean` `skeuo-forest` `skeuo-sunset` `skeuo-rose` `skeuo-grape` `skeuo-amber` `skeuo-slate` `skeuo-mint` `skeuo-coral` `skeuo-midnight` `skeuo-ember` `skeuo-cherry` `skeuo-olive` `skeuo-cobalt` `skeuo-plum` `skeuo-sand` `skeuo-teal` `skeuo-aurora` `skeuo-velvet` |
| `inset` | Sunken surfaces: inner shadows instead of drop shadows, no borders. | `inset-indigo` `inset-ocean` `inset-forest` `inset-sunset` `inset-rose` `inset-grape` `inset-amber` `inset-slate` `inset-mint` `inset-coral` `inset-midnight` `inset-ember` `inset-cherry` `inset-olive` `inset-cobalt` `inset-plum` `inset-sand` `inset-teal` `inset-aurora` `inset-velvet` |
| `hairline` | Wireframe: square corners, thin ink lines, dotted outlines, outline-only buttons. | `hairline-indigo` `hairline-ocean` `hairline-forest` `hairline-sunset` `hairline-rose` `hairline-grape` `hairline-amber` `hairline-slate` `hairline-mint` `hairline-coral` `hairline-midnight` `hairline-ember` `hairline-cherry` `hairline-olive` `hairline-cobalt` `hairline-plum` `hairline-sand` `hairline-teal` `hairline-aurora` `hairline-velvet` |
| `dusk` | Dark slate panels tinted by the accent, soft corners, a lit top edge. | `dusk-indigo` `dusk-ocean` `dusk-forest` `dusk-sunset` `dusk-rose` `dusk-grape` `dusk-amber` `dusk-slate` `dusk-mint` `dusk-coral` `dusk-midnight` `dusk-ember` `dusk-cherry` `dusk-olive` `dusk-cobalt` `dusk-plum` `dusk-sand` `dusk-teal` `dusk-aurora` `dusk-velvet` |

## Motion (motion and depth): 340 looks

Tuned for `mo-scroll-zoom`, `mo-image-tunnel`, `mo-orbit-gallery`, `mo-clothesline`, `mo-elastic-frame` and `mo-border-beam`: these change picture filters, frames and loop speed as well as colors.

| Treatment | Effect | Looks |
|---|---|---|
| `vivid` | Boosted saturation and contrast on pictures, faster loops. | `vivid-indigo` `vivid-ocean` `vivid-forest` `vivid-sunset` `vivid-rose` `vivid-grape` `vivid-amber` `vivid-slate` `vivid-mint` `vivid-coral` `vivid-midnight` `vivid-ember` `vivid-cherry` `vivid-olive` `vivid-cobalt` `vivid-plum` `vivid-sand` `vivid-teal` `vivid-aurora` `vivid-velvet` |
| `noir` | Black and white pictures on black, a white beam, slower loops. | `noir-indigo` `noir-ocean` `noir-forest` `noir-sunset` `noir-rose` `noir-grape` `noir-amber` `noir-slate` `noir-mint` `noir-coral` `noir-midnight` `noir-ember` `noir-cherry` `noir-olive` `noir-cobalt` `noir-plum` `noir-sand` `noir-teal` `noir-aurora` `noir-velvet` |
| `sepia` | Sepia-toned pictures on old paper with cream frames. | `sepia-indigo` `sepia-ocean` `sepia-forest` `sepia-sunset` `sepia-rose` `sepia-grape` `sepia-amber` `sepia-slate` `sepia-mint` `sepia-coral` `sepia-midnight` `sepia-ember` `sepia-cherry` `sepia-olive` `sepia-cobalt` `sepia-plum` `sepia-sand` `sepia-teal` `sepia-aurora` `sepia-velvet` |
| `duotone` | Pictures tinted to the palette hue (two-tone). | `duotone-indigo` `duotone-ocean` `duotone-forest` `duotone-sunset` `duotone-rose` `duotone-grape` `duotone-amber` `duotone-slate` `duotone-mint` `duotone-coral` `duotone-midnight` `duotone-ember` `duotone-cherry` `duotone-olive` `duotone-cobalt` `duotone-plum` `duotone-sand` `duotone-teal` `duotone-aurora` `duotone-velvet` |
| `glow` | Pictures and frames with a colored glow. | `glow-indigo` `glow-ocean` `glow-forest` `glow-sunset` `glow-rose` `glow-grape` `glow-amber` `glow-slate` `glow-mint` `glow-coral` `glow-midnight` `glow-ember` `glow-cherry` `glow-olive` `glow-cobalt` `glow-plum` `glow-sand` `glow-teal` `glow-aurora` `glow-velvet` |
| `polaroid` | White instant-photo frames and nearly square corners. | `polaroid-indigo` `polaroid-ocean` `polaroid-forest` `polaroid-sunset` `polaroid-rose` `polaroid-grape` `polaroid-amber` `polaroid-slate` `polaroid-mint` `polaroid-coral` `polaroid-midnight` `polaroid-ember` `polaroid-cherry` `polaroid-olive` `polaroid-cobalt` `polaroid-plum` `polaroid-sand` `polaroid-teal` `polaroid-aurora` `polaroid-velvet` |
| `film` | Muted, slightly warm pictures, square corners, dark frame, slow loops. | `film-indigo` `film-ocean` `film-forest` `film-sunset` `film-rose` `film-grape` `film-amber` `film-slate` `film-mint` `film-coral` `film-midnight` `film-ember` `film-cherry` `film-olive` `film-cobalt` `film-plum` `film-sand` `film-teal` `film-aurora` `film-velvet` |
| `blueprint` | Blue technical sheet: dashed white lines, gray pictures. | `blueprint-indigo` `blueprint-ocean` `blueprint-forest` `blueprint-sunset` `blueprint-rose` `blueprint-grape` `blueprint-amber` `blueprint-slate` `blueprint-mint` `blueprint-coral` `blueprint-midnight` `blueprint-ember` `blueprint-cherry` `blueprint-olive` `blueprint-cobalt` `blueprint-plum` `blueprint-sand` `blueprint-teal` `blueprint-aurora` `blueprint-velvet` |
| `holo` | Hue-shifted, saturated pictures, round corners, fast loops. | `holo-indigo` `holo-ocean` `holo-forest` `holo-sunset` `holo-rose` `holo-grape` `holo-amber` `holo-slate` `holo-mint` `holo-coral` `holo-midnight` `holo-ember` `holo-cherry` `holo-olive` `holo-cobalt` `holo-plum` `holo-sand` `holo-teal` `holo-aurora` `holo-velvet` |
| `charcoal` | High-contrast black and white pictures on light paper, square corners. | `charcoal-indigo` `charcoal-ocean` `charcoal-forest` `charcoal-sunset` `charcoal-rose` `charcoal-grape` `charcoal-amber` `charcoal-slate` `charcoal-mint` `charcoal-coral` `charcoal-midnight` `charcoal-ember` `charcoal-cherry` `charcoal-olive` `charcoal-cobalt` `charcoal-plum` `charcoal-sand` `charcoal-teal` `charcoal-aurora` `charcoal-velvet` |
| `infrared` | Inverted, hue-flipped false-color pictures with a red glow. | `infrared-indigo` `infrared-ocean` `infrared-forest` `infrared-sunset` `infrared-rose` `infrared-grape` `infrared-amber` `infrared-slate` `infrared-mint` `infrared-coral` `infrared-midnight` `infrared-ember` `infrared-cherry` `infrared-olive` `infrared-cobalt` `infrared-plum` `infrared-sand` `infrared-teal` `infrared-aurora` `infrared-velvet` |
| `blockbuster` | Teal and orange movie grade on a dark screen, slow loops. | `blockbuster-indigo` `blockbuster-ocean` `blockbuster-forest` `blockbuster-sunset` `blockbuster-rose` `blockbuster-grape` `blockbuster-amber` `blockbuster-slate` `blockbuster-mint` `blockbuster-coral` `blockbuster-midnight` `blockbuster-ember` `blockbuster-cherry` `blockbuster-olive` `blockbuster-cobalt` `blockbuster-plum` `blockbuster-sand` `blockbuster-teal` `blockbuster-aurora` `blockbuster-velvet` |
| `dreamy` | Softly blurred, brightened pictures with very round corners and slow loops. | `dreamy-indigo` `dreamy-ocean` `dreamy-forest` `dreamy-sunset` `dreamy-rose` `dreamy-grape` `dreamy-amber` `dreamy-slate` `dreamy-mint` `dreamy-coral` `dreamy-midnight` `dreamy-ember` `dreamy-cherry` `dreamy-olive` `dreamy-cobalt` `dreamy-plum` `dreamy-sand` `dreamy-teal` `dreamy-aurora` `dreamy-velvet` |
| `matte` | Faded, low-contrast pictures with a muted frame and no shadow. | `matte-indigo` `matte-ocean` `matte-forest` `matte-sunset` `matte-rose` `matte-grape` `matte-amber` `matte-slate` `matte-mint` `matte-coral` `matte-midnight` `matte-ember` `matte-cherry` `matte-olive` `matte-cobalt` `matte-plum` `matte-sand` `matte-teal` `matte-aurora` `matte-velvet` |
| `thermal` | Heat-map false color on near black, a yellow accent and an orange glow. | `thermal-indigo` `thermal-ocean` `thermal-forest` `thermal-sunset` `thermal-rose` `thermal-grape` `thermal-amber` `thermal-slate` `thermal-mint` `thermal-coral` `thermal-midnight` `thermal-ember` `thermal-cherry` `thermal-olive` `thermal-cobalt` `thermal-plum` `thermal-sand` `thermal-teal` `thermal-aurora` `thermal-velvet` |
| `nightvision` | Green night-vision pictures in an oval mask on black, monospace type. | `nightvision-indigo` `nightvision-ocean` `nightvision-forest` `nightvision-sunset` `nightvision-rose` `nightvision-grape` `nightvision-amber` `nightvision-slate` `nightvision-mint` `nightvision-coral` `nightvision-midnight` `nightvision-ember` `nightvision-cherry` `nightvision-olive` `nightvision-cobalt` `nightvision-plum` `nightvision-sand` `nightvision-teal` `nightvision-aurora` `nightvision-velvet` |
| `comic` | Punchy saturated pictures, thick ink borders and a hard offset shadow. | `comic-indigo` `comic-ocean` `comic-forest` `comic-sunset` `comic-rose` `comic-grape` `comic-amber` `comic-slate` `comic-mint` `comic-coral` `comic-midnight` `comic-ember` `comic-cherry` `comic-olive` `comic-cobalt` `comic-plum` `comic-sand` `comic-teal` `comic-aurora` `comic-velvet` |

## Showcase

- [Looks](../showcase/looks.html): all 1020 on real widgets, filterable by family and palette, in Chinese.
