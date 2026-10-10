// 11.6: pluggable LLM provider for the motion AI layer — local parser default, JSON Schema validation, fallback.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import * as ai from '../src/components/ai/index';
import * as intent from '../src/components/core/intent';
import { describeMotion, suggestMotion, validateMotionSpec, intentFromSpec, specOf, MOTION_SPEC_SCHEMA, type MotionProvider } from '../src/components/ai/index';
import { defineMotionPrompt } from '../src/components/widgets/motion-prompt';

const read = (f: string) => readFileSync(f, 'utf8');
const TEXT = 'fade the cards up slowly when they scroll into view, one after another';

describe('11.6: local deterministic default', () => {
  it('the Tooling entry re-exports the Motion Core parser (same functions)', () => {
    expect(ai.describeMotion).toBe(intent.describeMotion);
    expect(ai.suggestMotion).toBe(intent.suggestMotion);
    expect(describeMotion(TEXT).trigger).toBe('scroll');
  });
  it('without a provider: local result, no network', async () => {
    const f = vi.fn();
    const orig = (globalThis as any).fetch;
    (globalThis as any).fetch = f;
    try {
      const r = await suggestMotion(TEXT);
      expect(r.source).toBe('local');
      expect(r.errors).toEqual([]);
      expect(r.intent).toEqual(describeMotion(TEXT));
    } finally {
      (globalThis as any).fetch = orig;
    }
    expect(f).not.toHaveBeenCalled();
    for (const file of ['src/components/core/intent.ts', 'src/components/ai/index.ts']) expect(read(file)).not.toMatch(/\bfetch\(|XMLHttpRequest|WebSocket/);
  });
});

describe('11.6: provider answers are validated', () => {
  it('a valid object becomes a full intent built locally', async () => {
    const seen: any[] = [];
    const provider: MotionProvider = { name: 'test-llm', complete: (req) => { seen.push(req); return { effect: 'zoom', also: ['fade'], duration: 900, easing: 'spring', trigger: 'hover', iterations: 'infinite', stagger: 80 }; } };
    const r = await suggestMotion(TEXT, { provider });
    expect(r.source).toBe('provider');
    expect(r.provider).toBe('test-llm');
    expect(r.intent.effect).toBe('zoom');
    expect(r.intent.duration).toBe(900);
    expect(r.intent.easingName).toBe('spring');
    expect(r.intent.easing).toMatch(/^cubic-bezier/);
    expect(r.intent.iterations).toBe(Infinity);
    expect(r.intent.keyframes.length).toBeGreaterThan(1);
    expect(r.intent.css).toContain('@keyframes usa-motion');
    expect(r.intent.components.some((c) => c.tag === 'usa-stagger')).toBe(true);
    expect(seen[0].schema).toBe(MOTION_SPEC_SCHEMA);
    expect(seen[0].local).toEqual(specOf(describeMotion(TEXT)));
    expect(seen[0].system).toMatch(/JSON/);
  });
  it('a fenced JSON string is parsed; a function provider works too', async () => {
    const r = await suggestMotion('make it pop', { provider: async () => '```json\n{ "effect": "bounce", "easing": "cubic-bezier(0.2, 0.9, 0.1, 1)" }\n```' });
    expect(r.source).toBe('provider');
    expect(r.intent.effect).toBe('bounce');
    expect(r.intent.easing).toBe('cubic-bezier(0.2, 0.9, 0.1, 1)');
  });
  it('invalid answers fall back to the local rules with the reasons', async () => {
    const bad = [
      [{ effect: 'explode' }, /effect/],
      [{ effect: 'fade', color: 'red' }, /color: not allowed/],
      [{ effect: 'fade', easing: 'linear; } body { display: none' }, /easing/],
      [{ effect: 'fade', duration: -5 }, /duration/],
      [{ effect: 'fade', iterations: 2.5 }, /iterations/],
      [{ duration: 300 }, /effect: required/],
      ['not json at all', /not JSON/],
    ] as const;
    for (const [answer, re] of bad) {
      const r = await suggestMotion(TEXT, { provider: () => answer });
      expect(r.source, JSON.stringify(answer)).toBe('fallback');
      expect(r.errors.join(' '), JSON.stringify(answer)).toMatch(re);
      expect(r.intent).toEqual(describeMotion(TEXT));
    }
  });
  it('exceptions, timeouts and aborts fall back too', async () => {
    expect((await suggestMotion(TEXT, { provider: () => { throw new Error('quota'); } })).errors[0]).toMatch(/quota/);
    const slow = await suggestMotion(TEXT, { provider: () => new Promise(() => {}), timeout: 20 });
    expect(slow.source).toBe('fallback');
    expect(slow.errors[0]).toMatch(/timed out/);
    const ac = new AbortController();
    const p = suggestMotion(TEXT, { provider: async () => { ac.abort(); return { effect: 'zoom' }; }, signal: ac.signal });
    expect((await p).errors).toEqual(['aborted']);
  });
  it('validateMotionSpec / schema / intentFromSpec', () => {
    expect(validateMotionSpec({ effect: 'fade' })).toEqual([]);
    expect(validateMotionSpec({ effect: 'slide', direction: null, iterations: 3, alternate: true })).toEqual([]);
    expect(validateMotionSpec([])).toEqual(['$: must be object']);
    expect(MOTION_SPEC_SCHEMA.required).toEqual(['effect']);
    expect(MOTION_SPEC_SCHEMA.additionalProperties).toBe(false);
    const base = describeMotion(TEXT);
    const same = intentFromSpec(TEXT, specOf(base), base);
    for (const k of ['effect', 'direction', 'duration', 'delay', 'easing', 'trigger', 'iterations', 'stagger', 'keyframes', 'css'] as const) expect(same[k], k).toEqual(base[k]);
  });
});

describe('11.6: <usa-motion-prompt> provider + architecture', () => {
  it('shows the local suggestion first, then the suggester (provider) answer', async () => {
    defineMotionPrompt('usa-mp-116');
    const el = document.createElement('usa-mp-116') as any;
    document.body.append(el);
    const events: any[] = [];
    el.addEventListener('usa:suggest', (e: CustomEvent) => events.push(e.detail));
    el.suggester = (text: string) => suggestMotion(text, { provider: async () => ({ effect: 'rotate', duration: 700 }) });
    const local = el.suggest('fade in');
    expect(local.effect).toBe('fade');
    await new Promise((r) => setTimeout(r, 10));
    expect(events.at(-1).source).toBe('provider');
    expect(el.intent.effect).toBe('rotate');
    el.remove();
  });
  it('the component no longer imports the Tooling layer; no exceptions remain', () => {
    expect(read('src/components/widgets/motion-prompt.ts')).not.toMatch(/from '\.\.\/ai'/);
    expect(read('test/architecture.test.ts')).toContain('new Set<string>([])');
    expect(read('docs/architecture.md')).toContain('ai-provider.md');
    const d = read('docs/ai-provider.md');
    for (const s of ['suggestMotion', 'MOTION_SPEC_SCHEMA', 'no network request unless you pass a', 'el.suggester']) expect(d).toContain(s);
  });
});
