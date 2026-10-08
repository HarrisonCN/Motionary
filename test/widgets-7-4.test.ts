import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, PRESENCE_STATES, initials, parseReactions } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, SOCIAL_FX, registerSocialPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { SOCIAL_FX, registerSocialPack, fanAngles } from '../src/components/fx2';
import { parseReactions, PRESENCE_STATES, initials } from '../src/components/widgets';

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

describe('7.4 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['7.4'])).toEqual(["usa-message-list", "usa-reactions", "usa-notification-bell", "usa-presence"]);
    for (const t of Object.keys(WIDGETS['7.4'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerSocialPack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of SOCIAL_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['social']).toBe(SOCIAL_FX);
    expect(COMPONENT_ENTRIES['fx-social']).toBe('fx2/social');
    expect(pkg.exports['./fx/social'].import.default).toBe('./dist/components/fx-social.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['7.4'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('7.4');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-chat')).esm).toContain("from 'motionary/components/fx-social'");
    for (const id of ["message-list", "reactions", "notification-bell", "presence", "fx-chat", "fx-react"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-message-list", "<usa-reactions", "<usa-notification-bell", "<usa-presence", "motionary/fx/social"]) expect(doc).toContain(s);
  });
});


describe('7.4 widgets behave', () => {
  it('message list: seeds from <p>, groups, log role, push emits, typing bubble', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const l = mount<any>('<usa-message-list><p data-from="Ada">Hi</p><p data-from="Ada">There</p><p data-me>Hey</p></usa-message-list>');
    expect(l.messages.length).toBe(3);
    const items = l.querySelectorAll('.usa-ml-msg');
    expect(items[1].hasAttribute('data-grouped')).toBe(true);
    expect(items[2].dataset.side).toBe('right');
    expect(l.querySelector('.usa-ml-list').getAttribute('role')).toBe('log');
    l.typing('Ada');
    expect(l.querySelector('.usa-ml-typing').getAttribute('aria-label')).toBe('Ada is typing');
    const ev = vi.fn();
    l.addEventListener('usa:message', ev);
    l.push({ from: 'Ada', text: 'Ship it?' });
    expect(l.querySelector('.usa-ml-typing')).toBeNull();
    expect(ev).toHaveBeenCalledTimes(1);
    expect(l.messages[3].text).toBe('Ship it?');
  });
  it('reactions: toggles count + aria-pressed, picker adds, emits', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(parseReactions('👍,❤️', '3')).toEqual([['👍', 3], ['❤️', 0]]);
    const r = mount<any>('<usa-reactions emojis="👍,❤️" counts="3,0"></usa-reactions>');
    const pills = r.querySelectorAll('.usa-rx-pill');
    expect(pills[1].hidden).toBe(true);
    const ev = vi.fn();
    r.addEventListener('usa:react', ev);
    pills[0].click();
    expect(r.counts['👍']).toBe(4);
    expect(pills[0].getAttribute('aria-pressed')).toBe('true');
    expect(pills[0].getAttribute('aria-label')).toBe('👍 4 reactions');
    pills[0].click();
    expect(r.counts['👍']).toBe(3);
    r.querySelector('.usa-rx-add').click();
    expect(r.querySelector('.usa-rx-picker').hidden).toBe(false);
    r.querySelector('.usa-rx-picker button:nth-child(2)').click();
    expect(r.mine).toEqual(['❤️']);
    expect(pills[1].hidden).toBe(false);
    expect(ev).toHaveBeenCalledTimes(3);
  });
  it('notification bell: seeds, unread label, notify, mark all read, Esc', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const b = mount<any>('<usa-notification-bell><li>One</li><li data-read>Two</li></usa-notification-bell>');
    expect(b.unread).toBe(1);
    expect(b.querySelector('.usa-nb-btn').getAttribute('aria-label')).toBe('Notifications, 1 unread');
    b.notify('Three');
    expect(b.unread).toBe(2);
    expect(b.querySelector('.usa-nb-badge').textContent).toBe('2');
    expect(b.querySelector('.usa-nb-item .usa-nb-text').textContent).toBe('Three');
    b.querySelector('.usa-nb-btn').click();
    expect(b.open).toBe(true);
    b.markAllRead();
    expect(b.unread).toBe(0);
    expect(b.querySelector('.usa-nb-badge').textContent).toBe('');
    b.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(b.open).toBe(false);
  });
  it('presence: initials, status label, invalid status falls back', () => {
    expect(initials('ada  lovelace byron')).toBe('AL');
    expect(PRESENCE_STATES).toEqual(['online', 'away', 'busy', 'offline']);
    const p = mount<any>('<usa-presence name="Ada Lovelace" status="away" speaking></usa-presence>');
    expect(p.getAttribute('role')).toBe('img');
    expect(p.querySelector('.usa-pr2-face').textContent).toBe('AL');
    expect(p.getAttribute('aria-label')).toBe('Ada Lovelace, away, speaking');
    p.status = 'online';
    expect(p.dataset.state).toBe('online');
    p.setAttribute('status', 'nope');
    expect(p.status).toBe('offline');
  });
});

describe('chat & social motion pack', () => {
  it('fanAngles spreads symmetrically', () => {
    expect(fanAngles(1)).toEqual([0]);
    expect(fanAngles(3, 60)).toEqual([-30, 0, 30]);
  });
  it('registers 5 effects; typing-dots cleans up; read-receipt colours under reduced motion', () => {
    registerSocialPack();
    expect(SOCIAL_FX.map((d) => d.name).sort()).toEqual(['mention-glow', 'message-in', 'reaction-burst', 'read-receipt', 'typing-dots']);
    expect(getEffect('reaction-burst')?.reduced).toBe('skip');
    const el = mount<HTMLElement>('<span></span>');
    const stop = getEffect('typing-dots')!.run(el, { ...getEffect('typing-dots')!.defaults }, ctx(false)) as () => void;
    expect(el.querySelectorAll('.usa-fx-typing > span').length).toBe(3);
    stop();
    expect(el.querySelector('.usa-fx-typing')).toBeNull();
    const r = mount<HTMLElement>('<span>Seen</span>');
    getEffect('read-receipt')!.run(r, { ...getEffect('read-receipt')!.defaults }, ctx(true));
    expect((r.querySelector('.usa-fx-ticks') as HTMLElement).style.color).not.toBe('');
  });
});
