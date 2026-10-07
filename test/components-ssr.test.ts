// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  delete (globalThis as any).IntersectionObserver;
  delete (globalThis as any).matchMedia;
});

describe('components on the server', () => {
  it('import with no side effects and every define*() is a safe no-op', async () => {
    vi.resetModules();
    const IO = vi.fn();
    const matchMedia = vi.fn();
    (globalThis as any).IntersectionObserver = IO;
    (globalThis as any).matchMedia = matchMedia;
    const mod: any = await import('../src/components');
    expect(typeof window).toBe('undefined');
    expect(IO).not.toHaveBeenCalled();
    expect(matchMedia).not.toHaveBeenCalled();
    expect(() => mod.defineComponents()).not.toThrow();
    for (const [name, fn] of Object.entries(mod)) {
      if (/^define[A-Z]/.test(name)) expect((fn as () => unknown)(), name).toBeUndefined();
    }
    expect(mod.toast('hi')).toBeNull();
    await expect(mod.viewTransition(() => undefined)).resolves.toBeUndefined();
    expect(IO).not.toHaveBeenCalled();
  });

  it('the auto (CDN) entry is also importable without a DOM', async () => {
    vi.resetModules();
    await expect(import('../src/components/auto')).resolves.toBeTruthy();
  });
});
