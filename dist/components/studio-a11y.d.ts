/**
 * 15.3: accessible & responsive motion — `motionary/studio/a11y` (= `motionary/components/studio-a11y`).
 *
 * Motion sensitivity tiers (`full` / `gentle` / `reduced`) and breakpoint variants for Scene v2 documents, as pure
 * data transforms: `resolveVariant(doc, { width, sensitivity })` returns a plain Scene v2 document, so the Studio
 * preview, the 14.7 standalone export and the 15.2 native exporters all play exactly the same motion for a context.
 *
 * Variants live in `meta["motionary:variants"]`:
 * `[{ id, media: { minWidth?, maxWidth? }, layers: { [layerId]: { muted?, distanceScale?, timeScale? } } }]`
 * (`minWidth` inclusive, `maxWidth` exclusive, first match wins). Pure, no DOM except `motionSensitivity()`.
 */
declare const STUDIO_A11Y_VERSION = 1;
declare const MOTION_SENSITIVITIES: readonly ["full", "gentle", "reduced"];
type MotionSensitivity = (typeof MOTION_SENSITIVITIES)[number];
declare const VARIANTS_META_KEY = "motionary:variants";
declare const VARIANT_META_KEY = "motionary:variant";
interface VariantLayer {
    muted?: boolean;
    distanceScale?: number;
    timeScale?: number;
}
interface MotionVariant {
    id: string;
    media: {
        minWidth?: number;
        maxWidth?: number;
    };
    layers?: Record<string, VariantLayer>;
}
interface VariantContext {
    width?: number;
    sensitivity?: MotionSensitivity;
}
/** Scale the travel in a CSS transform: lengths and angles × k, scale halfway (k) to 1 (`translateOnly`: just the translations). Unknown functions are kept. */
declare function scaleTransform(t: string, k: number, translateOnly?: boolean): string;
/** The document as seen at a sensitivity level. `full` returns an equal copy. */
declare function applySensitivity<T>(doc: T, level?: MotionSensitivity): T;
/** The variants a document declares (copies; invalid entries skipped — see validateVariants). */
declare function variantsOf(doc: unknown): MotionVariant[];
/** `[]` or the problems with `meta["motionary:variants"]`. */
declare function validateVariants(doc: unknown): string[];
/** The plain Scene v2 document for a context: the first matching variant, then the sensitivity. */
declare function resolveVariant<T>(doc: T, ctx?: VariantContext): T;
/** The viewer's level: `reduced` when the OS asks for it, else `<html data-usa-motion-mode~="gentle">`, else `full`. */
declare function motionSensitivity(root?: {
    getAttribute?(n: string): string | null;
} | undefined): MotionSensitivity;

export { MOTION_SENSITIVITIES, STUDIO_A11Y_VERSION, VARIANTS_META_KEY, VARIANT_META_KEY, applySensitivity, motionSensitivity, resolveVariant, scaleTransform, validateVariants, variantsOf };
export type { MotionSensitivity, MotionVariant, VariantContext, VariantLayer };
