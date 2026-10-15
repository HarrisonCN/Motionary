import React, { useCallback, useState } from 'react';
import { createReactHooks } from 'motionary/react';
import { bindUsa } from 'motionary/components/react';

const { useScrollAnimate } = createReactHooks(React);
const section = { minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '2rem' };

export function App() {
  const titleRef = useScrollAnimate({ animation: 'fade-in-up', duration: 800 });
  const [checked, setChecked] = useState(false);
  // React 19 sets properties on custom elements natively; the usa:change event is bound with bindUsa.
  const switchRef = useCallback((el) => {
    if (!el) return;
    const b = bindUsa(el, { on: { change: (e) => setChecked(e.detail.checked) } });
    return () => b.destroy();
  }, []);
  return (
    <main>
      <section style={section}><h1>Scroll down</h1></section>
      <section style={section}><h2 ref={titleRef}>Revealed with useScrollAnimate</h2></section>
      <section style={section}>
        <usa-switch label="Wifi" checked={checked} ref={switchRef}></usa-switch>
        <output>{checked ? 'on' : 'off'}</output>
      </section>
    </main>
  );
}
