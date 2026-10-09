import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, finishAll } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineFxComponents, playEffect, getEffect, listEffects } from '../src/components/fx';
import { getMotionTokens } from '../src/components/tokens';
import { registerAllEffects, registerMicroEffects, MICRO_FX, THEME_FX, EFFECT_PACKS, MOTION_THEMES, MOTION_THEME_NAMES, THEME_ROLES, themeVars, themeCss, applyMotionTheme, themePreset, playThemeEffect, defineMotionTheme, togglePressed, swapLabel, bumpCount } from '../src/components/effects';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineFxComponents();
  registerAllEffects();
});
afterEach(() => {
  vi.useRealTimers();
  configureComponents({ reducedMotion: 'user' });
});

describe('5.8 micro-interactions', () => {
  it('registers 23 uniquely named micro effects', () => {
    registerMicroEffects();
    expect(MICRO_FX.length).toBeGreaterThanOrEqual(20);
    expect(MICRO_FX.length).toBe(23);
    const names = MICRO_FX.map((d) => d.name);
    expect(new Set(names).size).toBe(names.length);
    for (const d of MICRO_FX) {
      expect(getEffect(d.name), d.name).toBe(d); // not shadowed by an older effect of the same name
      expect(['click', 'attention']).toContain(d.kind);
      expect(d.description).toBeTruthy();
    }
    expect(EFFECT_PACKS.micro).toBe(MICRO_FX);
  });

  it('helpers: togglePressed / swapLabel / bumpCount', async () => {
    vi.useFakeTimers();
    const b = mount<HTMLElement>('<button><b>Copy</b> <span data-count="9">9</span></button>');
    expect(togglePressed(b)).toBe(true);
    expect(togglePressed(b)).toBe(false);
    expect(bumpCount(b, 1)).toBe(10);
    expect(b.querySelector('[data-count]')!.textContent).toBe('10');
    const p = swapLabel(b, 'Done', 500);
    expect(b.textContent).toBe('Done');
    expect(b.getAttribute('aria-live')).toBe('polite');
    vi.advanceTimersByTime(500);
    await p;
    expect(b.querySelector('b')!.textContent).toBe('Copy');
  });

  it('copy-success writes to the clipboard and swaps the label', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const b = mount<HTMLElement>('<button data-copy="npm i motionary">Copy</button>');
    const done = playEffect(b, 'copy-success');
    expect(writeText).toHaveBeenCalledWith('npm i motionary');
    expect(b.textContent).toBe('Copied ✓');
    anims.forEach((a) => a.finish());
    vi.advanceTimersByTime(1600);
    await done;
    expect(b.textContent).toBe('Copy');
  });

  it('password-reveal toggles the input type and the button state', () => {
    mount('<div><input id="pw" type="password"><button for="pw" aria-label="Show password">👁</button></div>');
    const btn = document.querySelector<HTMLElement>('button')!;
    const input = document.getElementById('pw') as HTMLInputElement;
    void playEffect(btn, 'password-reveal');
    expect(input.type).toBe('text');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.getAttribute('aria-label')).toBe('Hide password');
    void playEffect(btn, 'password-reveal');
    expect(input.type).toBe('password');
  });

  it.each(['favorite-star', 'like-heart', 'bookmark-flip', 'toggle-morph'])('%s toggles aria-pressed', (name) => {
    const b = mount<HTMLElement>('<button>x</button>');
    void playEffect(b, name);
    expect(b.getAttribute('aria-pressed')).toBe('true');
    void playEffect(b, name);
    expect(b.getAttribute('aria-pressed')).toBe('false');
  });

  it('counters: add-to-cart, counter-bump, upvote, clap, notify-badge', () => {
    const el = (h: string) => mount<HTMLElement>(h);
    const cart = el('<button>Cart <span data-count="2">2</span></button>');
    void playEffect(cart, 'add-to-cart');
    expect(cart.querySelector('[data-count]')!.textContent).toBe('3');
    const c = el('<button data-count="0">0</button>');
    void playEffect(c, 'counter-bump', { step: 5 });
    expect(c.textContent).toBe('5');
    const up = el('<button>▲ <span data-count="41">41</span></button>');
    void playEffect(up, 'upvote');
    expect(up.querySelector('[data-count]')!.textContent).toBe('42');
    void playEffect(up, 'upvote');
    expect(up.querySelector('[data-count]')!.textContent).toBe('41');
    const clap = el('<button>👏 <span data-count="0">0</span></button>');
    void playEffect(clap, 'clap');
    void playEffect(clap, 'clap');
    expect(clap.querySelector('[data-count]')!.textContent).toBe('2');
    const badge = el('<span data-count="3">3</span>');
    void playEffect(badge, 'notify-badge');
    expect(badge.textContent).toBe('4');
  });

  it('download-progress: aria-busy while filling, ignores re-clicks, then "Done ✓" and usa-done', async () => {
    const b = mount<HTMLElement>('<button>Download</button>');
    const done = vi.fn();
    b.addEventListener('usa-done', done);
    const p = playEffect(b, 'download-progress', { duration: 100 });
    expect(b.getAttribute('aria-busy')).toBe('true');
    void playEffect(b, 'download-progress');
    expect(b.querySelectorAll('span[aria-hidden]').length).toBe(1);
    await finishAll();
    expect(done).toHaveBeenCalledTimes(1);
    expect(b.hasAttribute('aria-busy')).toBe(false);
    expect(b.textContent).toBe('Done ✓');
    void p;
  });

  it('input-shake marks the field invalid; check-toggle uses aria-checked on role=checkbox', () => {
    const i = mount<HTMLInputElement>('<input>');
    void playEffect(i, 'input-shake');
    expect(i.getAttribute('aria-invalid')).toBe('true');
    expect(anims.at(-1)!.keyframes.length).toBe(7);
    const cb = mount<HTMLElement>('<div role="checkbox" aria-checked="false"></div>');
    void playEffect(cb, 'check-toggle');
    expect(cb.getAttribute('aria-checked')).toBe('true');
  });

  it('trash-shake with remove: true removes the element after the animation', async () => {
    const t = mount<HTMLElement>('<li>item</li>');
    const p = playEffect(t, 'trash-shake', { remove: true });
    await finishAll();
    await p;
    expect(t.isConnected).toBe(false);
  });

  it('every micro effect runs on a plain button without throwing (and under reduced motion)', async () => {
    for (const reduced of [false, true]) {
      configureComponents({ reducedMotion: reduced ? 'reduce' : 'user' });
      for (const d of MICRO_FX) {
        const b = mount<HTMLElement>('<button data-count="1">1</button>');
        const errors: unknown[] = [];
        const p = playEffect(b, d.name, { duration: 50, ms: 10 }).catch((e) => errors.push(e));
        await finishAll();
        await Promise.race([p, new Promise((r) => setTimeout(r, 30))]);
        expect(errors, d.name).toEqual([]);
      }
    }
  });
});

describe('5.8 theme packs', () => {
  it('ships five themes with full tokens and presets that point at registered effects', () => {
    expect(MOTION_THEME_NAMES).toEqual(['neon', 'paper', 'glass', 'retro', 'brutalist']);
    for (const n of MOTION_THEME_NAMES) {
      const t = MOTION_THEMES[n];
      for (const k of ['bg', 'fg', 'accent', 'accent-2', 'surface', 'border', 'radius', 'shadow', 'font']) expect((t.vars as any)[k], `${n}.${k}`).toBeTruthy();
      for (const r of THEME_ROLES) expect(getEffect(themePreset(n, r).effect), `${n}.${r}`).toBeTruthy();
    }
    expect(THEME_FX.map((d) => d.name)).toEqual(['neon-flicker', 'paper-fold', 'glass-shine', 'retro-scanlines', 'brutal-shift']);
    expect(listEffects().length).toBeGreaterThan(80);
  });

  it('themeVars / themeCss include design and motion tokens', () => {
    const v = themeVars('retro');
    expect(v['--usa-theme-accent']).toBe('#ff6b35');
    expect(v['--usa-easing-standard']).toBe('steps(6, end)');
    expect(themeCss('neon')).toMatch(/^\[data-usa-theme=neon\]\{--usa-theme-bg:#07070c;/);
    expect(themeCss('paper', ':root')).toMatch(/^:root\{/);
    expect(() => themeVars('nope')).toThrow(/unknown theme/);
  });

  it('applyMotionTheme on <html> activates motion tokens; undo restores everything', () => {
    const before = getMotionTokens().duration.normal;
    const undo = applyMotionTheme('brutalist');
    const html = document.documentElement;
    expect(html.getAttribute('data-usa-theme')).toBe('brutalist');
    expect(html.style.getPropertyValue('--usa-theme-shadow')).toBe('6px 6px 0 #000000');
    expect(getMotionTokens().duration.normal).toBe(160);
    undo();
    expect(html.hasAttribute('data-usa-theme')).toBe(false);
    expect(html.style.getPropertyValue('--usa-theme-shadow')).toBe('');
    expect(getMotionTokens().duration.normal).toBe(before);
  });

  it('applyMotionTheme on an element scopes variables without touching the global motion tokens', () => {
    const before = getMotionTokens().easing.standard;
    const box = mount<HTMLElement>('<div></div>');
    const undo = applyMotionTheme('retro', box);
    expect(box.style.getPropertyValue('--usa-easing-standard')).toBe('steps(6, end)');
    expect(getMotionTokens().easing.standard).toBe(before);
    undo();
    expect(box.style.getPropertyValue('--usa-easing-standard')).toBe('');
  });

  it('playThemeEffect plays the preset of the closest theme', async () => {
    const box = mount<HTMLElement>('<div data-usa-theme="brutalist"><button>Go</button></div>');
    void playThemeEffect(box.querySelector('button')!, 'click');
    expect(anims.at(-1)!.keyframes[1].transform).toBe('translate(6px,6px)');
  });

  it('<usa-motion-theme> themes its subtree and binds data-theme-fx presets', () => {
    defineMotionTheme();
    const host = mount<HTMLElement>('<usa-motion-theme name="neon"><button data-theme-fx="click">Tap</button><p data-theme-fx="bogus">x</p></usa-motion-theme>');
    expect(host.getAttribute('data-usa-theme')).toBe('neon');
    expect(host.style.getPropertyValue('--usa-theme-accent')).toBe('#22d3ee');
    const n = anims.length;
    host.querySelector('button')!.click();
    expect(anims.length).toBeGreaterThan(n); // shockwave
    host.setAttribute('name', 'paper');
    expect(host.style.getPropertyValue('--usa-theme-accent')).toBe('#c2410c');
    host.remove();
    expect(host.style.getPropertyValue('--usa-theme-accent')).toBe('');
  });

  it('retro-scanlines stays static under reduced motion; neon-flicker never fully blacks out', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const el = mount<HTMLElement>('<div></div>');
    const n = anims.length;
    void playEffect(el, 'retro-scanlines');
    expect(el.querySelector('span[aria-hidden]')).not.toBeNull();
    expect(anims.length).toBe(n);
    const kf = THEME_FX[0];
    const a: any[] = [];
    kf.run(el, { color: '#fff' }, { reduced: false, animate: (_e: any, k: any) => (a.push(...k), null) } as any);
    expect(Math.min(...a.map((f) => f.opacity))).toBeGreaterThanOrEqual(0.5);
  });
});
