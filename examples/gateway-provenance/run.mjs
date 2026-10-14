#!/usr/bin/env node
// Motionary 15.1 example: trace an AI edit from the Studio project back to the MCP Gateway call behind it.
// Integrated against Gateway 15.1 canary (`@winstonsayno/mcp-gateway@15.1.0-canary.1`, npm `canary` — a development
// prerelease of the gateway; its lineage route is a canary feature).
//
//   node examples/gateway-provenance/run.mjs          (from a motionary checkout with a build, or an installed package)
//   MGW_CMD="node /path/to/mcp-gateway/dist/cli.js" node examples/gateway-provenance/run.mjs
//
// 1 starts the gateway with motionary-mcp behind it (stdio) · 2 calls propose_edit over /mcp with one correlation id
// (X-Request-Id header + requestId argument) — nothing is written · 3 a person "accepts": the ops are applied to the
// project through withProvenance → one undo step with { generator, requestId, at } · 4 reads the gateway lineage
// (GET /api/v1/admin/ops/lineage?correlationId=) · 5 matchLineage pairs the project record with the gateway call.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = (n) => pathToFileURL(join(ROOT, 'dist/components', `${n}.js`)).href;
export const GATEWAY_CANARY = '@winstonsayno/mcp-gateway@15.1.0-canary.1';
const freePort = () => new Promise((res) => { const s = createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rpc(url, key, session, body, headers = {}) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30_000), method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', authorization: `Bearer ${key}`, ...(session ? { 'mcp-session-id': session } : {}), 'mcp-protocol-version': '2025-06-18', ...headers }, body: JSON.stringify(body) });
  const sid = r.headers.get('mcp-session-id') || session;
  if (!r.ok && r.status !== 202) throw new Error(`${body.method}: HTTP ${r.status} ${(await r.text()).slice(0, 300)}`);
  if (!('id' in body)) { await r.body?.cancel().catch(() => {}); return { sid }; }
  let msg, text = '';
  if ((r.headers.get('content-type') || '').includes('text/event-stream')) {
    const reader = r.body.getReader(), dec = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      text += dec.decode(value, { stream: true });
      for (const line of text.split('\n')) if (line.startsWith('data:')) { try { const j = JSON.parse(line.slice(5)); if (j.id === body.id) msg = j; } catch { /* partial */ } }
      if (msg) { reader.cancel().catch(() => {}); break; }
    }
  } else msg = JSON.parse((text = await r.text()));
  if (!msg) throw new Error(`${body.method}: no response in ${text.slice(0, 300)}`);
  if (msg.error) throw new Error(`${body.method}: ${JSON.stringify(msg.error)}`);
  return { sid, result: msg.result };
}

export async function run({ log = console.log } = {}) {
  if (!existsSync(join(ROOT, 'dist/components/studio-provenance.js'))) throw new Error('build first (npm run build): dist/components/studio-provenance.js is missing');
  const { withProvenance, provenanceOf, matchLineage } = await import(DIST('studio-provenance'));
  const { applySceneOps } = await import(DIST('studio-ai'));
  const { createTimelineHistory } = await import(DIST('timeline-editor'));
  const dir = mkdtempSync(join(tmpdir(), 'motionary-prov-'));
  const port = await freePort();
  const key = randomBytes(24).toString('hex');
  const cfg = join(dir, 'mcp-gateway.yml');
  writeFileSync(cfg, [
    'version: 11', `port: ${port}`, 'host: 127.0.0.1', 'logLevel: warn',
    'auth:', '  strategy: api-key', '  apiKeys:', `    - "${key}"`,
    'servers:', '  - id: motionary', '    name: Motionary MCP', '    transport: stdio', `    command: ${JSON.stringify(process.execPath)}`,
    `    args: [${JSON.stringify(join(ROOT, 'bin/motionary-mcp.mjs'))}]`, '    enabled: true',
    'mcp:', '  allowedOrigins: []', '',
  ].join('\n'));
  const cmd = (process.env.MGW_CMD || `npx -y ${GATEWAY_CANARY}`).split(' ');
  const gw = spawn(cmd[0], [...cmd.slice(1), 'start', '-c', cfg], { env: { ...process.env, MCP_GATEWAY_API_KEYS: key }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let out = '';
  gw.stdout.on('data', (d) => (out += d)); gw.stderr.on('data', (d) => (out += d));
  const base = `http://127.0.0.1:${port}`, url = `${base}/mcp`;
  log(`starting ${cmd.join(' ')} on 127.0.0.1:${port}`);
  try {
    let sid, ready = false;
    for (let i = 0; i < 360 && !ready; i++) {
      if (gw.exitCode !== null) throw new Error(`gateway exited (${gw.exitCode}):\n${out.slice(-2000)}`);
      try { ({ sid } = await rpc(url, key, null, { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'motionary-provenance-example', version: '1' } } })); ready = true; } catch { await sleep(500); }
    }
    if (!ready) throw new Error('gateway did not answer initialize');
    await rpc(url, key, sid, { jsonrpc: '2.0', method: 'notifications/initialized' });
    let tools = [];
    for (let i = 0; i < 40 && !tools.some((n) => n.endsWith('propose_edit')); i++) { tools = (await rpc(url, key, sid, { jsonrpc: '2.0', id: 2, method: 'tools/list' })).result.tools.map((t) => t.name); if (!tools.some((n) => n.endsWith('propose_edit'))) await sleep(500); }
    const tool = tools.find((n) => n === 'propose_edit') || tools.find((n) => n.endsWith('propose_edit'));
    if (!tool) throw new Error(`propose_edit not listed through the gateway (got ${tools.join(', ')})`);

    const scene = { format: 'motionary-scene', version: 2, layers: [{ id: 'title', type: 'track', target: '#title', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 400, props: { opacity: 1 } }] }, { id: 'card', type: 'track', target: '.card', keyframes: [] }] };
    const history = createTimelineHistory(JSON.parse(JSON.stringify(scene)));
    const requestId = `motionary-ai-edit.${randomBytes(6).toString('hex')}`;
    const r = (await rpc(url, key, sid, { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: tool, arguments: { scene: history.doc, prompt: 'fade up the card', requestId } } }, { 'x-request-id': requestId })).result;
    if (r.isError) throw new Error(`propose_edit: ${JSON.stringify(r.content).slice(0, 300)}`);
    const p = r.structuredContent;
    if (!p.ok || p.applied !== false || !p.ops.length) throw new Error(`propose_edit: ${JSON.stringify(p).slice(0, 300)}`);
    if (JSON.stringify(history.doc) !== JSON.stringify(scene)) throw new Error('the project changed before anyone accepted the proposal');
    log(`propose_edit through the gateway: ${p.ops.length} op(s), layers ${p.layers.join(', ')}, applied=false, project unchanged`);

    // a person accepted the proposal: apply its ops as ONE step that records where the change came from
    withProvenance(history, { ...p.provenance, at: new Date().toISOString() }).apply((d) => applySceneOps(d, p.ops.map((o) => o.op)), { label: `AI: ${p.summary || 'fade up the card'}` });
    const records = provenanceOf(history.doc);
    log(`applied: ${records.length} provenance record(s) — ${JSON.stringify(records[0])}`);

    let body;
    for (let i = 0; i < 20; i++) {
      const res = await fetch(`${base}/api/v1/admin/ops/lineage?correlationId=${encodeURIComponent(requestId)}`, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15_000) });
      if (res.status === 404) throw new Error('GET /api/v1/admin/ops/lineage: 404 — this gateway has no call lineage (needs Gateway 15.1 canary or later)');
      if (!res.ok) throw new Error(`GET /api/v1/admin/ops/lineage: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
      body = await res.json();
      if (body.total > 0) break;
      await sleep(250);
    }
    const j = matchLineage(records, body);
    if (j.matched.length !== 1 || j.missing.length || j.unattributed.length) throw new Error(`lineage join: ${JSON.stringify({ body, j }).slice(0, 600)}`);
    const g = j.matched[0].lineage;
    log(`lineage join OK: record ${j.matched[0].record.id} (${j.matched[0].record.generator}, requestId ${requestId}) ↔ gateway call ${g.requestId} (${g.target?.serverId}/${g.target?.tool} via ${g.target?.via}, outcome ${g.decision?.outcome})`);
    history.undo();
    if (provenanceOf(history.doc).length !== 0) throw new Error('undo kept the provenance record');
    log('undo removed the edit and its record together');
    return { requestId, gatewayRequestId: g.requestId, ops: p.ops.length };
  } catch (e) {
    e.message += `\n--- gateway output (tail) ---\n${out.slice(-3000)}`;
    throw e;
  } finally {
    try { process.kill(-gw.pid, 'SIGTERM'); } catch { gw.kill('SIGTERM'); }
    await sleep(500);
    try { process.kill(-gw.pid, 'SIGKILL'); } catch { /* gone */ }
    gw.stdout.destroy(); gw.stderr.destroy(); gw.unref();
    rmSync(dir, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const guard = setTimeout(() => { console.error('gateway provenance example FAILED: timed out after 8 minutes'); process.exit(1); }, 8 * 60_000);
  run().then(() => { clearTimeout(guard); process.exit(0); }, (e) => { console.error('gateway provenance example FAILED:', e.message); process.exit(1); });
}
