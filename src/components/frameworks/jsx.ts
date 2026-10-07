/**
 * use-scroll-animate/components/jsx — JSX typings for the raw `<usa-*>` tags (v2.9).
 *
 * ```ts
 * // src/usa-jsx.d.ts (React 18/19)
 * import type { UsaIntrinsicElements } from 'use-scroll-animate/components/jsx';
 * declare module 'react' { namespace JSX { interface IntrinsicElements extends UsaIntrinsicElements {} } }
 * // Solid / Preact / other JSX: extend their JSX.IntrinsicElements the same way.
 * ```
 */
import type { COMPONENT_CATEGORIES } from '../index-tags';

type Tags = (typeof COMPONENT_CATEGORIES)[keyof typeof COMPONENT_CATEGORIES][number];

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

export type UsaIntrinsicElements = { [K in Tags]: UsaAttributes };
export type UsaTag = Tags;
