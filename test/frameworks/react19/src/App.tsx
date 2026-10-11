// React 19: raw <usa-*> tags — properties set natively (`checked={…}`).
// 13.5.0 finding: React 19 does NOT attach `onusa:change`-style custom-element event props to elements it HYDRATES
// (server-rendered); it only does for elements it creates on the client. So after SSR the event is bound through a
// ref callback + bindUsa (works for hydrated and client-created elements alike; React 19 ref cleanups unbind it).
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { bindUsa } from 'motionary/components/react';
// JSX types for <usa-*>: ../types/usa-jsx.d.ts (motionary/components/jsx, generated from the manifest)

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
    f.mounts = (f.mounts || 0) + 1; // StrictMode runs this effect twice in development
  }, []);
  const onRef = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const b = bindUsa(el, {
      on: {
        change: (e) => {
          fx().log.push('change:' + e.detail.checked);
          setChecked(e.detail.checked);
        },
      },
    });
    return () => b.destroy();
  }, []);
  return (
    <section id="fx">
      <p id="status">{checked ? 'on' : 'off'}</p>
      {show && (
        <usa-switch
          id="sw"
          label="Wifi"
          checked={checked}
          ref={onRef}
        />
      )}
    </section>
  );
}
