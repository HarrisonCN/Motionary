/**
 * Development-only diagnostics. Bundlers replace `process.env.NODE_ENV`, so
 * these warnings disappear from production builds; in an unbundled browser
 * (`<script>` / UMD) `process` is not defined and nothing is logged.
 */

declare const process: { env: { NODE_ENV?: string } };

/** @internal */
export function isDev(): boolean {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}

const warned = new Set<string>();

/** @internal Log a deprecation warning once per `key` (dev builds only). */
export function deprecate(key: string, message: string): void {
  if (warned.has(key) || !isDev()) return;
  warned.add(key);
  if (typeof console !== 'undefined') console.warn(`[use-scroll-animate] Deprecated: ${message}`);
}
