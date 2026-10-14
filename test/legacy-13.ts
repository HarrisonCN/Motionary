// Test helper (15.0): the 13.x → animation JSON v1 reader that motionary/compat-v13 shipped until 15.0
// (upgradeLegacyAnimation + normalizeAnimation), kept here so the 5.9 / 13.9 golden tests still compare against it.
import { normalizePlayable, ANIMATION_FORMAT } from '../src/components/effects/player-core';

function decodePlayground(state: string) {
  const json = Buffer.from(state.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  const t = (JSON.parse(json).t || []) as [string, number, number, string][];
  return t.map(([preset, start, duration, label], i) => ({ target: `:scope > :nth-child(${i + 1})`, preset, start, duration, label }));
}
export function upgradeLegacy13(input: unknown): any {
  let d: any = input;
  if (typeof input === 'string') { try { d = JSON.parse(input); } catch { return null; } }
  if (!d || typeof d !== 'object') return null;
  if (d.format === 'use-scroll-animate/playground') return { format: ANIMATION_FORMAT, version: 1, name: typeof d.name === 'string' ? d.name : 'playground', tracks: decodePlayground(String(d.state || '')) };
  if (d.format === undefined && d.version === undefined && Array.isArray(d.tracks)) return { ...d, format: ANIMATION_FORMAT, version: 1 };
  return null;
}
/** What normalizeAnimation() (compat-v13, removed in 15.0) returned. */
export function normalizeLegacy13(input: any) {
  const d = typeof input === 'string' ? JSON.parse(input) : input;
  return normalizePlayable(upgradeLegacy13(d) || d);
}
