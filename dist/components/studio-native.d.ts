declare const STUDIO_NATIVE_VERSION = 1;
declare const NATIVE_TARGETS: readonly ["css", "wxss", "arkts", "compose", "swiftui"];
type NativeTarget = (typeof NATIVE_TARGETS)[number];
interface NativeOptions {
    target: NativeTarget; /** Kotlin package (compose). Default `motionary.generated`. */
    package?: string; /** WXSS: 1px → 2rpx. */
    rpx?: boolean;
}
interface NativeLoss {
    layer: string;
    prop: string;
    reason: string;
}
/** A 15.1 provenance record (`meta['motionary:provenance']`) that touched an exported layer. */
interface NativeAiChange {
    id: string;
    generator: string;
    model?: string;
    requestId?: string;
    at: string;
    layers: string[];
}
interface NativeReport {
    target: NativeTarget;
    supported: Array<{
        layer: string;
        prop: string;
    }>;
    lost: NativeLoss[];
    notes: string[]; /** Changes recorded by motionary/studio/provenance on exported layers (oldest first). */
    ai: NativeAiChange[];
}
interface NativeResult {
    code: string;
    file: string;
    report: NativeReport;
}
/** Whether a target carries a property or feature (`opacity`, `translate`, `scale`, `rotate`, `color`, `background-color`, an easing name, or any CSS property). */
declare function nativeSupport(target: NativeTarget, feature: string): boolean;
/** Export a motion document to one target. Throws on an unknown target or an unreadable document. */
declare function exportNative(input: unknown, opts: NativeOptions): NativeResult;

export { NATIVE_TARGETS, STUDIO_NATIVE_VERSION, exportNative, nativeSupport };
export type { NativeAiChange, NativeLoss, NativeOptions, NativeReport, NativeResult, NativeTarget };
