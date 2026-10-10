#!/usr/bin/env node
// 13.2: release gate — a release PR is merged and published only when its head commit passed every required CI check
// (.github/required-checks.json: the Node jobs — typecheck, tests, build, exports, tree-shaking, tiers, contract, peer docs,
// docs facts, package lint, pack, size, playground, perf — and the Chromium / Firefox / WebKit browser jobs). docs/release-gate.md.
//   node scripts/release-gate.mjs --pr 136 [--repo HarrisonCN/Motionary] [--json]
//   → prints `head=<sha>` and exits 0 when the gate is open; lists the problems and exits 1 otherwise (2 on usage / network errors).
// Uses GITHUB_TOKEN / GH_TOKEN when set (public repositories work without one, within the anonymous rate limit).
// Merge with that exact head sha (the merge API's `sha` parameter) so a push after the checks cannot slip through.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const HERE = (() => { try { return fileURLToPath(new URL('..', import.meta.url)); } catch { return ''; } })();
const ROOT = HERE && existsSync(join(HERE, 'package.json')) ? HERE : process.cwd();

/** Check names a workflow produces: each job's `name:` with its matrix expanded (`Node ${{ matrix.node }}` → Node 20, Node 22 …). */
export function checksFromWorkflow(yaml) {
  const lines = String(yaml).split('\n');
  const start = lines.findIndex((l) => /^jobs:\s*$/.test(l));
  const jobs = [];
  let cur = null;
  for (const l of lines.slice(start + 1)) {
    if (/^\S/.test(l)) break;
    const job = l.match(/^ {2}([\w-]+):\s*$/);
    if (job) { cur = { id: job[1], name: job[1], matrix: {} }; jobs.push(cur); continue; }
    if (!cur) continue;
    const name = l.match(/^ {4}name:\s*(.+?)\s*$/);
    if (name) cur.name = name[1].replace(/^['"]|['"]$/g, '');
    const mx = l.match(/^ {8}([\w-]+):\s*\[([^\]]*)\]\s*$/);
    if (mx) cur.matrix[mx[1]] = mx[2].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }
  const out = [];
  for (const j of jobs) {
    let names = [j.name];
    for (const [k, vals] of Object.entries(j.matrix)) {
      const re = new RegExp(`\\$\\{\\{\\s*matrix\\.${k}\\s*\\}\\}`, 'g');
      if (re.test(j.name)) names = names.flatMap((n) => vals.map((v) => n.replace(re, v)));
    }
    out.push(...names);
  }
  return out;
}

const BAD = new Set(['failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure', 'stale']);
/** { ok, problems[] } for a PR and the check runs of its head commit. The newest run of each check counts. */
export function evaluateGate({ required = [], pr, checkRuns = [] }) {
  const problems = [];
  if (!pr) return { ok: false, problems: ['no pull request'] };
  if (pr.merged || pr.state !== 'open') problems.push(`PR #${pr.number} is ${pr.merged ? 'already merged' : pr.state} — nothing to release from it`);
  if (pr.draft) problems.push(`PR #${pr.number} is a draft`);
  const sha = pr.head && pr.head.sha;
  const runs = checkRuns.filter((r) => !r.head_sha || r.head_sha === sha);
  const newest = new Map();
  for (const r of runs) {
    const prev = newest.get(r.name);
    const t = (x) => Date.parse(x.started_at || x.completed_at || 0) || 0;
    if (!prev || t(r) > t(prev) || (t(r) === t(prev) && (r.id || 0) > (prev.id || 0))) newest.set(r.name, r);
  }
  for (const name of required) {
    const r = newest.get(name);
    if (!r) problems.push(`required check "${name}" is missing on the head commit ${String(sha).slice(0, 7)}`);
    else if (r.status !== 'completed') problems.push(`required check "${name}" is ${r.status} — wait for it`);
    else if (r.conclusion !== 'success') problems.push(`required check "${name}" concluded ${r.conclusion}`);
  }
  for (const [name, r] of newest) if (!required.includes(name) && r.status === 'completed' && BAD.has(r.conclusion)) problems.push(`check "${name}" concluded ${r.conclusion}`);
  return { ok: problems.length === 0, sha, problems };
}

export function requiredChecks() {
  return JSON.parse(readFileSync(join(ROOT, '.github/required-checks.json'), 'utf8')).checks;
}

async function gh(path) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const res = await fetch(`https://api.github.com${path}`, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'motionary-release-gate', ...(token ? { authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const repo = arg('--repo', 'HarrisonCN/Motionary'), n = arg('--pr');
  if (!n) { console.error('usage: node scripts/release-gate.mjs --pr <number> [--repo owner/name] [--json]'); process.exit(2); }
  try {
    const pr = await gh(`/repos/${repo}/pulls/${n}`);
    const runs = [];
    for (let page = 1; page < 10; page++) {
      const r = await gh(`/repos/${repo}/commits/${pr.head.sha}/check-runs?per_page=100&page=${page}`);
      runs.push(...r.check_runs);
      if (runs.length >= r.total_count || !r.check_runs.length) break;
    }
    const res = evaluateGate({ required: requiredChecks(), pr, checkRuns: runs });
    if (process.argv.includes('--json')) console.log(JSON.stringify({ ...res, pr: pr.number, checks: runs.map((r) => ({ name: r.name, status: r.status, conclusion: r.conclusion })) }, null, 2));
    if (res.ok) { console.log(`release gate open: PR #${pr.number}, ${requiredChecks().length} required checks green`); console.log(`head=${pr.head.sha}`); process.exit(0); }
    console.error(`❌ release gate closed for PR #${pr.number} (head ${pr.head.sha.slice(0, 7)}):`);
    for (const p of res.problems) console.error(`  - ${p}`);
    process.exit(1);
  } catch (e) {
    console.error(`❌ release gate: ${e.message}`);
    process.exit(2);
  }
}
