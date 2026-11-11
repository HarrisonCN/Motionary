# Luminous controls (17.4)

Six independent SVG/CSS controls, inspired by the glass day/night switch in [Zsolt Kacso's demonstration](https://x.com/kaolti/status/2119151022014894260), shared by [观默](https://x.com/guanmo_ai/status/2120320855532306892). This is an independent implementation of the visual idea; no third-party source, video, icons or textures are bundled.

Try the [interactive lab](../showcase/luminous.html) or find each component in the gallery.

```js
import { defineLuminousSwitch } from 'motionary/widgets/luminous-switch';
defineLuminousSwitch(); // registers mo-luminous-switch and its legacy usa-* alias
```

```html
<mo-luminous-switch label="Light theme" name="light"></mo-luminous-switch>
```

For a no-build page, load `https://unpkg.com/motionary@17/dist/widgets.umd.js`. To register only this collection, import `defineWidgets` from `motionary/components/widgets` and call `defineWidgets('17.4')`.

| Component / individual import | Attributes | State / events |
|---|---|---|
| `mo-luminous-switch` / `motionary/widgets/luminous-switch` | `checked`, `disabled`, `label` (Light theme), `name`, `value` (on), `target` | `checked: boolean`, `toggle(force?)`; `usa:change` `{ checked, theme }` on user activation |
| `mo-particle-icon` / `motionary/widgets/particle-icon` | `icon` (moon), `label`, `decorative`, `theme` (dark/light) | `icon: string`, `morph(name)`; no event |
| `mo-particle-button` / `motionary/widgets/particle-button` | `label` (Activate), `icon` (spark), `active-icon` (check), `toggle`, `pressed`, `disabled`, `theme` | `pressed: boolean`, `activate()`; `usa:activate` `{ pressed }` |
| `mo-halo-segmented` / `motionary/widgets/halo-segmented` | `options` (Studio,Gallery,Export; comma-separated unique labels, up to 12), `value`, `label` (Mode), `disabled`, `theme` | `value: string`; `usa:change` `{ value, index }` |
| `mo-halo-slider` / `motionary/widgets/halo-slider` | `value`, `min` (0), `max` (100), `step` (1; or any), `name`, `label` (Level), `disabled`, `theme` | `value: number`; `usa:input` and `usa:change` `{ value }` |
| `mo-orbit-progress` / `motionary/widgets/orbit-progress` | `value` (0), `max` (100), `label` (Progress), `theme` | `value: number`; no event |

The switch's checked state determines its own light/dark appearance. With `target="#app"` it also sets `data-usa-surface="light"` or `"dark"` on that explicit target. Omitting target changes only the control. Application code can listen for the event to persist or apply a page theme.

The particle glyphs are `sun`, `moon`, `check`, `heart`, `play`, `pause`, `spark`, and `power`. Changing a glyph morphs the same 64 SVG circles through a brief scatter. Unknown glyph names fall back to sun. The icon is a labelled image; use `decorative` inside a button whose text supplies the accessible name.

Switch and slider use native controls, including disabled state, keyboard/touch activation, form submission and reset. Programmatic state changes update properties, attributes, visuals and ARIA without emitting user events. Cancelled form resets are respected. Segmented choices use radio semantics, roving focus, Arrow keys, Home/End and RTL navigation. Dynamic text is assigned with `textContent`.

Customize `--mo-luminous-accent`, `--mo-switch-width`, `--mo-icon-size`, `--mo-segment-width`, `--mo-slider-width`, or `--mo-progress-size` on the host. Give numeric CSS sizes units. The controls provide forced-colors borders and visible keyboard focus.

No dependencies, network assets, canvas, idle render loop or synthetic progress. Particle animations are cancelled on reversal and disconnect. OS reduced motion and Motionary's sensitivity settings are honored; static/reduced controls still update their actual state. Keep these controls at practical UI sizes; the implementation captures the reference's interaction language rather than reproducing its rendered video frame for frame.
