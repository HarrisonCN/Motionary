// Type-level regression test (tsc --noEmit -p test/frameworks/svelte5): SvelteHTMLElements wiring.
import type { SvelteHTMLElements } from 'svelte/elements';
import type { UsaSvelteElements } from 'motionary/components/svelte';
import { usa } from 'motionary/components/svelte';
declare module 'svelte/elements' { interface SvelteHTMLElements extends UsaSvelteElements {} }
export const ok: SvelteHTMLElements['usa-switch'] = { label: 'Wifi', checked: true };
type Label = SvelteHTMLElements['usa-switch']['label'];
export const label: Label = 'x';
// @ts-expect-error documented attributes are string | boolean | number
export const badLabel: Label = { not: 'a string' };
export const action: typeof usa = usa;
