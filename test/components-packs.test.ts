import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installComponentMocks, anims, mount, intersect } from './components-setup';
import { definePacksComponents, applyPack, flyToCart, countUp, PACKS, PACK_PRIMITIVES } from '../src/components/packs';
import { connectedAnimation, defineFlipList } from '../src/components/transitions';
import { sequence } from '../src';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  definePacksComponents();
});

describe('effect packs', () => {
  it('has the five packs, each using known primitives', () => {
    expect(Object.keys(PACKS)).toEqual(['ecommerce', 'portfolio', 'dashboard', 'game', 'landing']);
    Object.values(PACKS).forEach((p) => Object.values(p).flat().forEach((f) => expect(PACK_PRIMITIVES).toContain(f)));
  });

  it('applyPack wires roles (staggered reveal, press, pulse) and undoes', () => {
    document.body.innerHTML = '<main><section data-role="feature">a</section><section data-role="feature">b</section><a data-role="cta">Go</a></main>';
    const main = document.querySelector('main')!;
    const undo = applyPack('landing', main);
    const [a, b] = Array.from(document.querySelectorAll<HTMLElement>('[data-role="feature"]'));
    expect(a.style.opacity).toBe('0');
    intersect(a);
    intersect(b);
    const reveal = anims.filter((x) => x.el === a || x.el === b);
    expect(reveal.map((x) => x.timing.delay)).toEqual([0, 70]);
    const cta = document.querySelector('[data-role="cta"]')!;
    expect(anims.some((x) => x.el === cta && x.timing.iterations === Infinity)).toBe(true);
    cta.dispatchEvent(new Event('pointerdown'));
    expect(anims.filter((x) => x.el === cta)).toHaveLength(2);
    undo();
    expect(a.style.opacity).toBe('');
  });

  it('countUp counts to the number, keeping its format and an accessible label', async () => {
    const el = mount('<span>$1,299.50</span>');
    countUp(el, 20);
    expect(el.textContent).toBe('$0.00');
    expect(el.getAttribute('aria-label')).toBe('$1,299.50');
    intersect(el);
    await new Promise((r) => setTimeout(r, 120));
    expect(el.textContent).toBe('$1,299.50');
  });

  it('flyToCart flies a ghost into the cart and bumps it', async () => {
    document.body.innerHTML = '<img id="p" alt=""><a id="c">Cart</a>';
    const p = document.getElementById('p')!;
    const c = document.getElementById('c')!;
    const done = flyToCart(p, c);
    const ghost = document.body.lastElementChild as HTMLElement;
    expect(ghost.getAttribute('aria-hidden')).toBe('true');
    expect(ghost.style.position).toBe('fixed');
    anims[0].finish();
    await done;
    expect(ghost.isConnected).toBe(false);
    expect(anims.some((x) => x.el === c)).toBe(true);
  });

  it('<usa-pack> applies its pack; reduced motion leaves content static', () => {
    installComponentMocks({ reducedMotion: true });
    const el = mount<any>('<usa-pack name="dashboard"><div data-role="card">x</div><b data-role="stat">42</b></usa-pack>');
    expect(el.roles).toEqual(['card', 'stat', 'alert', 'action']);
    expect((el.querySelector('[data-role="card"]') as HTMLElement).style.opacity).toBe('');
    expect(el.querySelector('[data-role="stat"]').textContent).toBe('42');
    expect(anims).toHaveLength(0);
  });
});

describe('4.0 deprecation warnings', () => {
  it('sequence(), connectedAnimation() and <usa-flip-list> warn once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    sequence([]);
    sequence([]);
    await connectedAnimation(document.body, document.createElement('div'));
    defineFlipList();
    mount('<usa-flip-list><p>a</p></usa-flip-list>');
    mount('<usa-flip-list><p>b</p></usa-flip-list>');
    const msgs = warn.mock.calls.map((c) => String(c[0]));
    expect(msgs.filter((m) => m.includes('sequence() is deprecated'))).toHaveLength(1);
    expect(msgs.filter((m) => m.includes('connectedAnimation() is deprecated'))).toHaveLength(1);
    expect(msgs.filter((m) => m.includes('<usa-flip-list> is deprecated'))).toHaveLength(1);
    msgs.forEach((m) => expect(m).toContain('upgrading-4.md'));
    warn.mockRestore();
  });
});
