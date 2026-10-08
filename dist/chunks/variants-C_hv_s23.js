import { v as adoptStyles } from './base-DchG4q_S.js';

var css = ":root{--usa-accent:#7c5cff;--usa-accent-text:#fff;--usa-surface:#1b1e27;--usa-text:inherit;--usa-radius:14px;--usa-border:1px solid rgb(127 127 127 / 0.25);--usa-shadow:0 10px 30px -12px rgb(0 0 0 / 0.45);--usa-blur:0px;--usa-font:inherit}:where([variant=\"minimal\"],[data-usa-variant=\"minimal\"]){--usa-accent:currentColor;--usa-accent-text:Canvas;--usa-surface:transparent;--usa-radius:6px;--usa-border:1px solid color-mix(in srgb,currentColor 22%,transparent);--usa-shadow:none;--usa-blur:0px}:where([variant=\"neon\"],[data-usa-variant=\"neon\"]){--usa-accent:#00f0ff;--usa-accent-text:#04121a;--usa-surface:#0a0b14;--usa-text:#e6fbff;--usa-radius:10px;--usa-border:1px solid #00f0ff;--usa-shadow:0 0 6px #00f0ff,0 0 22px rgb(0 240 255 / 0.45);--usa-blur:0px}:where([variant=\"glass\"],[data-usa-variant=\"glass\"]){--usa-accent:#a78bfa;--usa-accent-text:#fff;--usa-surface:rgb(255 255 255 / 0.12);--usa-radius:18px;--usa-border:1px solid rgb(255 255 255 / 0.28);--usa-shadow:0 12px 40px -12px rgb(0 0 0 / 0.35);--usa-blur:16px}:where([variant=\"brutalist\"],[data-usa-variant=\"brutalist\"]){--usa-accent:#ff3d00;--usa-accent-text:#000;--usa-surface:#fff;--usa-text:#000;--usa-radius:0px;--usa-border:3px solid #000;--usa-shadow:5px 5px 0 #000;--usa-blur:0px;--usa-font:ui-monospace,\"SFMono-Regular\",Menlo,monospace}:where([variant=\"fluent\"],[data-usa-variant=\"fluent\"]){--usa-accent:#0067c0;--usa-accent-text:#fff;--usa-surface:rgb(249 249 249 / 0.82);--usa-text:#1a1a1a;--usa-radius:8px;--usa-border:1px solid rgb(0 0 0 / 0.08);--usa-shadow:0 2px 4px rgb(0 0 0 / 0.14),0 0 2px rgb(0 0 0 / 0.12);--usa-blur:30px;--usa-font:\"Segoe UI Variable\",\"Segoe UI\",system-ui,sans-serif}:where([variant=\"material\"],[data-usa-variant=\"material\"]){--usa-accent:#6750a4;--usa-accent-text:#fff;--usa-surface:#fffbfe;--usa-text:#1c1b1f;--usa-radius:20px;--usa-border:0 solid transparent;--usa-shadow:0 1px 3px rgb(0 0 0 / 0.3),0 4px 8px 3px rgb(0 0 0 / 0.15);--usa-blur:0px;--usa-font:Roboto,system-ui,sans-serif}@media (prefers-color-scheme:dark){:where([variant=\"fluent\"],[data-usa-variant=\"fluent\"]){--usa-accent:#4cc2ff;--usa-accent-text:#000;--usa-surface:rgb(44 44 44 / 0.8);--usa-text:#fff;--usa-border:1px solid rgb(255 255 255 / 0.08)}:where([variant=\"material\"],[data-usa-variant=\"material\"]){--usa-accent:#d0bcff;--usa-accent-text:#381e72;--usa-surface:#1c1b1f;--usa-text:#e6e1e5}}.usa-surface{background:var(--usa-surface);color:var(--usa-text);border:var(--usa-border);border-radius:var(--usa-radius);box-shadow:var(--usa-shadow);font-family:var(--usa-font);-webkit-backdrop-filter:blur(var(--usa-blur));backdrop-filter:blur(var(--usa-blur))}@media (prefers-reduced-transparency:reduce){.usa-surface{-webkit-backdrop-filter:none;backdrop-filter:none}}";

/**
 * Style variants (v2.6): `variant="minimal | neon | glass | brutalist |
 * fluent | material"` on any `<usa-*>` element — or on any ancestor as
 * `data-usa-variant`, or page-wide with `setVariant()` — sets the shared
 * design tokens every component reads:
 *
 * `--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`,
 * `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font`.
 *
 * (`<usa-spinner>`, `<usa-check>` and `<usa-dialog>` already use `variant`
 * for their kind; the token names never clash with those values except
 * `fluent`, which means the same thing there.)
 */
const VARIANTS = ['minimal', 'neon', 'glass', 'brutalist', 'fluent', 'material'];
/** Inject the variant token sheet (done automatically by every `ui` component). */
function adoptVariants() {
    adoptStyles('variants', css);
}
/** Apply a variant to the whole page (or `root`); `null` removes it. */
function setVariant(variant, root = typeof document !== 'undefined' ? document.documentElement : null) {
    if (!root)
        return;
    adoptVariants();
    if (variant)
        root.setAttribute('data-usa-variant', variant);
    else
        root.removeAttribute('data-usa-variant');
}

export { VARIANTS as V, adoptVariants as a, setVariant as s };
//# sourceMappingURL=variants-C_hv_s23.js.map
