/**
 * motionary/components/jsx — JSX typings for the raw `<usa-*>` tags (v2.9).
 *
 * ```ts
 * // src/usa-jsx.d.ts (React 18/19)
 * import type { UsaIntrinsicElements } from 'motionary/components/jsx';
 * declare module 'react' { namespace JSX { interface IntrinsicElements extends UsaIntrinsicElements {} } }
 * // Solid / Preact / other JSX: extend their JSX.IntrinsicElements the same way.
 *
 * // React 19 (13.5.0): per-tag attributes + typed `onusa:*` handlers, generated from the manifest:
 * import type { UsaReact19IntrinsicElements } from 'motionary/components/jsx';
 * declare module 'react' { namespace JSX { interface IntrinsicElements extends UsaReact19IntrinsicElements {} } }
 * ```
 * (React 19 + SSR: `onusa:*` props are not attached to hydrated elements — use a ref + `bindUsa`, see `motionary/components/react`.)
 */
import type { COMPONENT_CATEGORIES } from '../index-tags';
import type { UsaElementAttributeMap, UsaElementEventMap, UsaElementTag } from './elements.generated';

export type { UsaElementAttributeMap, UsaElementEventMap, UsaElementTag } from './elements.generated';

// 13.5.0: core category tags + every manifest tag (widgets such as <usa-switch> were missing before).
type Tags = (typeof COMPONENT_CATEGORIES)[keyof typeof COMPONENT_CATEGORIES][number] | UsaElementTag;

/** Attributes accepted by every `<usa-*>` element (all component attributes are strings / booleans). */
export interface UsaAttributes {
  [attr: string]: unknown;
  class?: string;
  className?: string;
  id?: string;
  style?: unknown;
  slot?: string;
  variant?: 'minimal' | 'neon' | 'glass' | 'brutalist' | 'fluent' | 'material' | (string & {});
  children?: unknown;
  ref?: unknown;
}

/** Documented attributes of tag `K` (13.5.0, generated from the manifest; `{}` for tags without documented attributes). */
export type UsaTagAttributes<K extends string> = K extends keyof UsaElementAttributeMap ? UsaElementAttributeMap[K] : {};
/** `onusa:<event>` handler props for tag `K` (React 19 native custom-element events). */
export type UsaTagEventProps<K extends string> = K extends keyof UsaElementEventMap
  ? { [E in keyof UsaElementEventMap[K] as `on${E & string}`]?: (event: UsaElementEventMap[K][E]) => void }
  : {};

/** Raw `<usa-*>` tags with their documented attributes (13.5.0: per-tag, generated). */
export type UsaIntrinsicElements = { [K in Tags]: UsaAttributes & UsaTagAttributes<K> };
/** React 19: raw tags + typed `onusa:*` event props (client-created elements; after SSR hydration use ref + `bindUsa`). */
export type UsaReact19IntrinsicElements = { [K in Tags]: UsaAttributes & UsaTagAttributes<K> & UsaTagEventProps<K> };
export type UsaTag = Tags;
