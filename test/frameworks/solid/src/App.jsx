// Solid: `prop:checked` sets the property; the `usa` directive listens to usa:change (`on:usa:change` is not valid JSX —
// a JSX attribute name has at most one colon).
import { createSignal, Show } from 'solid-js';
import { usa } from 'motionary/components/solid';
false && usa; // keep the directive import (Solid convention)

const fx = () => globalThis.__fx;

export function App() {
  const [checked, setChecked] = createSignal(false);
  const [show, setShow] = createSignal(true);
  if (typeof window !== 'undefined' && fx()) Object.assign(fx(), { setChecked, show: setShow });
  const onChange = (e) => {
    fx().log.push('change:' + e.detail.checked);
    setChecked(e.detail.checked);
  };
  return (
    <section id="fx">
      <p id="status">{checked() ? 'on' : 'off'}</p>
      <Show when={show()}>
        <usa-switch id="sw" label="Wifi" prop:checked={checked()} use:usa={{ on: { change: onChange } }}></usa-switch>
      </Show>
    </section>
  );
}
