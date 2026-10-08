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
    expect(html).toContain('https://unpkg.com/motionary/dist/index.umd.js');
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
  it.each(['docs/API.md', 'docs/migration-from-aos.md', 'docs/migration-from-gsap-scrolltrigger.md', 'docs/deprecations.md', 'docs/components.md', 'docs/windows-apps.md'])('%s exists and its relative links resolve', (file) => {
    const text = readFileSync(resolve(root, file), 'utf8');
    const links = Array.from(text.matchAll(/\]\((\.{1,2}\/[^)#]+)/g)).map((m) => m[1]);
    links.forEach((link) => expect(existsSync(resolve(root, 'docs', link)), `${file} -> ${link}`).toBe(true));
  });

  it('component docs list every <usa-*> element and every define function', async () => {
    const mod: any = await import('../src/components');
    const doc = readFileSync(resolve(root, 'docs/components.md'), 'utf8');
    const readme = readFileSync(resolve(root, 'README.md'), 'utf8');
    const zh = readFileSync(resolve(root, 'README_zh.md'), 'utf8');
    Object.values(mod.COMPONENT_CATEGORIES).flat().forEach((tag: any) => {
      expect(doc, tag).toContain(`<${tag}>`);
      expect(readme, tag).toContain(`<${tag}>`);
      expect(zh, tag).toContain(`<${tag}>`);
    });
    ['viewTransition', 'flip', 'sharedTransition', 'toast', 'configureComponents', 'defineComponents'].forEach((n) => expect(doc, n).toContain(n));
  });

  it('API reference documents every runtime export of the main entry', async () => {
    const lib = await import('../src/index');
    const api = readFileSync(resolve(root, 'docs/API.md'), 'utf8');
    Object.keys(lib).filter((k) => k !== 'default').forEach((name) => expect(api, name).toContain(name));
  });
});

describe('2.0 removals', () => {
  it('the main entry no longer re-exports the React / Vue factories', async () => {
    const lib: Record<string, unknown> = await import('../src/index');
    expect(lib.createReactHooks).toBeUndefined();
    expect(lib.createVueComposables).toBeUndefined();
    expect(typeof (await import('../src/react')).createReactHooks).toBe('function');
    expect(typeof (await import('../src/vue')).createVueComposables).toBe('function');
  });
});
