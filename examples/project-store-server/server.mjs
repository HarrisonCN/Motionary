#!/usr/bin/env node
// Motionary 15.5 example: a reference backend for `createHttpProjectStore` (motionary/studio/store). Motionary ships no
// server — this is ~100 lines of node:http you can copy, put behind your gateway, or replace with your own.
//
//   node examples/project-store-server/server.mjs            (PORT=8787, tokens from STORE_TOKENS="tok-a=acme,tok-b=globex")
//
// Routes (per tenant):  GET /t/:tenant/projects · GET|PUT|DELETE /t/:tenant/projects/:name (If-Match: <rev>)
//                       GET /t/:tenant/projects/:name/revisions[/:rev]
// - `Authorization: Bearer <token>` maps to exactly one tenant. A token for tenant B on /t/A/… is refused with 403 and
//   written to the audit log (`cross-tenant-denied`); a missing / unknown token is 401.
// - Each tenant has its own ProjectStore (memory here; swap `createStore` for a database).
// - Quotas per tenant: number of projects and bytes per project → 429 + audit `quota-exceeded`.
// - Stale writes (If-Match ≠ current revision) → 409 { currentRev }.
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

export async function startProjectStoreServer(o = {}) {
  const tokens = o.tokens || {};
  const quota = { projects: 100, bytes: 4 * 1024 * 1024, ...o.quota };
  const audit = o.audit || ((e) => console.log(JSON.stringify(e)));
  const createStore = o.createStore || (await import('motionary/studio/store')).createMemoryProjectStore;
  const stores = new Map();
  const storeOf = (t) => (stores.has(t) ? stores.get(t) : (stores.set(t, createStore(t)), stores.get(t)));
  const send = (res, status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(body === undefined ? '' : JSON.stringify(body)); };
  const readBody = (req) => new Promise((ok, bad) => { let n = 0; const parts = []; req.on('data', (c) => { n += c.length; if (n > quota.bytes * 2 + 1024) { bad(Object.assign(new Error('body too large'), { status: 413 })); req.destroy(); } else parts.push(c); }); req.on('end', () => ok(Buffer.concat(parts).toString('utf8'))); req.on('error', bad); });

  const server = createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x');
    const m = u.pathname.match(/^\/t\/([^/]+)\/projects(?:\/([^/]+))?(?:\/(revisions)(?:\/([^/]+))?)?$/);
    if (!m) return send(res, 404, { error: 'not found' });
    const target = decodeURIComponent(m[1]), name = m[2] && decodeURIComponent(m[2]);
    const tok = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const tenant = Object.prototype.hasOwnProperty.call(tokens, tok) ? tokens[tok] : undefined;
    if (!tenant) return send(res, 401, { error: 'unauthorized' });
    if (tenant !== target) {
      audit({ event: 'cross-tenant-denied', tenant, target, method: req.method, path: u.pathname, at: new Date().toISOString() });
      return send(res, 403, { error: 'forbidden' });
    }
    const store = storeOf(tenant);
    try {
      if (!name) return req.method === 'GET' ? send(res, 200, await store.list()) : send(res, 405, { error: 'method' });
      if (m[3]) {
        if (req.method !== 'GET') return send(res, 405, { error: 'method' });
        const r = m[4] ? await store.getRevision(name, decodeURIComponent(m[4])) : await store.history(name);
        return r ? send(res, 200, r) : send(res, 404, { error: 'not found' });
      }
      if (req.method === 'GET') { const r = await store.get(name); return r ? send(res, 200, r) : send(res, 404, { error: 'not found' }); }
      const baseRev = req.headers['if-match'] || undefined;
      if (req.method === 'DELETE') { await store.delete(name, { baseRev }); return send(res, 204); }
      if (req.method === 'PUT') {
        const { text } = JSON.parse(await readBody(req));
        const exists = !!(await store.get(name));
        const over = Buffer.byteLength(String(text)) > quota.bytes ? 'bytes' : !exists && (await store.list()).length >= quota.projects ? 'projects' : '';
        if (over) { audit({ event: 'quota-exceeded', tenant, quota: over, project: name, at: new Date().toISOString() }); return send(res, 429, { error: `quota: ${over}` }); }
        return send(res, 200, await store.put(name, text, { baseRev }));
      }
      return send(res, 405, { error: 'method' });
    } catch (e) {
      const code = e && e.code;
      if (code === 'conflict') return send(res, 409, { error: 'conflict', currentRev: e.currentRev });
      if (code === 'not-found') return send(res, 404, { error: 'not found' });
      if (code === 'invalid' || e instanceof SyntaxError) return send(res, 400, { error: String(e.message || e) });
      if (code === 'too-large' || e.status === 413) return send(res, 413, { error: 'too large' });
      return send(res, 500, { error: 'server error' });
    }
  });
  await new Promise((ok) => server.listen(o.port ?? 8787, o.host || '127.0.0.1', ok));
  const { port } = server.address();
  return { url: `http://${o.host || '127.0.0.1'}:${port}`, close: () => new Promise((ok) => server.close(() => ok())) };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const tokens = Object.fromEntries((process.env.STORE_TOKENS || 'tok-a=acme,tok-b=globex').split(',').map((p) => p.split('=')));
  startProjectStoreServer({ port: Number(process.env.PORT || 8787), tokens }).then((s) => console.log(`project store on ${s.url} (tenants: ${[...new Set(Object.values(tokens))].join(', ')})`));
}
