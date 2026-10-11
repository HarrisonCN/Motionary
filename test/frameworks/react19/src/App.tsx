// React 19: raw <usa-*> tags — properties set natively, `onusa:change` listened natively (no wrapper).
import * as React from 'react';
import { useEffect, useState } from 'react';
import type {} from 'motionary/components/react-jsx'; // JSX types for <usa-*> (generated from the manifest)

const fx = (): any => (globalThis as any).__fx;

export function App() {
  const [checked, setChecked] = useState(false);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const f = fx();
    if (!f) return;
    f.setChecked = setChecked;
    f.show = setShow;
    f.mounts = (f.mounts || 0) + 1; // StrictMode runs this effect twice in development
  }, []);
  return (
    <section id="fx">
      <p id="status">{checked ? 'on' : 'off'}</p>
      {show && (
        <usa-switch
          id="sw"
          label="Wifi"
          checked={checked}
          onusa:change={(e) => {
            fx().log.push('change:' + e.detail.checked);
            setChecked(e.detail.checked);
          }}
        />
      )}
    </section>
  );
}
