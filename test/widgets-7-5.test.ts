import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, badgeProgress, levelFor, rankRows, wheelAngle } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, GAME_FX, registerGamePack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { GAME_FX as GFX, throwPath } from '../src/components/fx2';
import { rankRows, levelFor, badgeProgress, wheelAngle } from '../src/components/widgets';

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

describe('7.5 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['7.5'])).toEqual(["usa-leaderboard", "usa-xp-bar", "usa-badge-wall", "usa-prize-wheel"]);
    for (const t of Object.keys(WIDGETS['7.5'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerGamePack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of GAME_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['game']).toBe(GAME_FX);
    expect(COMPONENT_ENTRIES['fx-game']).toBe('fx2/game');
    expect(pkg.exports['./fx/game'].import.default).toBe('./dist/components/fx-game.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['7.5'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('7.5');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-unlock')).esm).toContain("from 'motionary/components/fx-game'");
    for (const id of ["leaderboard", "xp-bar", "badge-wall", "prize-wheel", "fx-unlock", "fx-loot"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-leaderboard", "<usa-xp-bar", "<usa-badge-wall", "<usa-prize-wheel", "motionary/fx/game"]) expect(doc).toContain(s);
  });
});


describe('7.5 widgets behave', () => {
  it('leaderboard: ranks, medals, setScore emits usa:rank with delta', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(rankRows([{ name: 'b', score: 1 }, { name: 'a', score: 1 }, { name: 'c', score: 5 }]).map((r) => r.name)).toEqual(['c', 'a', 'b']);
    const b = mount<any>('<usa-leaderboard me="Ada"><li data-score="980">Ada</li><li data-score="870">Alan</li><li data-score="760">Grace</li></usa-leaderboard>');
    const rows = () => Array.from(b.querySelectorAll('.usa-lb-row')) as HTMLElement[];
    expect(rows().map((r) => r.dataset.name)).toEqual(['Ada', 'Alan', 'Grace']);
    expect(rows()[0].querySelector('.usa-lb-rank')!.textContent).toBe('🥇');
    expect(rows()[0].hasAttribute('data-me')).toBe(true);
    expect(rows()[0].getAttribute('aria-label')).toBe('1. Ada, 980 points');
    const ev = vi.fn();
    b.addEventListener('usa:rank', ev);
    b.setScore('Grace', 1000);
    expect(rows()[0].dataset.name).toBe('Grace');
    expect(rows()[0].querySelector('.usa-lb-delta')!.textContent).toBe('▲2');
    expect(ev.mock.calls.map((c) => c[0].detail.name).sort()).toEqual(['Ada', 'Alan', 'Grace']);
  });
  it('xp bar: levelFor carries over levels; add() updates aria + emits levelup', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(levelFor(3, 40, 75, 100)).toEqual({ level: 4, xp: 15, ups: 1 });
    expect(levelFor(1, 90, 250, 100)).toEqual({ level: 4, xp: 40, ups: 3 });
    const x = mount<any>('<usa-xp-bar level="3" xp="40" per="100"></usa-xp-bar>');
    expect(x.getAttribute('role')).toBe('progressbar');
    expect(x.getAttribute('aria-label')).toBe('Level 3, 40 of 100 XP');
    const up = vi.fn();
    x.addEventListener('usa:levelup', up);
    x.add(30);
    expect(x.getAttribute('aria-valuenow')).toBe('70');
    expect(up).not.toHaveBeenCalled();
    x.add(45);
    expect(x.level).toBe(4);
    expect(x.xp).toBe(15);
    expect(up).toHaveBeenCalledTimes(1);
    expect(x.querySelector('.usa-xp-lvl').textContent).toBe('4');
  });
  it('badge wall: seeds, locked labels, unlock flips + counts + emits', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const w = mount<any>('<usa-badge-wall><li data-icon="🏆">First win</li><li data-icon="🔥" data-locked>Streak</li></usa-badge-wall>');
    expect(badgeProgress(w.badges)).toEqual({ unlocked: 1, total: 2 });
    expect(w.querySelector('.usa-bw-count').textContent).toBe('1 / 2 unlocked');
    const li = w.querySelectorAll('.usa-bw-badge')[1];
    expect(li.getAttribute('aria-label')).toBe('Streak, locked');
    const ev = vi.fn();
    w.addEventListener('usa:unlock', ev);
    expect(w.unlock('Streak')).toBe(true);
    expect(w.unlock('Streak')).toBe(false);
    expect(li.hasAttribute('data-locked')).toBe(false);
    expect(li.getAttribute('aria-label')).toBe('Streak, unlocked');
    expect(w.querySelector('.usa-bw-count').textContent).toBe('2 / 2 unlocked');
    expect(ev).toHaveBeenCalledTimes(1);
  });
  it('prize wheel: wheelAngle lands segment under pointer; spin(index) resolves + emits', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(wheelAngle(0, 4, 0)).toBe(315);
    expect(wheelAngle(1, 4, 2)).toBe(720 + 225);
    const p = mount<any>('<usa-prize-wheel segments="A,B,C,D"></usa-prize-wheel>');
    expect(p.segments).toEqual(['A', 'B', 'C', 'D']);
    expect(p.querySelectorAll('.usa-pw-label').length).toBe(4);
    const ev = vi.fn();
    p.addEventListener('usa:result', ev);
    expect(await p.spin(2)).toBe(2);
    expect(p.result).toBe(2);
    expect(p.hasAttribute('data-done')).toBe(true);
    expect(ev.mock.calls[0][0].detail).toEqual({ index: 2, label: 'C' });
    expect(p.querySelector('.usa-pw-btn').disabled).toBe(false);
  });
});

describe('gamification motion pack', () => {
  it('throwPath starts at origin and rises then falls', () => {
    const t = throwPath(0, 100, 6);
    expect(t[0]).toEqual({ x: 0, y: 0 });
    expect(t[2].y).toBeLessThan(0);
  });
  it('registers 5 effects; chest-open opens lid under reduced motion', () => {
    expect(GFX.map((d) => d.name).sort()).toEqual(['achievement-unlock', 'chest-open', 'coin-burst', 'level-up', 'xp-gain']);
    expect(getEffect('coin-burst')?.reduced).toBe('skip');
    const el = mount<HTMLElement>('<div><span data-lid>L</span></div>');
    getEffect('chest-open')!.run(el, { ...getEffect('chest-open')!.defaults }, ctx(true));
    expect(el.hasAttribute('data-open')).toBe(true);
    expect((el.querySelector('[data-lid]') as HTMLElement).style.transform).toContain('rotateX');
  });
});
