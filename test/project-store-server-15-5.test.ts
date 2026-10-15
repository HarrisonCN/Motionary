// @vitest-environment node
// 15.5: reference backend for createHttpProjectStore (examples/project-store-server) — one store per tenant, a read of
// another tenant's projects is refused (403) and audited, quotas give 429 → StoreError 'quota', stale writes 409.
// Plus the package entry and its size line.
import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { createMemoryProjectStore, createHttpProjectStore } from '../src/components/studio/store';
// @ts-expect-error plain ESM example without types
import { startProjectStoreServer } from '../examples/project-store-server/server.mjs';

const P = (o: number) => JSON.stringify({ format: 'motionary-scene', version: 2, duration: 100, layers: [{ id: 'a', type: 'track', target: '#a', keyframes: [{ id: 'k', time: 0, props: { opacity: o } }] }] });
const audit: any[] = [];
let srv: { url: string; close(): Promise<void> };
afterAll(() => srv?.close());

describe('15.5 project store server: tenant isolation, audit, quota', () => {
  it('each tenant has its own store; cross-tenant reads are denied and audited', async () => {
    srv = await startProjectStoreServer({ port: 0, tokens: { 'tok-a': 'acme', 'tok-b': 'globex' }, quota: { projects: 2, bytes: 4096 }, createStore: () => createMemoryProjectStore(), audit: (e: any) => audit.push(e) });
    const a = createHttpProjectStore(`${srv.url}/t/acme`, { headers: { authorization: 'Bearer tok-a' } });
    const b = createHttpProjectStore(`${srv.url}/t/globex`, { headers: { authorization: 'Bearer tok-b' } });
    const r1 = await a.put('hero', P(0));
    await b.put('hero', P(1));
    expect((await a.get('hero'))!.text).toBe(P(0));
    expect((await b.get('hero'))!.text).toBe(P(1));
    const spy = createHttpProjectStore(`${srv.url}/t/acme`, { headers: { authorization: 'Bearer tok-b' } });
    expect((await spy.get('hero').catch((x) => x)).code).toBe('forbidden');
    expect((await spy.list().catch((x) => x)).code).toBe('forbidden');
    expect(audit.filter((e) => e.event === 'cross-tenant-denied').map((e) => [e.tenant, e.target])).toEqual([['globex', 'acme'], ['globex', 'acme']]);
    const anon = createHttpProjectStore(`${srv.url}/t/acme`);
    expect((await anon.list().catch((x) => x)).code).toBe('forbidden');
    expect((await a.put('hero', P(0.5), { baseRev: 'stale' }).catch((x) => x)).code).toBe('conflict');
    await a.put('hero', P(0.5), { baseRev: r1.rev });
    expect((await a.history('hero')).length).toBe(2);
  });
  it('quotas: projects per tenant and bytes per project → 429 quota, audited', async () => {
    const a = createHttpProjectStore(`${srv.url}/t/acme`, { headers: { authorization: 'Bearer tok-a' } });
    await a.put('second', P(0));
    expect((await a.put('third', P(0)).catch((x) => x)).code).toBe('quota');
    expect((await a.put('big', 'x'.repeat(5000)).catch((x) => x)).code).toBe('quota');
    expect(audit.filter((e) => e.event === 'quota-exceeded').length).toBe(2);
    expect((await a.list()).map((p) => p.name)).toEqual(['hero', 'second']);
  });
});

describe('15.5 package entry', () => {
  it('motionary/studio/store and motionary/components/studio-store with a size line', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.exports['./studio/store'].import.default).toBe('./dist/components/studio-store.js');
    expect(pkg.exports['./components/studio-store'].require.default).toBe('./dist/components/studio-store.cjs');
    expect(readFileSync('size-budget.json', 'utf8')).toMatch(/components\/studio-store/);
  });
});
