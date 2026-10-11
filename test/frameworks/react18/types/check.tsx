// Type-level regression test (tsc --noEmit -p test/frameworks/react18): raw tags via UsaIntrinsicElements + wrappers.
import * as React from 'react';
import type { UsaIntrinsicElements } from 'motionary/components/jsx';
import { createUsaComponents, bindUsa } from 'motionary/components/react';
declare module 'react' { namespace JSX { interface IntrinsicElements extends UsaIntrinsicElements {} } }
const { UsaSwitch } = createUsaComponents(React);
export const a = <UsaSwitch checked onUsaChange={(e: CustomEvent) => e.detail} />;
export const b = <usa-switch label="Wifi" />;
// @ts-expect-error unknown <usa-*> tag
export const bad = <usa-definitely-not-a-tag />;
export const c = bindUsa;
