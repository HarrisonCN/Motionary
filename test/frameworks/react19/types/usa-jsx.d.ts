// 13.5.0: React 19 JSX types for the raw <usa-*> tags (per-tag attributes + `onusa:*` handlers, generated from the manifest).
import type { UsaReact19IntrinsicElements } from 'motionary/components/jsx';
declare module 'react' { namespace JSX { interface IntrinsicElements extends UsaReact19IntrinsicElements {} } }
