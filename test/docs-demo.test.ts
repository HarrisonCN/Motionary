import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { installMocks, animations, MockIO } from './setup';

const root = resolve(__dirname, '..');
const html = readFileSync(resolve(root, 'demo/index.html'), 'utf8');

describe('demo/index.html', () => {
  beforeEach(() => {
    vi.resetModules();
    installMocks();
  });

  it('loads the UMD build without a build step (local file, unpkg fallback)', () => {
    expect(html).toContain("'../dist/index.umd.js'");
    expect(html).toContain('https://unpkg.com/use-scroll-animate/dist/index.umd.js');
    expect(html).not.toMatch(/type=["']module["']/);
    expect(existsSync(resolve(root, 'dist/index.umd.js'))).toBe(true);
  });

  it('renders a clickable button and a scroll card for every preset', async () => {
    const lib = await import('../src/index');
    document.documentElement.innerHTML = html.replace(/<script>[\s\S]*<\/script>/, '');
    (window as any).ScrollAnimate = lib;
    const script = /function start\(\) \{[\s\S]*\n    \}\n  <\/script>/.exec(html)![0].replace(/<\/script>$/, '');
    // eslint-disable-next-line no-new-func
    new Function(`${script}; start();`)();

    const names = Object.keys(lib.PRESETS);
    const buttons = Array.from(document.querySelectorAll('#presets button')) as HTMLButtonElement[];
    expect(buttons.map((b) => b.textContent)).toEqual(names);
    const cards = Array.from(document.querySelectorAll('#scroll-list [data-sa]'));
    expect(cards.map((c) => c.getAttribute('data-sa-animation'))).toEqual(names);
    expect(cards.every((c) => c.hasAttribute('data-sa-exit'))).toBe(true);
    expect(MockIO.instances.some((io) => io.targets.has(cards[0]))).toBe(true);

    buttons[names.indexOf('zoom-in')].click();
    const played = animations[animations.length - 1];
    expect(played.el.id).toBe('target');
    expect(played.keyframes[0]).toMatchObject({ transform: 'scale(0.8)' });
    expect(buttons[names.indexOf('zoom-in')].getAttribute('aria-pressed')).toBe('true');
  });
});

describe('docs', () => {
  it.each(['docs/API.md', 'docs/migration-from-aos.md', 'docs/migration-from-gsap-scrolltrigger.md', 'docs/deprecations.md'])('%s exists and its relative links resolve', (file) => {
    const text = readFileSync(resolve(root, file), 'utf8');
    const links = Array.from(text.matchAll(/\]\((\.{1,2}\/[^)#]+)/g)).map((m) => m[1]);
    links.forEach((link) => expect(existsSync(resolve(root, 'docs', link)), `${file} -> ${link}`).toBe(true));
  });

  it('API reference documents every runtime export of the main entry', async () => {
    const lib = await import('../src/index');
    const api = readFileSync(resolve(root, 'docs/API.md'), 'utf8');
    Object.keys(lib).filter((k) => k !== 'default').forEach((name) => expect(api, name).toContain(name));
  });
});

describe('deprecation warnings (dev only)', () => {
  beforeEach(() => {
    vi.resetModules();
    installMocks();
  });

  it('warns once when createReactHooks / createVueComposables are imported from the main entry', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const lib = await import('../src/index');
    const React = { useRef: () => ({ current: null }), useEffect: () => undefined } as any;
    lib.createReactHooks(React);
    lib.createReactHooks(React);
    lib.createVueComposables({ ref: () => ({ value: null }), onMounted: () => undefined, onUnmounted: () => undefined } as any);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain("use-scroll-animate/react");
    expect(warn.mock.calls[1][0]).toContain("use-scroll-animate/vue");
    warn.mockRestore();
  });

  it('subpath imports do not warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { createReactHooks } = await import('../src/react');
    createReactHooks({ useRef: () => ({ current: null }), useEffect: () => undefined } as any);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('is silent in production builds', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const lib = await import('../src/index');
    lib.createReactHooks({ useRef: () => ({ current: null }), useEffect: () => undefined } as any);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    process.env.NODE_ENV = prev;
  });

  it('still returns working hooks', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const lib = await import('../src/index');
    const hooks = lib.createReactHooks({ useRef: () => ({ current: null }), useEffect: () => undefined } as any);
    expect(typeof hooks.useScrollAnimate).toBe('function');
    expect(typeof hooks.useScrollStagger).toBe('function');
  });
});
