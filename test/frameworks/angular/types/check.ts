// Type-level regression test (tsc --noEmit -p test/frameworks/angular): event maps for [usaOn] handlers.
import type { UsaElementEventMap, UsaElementTag } from 'motionary/angular';
import { usaDetail } from 'motionary/angular';
export const onChange = (e: UsaElementEventMap['usa-switch']['usa:change']): boolean => usaDetail<{ checked: boolean }>(e).checked;
export const tag: UsaElementTag = 'usa-switch';
// @ts-expect-error unknown tag
export const badTag: UsaElementTag = 'usa-definitely-not-a-tag';
