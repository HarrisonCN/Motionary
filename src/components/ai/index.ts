/**
 * `motionary/tooling/ai` (old path `motionary/components/ai`, deprecated in 11.5) — AI-assisted motion.
 * 10.7: a small deterministic parser (English and Chinese) turns a description into a motion spec — no model, no network.
 * 11.6: `suggestMotion(text, { provider })` optionally asks a **user-supplied** LLM provider; its answer is validated
 * against `MOTION_SPEC_SCHEMA` (JSON Schema) and the local rules are used whenever it fails (docs/ai-provider.md).
 * The implementation lives in Motion Core (`../core/intent`, pure) so components can use it without importing Tooling.
 */
export * from '../core/intent';
