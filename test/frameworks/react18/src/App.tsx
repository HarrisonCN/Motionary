// React 18: raw tags cannot take properties or custom events, so use the typed wrappers from createUsaComponents(React).
import * as React from 'react';
import { useEffect, useState } from 'react';
import { createUsaComponents } from 'motionary/components/react';

const { UsaSwitch } = createUsaComponents(React);
const fx = (): any => (globalThis as any).__fx;

export function App() {
  const [checked, setChecked] = useState(false);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const f = fx();
    if (!f) return;
    f.setChecked = setChecked;
    f.hydrated?.();
    f.show = setShow;
    f.mounts = (f.mounts || 0) + 1;
  }, []);
  return (
    <section id="fx">
      <p id="status">{checked ? 'on' : 'off'}</p>
      {show && (
        <UsaSwitch
          id="sw"
          label="Wifi"
          checked={checked}
          onUsaChange={(e: CustomEvent<{ checked: boolean }>) => {
            fx().log.push('change:' + e.detail.checked);
            setChecked(e.detail.checked);
          }}
        />
      )}
    </section>
  );
}
