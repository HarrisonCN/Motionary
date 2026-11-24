# Looks (17.11)

324 ready-made styles for the 17.11 widgets: twelve palettes combined with nine treatments in each of three families,
so 108 looks for UI, 108 for components and 108 for motion. A treatment is more than a color: it sets borders, corner
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
(`lookInfo(name).dark`: most `midnight` and `ember` looks, and every neon, terminal, cyber, console, noir, film and
blueprint look) set light text, so put them on something with a dark background: `lookInfo(name).bg` is the color each
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

`midnight` and `ember` are dark palettes.

## UI (page blocks): 108 looks

Tuned for `mo-search-bar`, `mo-subscribe`, `mo-download-button`, `mo-reveal-footer`, `mo-shape-divider` and `mo-scroll-cue`.

| Treatment | Effect | Looks |
|---|---|---|
| `solid` | Filled surfaces, a soft drop shadow, the default shape. | `solid-indigo` `solid-ocean` `solid-forest` `solid-sunset` `solid-rose` `solid-grape` `solid-amber` `solid-slate` `solid-mint` `solid-coral` `solid-midnight` `solid-ember` |
| `outline` | Two-pixel accent outlines, no shadow, accent buttons. | `outline-indigo` `outline-ocean` `outline-forest` `outline-sunset` `outline-rose` `outline-grape` `outline-amber` `outline-slate` `outline-mint` `outline-coral` `outline-midnight` `outline-ember` |
| `soft` | Tinted fills with no borders and a colored shadow. | `soft-indigo` `soft-ocean` `soft-forest` `soft-sunset` `soft-rose` `soft-grape` `soft-amber` `soft-slate` `soft-mint` `soft-coral` `soft-midnight` `soft-ember` |
| `glass` | Translucent frosted panels (backdrop blur) over a tinted backdrop. | `glass-indigo` `glass-ocean` `glass-forest` `glass-sunset` `glass-rose` `glass-grape` `glass-amber` `glass-slate` `glass-mint` `glass-coral` `glass-midnight` `glass-ember` |
| `neon` | Dark surfaces, bright accent lines and a colored glow. | `neon-indigo` `neon-ocean` `neon-forest` `neon-sunset` `neon-rose` `neon-grape` `neon-amber` `neon-slate` `neon-mint` `neon-coral` `neon-midnight` `neon-ember` |
| `brutal` | Square corners, thick ink borders, a hard offset shadow, monospace type. | `brutal-indigo` `brutal-ocean` `brutal-forest` `brutal-sunset` `brutal-rose` `brutal-grape` `brutal-amber` `brutal-slate` `brutal-mint` `brutal-coral` `brutal-midnight` `brutal-ember` |
| `paper` | Warm paper, dashed rules, serif type (stays light on the dark palettes). | `paper-indigo` `paper-ocean` `paper-forest` `paper-sunset` `paper-rose` `paper-grape` `paper-amber` `paper-slate` `paper-mint` `paper-coral` `paper-midnight` `paper-ember` |
| `gradient` | Gradient buttons and fills with a soft accent glow. | `gradient-indigo` `gradient-ocean` `gradient-forest` `gradient-sunset` `gradient-rose` `gradient-grape` `gradient-amber` `gradient-slate` `gradient-mint` `gradient-coral` `gradient-midnight` `gradient-ember` |
| `terminal` | Near-black screen, monospace type, a thin glowing frame. | `terminal-indigo` `terminal-ocean` `terminal-forest` `terminal-sunset` `terminal-rose` `terminal-grape` `terminal-amber` `terminal-slate` `terminal-mint` `terminal-coral` `terminal-midnight` `terminal-ember` |

## Components (interface parts): 108 looks

Tuned for `mo-virtual-list`, `mo-infinite-scroll`, `mo-context-menu`, `mo-split-pane`, `mo-desktop-windows`, `mo-stack-slider` and `mo-morph-card`.

| Treatment | Effect | Looks |
|---|---|---|
| `flat` | No shadow, hairline borders, accent buttons. | `flat-indigo` `flat-ocean` `flat-forest` `flat-sunset` `flat-rose` `flat-grape` `flat-amber` `flat-slate` `flat-mint` `flat-coral` `flat-midnight` `flat-ember` |
| `elevated` | Borderless cards on deep layered shadows. | `elevated-indigo` `elevated-ocean` `elevated-forest` `elevated-sunset` `elevated-rose` `elevated-grape` `elevated-amber` `elevated-slate` `elevated-mint` `elevated-coral` `elevated-midnight` `elevated-ember` |
| `outlined` | Accent-tinted outlines, no shadow. | `outlined-indigo` `outlined-ocean` `outlined-forest` `outlined-sunset` `outlined-rose` `outlined-grape` `outlined-amber` `outlined-slate` `outlined-mint` `outlined-coral` `outlined-midnight` `outlined-ember` |
| `frosted` | Heavier frosted glass with a tinted backdrop. | `frosted-indigo` `frosted-ocean` `frosted-forest` `frosted-sunset` `frosted-rose` `frosted-grape` `frosted-amber` `frosted-slate` `frosted-mint` `frosted-coral` `frosted-midnight` `frosted-ember` |
| `cyber` | Dark panels, sharp corners, double glow lines, monospace type. | `cyber-indigo` `cyber-ocean` `cyber-forest` `cyber-sunset` `cyber-rose` `cyber-grape` `cyber-amber` `cyber-slate` `cyber-mint` `cyber-coral` `cyber-midnight` `cyber-ember` |
| `blocky` | Ink borders with a hard accent-colored offset shadow. | `blocky-indigo` `blocky-ocean` `blocky-forest` `blocky-sunset` `blocky-rose` `blocky-grape` `blocky-amber` `blocky-slate` `blocky-mint` `blocky-coral` `blocky-midnight` `blocky-ember` |
| `pastel` | Light candy tints and very round corners (light on every palette). | `pastel-indigo` `pastel-ocean` `pastel-forest` `pastel-sunset` `pastel-rose` `pastel-grape` `pastel-amber` `pastel-slate` `pastel-mint` `pastel-coral` `pastel-midnight` `pastel-ember` |
| `window` | Desktop-window chrome: gray title bars, big soft shadow, system font. | `window-indigo` `window-ocean` `window-forest` `window-sunset` `window-rose` `window-grape` `window-amber` `window-slate` `window-mint` `window-coral` `window-midnight` `window-ember` |
| `console` | Dark developer console with monospace type. | `console-indigo` `console-ocean` `console-forest` `console-sunset` `console-rose` `console-grape` `console-amber` `console-slate` `console-mint` `console-coral` `console-midnight` `console-ember` |

## Motion (motion and depth): 108 looks

Tuned for `mo-scroll-zoom`, `mo-image-tunnel`, `mo-orbit-gallery`, `mo-clothesline`, `mo-elastic-frame` and `mo-border-beam`: these change picture filters, frames and loop speed as well as colors.

| Treatment | Effect | Looks |
|---|---|---|
| `vivid` | Boosted saturation and contrast on pictures, faster loops. | `vivid-indigo` `vivid-ocean` `vivid-forest` `vivid-sunset` `vivid-rose` `vivid-grape` `vivid-amber` `vivid-slate` `vivid-mint` `vivid-coral` `vivid-midnight` `vivid-ember` |
| `noir` | Black and white pictures on black, a white beam, slower loops. | `noir-indigo` `noir-ocean` `noir-forest` `noir-sunset` `noir-rose` `noir-grape` `noir-amber` `noir-slate` `noir-mint` `noir-coral` `noir-midnight` `noir-ember` |
| `sepia` | Sepia-toned pictures on old paper with cream frames. | `sepia-indigo` `sepia-ocean` `sepia-forest` `sepia-sunset` `sepia-rose` `sepia-grape` `sepia-amber` `sepia-slate` `sepia-mint` `sepia-coral` `sepia-midnight` `sepia-ember` |
| `duotone` | Pictures tinted to the palette hue (two-tone). | `duotone-indigo` `duotone-ocean` `duotone-forest` `duotone-sunset` `duotone-rose` `duotone-grape` `duotone-amber` `duotone-slate` `duotone-mint` `duotone-coral` `duotone-midnight` `duotone-ember` |
| `glow` | Pictures and frames with a colored glow. | `glow-indigo` `glow-ocean` `glow-forest` `glow-sunset` `glow-rose` `glow-grape` `glow-amber` `glow-slate` `glow-mint` `glow-coral` `glow-midnight` `glow-ember` |
| `polaroid` | White instant-photo frames and nearly square corners. | `polaroid-indigo` `polaroid-ocean` `polaroid-forest` `polaroid-sunset` `polaroid-rose` `polaroid-grape` `polaroid-amber` `polaroid-slate` `polaroid-mint` `polaroid-coral` `polaroid-midnight` `polaroid-ember` |
| `film` | Muted, slightly warm pictures, square corners, dark frame, slow loops. | `film-indigo` `film-ocean` `film-forest` `film-sunset` `film-rose` `film-grape` `film-amber` `film-slate` `film-mint` `film-coral` `film-midnight` `film-ember` |
| `blueprint` | Blue technical sheet: dashed white lines, gray pictures. | `blueprint-indigo` `blueprint-ocean` `blueprint-forest` `blueprint-sunset` `blueprint-rose` `blueprint-grape` `blueprint-amber` `blueprint-slate` `blueprint-mint` `blueprint-coral` `blueprint-midnight` `blueprint-ember` |
| `holo` | Hue-shifted, saturated pictures, round corners, fast loops. | `holo-indigo` `holo-ocean` `holo-forest` `holo-sunset` `holo-rose` `holo-grape` `holo-amber` `holo-slate` `holo-mint` `holo-coral` `holo-midnight` `holo-ember` |

## Showcase

- [Looks](../showcase/looks.html): all 324 on real widgets, filterable by family and palette, in Chinese.
