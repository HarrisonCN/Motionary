// 16.1.0 — Symbols (tests first; failing-before: v16.1.0/failing-before.txt).
// A symbol is a Scene v3 `components[id]` entry, an instance is a `type: "component"` layer (the 16.0 format, no
// format change). motionary/scene/symbols edits them as pure functions (input never mutated, output valid Scene v3):
// createSymbol / addInstance / setOverride / clearOverride / updateSymbol / detachInstance / renameSymbol /
// symbolUsage / validateSymbols, and symbolsToCss exports every symbol layer's @keyframes once however many
// instances use it (instances add selectors and timing only).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as S from '../src/components/scene/symbols';
import { validateSceneV3, sceneV3ToV2 } from '../src/components/scene/v3';

const ROOT = join(__dirname, '..');
const DOC = () => ({
  format: 'motionary-scene', version: 3, name: 'cards',
  layers: [
    { id: 'title', type: 'track', target: '#title', keyframes: [{ id: 't0', time: 0, props: { opacity: 0 } }, { id: 't1', time: 200, props: { opacity: 1 } }] },
    { id: 'card', type: 'group', name: 'Card' },
    { id: 'face', type: 'track', parent: 'card', target: '#card .face', keyframes: [{ id: 'f0', time: 100, props: { opacity: 0, translate: '0 20px' } }, { id: 'f1', time: 400, props: { opacity: 1, translate: '0 0' }, easing: 'ease-out' }] },
    { id: 'glow', type: 'track', parent: 'card', target: '#card .glow', keyframes: [{ id: 'g0', time: 100, props: { opacity: 0 } }, { id: 'g1', time: 300, props: { opacity: 0.6 } }] },
  ],
}) as any;
const frozen = (d: any) => JSON.stringify(d);
const ok = (d: any) => expect(validateSceneV3(d)).toEqual([]);

describe('createSymbol', () => {
  it('moves a group (with its children) into components and leaves one instance in its place', () => {
    const d = DOC(), before = frozen(d);
    const r = S.createSymbol(d, ['card'], { id: 'card', instanceId: 'card1', target: '#card' });
    expect(frozen(d)).toBe(before); // pure
    ok(r);
    expect(Object.keys(r.components)).toEqual(['card']);
    expect(r.layers.map((l: any) => [l.id, l.type])).toEqual([['title', 'track'], ['card1', 'component']]);
    const inst = r.layers[1];
    expect(inst).toMatchObject({ ref: 'card', target: '#card', start: 100 });
    // content time inside the symbol starts at 0; targets are relative to the instance target
    const face = r.components.card.layers.find((l: any) => l.id === 'face');
    expect(face.target).toBe('.face');
    expect(face.keyframes.map((k: any) => k.time)).toEqual([0, 300]);
    // reading it back gives the same timing and targets as before
    const flat = sceneV3ToV2(r).doc.layers.find((l: any) => l.id === 'card1/face') as any;
    expect(flat.target).toBe('#card .face');
    expect(flat.keyframes.map((k: any) => k.time)).toEqual([100, 400]);
  });
  it('refuses unknown layers, an existing symbol id, an id clash and an empty selection', () => {
    expect(() => S.createSymbol(DOC(), ['nope'], { id: 'x' })).toThrow(/nope/);
    expect(() => S.createSymbol(DOC(), [], { id: 'x' })).toThrow(/layer/);
    const r = S.createSymbol(DOC(), ['card'], { id: 'card', instanceId: 'card1' });
    expect(() => S.createSymbol(r, ['title'], { id: 'card' })).toThrow(/exists/);
    expect(() => S.createSymbol(DOC(), ['card'], { id: 'c', instanceId: 'title' })).toThrow(/title/);
  });
});

describe('instances, overrides, master updates', () => {
  const base = () => S.createSymbol(DOC(), ['card'], { id: 'card', instanceId: 'card1', target: '#card' });
  it('addInstance places more instances of the same symbol; symbolUsage lists them', () => {
    let d = S.addInstance(base(), 'card', { id: 'card2', target: '#card2', start: 600 });
    d = S.addInstance(d, 'card', { id: 'card3', target: '#card3', start: 900 });
    ok(d);
    expect(S.symbolUsage(d)).toEqual({ card: { instances: ['card1', 'card2', 'card3'], overrides: 0 } });
    expect(() => S.addInstance(d, 'missing', { id: 'z' })).toThrow(/missing/);
    expect(() => S.addInstance(d, 'card', { id: 'card2' })).toThrow(/card2/);
  });
  it('updateSymbol edits the master once and every instance follows; overrides survive the edit', () => {
    let d = S.addInstance(base(), 'card', { id: 'card2', target: '#card2', start: 600 });
    d = S.setOverride(d, 'card2', 'glow', { props: { opacity: 0.2 } });
    const before = frozen(d);
    const e = S.updateSymbol(d, 'card', (layers) => layers.map((l: any) => (l.id === 'face' ? { ...l, keyframes: l.keyframes.map((k: any) => ({ ...k, props: { ...k.props, scale: k.time ? '1' : '0.9' } })) } : l)));
    expect(frozen(d)).toBe(before);
    ok(e);
    const flat = sceneV3ToV2(e).doc.layers as any[];
    for (const id of ['card1/face', 'card2/face']) expect(flat.find((l) => l.id === id).keyframes.map((k: any) => k.props.scale)).toEqual(['0.9', '1']);
    expect(flat.find((l) => l.id === 'card2/glow').keyframes.map((k: any) => k.props.opacity)).toEqual([0.2, 0.2]);
    expect(flat.find((l) => l.id === 'card1/glow').keyframes.map((k: any) => k.props.opacity)).toEqual([0, 0.6]);
    expect(S.symbolUsage(e).card.overrides).toBe(1);
    expect(() => S.updateSymbol(e, 'card', () => [{ id: 'x', type: 'component', ref: 'card' }] as any)).toThrow(/cycle|itself/);
  });
  it('setOverride refuses layers the symbol does not have; clearOverride removes one or all', () => {
    const d = S.setOverride(base(), 'card1', 'face', { muted: true, target: '#other' });
    ok(d);
    expect(() => S.setOverride(d, 'card1', 'nope', { muted: true })).toThrow(/nope/);
    expect(() => S.setOverride(d, 'title', 'face', { muted: true })).toThrow(/title/);
    expect(S.clearOverride(d, 'card1', 'face').layers.find((l: any) => l.id === 'card1').overrides).toBeUndefined();
    expect(S.clearOverride(d, 'card1').layers.find((l: any) => l.id === 'card1').overrides).toBeUndefined();
  });
  it('detachInstance turns one instance back into plain layers (others keep the link); renameSymbol updates refs', () => {
    let d = S.addInstance(base(), 'card', { id: 'card2', target: '#card2', start: 600 });
    const r = S.detachInstance(d, 'card1');
    ok(r.doc);
    expect(r.doc.layers.map((l: any) => l.id)).toEqual(['title', 'card1', 'card1/face', 'card1/glow', 'card2']);
    expect(r.doc.layers.find((l: any) => l.id === 'card1').type).toBe('group');
    expect(S.symbolUsage(r.doc).card.instances).toEqual(['card2']);
    d = S.renameSymbol(d, 'card', 'tile');
    ok(d);
    expect(Object.keys(d.components)).toEqual(['tile']);
    expect(d.layers.filter((l: any) => l.type === 'component').map((l: any) => l.ref)).toEqual(['tile', 'tile']);
  });
  it('validateSymbols reports missing refs, stray override keys and unused symbols', () => {
    const d: any = base();
    d.layers.push({ id: 'ghost', type: 'component', ref: 'nope' });
    d.layers[1].overrides = { zzz: { muted: true } };
    d.components.spare = { layers: [] };
    const msgs = S.validateSymbols(d).map((p) => `${p.path}: ${p.message}`).join('\n');
    expect(msgs).toMatch(/nope/);
    expect(msgs).toMatch(/zzz/);
    expect(msgs).toMatch(/spare.*unused/);
  });
});

describe('symbolsToCss — no repeated bytes per instance', () => {
  it('each symbol layer gets one @keyframes block; instances add selector + timing lines only', () => {
    let d = S.createSymbol(DOC(), ['card'], { id: 'card', instanceId: 'card1', target: '#card' });
    const one = S.symbolsToCss(d).css;
    for (let i = 2; i <= 9; i++) d = S.addInstance(d, 'card', { id: `card${i}`, target: `#card${i}`, start: i * 100 });
    const nine = S.symbolsToCss(d).css;
    expect(nine.match(/@keyframes mo-card-face\b/g)).toHaveLength(1);
    expect(nine.match(/@keyframes mo-card-glow\b/g)).toHaveLength(1);
    expect(nine).toContain('#card5 .face');
    expect(nine).toMatch(/#card5 \.face\s*\{[^}]*animation:[^}]*mo-card-face[^}]*500ms/);
    // 8 more instances × 2 layers: only short rules, far less than another copy of the keyframes
    const kfBytes = (one.match(/@keyframes[\s\S]*?\n\}/g) || []).join('').length;
    expect(nine.length - one.length).toBeLessThan(8 * kfBytes);
    expect(nine.length - one.length).toBeLessThan(8 * 2 * 120);
  });
  it('an instance with prop overrides gets its own keyframes; muted layers get none; plain tracks still export', () => {
    let d = S.createSymbol(DOC(), ['card'], { id: 'card', instanceId: 'card1', target: '#card' });
    d = S.addInstance(d, 'card', { id: 'card2', target: '#card2' });
    d = S.setOverride(d, 'card2', 'glow', { props: { opacity: 0.2 } });
    d = S.setOverride(d, 'card1', 'face', { muted: true });
    const { css, report } = S.symbolsToCss(d);
    expect(css).toMatch(/@keyframes mo-card-glow--card2/);
    expect(css).not.toMatch(/#card \.face\s*\{/);
    expect(css).toMatch(/@keyframes mo-title\b/);
    expect(report.symbols).toBe(1);
    expect(report.instances).toBe(2);
    expect(report.keyframeBlocks).toBe(4); // face, glow, glow--card2, title
  });
});

describe('packaging', () => {
  it('motionary/scene/symbols is exported, opt-in, zero deps', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.exports['./scene/symbols'].import.default).toBe('./dist/components/scene-symbols.js');
    expect(JSON.stringify(pkg.dependencies || {})).toBe('{}');
    const budget = JSON.parse(readFileSync(join(ROOT, 'size-budget.json'), 'utf8'));
    const line = budget.find((b: any) => /scene-symbols/.test(b.import || ''));
    expect(line && line.limit).toBeLessThanOrEqual(4096);
  });
});
