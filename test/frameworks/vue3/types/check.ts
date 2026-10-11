// Type-level regression test (tsc --noEmit -p test/frameworks/vue3): GlobalComponents wiring.
import type { GlobalComponents } from 'vue';
import type { UsaGlobalComponents } from 'motionary/components/vue';
declare module 'vue' { interface GlobalComponents extends UsaGlobalComponents {} }
type SwitchProps = InstanceType<GlobalComponents['usa-switch']>['$props'];
export const ok: SwitchProps = { label: 'Wifi', checked: true, 'onUsa:change': (e: CustomEvent) => void e.detail };
// @ts-expect-error event handler must be a function
export const bad: SwitchProps = { 'onUsa:change': 5 };
