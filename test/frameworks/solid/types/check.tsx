// Type-level regression test (tsc --noEmit -p test/frameworks/solid): JSX.IntrinsicElements wiring.
import type {} from 'solid-js';
import type { UsaIntrinsicElements } from 'motionary/components/jsx';
import { bindUsa } from 'motionary/components/solid';
declare module 'solid-js' { namespace JSX { interface IntrinsicElements extends UsaIntrinsicElements {} } }
export const ok = () => <usa-switch label="Wifi" />;
export const b = bindUsa;
