# Motion AI: local parser + optional LLM provider (11.6)

`motionary/tooling/ai` turns a short description — "fade the cards up slowly,
one after another" / "卡片从下往上依次淡入" — into a motion: effect, direction, timing, easing, trigger, Web Animations
keyframes, CSS and the Motionary components that do it.

**Default: local and deterministic.** `describeMotion(text)` is a small rule-based parser (English and Chinese). It is
offline, fast and predictable, and it is what `<usa-motion-prompt>` and the `suggest_motion` tool of `motionary-mcp`
use when nothing else is configured.

**Optional: your own model.** For complex, composed motions you can pass a *provider* — any function that talks to a
model you choose. Motionary ships no vendor SDK, holds no API key and makes **no network request unless you pass a provider**
(the request is yours).

```ts
import { suggestMotion, type MotionProvider } from 'motionary/tooling/ai';

const provider: MotionProvider = {
  name: 'my-llm',
  async complete({ system, prompt, schema, local, signal }) {
    const r = await fetch('/api/llm', { method: 'POST', signal, body: JSON.stringify({ system, prompt, schema, hint: local }) });
    return r.text(); // an object or a JSON string (```json fences are fine)
  },
};

const { intent, source, errors } = await suggestMotion('cards cascade in like falling dominoes', { provider, timeout: 8000 });
// source: 'provider' (validated answer) · 'fallback' (provider failed / invalid → local result) · 'local' (no provider)
el.animate(intent.keyframes, intent.options);
```

- The provider answers a **MotionSpec** — decisions only (`effect`, `also`, `direction`, `amount`, `duration`, `delay`,
  `easing`, `trigger`, `iterations`, `alternate`, `stagger`). Keyframes, CSS and component suggestions are always built
  locally from it (`intentFromSpec()`), so a model can never inject arbitrary CSS or markup.
- Every answer is validated against `MOTION_SPEC_SCHEMA` (JSON Schema 2020-12; `validateMotionSpec(value)` returns the
  errors). Unknown properties, out-of-range numbers and easings other than the named ones, `cubic-bezier()` or
  `steps()` are rejected → the local result is used and `errors` says why.
- Errors, timeouts (default 8 s) and aborts (`signal`) fall back to the local parser too.

`<usa-motion-prompt>` takes a suggester: `el.suggester = (text) => suggestMotion(text, { provider })`. It shows the local
suggestion at once and replaces it when the validated answer arrives (`usa:suggest` fires again with `{ intent, source, errors }`).
The element itself never loads the provider / schema code, so its own entry stays within its fixed size budget.

Architecture: the parser now lives in Motion Core (`src/components/core/intent.ts`, pure, no DOM, no network) and is
re-exported by the Tooling entry, so the `<usa-motion-prompt>` component no longer imports the Tooling layer — the
last exception of the layer rules (docs/architecture.md) is gone.
