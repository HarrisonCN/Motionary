# Moments & Tactile (unreleased, 17.9)

Ten independently importable widgets, a spring release for `mo-magnetic`, a "Copy as AI prompt" button with the values
you tuned, an Agent Skill and a style compare page. Every new element registers its `mo-*` name directly; the `usa-*`
names stay available. No runtime dependency, network request, third-party code, font or image is bundled.

## Design references and scope

The ideas came from public X posts read on 2026-11-24:

- [guanmo_ai on UI Moments](https://x.com/guanmo_ai/status/2125078202989048229): a gallery of small interaction
  studies (eclipse, hue orbit, notch slider, bulge volume, copy button, tile relay, magnetic button). A reply asked how
  the magnetic button should snap back when the cursor leaves fast, which `release="spring"` answers.
- [meow2149 on the same gallery](https://x.com/meow2149/status/2124761539991548288): live parameters, code export and
  "copy a prompt with the current parameters" for coding assistants, plus a separate style comparison.
- [laogui on Solar Icons](https://x.com/laogui/status/2124535745281143235): one icon in several styles driven by CSS
  variables, the model for the style compare page.
- [yu1dot on squishy UI](https://x.com/yu1dot/status/2120825584947487170): soft rubbery keys, an analog stick and
  download / upload tiles.
- [ChatGptAstra on motion prompts](https://x.com/ChatGptAstra/status/2119732495747043631) and
  [himanshubuildss on scrolltide](https://x.com/himanshubuildss/status/2120703551358058739): copyable prompts per effect
  and installing a library as an agent skill.

These are original implementations of related ideas, written against Motionary's element base, spring physics and
contract rules. No code, markup, art or wording from those projects is included.

## Widgets

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-eclipse-toggle` | `button role="switch"` | `checked`, `label`, `disabled` | `usa:change { checked }` |
| `mo-hue-orbit` | radio group in a fieldset | `hue`, `count` (6–24), `saturation`, `lightness`, `label` | `usa:change { hue, color }` |
| `mo-notch-slider` | `input type="range"` | `value`, `min`, `max`, `step`, `notches`, `snap`, `unit`, `name` | `usa:input`, `usa:change { value }`, `usa:detent { value, index }` |
| `mo-bulge-volume` | hidden `input type="range"` | `value` (0–100), `label` | `usa:input`, `usa:change { value }` |
| `mo-copy-button` | `button` + live region | `text` or `for`, `label`, `done-label`, `fail-label`, `duration` | `usa:copy { ok, length }` |
| `mo-tile-relay` | `role="status"` | `size` (2 or 3), `duration`, `label`, `paused` | none |
| `mo-squish-key` | `button` | `label`, `shape` (square, round, pill), `tone` (dark, light) | `usa:press` |
| `mo-squish-stepper` | two `button`s + live region | `value`, `min`, `max`, `step`, `label` | `usa:input`, `usa:change { value }` |
| `mo-analog-stick` | `button` with arrow keys | `label`, `dead-zone` | `usa:move { x, y }`, `usa:release { x, y }` |
| `mo-transfer-button` | `button` + live region | `direction` (download, upload), `label`, `progress` (0–100) | `usa:transfer { direction }`, `usa:complete { direction }` |

All take `disabled` where it makes sense, stand still under `prefers-reduced-motion`, and read the shared variant tokens
(`--usa-accent`, `--usa-surface`, `--usa-font`) when a `variant` or `data-usa-variant` applies. Without a variant they
use their own ink and paper colours, overridable with `--mo-moment-ink`, `--mo-moment-paper`, `--mo-tactile-key`,
`--mo-tactile-glyph` and `--mo-tactile-tile`.

The tactile keys share one press spring (`stiffness 520, damping 17`): the key sinks while held, and on release it is
kicked upward so it overshoots its rest height and settles. A press that arrives as a click with no pointer (Enter,
Space, assistive tech) still gets a short dip.

`mo-copy-button` never puts the copied text in an event, and `mo-transfer-button` does no transfer itself: the page
starts the work on `usa:transfer` and reports progress through the `progress` attribute.

```js
import { defineSquishStepper } from 'motionary/widgets/squish-stepper';
defineSquishStepper();
```

`defineWidgets('17.9')` registers all ten.

## Magnetic spring release

`<mo-magnetic release="spring">` keeps the pointer's velocity when the cursor leaves the magnet's radius and lets the
child spring back with it, so a fast exit wobbles once instead of easing back. Without the attribute nothing changes.

## Copy as AI prompt

The effect detail in the gallery, the playground and the run page have a **Copy as AI prompt** button. It copies one
prompt with the effect's name, every value you set in the controls, the code of the open tab and the usual Motionary
rules (`showcase/param-prompt.js`). Paste it into Claude Code, Codex or Cursor to get the same result in your project.

## Agent Skill

`skills/motionary/SKILL.md` follows the Agent Skills format (a folder with a `SKILL.md` and `name` / `description`
front matter). Install it with `npx skills add HarrisonCN/Motionary`, or copy `skills/motionary` into `.claude/skills/`.

## Showcase

- [Moments & Tactile](../showcase/moments.html): all ten widgets and the two magnetic releases side by side.
- [Style compare](../showcase/styles.html): one component in the six built-in variants, each with its own copy button.
