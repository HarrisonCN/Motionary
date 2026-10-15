// 15.5 team projects & assets: motionary/studio/store — a ProjectStore adapter interface (memory / IndexedDB / your own
// HTTP backend; Motionary ships no server), revision history, optimistic-concurrency conflict detection, a layer-level
// three-way merge for edits that do not overlap, and the bridge to createStudioApp's storage option.
import { describe, it, expect } from 'vitest';
import {
  STUDIO_STORE_VERSION, StoreError, createMemoryProjectStore, createHttpProjectStore, toAppStorage, detectConflict, mergeProjects, contentTag,
} from '../src/components/studio/store';

const proj = (layers: Array<{ id: string; o?: number }>) => JSON.stringify({
  format: 'motionary-studio', version: 1, studio: {},
  scene: { format: 'motionary-scene', version: 2, duration: 500, layers: layers.map((l) => ({ id: l.id, type: 'track', target: '#' + l.id, keyframes: [{ id: l.id + 'k', time: 0, props: { opacity: l.o ?? 1 } }] })) },
});

describe('15.5 memory ProjectStore: revisions + conflicts', () => {
  it('put / get / list / history with monotonically increasing revisions', async () => {
    expect(STUDIO_STORE_VERSION).toBe(1);
    const s = createMemoryProjectStore();
    expect(await s.get('hero')).toBeNull();
    const r1 = await s.put('hero', proj([{ id: 'a' }]));
    const r2 = await s.put('hero', proj([{ id: 'a', o: 0.5 }]), { baseRev: r1.rev });
    expect(r1.rev).not.toBe(r2.rev);
    expect(r2.rev.startsWith('2-')).toBe(true);
    expect((await s.get('hero'))!.rev).toBe(r2.rev);
    expect((await s.list()).map((p) => [p.name, p.rev])).toEqual([['hero', r2.rev]]);
    const h = await s.history('hero');
    expect(h.map((x) => x.rev)).toEqual([r2.rev, r1.rev]); // newest first
    expect((await s.getRevision('hero', r1.rev))!.text).toBe(proj([{ id: 'a' }]));
  });
  it('a write on a stale base revision is refused as a conflict and changes nothing', async () => {
    const s = createMemoryProjectStore();
    const r1 = await s.put('p', proj([{ id: 'a' }]));
    await s.put('p', proj([{ id: 'a', o: 0.2 }]), { baseRev: r1.rev });
    const e = await s.put('p', proj([{ id: 'a', o: 0.9 }]), { baseRev: r1.rev }).catch((x) => x);
    expect(e).toBeInstanceOf(StoreError);
    expect(e.code).toBe('conflict');
    expect(e.currentRev.startsWith('2-')).toBe(true);
    expect((await s.history('p')).length).toBe(2);
    // creating over an existing project without a base is a conflict too
    expect((await s.put('p', proj([])).catch((x) => x)).code).toBe('conflict');
  });
  it('history is capped (maxRevisions) and delete needs the current revision', async () => {
    const s = createMemoryProjectStore({ maxRevisions: 3 });
    let rev: string | undefined;
    for (let i = 0; i < 5; i++) rev = (await s.put('p', proj([{ id: 'a', o: i / 10 }]), { baseRev: rev })).rev;
    expect((await s.history('p')).length).toBe(3);
    expect((await s.delete('p', { baseRev: 'nope' }).catch((x) => x)).code).toBe('conflict');
    await s.delete('p', { baseRev: rev });
    expect(await s.get('p')).toBeNull();
  });
  it('names are validated (no path tricks) and size is limited', async () => {
    const s = createMemoryProjectStore({ maxBytes: 64 });
    for (const bad of ['', '../x', 'a/b', 'x'.repeat(200)]) expect((await s.put(bad, '{}').catch((x) => x)).code).toBe('invalid');
    expect((await s.put('big', 'x'.repeat(65)).catch((x) => x)).code).toBe('too-large');
  });
  it('contentTag is stable for the same text', () => {
    expect(contentTag('abc')).toBe(contentTag('abc'));
    expect(contentTag('abc')).not.toBe(contentTag('abd'));
  });
});

describe('15.5 conflict detection + layer-level merge', () => {
  const base = proj([{ id: 'a' }, { id: 'b' }]);
  it('edits to different layers merge; the same layer changed on both sides is a conflict', () => {
    const mine = proj([{ id: 'a', o: 0.1 }, { id: 'b' }]);
    const theirs = proj([{ id: 'a' }, { id: 'b', o: 0.7 }, { id: 'c' }]);
    expect(detectConflict(base, mine, theirs)).toEqual({ conflicts: [], mine: ['a'], theirs: ['b', 'c'] });
    const m = mergeProjects(base, mine, theirs);
    expect(m.ok).toBe(true);
    const layers = JSON.parse(m.text!).scene.layers;
    expect(layers.map((l: any) => [l.id, l.keyframes[0].props.opacity])).toEqual([['a', 0.1], ['b', 0.7], ['c', 1]]);
    const clash = proj([{ id: 'a', o: 0.3 }, { id: 'b' }]);
    expect(detectConflict(base, mine, clash).conflicts).toEqual(['a']);
    expect(mergeProjects(base, mine, clash)).toEqual({ ok: false, conflicts: ['a'] });
  });
  it('a layer deleted on one side and edited on the other is a conflict; deleted on one side only is merged', () => {
    const delA = proj([{ id: 'b' }]);
    expect(mergeProjects(base, delA, proj([{ id: 'a', o: 0.5 }, { id: 'b' }])).conflicts).toEqual(['a']);
    const m = mergeProjects(base, delA, proj([{ id: 'a' }, { id: 'b', o: 0.4 }]));
    expect(JSON.parse(m.text!).scene.layers.map((l: any) => l.id)).toEqual(['b']);
  });
});

describe('15.5 HTTP ProjectStore (bring your own backend)', () => {
  function fakeFetch(tenant: string) {
    const calls: Array<{ method: string; url: string; headers: Record<string, string> }> = [];
    const backing = createMemoryProjectStore();
    const f = async (url: string, init: any = {}) => {
      const method = init.method || 'GET', headers = init.headers || {};
      calls.push({ method, url, headers });
      const u = new URL(url);
      if (headers.authorization !== `Bearer ${tenant}`) return new Response('{"error":"forbidden"}', { status: 403 });
      const m = u.pathname.match(/^\/api\/projects(?:\/([^/]+))?(?:\/revisions(?:\/([^/]+))?)?$/)!;
      const name = m[1] && decodeURIComponent(m[1]);
      const json = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status, headers: { 'content-type': 'application/json' } });
      try {
        if (!name) return json(await backing.list());
        if (u.pathname.includes('/revisions')) {
          if (m[2]) { const r = await backing.getRevision(name, decodeURIComponent(m[2])); return r ? json(r) : json({ error: 'not found' }, 404); }
          return json(await backing.history(name));
        }
        if (method === 'GET') { const r = await backing.get(name); return r ? json(r) : json({ error: 'not found' }, 404); }
        if (method === 'PUT') return json(await backing.put(name, JSON.parse(init.body).text, { baseRev: headers['if-match'] }));
        if (method === 'DELETE') { await backing.delete(name, { baseRev: headers['if-match'] }); return new Response(null, { status: 204 }); }
      } catch (e: any) {
        if (e.code === 'conflict') return json({ error: 'conflict', currentRev: e.currentRev }, 409);
        throw e;
      }
      return json({ error: 'method' }, 405);
    };
    return { f, calls };
  }
  it('maps the REST shape: list / get / put with If-Match / history / revision', async () => {
    const { f, calls } = fakeFetch('t1');
    const s = createHttpProjectStore('https://store.example/api', { fetch: f as any, headers: { authorization: 'Bearer t1' } });
    const r1 = await s.put('hero card', proj([{ id: 'a' }]));
    const r2 = await s.put('hero card', proj([{ id: 'a', o: 0 }]), { baseRev: r1.rev });
    expect((await s.get('hero card'))!.rev).toBe(r2.rev);
    expect((await s.list()).length).toBe(1);
    expect((await s.history('hero card')).length).toBe(2);
    expect((await s.getRevision('hero card', r1.rev))!.text).toBe(proj([{ id: 'a' }]));
    expect(calls.find((c) => c.method === 'PUT' && c.headers['if-match'] === r1.rev)?.url).toBe('https://store.example/api/projects/hero%20card');
    expect(await s.get('missing')).toBeNull();
  });
  it('409 → conflict, 403 → forbidden, 429 → quota, network error → network', async () => {
    const { f } = fakeFetch('t1');
    const s = createHttpProjectStore('https://store.example/api', { fetch: f as any, headers: { authorization: 'Bearer t1' } });
    const r1 = await s.put('p', proj([]));
    await s.put('p', proj([{ id: 'a' }]), { baseRev: r1.rev });
    const c = await s.put('p', proj([{ id: 'b' }]), { baseRev: r1.rev }).catch((x) => x);
    expect([c.code, c.currentRev?.startsWith('2-')]).toEqual(['conflict', true]);
    const other = createHttpProjectStore('https://store.example/api', { fetch: f as any, headers: { authorization: 'Bearer t2' } });
    expect((await other.get('p').catch((x) => x)).code).toBe('forbidden');
    const q = createHttpProjectStore('https://x/api', { fetch: (async () => new Response('{}', { status: 429 })) as any });
    expect((await q.put('p', '{}').catch((x) => x)).code).toBe('quota');
    const n = createHttpProjectStore('https://x/api', { fetch: (async () => { throw new TypeError('offline'); }) as any });
    expect((await n.list().catch((x) => x)).code).toBe('network');
  });
});

describe('15.5 toAppStorage: createStudioApp storage with conflict detection', () => {
  it('read remembers the revision; a write after someone else saved is refused with a clear message', async () => {
    const s = createMemoryProjectStore();
    const alice = toAppStorage(s), bob = toAppStorage(s);
    await alice.write('p', proj([{ id: 'a' }]));
    expect(await bob.read('p')).toBe(proj([{ id: 'a' }]));
    expect(await alice.read('p')).toBe(proj([{ id: 'a' }]));
    await bob.write('p', proj([{ id: 'a', o: 0.5 }]));
    const e = await Promise.resolve(alice.write('p', proj([{ id: 'a', o: 0.1 }]))).catch((x) => x);
    expect(e.code).toBe('conflict');
    expect(String(e.message)).toMatch(/saved by someone else/);
    expect(await s.get('p').then((r) => r!.text)).toBe(proj([{ id: 'a', o: 0.5 }]));
  });
  it('merge: "auto" merges non-overlapping layer edits instead of refusing', async () => {
    const s = createMemoryProjectStore();
    const alice = toAppStorage(s, { merge: 'auto' }), bob = toAppStorage(s, { merge: 'auto' });
    await alice.write('p', proj([{ id: 'a' }, { id: 'b' }]));
    await bob.read('p');
    await bob.write('p', proj([{ id: 'a' }, { id: 'b', o: 0.4 }]));
    await alice.write('p', proj([{ id: 'a', o: 0.2 }, { id: 'b' }]));
    const layers = JSON.parse((await s.get('p'))!.text).scene.layers;
    expect(layers.map((l: any) => l.keyframes[0].props.opacity)).toEqual([0.2, 0.4]);
    expect((await s.history('p')).length).toBe(3);
  });
});
