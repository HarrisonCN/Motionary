// Type-level regression test (tsc --noEmit -p test/frameworks/react19).
import * as React from 'react';
export const ok = (
  <usa-switch label="Wifi" checked onusa:change={(e) => { const d: unknown = e.detail; void d; }} />
);
export const card = <usa-card effect="flip" />;
// @ts-expect-error unknown <usa-*> tag
export const bad = <usa-definitely-not-a-tag />;
// @ts-expect-error event handler must be a function
export const badHandler = <usa-switch onusa:change={5} />;
void React;
