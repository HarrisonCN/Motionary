// 14.8.0 — templates & extension ecosystem (`motionary/studio/templates` = `motionary/components/studio-templates`):
// a `motionary-template` v1 file = a manifest (id, name, version, SPDX license, author, required modules, token theme,
// preview time) + a 14.5 studio pack + a SHA-256 integrity value (+ an optional Ed25519 publisher signature).
// Install = ONE undo step with prefixed ids; uninstall removes exactly what was installed, so the serialized project
// is byte-identical to the one before the install. Size / count limits, script files, out-of-project paths and
// integrity / signature failures are refused and leave the project unchanged. Preview = the 14.7 standalone export,
// one inline file without scripts (CSS only) for a sandboxed iframe.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash, webcrypto } from 'node:crypto';
import {
  STUDIO_TEMPLATES_VERSION, TEMPLATE_FORMAT, TEMPLATE_LIMITS, TEMPLATE_META_KEY, sha256, templateIntegrity, createTemplate, serializeTemplate,
  parseTemplate, verifyTemplate, signTemplate, templateInfo, installTemplate, uninstallTemplate, installedTemplates,
  previewTemplate,
} from '../src/components/studio/templates';
import { createTimelineDoc, createTimelineHistory, sampleTimelineDoc } from '../src/components/timeline/editor/index';
import { serializeStudioProject } from '../src/components/studio/index';
import { packStudioProject, toBase64 } from '../src/components/studio/assets';
import { frameDigest } from '../src/components/studio/export';
import type { TimelineDoc } from '../src/components/timeline/editor/index';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8')) as { name: string; import?: string; limit: number }[];
const prevBudgets = JSON.parse(readFileSync('test/fixtures/size-budget-14-7-0.json', 'utf8')) as typeof budgets;
const SRC = readFileSync('src/components/studio/templates.ts', 'utf8');
const enc = (s: string) => new TextEncoder().encode(s);
const PNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]);

const tplDoc = (): TimelineDoc => createTimelineDoc({
  name: 'fade-up', seed: 4,
  layers: [
    { id: 'g', type: 'group', name: 'Hero' },
    { id: 'title', type: 'track', parent: 'g', target: '#title', keyframes: [
      { id: 'k1', time: 0, props: { opacity: 0, transform: 'translateY(24px)' }, easing: 'ease-out' },
      { id: 'k2', time: 400, props: { opacity: 1, transform: 'translateY(0px)' } },
    ] },
    { id: 'bg', type: 'track', target: '#bg', keyframes: [
      { id: 'k3', time: 0, props: { 'background-image': 'url("img/dot.png")', opacity: 0.5 } },
      { id: 'k4', time: 400, props: { opacity: 1 } },
    ] },
  ],
});
const MANIFEST = { id: 'fade-up', name: 'Fade up hero', version: '1.2.0', license: 'MIT', author: 'Motionary', description: 'Title fades up over a dotted background.', requires: ['motionary/studio'], preview: { time: 200 } };
const tpl = () => createTemplate({ doc: tplDoc() }, { manifest: MANIFEST, assets: { 'img/dot.png': PNG } });
const hostDoc = (extra: Partial<TimelineDoc> = {}): TimelineDoc => createTimelineDoc({
  name: 'my page', seed: 9, duration: 300, ...extra,
  layers: [
    { id: 'title', type: 'track', target: 'h1', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 300, props: { opacity: 1 } }] },
    { id: 'locked', type: 'track', target: '.x', locked: true, keyframes: [{ id: 'z', time: 0, props: { color: 'red' } }] },
  ],
});
const bytes = (doc: TimelineDoc) => serializeStudioProject(doc, {}, 2);
const rehash = (t: any) => { const c = JSON.parse(JSON.stringify(t)); delete c.signature; c.integrity = templateIntegrity(c); return c; };

describe('14.8 entry, version and budget', () => {
  it('ships motionary/studio/templates (= motionary/components/studio-templates) with zero runtime dependencies', () => {
    expect(pkg.version).toMatch(/^14\.([8-9]|\d\d)\.\d+$/);
    expect(STUDIO_TEMPLATES_VERSION).toBe(1);
    expect(TEMPLATE_FORMAT).toBe('motionary-template');
    for (const p of ['./studio/templates', './components/studio-templates']) expect(pkg.exports[p]?.import?.default).toBe('./dist/components/studio-templates.js');
    expect(pkg.dependencies ?? {}).toEqual({});
  });
  it('has its own budget line, never raises a 14.7.0 line, lite stays ≤ 70 KB and studio/templates stays out of lite / core / motion / studio / export', () => {
    const line = budgets.find((b) => b.import?.includes("pkg/components/studio-templates'"));
    expect(line).toBeTruthy();
    expect(line!.limit).toBeLessThanOrEqual(20480);
    for (const b of prevBudgets) {
      const now = budgets.find((x) => x.name === b.name);
      expect(now, b.name).toBeTruthy();
      expect(now!.limit, b.name).toBeLessThanOrEqual(b.limit);
    }
    const lite = budgets.find((b) => /components\/lite'/.test(b.import || ''));
    expect(lite!.limit).toBeLessThanOrEqual(71680);
    for (const f of ['lite', 'core/index', 'motion/index', 'studio/index', 'studio/assets', 'studio/ai', 'studio/export']) expect(readFileSync(`src/components/${f}.ts`, 'utf8')).not.toMatch(/studio\/templates|from '\.\/templates'/);
  });
  it('the template module never evaluates, fetches or touches the DOM', () => {
    expect(SRC).not.toMatch(/\beval\(|new Function|import\(|fetch\(|XMLHttpRequest|WebSocket|require\(|node:|innerHTML|document\.|window\./);
  });
});

describe('sha256 (pure JS, sync) — FIPS 180-4 vectors and node:crypto', () => {
  it('matches the standard vectors and node:crypto on random sizes', () => {
    const hex = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    expect(hex(sha256(enc('')))).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(hex(sha256(enc('abc')))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(hex(sha256(enc('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')))).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
    for (const n of [55, 56, 63, 64, 65, 1000, 4097]) {
      const b = new Uint8Array(n).map((_, i) => (i * 31 + n) & 255);
      expect(hex(sha256(b)), String(n)).toBe(createHash('sha256').update(b).digest('hex'));
    }
  });
});

describe('createTemplate / serializeTemplate / parseTemplate', () => {
  it('creates a deterministic template: manifest, 14.5 pack with the assets, sha256- integrity over manifest + pack', () => {
    const t = tpl();
    expect(t.format).toBe(TEMPLATE_FORMAT);
    expect(t.version).toBe(1);
    expect(t.manifest).toEqual({ ...MANIFEST });
    expect(t.integrity).toMatch(/^sha256-[A-Za-z0-9+/]{43}=$/);
    expect(typeof t.pack).toBe('string');
    expect(JSON.parse(t.pack).format).toBe('motionary-studio-pack');
    expect(JSON.parse(t.pack).files.map((f: any) => f.path)).toEqual(['img/dot.png']);
    expect(serializeTemplate(t)).toBe(serializeTemplate(tpl()));
    expect(serializeTemplate(t).endsWith('\n')).toBe(true);
    // integrity is independent of manifest key order (canonical JSON)
    const re = createTemplate({ doc: tplDoc() }, { manifest: { preview: { time: 200 }, requires: ['motionary/studio'], description: MANIFEST.description, author: 'Motionary', license: 'MIT', version: '1.2.0', name: 'Fade up hero', id: 'fade-up' }, assets: { 'img/dot.png': PNG } });
    expect(re.integrity).toBe(t.integrity);
  });
  it('round-trips through text: parseTemplate gives the same template, its info, the document and the files', () => {
    const r = parseTemplate(serializeTemplate(tpl()));
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.template!.integrity).toBe(tpl().integrity);
    expect(r.doc!.layers.map((l) => l.id)).toEqual(['g', 'title', 'bg']);
    expect([...r.files!.keys()]).toEqual(['img/dot.png']);
    expect(r.info).toMatchObject({ id: 'fade-up', name: 'Fade up hero', version: '1.2.0', license: 'MIT', author: 'Motionary', requires: ['motionary/studio'], layers: 3, files: 1, duration: 400 });
    expect(parseTemplate(tpl()).ok).toBe(true);
  });
  it('createTemplate refuses a bad manifest (id, semver, SPDX license, requires) and missing / script assets', () => {
    const bad = (m: any) => () => createTemplate({ doc: tplDoc() }, { manifest: { ...MANIFEST, ...m }, assets: { 'img/dot.png': PNG } });
    expect(bad({ id: 'Bad Id!' })).toThrow(/id/);
    expect(bad({ version: '1.2' })).toThrow(/version/);
    expect(bad({ license: 'MIT; rm -rf' })).toThrow(/license/);
    expect(bad({ license: '' })).toThrow(/license/);
    expect(bad({ requires: ['lodash'] })).toThrow(/requires/);
    expect(bad({ name: '' })).toThrow(/name/);
    expect(() => createTemplate({ doc: tplDoc() }, { manifest: MANIFEST })).toThrow(/missing/);
    const sdoc = createTimelineDoc({ layers: [{ id: 's', type: 'track', target: '#s', keyframes: [{ id: 'a', time: 0, props: { '--src': 'run.js' } }] }] });
    expect(() => createTemplate({ doc: sdoc }, { manifest: MANIFEST, assets: { 'run.js': enc('alert(1)') } })).toThrow(/script/);
    for (const l of ['MIT', 'Apache-2.0', 'CC-BY-4.0', 'MIT OR Apache-2.0', 'GPL-2.0-only WITH Classpath-exception-2.0', 'LicenseRef-Acme-1', 'UNLICENSED']) expect(bad({ license: l }), l).not.toThrow();
  });
});

describe('refused templates (malicious or broken) — reason codes, nothing changes', () => {
  const reasons = (input: unknown) => parseTemplate(input as any).errors.map((e) => e.reason);
  it('integrity mismatch: a changed manifest, a changed pack or a changed integrity value', () => {
    const t = tpl();
    expect(reasons({ ...t, manifest: { ...t.manifest, license: 'Apache-2.0' } })).toContain('integrity');
    const p = JSON.parse(t.pack); p.project.scene.layers[1].keyframes[0].props.opacity = 0.9;
    expect(reasons({ ...t, pack: JSON.stringify(p) + '\n' })).toContain('integrity');
    expect(reasons({ ...t, integrity: 'sha256-' + 'A'.repeat(43) + '=' })).toContain('integrity');
    expect(reasons({ ...t, integrity: 'md5-abc' })).toContain('integrity');
  });
  it('script files and out-of-project paths in the pack (even with a correct integrity value)', () => {
    const t = tpl(), p = JSON.parse(t.pack);
    const withFile = (path: string, data = enc('x')) => {
      const q = JSON.parse(JSON.stringify(p));
      q.files.push({ path, kind: 'other', bytes: data.length, crc32: 0, data: toBase64(data) });
      return rehash({ ...t, pack: JSON.stringify(q) + '\n' });
    };
    expect(reasons(withFile('evil.js'))).toContain('script');
    expect(reasons(withFile('page.html'))).toContain('script');
    expect(reasons(withFile('../../etc/passwd'))).toContain('path');
    expect(reasons(withFile('/abs.png'))).toContain('path');
    const crc = JSON.parse(JSON.stringify(p)); crc.files[0].crc32 = 1;
    expect(reasons(rehash({ ...t, pack: JSON.stringify(crc) + '\n' }))).toContain('pack');
  });
  it('limits: text size, layers, files, file bytes, tokens size, requires count', () => {
    expect(reasons('x'.repeat(TEMPLATE_LIMITS.textBytes + 1))).toContain('size');
    const many = createTimelineDoc({ layers: Array.from({ length: TEMPLATE_LIMITS.layers + 1 }, (_, i) => ({ id: 'l' + i, type: 'track' as const, target: '#a', keyframes: [] })) });
    const t = tpl();
    const big = rehash({ ...t, pack: packStudioProject({ doc: many }, {}).text });
    expect(reasons(big)).toContain('limit');
    const p = JSON.parse(t.pack);
    p.files = Array.from({ length: TEMPLATE_LIMITS.files + 1 }, (_, i) => ({ ...p.files[0], path: `img/${i}.png` }));
    expect(reasons(rehash({ ...t, pack: JSON.stringify(p) + '\n' }))).toContain('limit');
    expect(reasons(rehash({ ...t, manifest: { ...t.manifest, tokens: { blob: 'x'.repeat(TEMPLATE_LIMITS.tokensBytes) } } }))).toContain('tokens');
    expect(reasons(rehash({ ...t, manifest: { ...t.manifest, requires: Array.from({ length: TEMPLATE_LIMITS.requires + 1 }, (_, i) => `motionary/x${i}`) } }))).toContain('requires');
    expect(TEMPLATE_LIMITS.fileBytes).toBeLessThanOrEqual(5e6);
  });
  it('not a template / bad JSON / wrong version / prototype keys', () => {
    expect(reasons('{nope')).toContain('json');
    expect(reasons({ format: 'motionary-studio-pack', version: 1 })).toContain('format');
    expect(reasons({ ...tpl(), version: 2 })).toContain('format');
    expect(reasons(JSON.parse('{"format":"motionary-template","version":1,"__proto__":{"x":1}}'))).not.toEqual([]);
    expect(parseTemplate(null as any).ok).toBe(false);
    expect(() => parseTemplate(42 as any)).not.toThrow();
  });
});

describe('verifyTemplate: integrity + optional Ed25519 publisher signature (WebCrypto)', () => {
  it('signed by a trusted key → valid; a different key, a changed template or no signature are told apart', async () => {
    const subtle = webcrypto.subtle as unknown as SubtleCrypto;
    const kp = await subtle.generateKey({ name: 'Ed25519' } as any, true, ['sign', 'verify']) as CryptoKeyPair;
    const other = await subtle.generateKey({ name: 'Ed25519' } as any, true, ['sign', 'verify']) as CryptoKeyPair;
    const raw = toBase64(new Uint8Array(await subtle.exportKey('raw', kp.publicKey)));
    const rawOther = toBase64(new Uint8Array(await subtle.exportKey('raw', other.publicKey)));
    const s = await signTemplate(tpl(), kp.privateKey, 'motionary-2026');
    expect(s.signature).toMatchObject({ alg: 'Ed25519', keyId: 'motionary-2026' });
    expect(parseTemplate(serializeTemplate(s)).ok).toBe(true);
    expect(await verifyTemplate(s, { keys: { 'motionary-2026': raw } })).toMatchObject({ ok: true, integrity: true, signature: 'valid' });
    expect(await verifyTemplate(s, { keys: { 'motionary-2026': rawOther } })).toMatchObject({ ok: false, signature: 'invalid' });
    expect(await verifyTemplate(s, { keys: { someone: raw } })).toMatchObject({ ok: true, signature: 'untrusted' });
    expect(await verifyTemplate(s, { keys: { someone: raw }, requireSignature: true })).toMatchObject({ ok: false, signature: 'untrusted' });
    expect(await verifyTemplate(tpl(), {})).toMatchObject({ ok: true, integrity: true, signature: 'missing' });
    expect(await verifyTemplate(tpl(), { requireSignature: true })).toMatchObject({ ok: false, signature: 'missing' });
    const changed = { ...s, manifest: { ...s.manifest, name: 'Other' } };
    expect(await verifyTemplate(changed, { keys: { 'motionary-2026': raw } })).toMatchObject({ ok: false, integrity: false });
    // a re-hashed change keeps a matching integrity value but the publisher signature no longer verifies
    const forged = { ...rehash(changed), signature: s.signature };
    expect(await verifyTemplate(forged, { keys: { 'motionary-2026': raw } })).toMatchObject({ ok: false, integrity: true, signature: 'invalid' });
    // a CryptoKey works as well as raw base64
    expect(await verifyTemplate(s, { keys: { 'motionary-2026': kp.publicKey } })).toMatchObject({ ok: true, signature: 'valid' });
  });
});

describe('templateInfo: license and required modules visible before install', () => {
  it('lists requires and which are missing for the given available modules', () => {
    const i = templateInfo(tpl(), { available: ['motionary/studio/export'] });
    expect(i).toMatchObject({ id: 'fade-up', version: '1.2.0', license: 'MIT', requires: ['motionary/studio'], missing: ['motionary/studio'] });
    expect(templateInfo(tpl(), { available: ['motionary/studio', 'motionary/studio/templates'] }).missing).toEqual([]);
    expect(templateInfo(tpl()).missing).toEqual([]);
  });
});

describe('installTemplate / uninstallTemplate: one undo step, prefixed ids, byte-identical restore', () => {
  it('installs as ONE undo step: layers appended with prefixed layer / keyframe / parent ids, assets under templates/<id>/, a meta record', () => {
    const h = createTimelineHistory(hostDoc());
    const before = bytes(h.doc), size = h.size;
    const r = installTemplate(h, tpl());
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
    expect(h.size).toBe(size + 1);
    expect(h.undoLabel).toMatch(/fade-up@1\.2\.0/);
    const ids = h.doc.layers.map((l) => l.id);
    expect(ids).toEqual(['title', 'locked', 'fade-up--g', 'fade-up--title', 'fade-up--bg']);
    const t = h.doc.layers.find((l) => l.id === 'fade-up--title')!;
    expect(t.parent).toBe('fade-up--g');
    expect(t.keyframes!.map((k) => k.id)).toEqual(['fade-up--k1', 'fade-up--k2']);
    const bg = h.doc.layers.find((l) => l.id === 'fade-up--bg')!;
    expect(bg.keyframes![0].props['background-image']).toBe('url("templates/fade-up/img/dot.png")');
    expect([...r.files.keys()]).toEqual(['templates/fade-up/img/dot.png']);
    expect(r.files.get('templates/fade-up/img/dot.png')).toEqual(PNG);
    // the host's explicit duration (300) is extended to cover the template (400) and restored on uninstall
    expect(h.doc.duration).toBe(400);
    expect(installedTemplates(h.doc)).toEqual([expect.objectContaining({ id: 'fade-up', version: '1.2.0', license: 'MIT', prefix: 'fade-up--', layers: ['fade-up--g', 'fade-up--title', 'fade-up--bg'], files: ['templates/fade-up/img/dot.png'] })]);
    expect((h.doc.meta as any)[TEMPLATE_META_KEY]).toBeTruthy();
    // untouched host layers are the same objects (nothing else changed)
    expect(h.doc.layers[1].locked).toBe(true);
    // the installed layers play like the template (same values at the same time, ids prefixed)
    const tf = sampleTimelineDoc(tplDoc(), 200), hf = sampleTimelineDoc(h.doc, 200);
    expect(hf.layers['fade-up--title']).toEqual(tf.layers.title);
    h.undo();
    expect(bytes(h.doc)).toBe(before);
  });
  it('uninstall removes exactly what was installed: the serialized project is byte-identical to before the install', () => {
    for (const host of [hostDoc(), hostDoc({ duration: undefined }), hostDoc({ meta: { author: 'me', tags: ['a'] } })]) {
      const h = createTimelineHistory(host);
      const before = bytes(h.doc), json = JSON.stringify(h.doc);
      expect(installTemplate(h, tpl()).ok).toBe(true);
      const u = uninstallTemplate(h, 'fade-up');
      expect(u.ok).toBe(true);
      expect(u.removed).toEqual(['fade-up--g', 'fade-up--title', 'fade-up--bg']);
      expect(u.files).toEqual(['templates/fade-up/img/dot.png']);
      expect(bytes(h.doc)).toBe(before);
      expect(JSON.stringify(h.doc)).toBe(json);
      expect(frameDigest(h.doc)).toBe(frameDigest(host));
      expect(installedTemplates(h.doc)).toEqual([]);
      // uninstall is one undo step too
      h.undo();
      expect(installedTemplates(h.doc).map((x) => x.id)).toEqual(['fade-up']);
    }
  });
  it('two templates, uninstalled in either order, still restore the original bytes', () => {
    const second = createTemplate({ doc: createTimelineDoc({ layers: [{ id: 'dot', type: 'track', target: '.dot', keyframes: [{ id: 'a', time: 0, props: { opacity: 0 } }, { id: 'b', time: 100, props: { opacity: 1 } }] }] }) }, { manifest: { id: 'dots', name: 'Dots', version: '0.1.0', license: 'Apache-2.0', requires: [] } });
    for (const order of [['fade-up', 'dots'], ['dots', 'fade-up']]) {
      const h = createTimelineHistory(hostDoc());
      const before = bytes(h.doc);
      expect(installTemplate(h, tpl()).ok).toBe(true);
      expect(installTemplate(h, second).ok).toBe(true);
      expect(installedTemplates(h.doc).map((x) => x.id)).toEqual(['fade-up', 'dots']);
      for (const id of order) expect(uninstallTemplate(h, id).ok).toBe(true);
      expect(bytes(h.doc)).toBe(before);
    }
  });
  it('refuses (project unchanged, no undo step): an invalid template, an id conflict, the same template twice, missing required modules, non-object meta', () => {
    const h = createTimelineHistory(hostDoc());
    const before = bytes(h.doc), size = h.size;
    const t = tpl();
    const bad = { ...t, manifest: { ...t.manifest, name: 'changed' } };
    expect(installTemplate(h, bad as any).errors.map((e) => e.reason)).toContain('integrity');
    expect(installTemplate(h, t, { prefix: '' }).errors.map((e) => e.reason)).toContain('conflict'); // 'title' already exists
    expect(installTemplate(h, t, { available: ['motionary/studio/export'] }).errors.map((e) => e.reason)).toContain('requires');
    expect(bytes(h.doc)).toBe(before);
    expect(h.size).toBe(size);
    expect(installTemplate(h, t).ok).toBe(true);
    expect(installTemplate(h, t).errors.map((e) => e.reason)).toContain('installed');
    expect(uninstallTemplate(h, 'nope').errors.map((e) => e.reason)).toContain('not-installed');
    const h2 = createTimelineHistory(hostDoc({ meta: ['x'] }));
    const b2 = bytes(h2.doc);
    expect(installTemplate(h2, t).errors.map((e) => e.reason)).toContain('meta');
    expect(bytes(h2.doc)).toBe(b2);
  });
  it('options: a custom prefix and a time offset (`at`); solo is dropped with a warning', () => {
    const soloDoc = createTimelineDoc({ layers: [{ id: 's', type: 'track', target: '#s', solo: true, keyframes: [{ id: 'a', time: 0, props: { opacity: 0 } }, { id: 'b', time: 100, props: { opacity: 1 } }] }] });
    const t = createTemplate({ doc: soloDoc }, { manifest: { id: 'solo', name: 'Solo', version: '1.0.0', license: 'MIT', requires: [] } });
    const h = createTimelineHistory(hostDoc());
    const r = installTemplate(h, t, { prefix: 'x-', at: 1000 });
    expect(r.ok).toBe(true);
    const l = h.doc.layers.find((x) => x.id === 'x-s')!;
    expect(l.solo).toBeUndefined();
    expect(l.keyframes!.map((k) => k.time)).toEqual([1000, 1100]);
    expect(h.doc.duration).toBe(1100);
    expect(r.warnings.join(' ')).toMatch(/solo/);
    expect(installTemplate(createTimelineHistory(hostDoc()), t, { prefix: 'bad prefix!' }).errors.map((e) => e.reason)).toContain('prefix');
  });
});

describe('previewTemplate: the 14.7 export as one inline file without scripts, frozen at the preview time', () => {
  it('returns srcdoc HTML (no <script>), sandbox "" and the export report; the same template gives the same bytes', () => {
    const p = previewTemplate(tpl());
    expect(p.sandbox).toBe('');
    expect(p.time).toBe(200);
    expect(p.html).not.toMatch(/<script/i);
    expect(p.html).toContain('data:image/png;base64,');
    expect(p.html).toMatch(/animation-play-state: paused !important/);
    expect(p.html).toMatch(/animation-delay: -200ms !important/);
    expect(p.report.ok).toBe(true);
    expect(p.report.digest).toBe(frameDigest(tplDoc()));
    expect(previewTemplate(tpl()).html).toBe(p.html);
    expect(previewTemplate(tpl(), { time: 0 }).html).toMatch(/animation-delay: -0ms !important/);
    expect(previewTemplate(tpl(), { time: null }).html).not.toMatch(/paused !important/);
  });
  it('refuses to preview an invalid template', () => {
    const t = tpl();
    expect(() => previewTemplate({ ...t, integrity: 'sha256-x' } as any)).toThrow(/integrity/);
  });
});

describe('starter templates shipped in the package (templates/*.motionary-template.json)', () => {
  it('every shipped template parses, verifies its integrity, installs and uninstalls byte-identically', () => {
    expect(pkg.files).toContain('templates');
    const files = readdirSync('templates').filter((f) => f.endsWith('.motionary-template.json'));
    expect(files.length).toBeGreaterThanOrEqual(3);
    for (const f of files) {
      const r = parseTemplate(readFileSync(`templates/${f}`, 'utf8'));
      expect(r.errors, f).toEqual([]);
      expect(f).toBe(`${r.info!.id}.motionary-template.json`);
      expect(r.info!.license).toBe('MIT');
      const h = createTimelineHistory(hostDoc());
      const before = bytes(h.doc);
      expect(installTemplate(h, r.template!).ok, f).toBe(true);
      expect(uninstallTemplate(h, r.info!.id).ok).toBe(true);
      expect(bytes(h.doc)).toBe(before);
    }
    expect(existsSync('templates/index.json')).toBe(true);
    const index = JSON.parse(readFileSync('templates/index.json', 'utf8'));
    expect(index.templates.map((t: any) => t.file).sort()).toEqual(files.sort());
  });
});
