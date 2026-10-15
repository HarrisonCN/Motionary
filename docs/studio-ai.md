# AI Studio assistant 2.0 (`motionary/studio/ai`) — 14.6

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

Describe a change in words ("fade the card up slowly", "让标题弹跳放大") and get a **proposed edit** of your Scene v2
project: a list of small, structured ops you can review one by one. Nothing touches the project until you apply it,
the accepted ops land as **one undo step**, and an edit that fails a check is never offered.

`motionary/studio/ai` (also `motionary/components/studio-ai`) is an opt-in entry with its own size budget: it is not
part of `lite`, `core`, `motion`, `motionary/studio` or `motionary/studio/assets`. Zero runtime dependencies. It never
fetches anything: the model is **your** adapter, and the built-in local rules and mock provider need no network.

```js
import { proposeAiEdit, createAiReview, createAiPanel, createMockProvider } from 'motionary/studio/ai';
```

## The pipeline

1. **Request** — `buildAiRequest(prompt, scene, options)` gives a provider everything it needs as data: the system
   prompt (`STUDIO_AI_SYSTEM_PROMPT`), the answer schema (`AI_EDIT_SCHEMA`), a summary of the scene (ids, targets,
   keyframes, bound components, which layers are locked), the selection, the catalog components that match the prompt
   and are available in your version, and the local rules' own answer as a valid default.
2. **Model** — your provider answers with a `motionary-ai-edit` object (or JSON text, or JSON in a code fence).
3. **Parse as data** — `parseAiEdit(raw)` (see *Injection hardening*). Any problem drops the whole answer.
4. **Scope** — with `selection`, an op that touches a layer outside it is refused (new layers are allowed): AI edits
   stay local to what you selected. Locked layers are never touched.
5. **Check on a copy** — `validateAiEdit(scene, ops, options)` applies the ops to a copy and runs, in order: the Scene v2
   schema (`validateSceneV2`), component compatibility with your version (`checkSceneCompatibility`), a **headless
   render** of every frame (`renderSceneHeadless`), then your optional async `validate` hook — e.g. motionary-mcp
   `validate_snippet { scene, browser: true }`, which renders it in a real headless browser.
6. **Offer or refuse** — `proposeAiEdit` returns an `AiProposal`. `ok: false` offers no ops, keeps `preview` equal to
   your scene, lists `errors` and `checks`, and puts repair ops in `fixes` (offer them as a new proposal).
7. **Review** — `createAiReview(history, proposal)`: `accept(i)` / `reject(i)` / `acceptAll()` / `rejectAll()`,
   `preview()`, `apply()`, `discard()`. `apply()` re-applies the accepted ops to the history's *current* document,
   re-runs the schema / compatibility / render checks there and pushes **one** history step (`AI: …` label) — or
   changes nothing and returns `{ applied: 0, error }`. Undo with the editor's normal undo (`history.undo()`, ⌘Z).

```js
const proposal = await proposeAiEdit(history.doc, 'fade the card up slowly', {
  provider: myModel,                  // or omit: the local rules answer (source: 'local')
  selection: ['card'],                // local edit
  catalog, version: '14.6.0',         // component + version matching
  validate: (preview) => mcp.callTool('validate_snippet', { scene: preview, browser: 'auto' }).then((r) => ({ ok: r.structuredContent.valid })),
});
if (proposal.ok) {
  const review = createAiReview(history, proposal);
  review.accept(0); review.reject(1);
  review.apply();                     // one undo step
}
```

## Edits are Scene v2 ops

Every AI edit is a list of ops in the **`applyCanvasOps` format** from `motionary/studio/canvas` — the same records
the canvas emits — plus four scene ops:

| op | shape | what it does |
| --- | --- | --- |
| `add-keyframe` | `{ layer, keyframe: { id, time, props } }` | canvas op, unchanged |
| `set-props` | `{ layer, keyframe, props }` | canvas op, unchanged |
| `update-layers` | `{ ids, patch: { locked?, muted? } }` | canvas op, unchanged |
| `move-layer` | `{ layer, index }` | canvas op, unchanged |
| `add-layer` | `{ layer: { id, type, name?, parent?, target?, start?, duration?, easing?, keyframes?, preset?, component? }, index? }` | insert a track or group |
| `remove-layer` | `{ layer }` | remove it and its children (none may be locked) |
| `set-layer` | `{ layer, patch: { name?, target?, start?, duration?, easing?, preset? } }` | `null` removes a field |
| `set-component` | `{ layer, component: { tag, props } \| null }` | bind / unbind a component |

`applySceneOps(scene, ops)` replays them (pure; canvas ops go through `applyCanvasOps`), `describeSceneOp(op)` gives
one line of text for each, and `diffJson(before, after)` (from `motionary/scene`) is the structured diff a proposal
carries in `diff`.

## Model adapters

A provider is the same shape as the 11.6 `suggestMotion` provider: a function `(req) => answer` or
`{ name, complete(req) }`, sync or async. It receives an `AiRequest`; answer with an object or JSON text. Timeouts
(default 8 s), aborts (`signal`), thrown errors and invalid answers all end in `ok: false, source: 'fallback'` —
never in a partial edit.

```js
const myModel = {
  name: 'my-llm',
  async complete(req) {
    const r = await callYourModel({ system: req.system, schema: req.schema, input: JSON.stringify({ prompt: req.prompt, scene: req.scene, selection: req.selection, components: req.components, draft: req.local }) });
    return r.text;                    // JSON text is fine
  },
};
```

`createMockProvider({ responses? })` is deterministic: it replays scripted answers in turn, or answers with the local
rules' edit as JSON text — use it in tests and demos (`mock.calls` counts calls). The local rules
(`localAiEdit(prompt, scene, options)`) reuse the 10.7 / 11.6 parser (`describeMotion`, English and Chinese): keyframes
on the editable tracks in scope, a new track on an empty scene (prompt → Scene v2), the best matching component.

## Component and version matching

Pass `catalog` (motionary-mcp `list_components`, or the `components` of `dist/manifest.json`: `{ tag, since, keywords,
title, stability }`) and `version` (the motionary version your project uses).

- `matchComponents(text, catalog, { version })` — components a prompt asks for, best first, each with `available`.
  Only available, non-deprecated matches are bound by the local rules or offered to the model.
- `checkSceneCompatibility(scene, { catalog, version })` — `error` for an unknown tag (with the closest real tag) or a
  component newer than `version`; `warning` for a deprecated one.
- `suggestSceneFixes(scene, { catalog, version })` — repair ops: the closest tag for a typo, unbind a component your
  version lacks, a default easing for an unknown one, invalid `start` / `duration` removed.

## Injection hardening

Model output is **data only**:

- parsed with `JSON.parse`, never evaluated; no dynamic import, no fetch, no `innerHTML` anywhere in the entry;
- a strict whitelist: unknown ops, unknown keys (at the envelope, op, layer, keyframe and component level), `tools`,
  `options`, `effect`, `meta` … are errors; `__proto__` / `constructor` / `prototype` keys are errors;
- values that could run code are errors: `javascript:`, `vbscript:`, `data:text/html`, markup (`<script>`, `<img
  onerror>`), `expression(`, `@import`, `on…=` handlers;
- ids the model creates must match `[A-Za-z0-9_.:-]{1,128}`; at most 200 ops, 2000 characters per string, 200 000
  characters per answer;
- any error drops **every** op (all or nothing); the selection and lock rules apply after parsing;
- the model's `summary` and `reason` are plain text, shown with `textContent`.

The system prompt tells the model that the scene and the user's text are data, not instructions — but the guarantees
above do not depend on the model obeying it.

## The review panel

`createAiPanel(root, { history, provider?, catalog?, version?, getSelection?, validate?, onApply? })` adds a small
diff-review UI: a prompt box, the proposed ops with one checkbox each (checked = accepted), the diff (`+` added,
`−` removed, `~` changed), the check results, and **Apply** / **Accept all** / **Reject all** / **Discard** /
**Use suggested fixes** / **Undo**. Elements carry `data-ai="…"` hooks for styling and tests; the panel has no CSS of
its own. `panel.propose(prompt)` drives it from code; `panel.destroy()` removes it.

With Motion Studio, pass the studio's history:

```js
import { createStudio } from 'motionary/studio';
import { createAiPanel } from 'motionary/studio/ai';
const studio = createStudio(el, { history, stage });
// layer ids: the canvas selection, else the focused timeline row (studio.selection is keyframe ids)
createAiPanel(sidebar, { history, provider, catalog, version, getSelection: () => studio.canvas?.selection ?? (studio.focusedLayer ? [studio.focusedLayer] : []) });
```

A Studio history may hold a `motionary-timeline` v1 document; ops are checked against that format too (a
component binding, which v1 cannot hold, then fails validation instead of being written).

## motionary-mcp 2.2

The 13.7 tools take Scene v2 input (additive — every 13.7 argument and result field is unchanged):

- `check_compatibility { scene }` — checks the components the scene binds.
- `suggest_fix { scene }` — adds `sceneFixes` (ops in the format above), `fixedScene` and `messages`.
- `validate_snippet { scene, ops?, browser? }` — ops parsed as data and applied to a copy; schema, compatibility and the
  headless render; `browser: true | 'auto'` also renders it in a real headless browser (Playwright, optional peer;
  falls back to the sampler — `mode` says which ran). Result schema `motionary-mcp/validate_scene@1`.
- `suggest_motion { format: 'scene' }` — a description → a Scene v2 document (`scene`, `ops`, `valid`).

## Limits and what is not checked

- The headless render samples the editor model (keyframes, easing, `random()`); preset, effect and component layers
  have nothing to sample there — use the browser check for them.
- The async `validate` hook runs once, in `proposeAiEdit`; `apply()` re-runs the synchronous checks only.
- `matchComponents` is keyword matching over the catalog, not semantic search.
