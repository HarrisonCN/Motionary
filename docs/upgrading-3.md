# Upgrading to 3.0

3.0 removes the APIs deprecated in 2.9. Every change has a drop-in replacement; 2.9 logs a one-time console warning wherever old usage is found, so run your app on 2.9 first and fix the warnings.

| Removed in 3.0 | Use instead |
|---|---|
| `<usa-spinner variant="windows">`, `<usa-check variant="error">`, `<usa-dialog variant="drawer-end">`, `<usa-acrylic variant="mica">` (variant = kind) | `kind="windows"`, `kind="error"`, `kind="drawer-end"`, `kind="mica"`. `variant` now only selects a style variant (`minimal`, `neon`, `glass`, `brutalist`, `fluent`, `material`). |
| `spinner.variant` property | `spinner.kind` |
| `observe(el, { parallax: { y: 80 } })`, `data-sa-parallax-x/-y/-rotate/-scale/-speed` | `parallax(el, { speed: 0.3 })` (writes `--sa-parallax`, use it in CSS: `transform: translateY(calc(var(--sa-parallax) * -80px))`) or `progressVar: '--p'` |
| `ParallaxOptions` type | `ParallaxHelperOptions` |
| Node 18 for SSR imports | Node ≥ 20 (`engines`) |

Search & replace:

```bash
# kinds
grep -rlE '<usa-(spinner|check|dialog|acrylic)[^>]*variant=' src | xargs sed -i -E 's/(<usa-(spinner|check|dialog|acrylic)[^>]*)variant=/\1kind=/g'
# legacy parallax
grep -rn 'data-sa-parallax\|parallax:' src
```
