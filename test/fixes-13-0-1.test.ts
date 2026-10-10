// 13.0.1: component contract hotfix — the audit sees every public component (incl. `export const defineX` forms such as
// <usa-modal> / <usa-sheet>), the manifest and the audit agree on the tag set, exemptions are scoped, overlays update
// `label` (and their other attributes) live, and every `usa:*` event is composed so it crosses Shadow DOM boundaries.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { audit, summary, coverage, manifestTags, parseExemptions, RULES, META_RULES } from '../scripts/contract-audit.mjs';
import { buildManifest } from '../scripts/gen-manifest.mjs';
import { installComponentMocks, anims, finishAll } from './components-setup';
import { configureComponents, defineElement } from '../src/components/base';
import { defineWidgets } from '../src/components/widgets';
import { defineDialog } from '../src/components/transitions';
import { runtimeModule } from '../src/components/widgets/runtime-link';

const read = (f: string) => readFileSync(f, 'utf8');
const LITE_LIMIT_13_0_0 = 71680; // 70 KB gzip — never raised

/** A throw-away src/components tree for auditor unit tests. */
function fixture(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'usa-audit-'));
  mkdirSync(join(root, 'src/components/x'), { recursive: true });
  for (const [f, s] of Object.entries(files)) writeFileSync(join(root, 'src/components/x', f), s);
  return root;
}

describe('13.0.1: the auditor recognises every define form', () => {
  it('`export const defineX = (tag = …) => helper(tag, …)` is audited against the helper it delegates to', () => {
    const root = fixture({
      'ov.ts': `function defineThing(tag: string, kind: 'a' | 'b') {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return ['size']; }
    mount(): void { this.str('size'); this.str('label'); this.emit('open', { kind }); }
  });
}
export const defineA = (tag = 'x-aa'): CustomElementConstructor | undefined => defineThing(tag, 'a');
export const defineB = (tag = 'x-bb') => defineThing(tag, 'b');
`,
    });
    const rows = audit(root);
    expect(rows.map((r: any) => r.tag)).toEqual(['x-aa', 'x-bb']);
    for (const r of rows) {
      expect(r.attributes).toEqual(['size']);
      expect(r.events).toEqual(['usa:open']);
      expect(r.findings).toEqual([{ rule: 'attr-unobserved', detail: 'label' }]);
    }
  });
  it('<usa-modal> and <usa-sheet> are in the real audit', () => {
    const tags = audit().map((r: any) => r.tag);
    expect(tags).toContain('usa-modal');
    expect(tags).toContain('usa-sheet');
    const m = audit().find((r: any) => r.tag === 'usa-modal');
    expect(m.file).toBe('src/components/widgets/overlay.ts');
    expect(m.events).toEqual(['usa:open', 'usa:close']);
  });
  it('the manifest scanner sees them too (attributes + events no longer empty)', () => {
    const man = buildManifest();
    const modal = man.components.find((c: any) => c.tag === 'usa-modal');
    const sheet = man.components.find((c: any) => c.tag === 'usa-sheet');
    expect(modal.attributes).toEqual(expect.arrayContaining(['effect', 'label', 'persistent']));
    expect(sheet.attributes).toEqual(expect.arrayContaining(['side', 'label', 'persistent']));
    for (const c of [modal, sheet]) expect(c.events).toEqual(['usa:open', 'usa:close']);
  });
});

describe('13.0.1: manifest tag set == audited tag set', () => {
  it('all 209 public manifest components are audited, and nothing else', () => {
    const tags = manifestTags();
    expect(tags.length).toBe(209);
    const rows = audit();
    expect(coverage(rows, tags)).toEqual({ missing: [], extra: [] });
    expect(rows.map((r: any) => r.tag).sort()).toEqual([...tags].sort());
  });
  it('coverage() names a component the audit missed (and one the manifest lacks)', () => {
    const rows = [{ tag: 'usa-a' }, { tag: 'usa-c' }];
    expect(coverage(rows, ['usa-a', 'usa-b'])).toEqual({ missing: ['usa-b'], extra: ['usa-c'] });
  });
  it('check:contract fails when a manifest component is not audited', () => {
    const src = read('scripts/contract-audit.mjs');
    expect(src).toMatch(/--check[\s\S]*coverage\(rows, manifestTags\(\)\)/);
    expect(src).toContain('not audited');
    const r = spawnSync(process.execPath, ['scripts/contract-audit.mjs', '--check'], { encoding: 'utf8' });
    expect(r.status, r.stdout).toBe(0);
    expect(r.stdout).toContain('209 components');
    expect(r.stdout).toContain('manifest tag set matches');
    // simulate a new public component the auditor cannot see
    const r2 = spawnSync(process.execPath, ['scripts/contract-audit.mjs', '--check'], { encoding: 'utf8', env: { ...process.env, USA_AUDIT_EXTRA_MANIFEST_TAG: 'usa-brand-new' } });
    expect(r2.status).toBe(1);
    expect(r2.stdout).toContain('<usa-brand-new> is in the manifest but not audited');
  });
});

describe('13.0.1: zero non-exempt findings; exemptions are explicit and scoped', () => {
  const rows = audit();
  it('zero findings across all audited components', () => {
    expect(rows.flatMap((r: any) => r.findings.map((f: any) => `<${r.tag}> ${f.rule} ${f.detail}`))).toEqual([]);
    expect(summary(rows).components).toBe(209);
  });
  it('every exemption names its rule, a reason, and (for per-item rules) the exact items it covers', () => {
    for (const r of rows)
      for (const e of r.exempt) {
        expect(RULES[e.rule], `${r.tag} ${e.rule}`).toBeTruthy();
        expect(e.reason.length, `${r.tag} ${e.rule}`).toBeGreaterThan(15);
        if (['attr-unobserved', 'lifecycle-global-listener', 'event-prefix', 'event-bubbles', 'error-prefix'].includes(e.rule)) expect(e.scope?.length, `${r.tag} ${e.rule} must be scoped`).toBeGreaterThan(0);
      }
  });
  it('audit meta-rules are separate from the six contract parts', () => {
    expect(Object.keys(META_RULES).sort()).toEqual(['audit-source', 'exempt-unscoped', 'exempt-unused']);
    for (const k of Object.keys(META_RULES)) expect(RULES[k]).toBeUndefined();
  });
  it('a scoped exemption only masks the items it names', () => {
    expect(parseExemptions("// contract-exempt: attr-unobserved(open, value) — state reflected by the element itself")).toEqual([{ rule: 'attr-unobserved', scope: ['open', 'value'], reason: 'state reflected by the element itself' }]);
    const root = fixture({
      'a.ts': `export function defineA(tag = 'x-aa') {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return []; }
    // contract-exempt: attr-unobserved(open) — state reflected by the element itself, set the property
    mount(): void { this.flag('open'); this.str('label'); }
  });
}`,
    });
    const [row] = audit(root);
    expect(row.findings).toEqual([{ rule: 'attr-unobserved', detail: 'label' }]);
  });
  it('an unscoped per-item exemption is itself a finding; an exemption that masks nothing is a finding', () => {
    const root = fixture({
      'a.ts': `export function defineA(tag = 'x-aa') {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return ['label']; }
    // contract-exempt: attr-unobserved — blanket exemptions would hide real bugs like label
    mount(): void { this.str('label'); }
  });
}
export function defineB(tag = 'x-bb') {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return []; }
    // contract-exempt: reduced-motion — nothing animates here so this exemption is stale
    mount(): void {}
  });
}`,
    });
    const rows2 = audit(root);
    expect(rows2.find((r: any) => r.tag === 'x-aa').findings.map((f: any) => f.rule)).toContain('exempt-unscoped');
    expect(rows2.find((r: any) => r.tag === 'x-bb').findings).toEqual([{ rule: 'exempt-unused', detail: 'reduced-motion' }]);
  });
  it("an exemption in one element's source never applies to another element in the same file", () => {
    const root = fixture({
      'two.ts': `export function defineA(tag = 'x-aa') {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return []; }
    // contract-exempt: attr-unobserved(label) — fixture: A really reads label only once, on purpose
    mount(): void { this.str('label'); }
  });
}
export function defineB(tag = 'x-bb') {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return []; }
    mount(): void { this.str('label'); }
  });
}`,
    });
    const rows2 = audit(root);
    expect(rows2.find((r: any) => r.tag === 'x-aa').findings).toEqual([]);
    expect(rows2.find((r: any) => r.tag === 'x-bb').findings).toEqual([{ rule: 'attr-unobserved', detail: 'label' }]);
  });
});

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.useRealTimers();
  configureComponents({ reducedMotion: 'user' });
});
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('13.0.1: <usa-modal> / <usa-sheet> dynamic attributes', () => {
  for (const tag of ['usa-modal', 'usa-sheet']) {
    it(`<${tag}> observes label and updates the dialog's accessible name in place`, () => {
      const C = customElements.get(tag) as any;
      expect(C.observedAttributes).toEqual(expect.arrayContaining(['label', 'persistent']));
      document.body.innerHTML = `<${tag} label="Cart"><p>x</p></${tag}>`;
      const el = document.querySelector(tag) as any;
      const dlg = el.querySelector('dialog');
      expect(dlg.getAttribute('aria-label')).toBe('Cart');
      el.setAttribute('label', 'Basket');
      expect(dlg.getAttribute('aria-label')).toBe('Basket');
      el.removeAttribute('label');
      expect(dlg.getAttribute('aria-label')).toBe(tag === 'usa-modal' ? 'Dialog' : 'Panel');
      expect(el.querySelectorAll('dialog').length).toBe(1);
    });
    it(`<${tag}> stays open (no silent close, same dialog) when label / persistent change while open`, () => {
      document.body.innerHTML = `<${tag} label="A"><button>ok</button></${tag}>`;
      const el = document.querySelector(tag) as any;
      const dlg = el.querySelector('dialog');
      const closed = vi.fn();
      el.addEventListener('usa:close', closed);
      el.show();
      el.setAttribute('label', 'B');
      el.setAttribute('persistent', '');
      expect(el.opened).toBe(true);
      expect(dlg.open).toBe(true);
      expect(el.querySelector('dialog')).toBe(dlg);
      expect(closed).not.toHaveBeenCalled();
      // persistent now applies: Esc (cancel) is ignored
      dlg.dispatchEvent(new Event('cancel', { cancelable: true }));
      expect(el.opened).toBe(true);
      el.removeAttribute('persistent');
      dlg.dispatchEvent(new Event('cancel', { cancelable: true }));
      anims.forEach((a) => a.finish());
    });
  }
  it('aria-labelledby wins over label (never overwritten)', () => {
    document.body.innerHTML = '<usa-modal label="A"><p>x</p></usa-modal>';
    const el = document.querySelector('usa-modal') as any;
    const dlg = el.querySelector('dialog');
    dlg.removeAttribute('aria-label');
    dlg.setAttribute('aria-labelledby', 'h');
    el.setAttribute('label', 'B');
    expect(dlg.hasAttribute('aria-label')).toBe(false);
  });
  it('<usa-modal effect> and <usa-sheet side> change in place while open', () => {
    document.body.innerHTML = '<usa-modal effect="scale"><p>x</p></usa-modal><usa-sheet side="right"><p>y</p></usa-sheet>';
    const m = document.querySelector('usa-modal') as any;
    const s = document.querySelector('usa-sheet') as any;
    m.show();
    s.show();
    m.setAttribute('effect', 'flip');
    s.setAttribute('side', 'bottom');
    expect(m.dataset.effect).toBe('flip');
    expect(s.dataset.side).toBe('bottom');
    expect(s.querySelector('.usa-ov-grab[data-handle]')).toBeTruthy();
    expect(m.opened && s.opened).toBe(true);
    s.setAttribute('side', 'nope');
    expect(s.dataset.side).toBe('right');
    expect(s.querySelector('.usa-ov-grab')).toBeNull();
  });
});

describe('13.0.1: usa:* events are composed and cross Shadow DOM boundaries', () => {
  /** document > outer-host #shadow > inner-host #shadow > el */
  function nest(el: Element): { outer: HTMLElement; inner: HTMLElement } {
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    outer.attachShadow({ mode: 'open' }).append(inner);
    inner.attachShadow({ mode: 'open' }).append(el);
    document.body.append(outer);
    return { outer, inner };
  }

  it('base emit() dispatches bubbles: true, composed: true, cancelable: true', () => {
    defineElement('x-emitter-1301', (Base) => class extends Base { fire(): boolean { return this.emit('ping', { n: 1 }); } } as unknown as CustomElementConstructor);
    const el = document.createElement('x-emitter-1301') as any;
    const { outer, inner } = nest(el);
    const seen: string[] = [];
    let ev: CustomEvent | null = null;
    let path: EventTarget[] = [];
    document.addEventListener('usa:ping', (e) => { ev = e as CustomEvent; path = e.composedPath(); seen.push('document'); }, { once: true });
    outer.addEventListener('usa:ping', () => seen.push('outer'));
    inner.addEventListener('usa:ping', () => seen.push('inner'));
    expect(el.fire()).toBe(true);
    expect(seen).toEqual(['inner', 'outer', 'document']);
    expect(ev!.bubbles && ev!.composed && ev!.cancelable).toBe(true);
    expect(ev!.detail).toEqual({ n: 1 });
    expect(ev!.target).toBe(outer); // retargeted at the outermost host when seen from the document
    expect(path[0]).toBe(el); // open shadow roots: the full path from the element out to the window
    expect(path).toContain(inner);
    expect(path).toContain(outer);
  });

  it('<usa-modal> usa:open / usa:close reach the document from two shadow roots deep with their detail shapes', async () => {
    const el = document.createElement('usa-modal') as any;
    el.innerHTML = '<button data-usa-close="ok">OK</button>';
    nest(el);
    const trigger = document.createElement('button');
    document.body.append(trigger);
    const got: Record<string, any> = {};
    document.addEventListener('usa:open', (e) => (got.open = (e as CustomEvent).detail), { once: true });
    document.addEventListener('usa:close', (e) => (got.close = (e as CustomEvent).detail), { once: true });
    el.show(trigger);
    expect(got.open).toEqual({ trigger });
    el.querySelector('[data-usa-close]').click();
    anims.forEach((a) => a.finish());
    await flush();
    expect(got.close).toEqual({ value: 'ok' });
  });

  it('<usa-sheet> events cross a closed shadow root too', () => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'closed' });
    const el = document.createElement('usa-sheet') as any;
    root.append(el);
    document.body.append(host);
    const opened = vi.fn();
    document.body.addEventListener('usa:open', (e) => opened((e as CustomEvent).detail));
    el.show();
    expect(opened).toHaveBeenCalledWith({ trigger: null });
  });

  it('<usa-dialog> (which has its own shadow root) composes usa:open / usa:beforeclose / usa:close', async () => {
    defineDialog();
    const el = document.createElement('usa-dialog') as any;
    nest(el);
    const got: Record<string, any> = {};
    for (const t of ['open', 'beforeclose', 'close']) document.addEventListener(`usa:${t}`, (e) => (got[t] = (e as CustomEvent).detail ?? null), { once: true });
    const p1 = el.show();
    await finishAll();
    await p1;
    const p2 = el.close('done');
    await finishAll();
    await p2;
    expect('open' in got).toBe(true);
    expect(got.beforeclose).toEqual({ returnValue: 'done' });
    expect(got.close).toEqual({ returnValue: 'done' });
  });

  it('usa:runtime-missing is composed as well', () => {
    const host = document.createElement('div');
    nest(host);
    const seen = vi.fn();
    document.addEventListener('usa:runtime-missing', (e) => seen((e as CustomEvent).detail.module), { once: true });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    runtimeModule(host, 'definitely-not-loaded-1301');
    expect(seen).toHaveBeenCalledWith('definitely-not-loaded-1301');
  });

  it('every dispatch of a usa:* event on an element in src/ is composed', () => {
    const offenders: string[] = [];
    const walk = (d: string): string[] =>
      readdirSync(d, { withFileTypes: true }).flatMap((f: any) => (f.isDirectory() ? walk(join(d, f.name)) : f.name.endsWith('.ts') ? [join(d, f.name)] : []));
    for (const f of walk('src')) {
      const s = read(f);
      for (const m of s.matchAll(/^(.*)new CustomEvent(?:<[^>]*>)?\(\s*['`](usa:[^'`]*)['`]([^;\n]{0,200})/gm))
        if (!/\b(document|window)\.dispatchEvent\($/.test(m[1]) && !/composed:\s*true/.test(m[3])) offenders.push(`${f}: ${m[2]}`);
    }
    expect(offenders).toEqual([]);
    expect(read('src/components/base.ts')).toMatch(/new CustomEvent\(`usa:\$\{type\}`, \{ detail, bubbles: true, composed: true, cancelable: true \}\)/);
  });
});

describe('13.0.1: event detail shapes are specified', () => {
  const specOf = () => JSON.parse(read('test/fixtures/event-details-13.json'));
  const rows = audit();
  it('every audited component event has a specified detail shape, and the source matches the spec', () => {
    const actual: Record<string, Record<string, string[]>> = {};
    for (const r of rows) if (Object.keys(r.eventDetails).length) actual[r.tag] = r.eventDetails;
    expect(actual).toEqual(specOf().components);
  });
  it('every event the audit lists has a shape entry', () => {
    for (const r of rows) for (const e of r.events) expect(r.eventDetails?.[e], `<${r.tag}> ${e}`).toBeTruthy();
  });
  it('details are object literals or absent (detail: null) — never a bare primitive', () => {
    for (const [tag, evs] of Object.entries<Record<string, string[]>>(specOf().components))
      for (const [ev, shapes] of Object.entries(evs)) for (const s of shapes) expect(s, `<${tag}> ${ev}`).toMatch(/^(\(none\)|\{.*\}|object: .+)$/);
  });
});

describe('13.0.1: release wiring', () => {
  it('CHANGELOG documents composed: true as a fix with its behavioural note; budgets untouched', () => {
    const cl = read('CHANGELOG.md');
    const sec = cl.slice(cl.indexOf('## [13.0.1]'), cl.indexOf('## [13.0.0]'));
    expect(sec).toContain('### Fixed');
    expect(sec).toContain('composed: true');
    expect(sec).toMatch(/[Bb]ehaviou?r/);
    const lite = JSON.parse(read('size-budget.json')).find((b: any) => b.name === "import 'motionary/components/lite'");
    expect(lite.limit).toBe(LITE_LIMIT_13_0_0);
  });
});
