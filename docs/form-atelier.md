# Form Atelier — 17.7

Nine independent `mo-*` components, sharing a quiet satin surface, clear labels and finite interaction feedback. Preview: [Form Atelier](../showcase/forms.html). Individual entry points include the necessary styling and register both the current `mo-*` name and the deprecated `usa-*` alias.

```js
import { defineSelect } from 'motionary/widgets/select';
import { defineCombobox } from 'motionary/widgets/combobox';
defineSelect();
defineCombobox();
const picker = document.querySelector('mo-combobox');
picker.options = [
  { value: 'portrait', label: 'Portrait', group: 'Photography' },
  { value: 'film', label: 'Film' },
  { value: 'archive', label: 'Archive', disabled: true },
];
picker.addEventListener('usa:change', event => console.log(event.detail.value));
```

For all nine at once: import `defineWidgets` from `motionary/components/widgets`, then call `defineWidgets('17.7')`.

| Element / independent import suffix | Main API | Native form behavior |
|---|---|---|
| `mo-select` / `widgets/select` | `options`, `value`, `input`, `reset()` | Native select, optgroups, required and disabled; `name=value` |
| `mo-combobox` / `widgets/combobox` | `options`, `value`, `show()`, `hide()`, `reset()` | Searchable fixed choices; named hidden value; required selection |
| `mo-multi-select` / `widgets/multi-select` | `options`, `values`, `max`, `reset()` | Native checkboxes; repeated values under `name`; disabled choices excluded |
| `mo-number-stepper` / `widgets/number-stepper` | `value`, `min`, `max`, `step`, `stepUp(n?)`, `stepDown(n?)`, `reset()` | Native number input, named value, required, disabled |
| `mo-password` / `widgets/password` | `value`, `revealed`, `input`, `reset()` | Native password field; name, required, autocomplete, minlength and maxlength |
| `mo-range-slider` / `widgets/range-slider` | `low`, `high`, `min`, `max`, `step`, `min-gap`, `unit`, `reset()` | Two native sliders; `${name}-low` and `${name}-high` |
| `mo-consent` / `widgets/consent` | `preferences`, `reset()` | Optional checkbox values `${name}-analytics/marketing=yes`; essential always enabled |
| `mo-cta-popup` / `widgets/cta-popup` | `open`, `show()`, `hide(reason?)` | Explicit native modal dialog; no submitted value |
| `mo-validation-summary` / `widgets/validation-summary` | `errors`, `validate()`, `clear()`, `target` form ID | Reads native validity; links focus the invalid field |

All have `label` and `hint`. Input components have `disabled`; select, combobox, number and password support `required`. Options accept a JSON attribute or a typed property array of `{ value, label, disabled?, group? }`. Groups are native optgroups in select; combobox and multi-select flatten choices. `values` is a JSON array attribute or string-array property. Properties work after registration; if assigning before registration, wait for `customElements.whenDefined()`.

Wrap inputs in a real `<form>` to use `FormData`, native validation and reset. Reset restores the first mounted value, including when no attribute changed; canceled form reset leaves state untouched. Native controls remain in the light DOM. Keep unrelated user content outside generated `.usa-form-frame` children. Moving a component to another form triggers its normal disconnect/reconnect lifecycle and rebinds reset listeners.

## Keyboard and focus

Native select, number, range and checkbox semantics are retained. Combobox keeps focus on the input: arrows navigate enabled matches, Enter commits, Escape discards the query, Tab closes; Home/End navigate while expanded. Composition keystrokes do not select options. A query is provisional until committed; Escape restores the last committed selection. `aria-activedescendant` references an existing option. Multi-select Backspace removes the last token only when its search input is empty; chip removal returns focus to search. Password reveal preserves the selected range and returns focus to the input.

The popup opens on explicit activation, uses native modal focus containment, closes with Escape, and returns focus to its opener. `usa:confirm` is cancelable; `event.preventDefault()` keeps it open. Handle confirmation in your application. This element does not navigate, request a subscription, trigger on exit intent or start a timer.

## Events and privacy

`usa:input` / `usa:change` carry `{ value }` for the stepper, `{ low, high }` for ranges, or `{ filled }` for password. Select/combobox change carries `{ value }`; multi-select carries `{ values }`; combobox query carries `{ query }`. Consent carries `{ analytics, marketing }` for both change and consent. Popup open, close and confirm carry `{ open }`, `{ reason }` and `{ confirmed }`. Validation carries `{ valid, count }`.

Password strings never enter custom event details or reflected value attributes when typed or assigned through the property. The native password input still participates in normal form submission: treat your application’s native events and submit handler accordingly. Do not put a real password into markup. No strength scoring or authentication service is provided.

Consent collects an explicit decision only. Applications handle storage, service activation and policy text. The component itself does not read/write cookies, local storage or network requests. Validation can also display server messages using `errors = [{ target: 'field-id', message: 'Please choose another value.' }]`; all messages render as text, not HTML.

## Appearance and motion

Override `--mo-form-bg`, `--mo-form-fg`, `--mo-form-muted` and `--mo-form-accent` on a component or ancestor. Native select popup appearance follows the operating system. Form Atelier provides a shared starting appearance, not a comprehensive design-token system for the entire repository.

```js
import { registerDrawPack } from 'motionary/fx/draw';
import { playEffect } from 'motionary/components/fx';
registerDrawPack();
await playEffect(document.querySelector('button'), 'check-orbit', {
  duration: 650, color: '#a9e6cb',
});
```

The four effects are `check-orbit`, `error-underline`, `focus-brackets` and `submit-trail`. Each also has `motionary/effects/<name>` with its own `register<Name>()` function. They add an aria-hidden, pointer-transparent SVG overlay, preserve content and focus, then remove it. They skip native void inputs and reduced-motion mode, cancel on disconnect, hidden document or live reduced motion, and restore owned positioning after overlapping runs. They have no continuous animation loop. Duration is bounded to 200–5000 ms; color must be a CSS color, with a safe fallback.

Unit regressions and Chromium/Firefox/WebKit browser scenarios run in GitHub Actions. Local tests and local browser previews are excluded by the maintainer’s environment preference. Development and released status are separate: see the PR checks and npm dist-tags for acceptance and publication.
