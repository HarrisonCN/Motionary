#!/usr/bin/env node
// 13.7.0: motionary-mcp behind the published MCP gateway — docs/mcp-gateway-interop.md.
//   node scripts/gateway-interop.mjs                  (uses `npx -y @winstonsayno/mcp-gateway@latest`)
//   MGW_CMD="node /path/to/mcp-gateway/dist/cli.js" node scripts/gateway-interop.mjs
// Starts the gateway with a temporary config that runs this checkout's bin/motionary-mcp.mjs over stdio, then speaks
// MCP Streamable HTTP to the gateway (initialize → tools/list → tools/call) and checks the 13.7 tools answer through it.
// The gateway is never a dependency of motionary: CI installs it on the fly in the "Gateway interop" job only.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const EXPECT_TOOLS = ['list_components', 'search_components', 'get_component', 'get_example', 'scaffold_snippet', 'suggest_motion', 'validate_snippet', 'check_compat', 'check_compatibility', 'suggest_fix'];

const freePort = () => new Promise((res) => { const s = createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rpc(url, key, session, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', authorization: `Bearer ${key}`, ...(session ? { 'mcp-session-id': session } : {}), 'mcp-protocol-version': '2025-06-18' }, body: JSON.stringify(body) });
  const sid = r.headers.get('mcp-session-id') || session;
  const text = await r.text();
  if (!r.ok && r.status !== 202) throw new Error(`${body.method}: HTTP ${r.status} ${text.slice(0, 300)}`);
  if (!('id' in body)) return { sid };
  const ct = r.headers.get('content-type') || '';
  let msg;
  if (ct.includes('text/event-stream')) {
    for (const line of text.split('\n')) if (line.startsWith('data:')) { const j = JSON.parse(line.slice(5)); if (j.id === body.id) msg = j; }
  } else msg = JSON.parse(text);
  if (!msg) throw new Error(`${body.method}: no response in ${text.slice(0, 300)}`);
  if (msg.error) throw new Error(`${body.method}: ${JSON.stringify(msg.error)}`);
  return { sid, result: msg.result };
}

export async function run({ log = console.log } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'motionary-gw-'));
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
  const cmd = (process.env.MGW_CMD || 'npx -y @winstonsayno/mcp-gateway@latest').split(' ');
  const gw = spawn(cmd[0], [...cmd.slice(1), 'start', '-c', cfg], { env: { ...process.env, MCP_GATEWAY_API_KEYS: key }, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  gw.stdout.on('data', (d) => (out += d)); gw.stderr.on('data', (d) => (out += d));
  const url = `http://127.0.0.1:${port}/mcp`;
  try {
    let sid, ready = false;
    for (let i = 0; i < 240 && !ready; i++) {
      if (gw.exitCode !== null) throw new Error(`gateway exited (${gw.exitCode}):\n${out.slice(-2000)}`);
      try { ({ sid } = await rpc(url, key, null, { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'motionary-interop', version: '1' } } })); ready = true; } catch (e) { if (i === 239) throw e; await sleep(500); }
    }
    await rpc(url, key, sid, { jsonrpc: '2.0', method: 'notifications/initialized' });
    let tools = [];
    for (let i = 0; i < 40; i++) { tools = (await rpc(url, key, sid, { jsonrpc: '2.0', id: 2, method: 'tools/list' })).result.tools.map((t) => t.name); if (EXPECT_TOOLS.every((t) => tools.some((n) => n === t || n.endsWith(t)))) break; await sleep(500); }
    const name = (t) => tools.find((n) => n === t) || tools.find((n) => n.endsWith(t));
    const missing = EXPECT_TOOLS.filter((t) => !name(t));
    if (missing.length) throw new Error(`tools missing through the gateway: ${missing.join(', ')} (got ${tools.join(', ')})`);
    const callT = async (t, args, id) => { const r = (await rpc(url, key, sid, { jsonrpc: '2.0', id, method: 'tools/call', params: { name: name(t), arguments: args } })).result; if (r.isError) throw new Error(`${t}: ${JSON.stringify(r.content)}`); return r.structuredContent || JSON.parse(r.content[0].text); };
    const s = await callT('search_components', { query: 'tilt', limit: 3 }, 3);
    const top = (s.results || s.items || s)[0]?.tag;
    if (top !== 'usa-tilt') throw new Error(`search_components through the gateway: top ${top}`);
    const c = await callT('check_compatibility', { tags: ['usa-tilt'], framework: 'vue' }, 4);
    if (c.schema !== 'motionary-mcp/check_compatibility@1' || !c.compatible) throw new Error(`check_compatibility: ${JSON.stringify(c).slice(0, 300)}`);
    const f = await callT('suggest_fix', { code: '<usa-tosater></usa-tosater>' }, 5);
    if (!f.fixed.includes('<usa-toaster>')) throw new Error(`suggest_fix: ${JSON.stringify(f).slice(0, 300)}`);
    const v = await callT('validate_snippet', { code: '<usa-tilt></usa-tilt>', browser: 'auto' }, 6);
    if (!['browser', 'static'].includes(v.mode)) throw new Error(`validate_snippet: ${JSON.stringify(v).slice(0, 300)}`);
    log(`gateway interop OK: ${tools.length} tools through ${cmd.join(' ')} (${EXPECT_TOOLS.length} expected); search → ${top}; check_compatibility ✓; suggest_fix ✓; validate_snippet mode=${v.mode}`);
    return { tools };
  } finally {
    gw.kill('SIGTERM');
    await sleep(300);
    rmSync(dir, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) run().catch((e) => { console.error('gateway interop FAILED:', e.message); process.exit(1); });
