import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, parseChips, waveBars } from '../src/components/widgets';
import { registerAllPlugins, EFFECT_PACKS, AI_FX, registerAiPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { AI_FX as AI, splitWords } from '../src/components/fx2';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });
void ctx; void anims; void tick; void playEffect; void mount;

describe('7.8 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['7.8'])).toEqual(["usa-chat-composer", "usa-suggestion-chips", "usa-voice-button"]);
    for (const t of Object.keys(WIDGETS['7.8'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerAllPlugins) as their own entries', () => {
    registerAiPack();
    registerAllPlugins();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of AI_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['ai']).toBe(AI_FX);
    expect(COMPONENT_ENTRIES['fx-ai']).toBe('fx2/ai');
    expect(pkg.exports['./fx/ai'].import.default).toBe('./dist/components/fx-ai.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['7.8'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('7.8');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-stream')).esm).toContain("from 'motionary/components/fx-ai'");
    for (const id of ["chat-composer", "suggestion-chips", "voice-button", "fx-stream", "fx-voice"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-chat-composer", "<usa-suggestion-chips", "<usa-voice-button", "motionary/fx/ai"]) expect(doc).toContain(s);
  });
});


describe('7.8 widgets behave', () => {
  it('chat composer: send on Enter, cancelable send, busy → stop', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const c = mount<any>('<usa-chat-composer placeholder="Ask &lt;me&gt;" label="Prompt"></usa-chat-composer>');
    const ta = c.querySelector('textarea');
    expect(ta.getAttribute('aria-label')).toBe('Prompt');
    expect(ta.placeholder).toBe('Ask <me>');
    const sent = vi.fn();
    c.addEventListener('usa:send', sent);
    expect(c.send()).toBe(false);
    c.value = '  hello  ';
    expect(c.hasAttribute('data-ready')).toBe(true);
    ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(sent.mock.calls[0][0].detail).toEqual({ text: 'hello' });
    expect(c.value).toBe('');
    c.value = 'keep';
    c.addEventListener('usa:send', (e: Event) => e.preventDefault(), { once: true });
    expect(c.send()).toBe(false);
    expect(c.value).toBe('keep');
    const stop = vi.fn();
    c.addEventListener('usa:stop', stop);
    c.busy = true;
    const btn = c.querySelector('.usa-cc-send');
    expect(btn.getAttribute('aria-label')).toBe('Stop generating');
    expect(c.hasAttribute('data-busy')).toBe(true);
    btn.click();
    expect(stop).toHaveBeenCalledTimes(1);
    expect(c.busy).toBe(false);
  });
  it('suggestion chips: items, pick, dismiss, setItems', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(parseChips(' a | b|\nc ')).toEqual(['a', 'b', 'c']);
    const s = mount<any>('<usa-suggestion-chips items="One|Two|&lt;Three&gt;" dismiss></usa-suggestion-chips>');
    const chips = s.querySelectorAll('button');
    expect(chips.length).toBe(3);
    expect(chips[2].textContent).toBe('<Three>');
    expect(s.querySelector('[role=list]').getAttribute('aria-label')).toBe('Suggestions');
    const pick = vi.fn();
    s.addEventListener('usa:pick', pick);
    chips[1].click();
    expect(pick.mock.calls[0][0].detail).toEqual({ text: 'Two', index: 1 });
    expect(chips[1].hasAttribute('data-picked')).toBe(true);
    expect(chips[0].disabled).toBe(true);
    s.setItems(['X', 'Y']);
    expect(Array.from(s.querySelectorAll('button')).map((b: any) => b.textContent)).toEqual(['X', 'Y']);
    expect(s.items).toEqual(['X', 'Y']);
    const k = mount<any>('<usa-suggestion-chips><span>A</span><span>B</span></usa-suggestion-chips>');
    expect(k.items).toEqual(['A', 'B']);
    expect(k.querySelectorAll('button').length).toBe(2);
  });
  it('voice button: toggle, aria-pressed, events, level → bars', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const hs = waveBars(1, 5, 0);
    expect(hs.length).toBe(5);
    expect(Math.max(...hs)).toBeLessThanOrEqual(1);
    expect(waveBars(0, 3).every((h: number) => h === 0.15)).toBe(true);
    const v = mount<any>('<usa-voice-button bars="4"></usa-voice-button>');
    const btn = v.querySelector('button');
    expect(v.querySelectorAll('.usa-vb-bars i').length).toBe(4);
    const start = vi.fn();
    const stop = vi.fn();
    v.addEventListener('usa:start', start);
    v.addEventListener('usa:stop', stop);
    btn.click();
    expect(v.listening).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(start).toHaveBeenCalledTimes(1);
    v.level = 0.8;
    expect(v.hasAttribute('data-live')).toBe(true);
    expect(v.querySelector('.usa-vb-bars i').style.transform).toMatch(/^scaleY\(/);
    v.toggle(false);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(v.hasAttribute('data-live')).toBe(false);
  });
  it('ai pack: names, kinds, splitWords, stream restores text, glow cleanup', async () => {
    expect(AI.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['stream-text:enter', 'thinking-glow:loop', 'voice-wave:attention', 'gen-skeleton:enter']);
    expect(splitWords('Hello  big world')).toEqual(['Hello  ', 'big ', 'world']);
    const el = document.createElement('p');
    el.innerHTML = 'One two <b>three</b>';
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await AI[0].run(el, { speed: 10 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(4); // caret + 3 words
    expect(el.innerHTML).toBe('One two <b>three</b>');
    const cancel = vi.fn();
    const gctx: any = { ...ctx, animate: vi.fn(() => ({ cancel })) };
    const stop = AI[1].run(el, { colors: 'red,blue', duration: 100 }, gctx);
    expect(gctx.animate.mock.calls[0][1].length).toBe(3);
    (stop as any)();
    expect(cancel).toHaveBeenCalled();
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await AI[2].run(el, { cycles: 2, duration: 100 }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
    await AI[3].run(el, { hold: 0, duration: 100 }, ctx);
    expect(el.querySelectorAll('span').length).toBe(0);
  });
});
