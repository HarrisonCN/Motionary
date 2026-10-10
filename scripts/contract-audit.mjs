// 11.7: component contract audit (report only). Scans every `<usa-*>` element in src/components and checks the six parts
// of the component contract — attributes, events, keyboard, lifecycle, reduced motion, error messages — against the rules
// below, then writes docs/contract-report.md (+ docs/contract-report.json). `--check` exits 1 when the committed report is
// stale or (12.0: blocking) when any finding is left — intended exceptions carry `// contract-exempt: <rule> — <reason>`.
// 13.0.1: also audits `export const defineX = (tag = '…') => helper(tag, …)` elements (against the helper's body), requires
// the audited tag set to equal the AI manifest's (a public component the auditor cannot see fails --check), scopes
// exemptions to named items (`// contract-exempt: attr-unobserved(open) — <reason>`) and reports stale / unscoped ones,
// and records every `usa:*` event's detail shape (test/fixtures/event-details-13.json is the spec).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildManifest } from './gen-manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'); // string form: under jsdom (vitest) `URL` is not Node's
const walk = (d) => readdirSync(d).sort().flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') && !p.endsWith('.d.ts') ? [p] : []; });

/** The rules: id → [contract part, description]. */
export const RULES = {
  'attr-unobserved': ['attributes', 'reads an attribute (str/num/flag) that is not in observedAttributes — changing it later has no effect'],
  'event-prefix': ['events', 'dispatches a CustomEvent whose name does not start with `usa:` (use this.emit())'],
  'event-bubbles': ['events', 'dispatches a CustomEvent without bubbles: true (this.emit() bubbles and composes)'],
  'event-composed': ['events', 'dispatches a usa:* CustomEvent without composed: true — it stops at the nearest shadow root (13.0.1; this.emit() composes)'],
  'keyboard-click-only': ['keyboard', 'reacts to click / pointer input on the host but has no keyboard handling and no native control inside'],
  'lifecycle-global-listener': ['lifecycle', 'adds a window / document listener directly — not removed on disconnect (use this.listen())'],
  'lifecycle-timer': ['lifecycle', 'starts setInterval without clearing it on disconnect (onCleanup / clearInterval)'],
  'reduced-motion': ['reduced motion', 'animates (el.animate / requestAnimationFrame loop) without checking reduced motion (this.reduced, this.motion(), prefersReducedMotion())'],
  'error-prefix': ['errors', 'throws / logs a message that does not start with `[motionary]`'],
};

/** 13.0.1: findings about the audit itself (not one of the six contract parts) — blocking like the rules above. */
export const META_RULES = {
  'exempt-unscoped': ['exemptions', 'a per-item rule is exempted without naming the items — write `contract-exempt: <rule>(<item>, …) — <reason>`'],
  'exempt-unused': ['exemptions', 'an exemption (or one of its items) masks no finding — remove it so it cannot hide a future one'],
  'audit-source': ['audit', 'the element\'s source could not be resolved for scanning (a define delegating to a helper outside the file)'],
};

/** Rules whose findings name an item (attribute, event, listener, message): their exemptions must list the items. */
export const SCOPED_RULES = ['attr-unobserved', 'event-prefix', 'event-bubbles', 'event-composed', 'lifecycle-global-listener', 'error-prefix'];

/** `// contract-exempt: <rule>[(<item>, …)] — <reason>` → [{ rule, scope: string[] | null, reason }]. */
export function parseExemptions(body) {
  return [...body.matchAll(/contract-exempt:\s*([a-z][\w-]*?)(?:\(([^)]*)\))?\s+(?:—|-)\s*([^\n*]*)/g)].map((m) => ({
    rule: m[1],
    scope: m[2] ? m[2].split(',').map((x) => x.trim()).filter(Boolean) : null,
    reason: m[3].trim(),
  }));
}

/** Split `a, b(c, d), { e }` at top-level commas. */
function splitTop(src) {
  const out = [];
  let depth = 0, cur = '', q = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (q) { cur += ch; if (ch === '\\') { cur += src[++i] ?? ''; continue; } if (ch === q) q = ''; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; cur += ch; continue; }
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** `src` with line and block comments blanked (strings and template literals kept), so a comment can never satisfy or trip a rule. */
export function stripComments(src) {
  let out = '', q = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (q) { out += ch; if (ch === '\\') { out += src[++i] ?? ''; continue; } if (ch === q) q = ''; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; out += ch; continue; }
    if (ch === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); i = (e < 0 ? src.length : e) - 1; continue; }
    if (ch === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 1; continue; }
    out += ch;
  }
  return out;
}

/** Index just past the bracket matching the opener at `open` (skips strings and comments). */
function matchClose(src, open) {
  let depth = 0, q = '';
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = ''; continue; }
    if (ch === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) return src.length; continue; }
    if (ch === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 1; if (i <= 0) return src.length; continue; }
    if (ch === "'" || ch === '"') { q = ch; continue; }
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch) && --depth === 0) return i + 1;
  }
  return src.length;
}

/** `function name(…) … { … }` in `src` → its full text, or null. */
function functionSource(src, name) {
  const m = new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?function ${name}\\(`).exec(src);
  if (!m) return null;
  const paren = src.indexOf('(', m.index + m[0].length - 1);
  const afterParams = matchClose(src, paren);
  const brace = src.indexOf('{', afterParams);
  return brace < 0 ? null : src.slice(m.index, matchClose(src, brace));
}

/** event → sorted distinct detail shapes: `(none)`, `{a, b}`, or `object: <expr>` for a non-literal detail. */
export function eventDetails(body) {
  const out = {};
  for (const m of body.matchAll(/\.emit\(/g)) {
    const open = m.index + m[0].length - 1;
    const args = splitTop(body.slice(open + 1, matchClose(body, open) - 1));
    if (!args.length) continue;
    const lits = [...args[0].matchAll(/'([\w:-]+)'/g)].map((x) => x[1]);
    const names = /^'[\w:-]+'$/.test(args[0]) || (lits.length && /^[^'?]*\?\s*'[\w:-]+'\s*:\s*'[\w:-]+'$/.test(args[0])) ? lits : [`<${args[0]}>`];
    const d = args[1];
    let shape;
    if (d === undefined) shape = '(none)';
    else if (d.startsWith('{')) {
      const keys = splitTop(d.slice(1, -1)).map((k) => (k.startsWith('...') ? k : (/^['"]?([\w$]+)['"]?\s*(?::|$)/.exec(k)?.[1] ?? k))).sort();
      shape = `{${keys.join(', ')}}`;
    } else shape = `object: ${d.replace(/\s+/g, ' ')}`;
    for (const n of names) {
      const ev = 'usa:' + n;
      out[ev] = [...new Set([...(out[ev] || []), shape])].sort();
    }
  }
  // events dispatched directly: new CustomEvent('usa:x', { detail: …, … })
  for (const m of body.matchAll(/new CustomEvent(?:<[^>]*>)?\(/g)) {
    const open = m.index + m[0].length - 1;
    const [name, opts] = splitTop(body.slice(open + 1, matchClose(body, open) - 1));
    const ev = /^['`](usa:[\w:-]+)['`]$/.exec(name || '')?.[1];
    if (!ev) continue;
    const det = opts?.startsWith('{') ? splitTop(opts.slice(1, -1)).find((p) => /^detail\s*:/.test(p) || p === 'detail') : undefined;
    const d = det === undefined ? undefined : det === 'detail' ? 'detail' : det.replace(/^detail\s*:\s*/, '');
    const shape = d === undefined ? '(none)' : d.startsWith('{') ? `{${splitTop(d.slice(1, -1)).map((k) => (k.startsWith('...') ? k : (/^['"]?([\w$]+)['"]?\s*(?::|$)/.exec(k)?.[1] ?? k))).sort().join(', ')}}` : `object: ${d.replace(/\s+/g, ' ')}`;
    out[ev] = [...new Set([...(out[ev] || []), shape])].sort();
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

function scanElement(tag, file, raw) {
  const f = [];
  const body = stripComments(raw); // 13.0.1: rules look at code only (an exemption comment mentioning `reduced` used to satisfy its own rule)
  // 11.8: `// contract-exempt: <rule> — <reason>` inside an element's source skips that rule for it (listed in the report)
  // 13.0.1: an exemption for a per-item rule must name its items and masks only those; every exemption must mask something
  const exempt = parseExemptions(raw);
  const used = new Set();
  const add = (rule, detail) => {
    const e = exempt.find((x) => x.rule === rule && (x.scope ? x.scope.includes(detail) : !SCOPED_RULES.includes(rule)));
    if (!e) return void f.push({ rule, detail });
    used.add(e.scope ? `${rule}(${detail})` : rule);
  };
  // 13.0.1: the whole getter body (a `kind === 'a' ? [...] : [...]` list used to read as "observes nothing"); every literal counts
  const og = /static get observedAttributes\(\)[^{]*\{/.exec(body);
  const obs = og ? [null, body.slice(og.index + og[0].length - 1, matchClose(body, og.index + og[0].length - 1))] : null;
  const observed = new Set(obs ? [...obs[1].matchAll(/\[([^\]]*)\]/g)].flatMap((l) => [...l[1].matchAll(/'([^']+)'/g)].map((x) => x[1])) : []);
  const spreads = obs && /\.\.\./.test(obs[1]);
  const reads = [...new Set([...body.matchAll(/this\.(?:str|num|flag)\(\s*'([\w-]+)'/g)].map((x) => x[1]))];
  if (!spreads) for (const a of reads) if (!observed.has(a)) add('attr-unobserved', a);
  const events = [...new Set([...body.matchAll(/\.emit\(\s*'([\w:-]+)'/g)].map((x) => 'usa:' + x[1]))];
  for (const m of body.matchAll(/new CustomEvent(?:<[^>]*>)?\(\s*['`]([^'`]+)['`]([^;\n]{0,160})/g)) {
    if (!m[1].startsWith('usa:')) add('event-prefix', m[1]);
    else if (!/bubbles:\s*true/.test(m[2] || '')) add('event-bubbles', m[1]);
    else if (!/composed:\s*true/.test(m[2] || '')) add('event-composed', m[1]);
  }
  const keyboard = /'key(?:down|up|press)'|\.key\b|\bkey ===|onkeydown|keyClick\(/.test(body);
  const native = /<button|<input|<select|<textarea|<a\s|<details|<dialog|'summary'|createElement\('(?:button|input|select|a|textarea)'\)/.test(body) || /querySelector\(['"`][^'"`]*(?:button|input|select|textarea)/.test(body);
  const hostClick = /this\.listen\(this,\s*'(?:click|pointerdown|pointerup)'|this\.addEventListener\('(?:click|pointerdown)'/.test(body);
  const focusable = /tabindex|tabIndex|role', 'button'|role="button"/.test(body);
  if (hostClick && !keyboard && !native) add('keyboard-click-only', focusable ? 'focusable but no key handler' : 'not focusable');
  for (const m of body.matchAll(/(window|document)\.addEventListener\(\s*'([\w-]+)'/g)) if (!/removeEventListener/.test(body)) add('lifecycle-global-listener', `${m[1]} ${m[2]}`);
  if (/setInterval\(/.test(body) && !/clearInterval/.test(body)) add('lifecycle-timer', 'setInterval');
  const animates = /\.animate\(|requestAnimationFrame\(|\braf\(/.test(body);
  const guarded = /this\.reduced|prefersReducedMotion\(|this\.motion\(|animateWithMotion\(|getMotionSensitivity\(|adaptKeyframes\(|reduced\b/.test(body);
  if (animates && !guarded) add('reduced-motion', 'animates without a reduced-motion check');
  for (const m of body.matchAll(/(?:throw new (?:\w*Error)\(|console\.(?:warn|error)\()\s*(['`])([^'`]*)/g)) if (!m[2].startsWith('[motionary]')) add('error-prefix', m[2].slice(0, 60));
  for (const e of exempt) {
    if (!RULES[e.rule]) f.push({ rule: 'exempt-unused', detail: `${e.rule} (unknown rule)` }); // only the six contract parts can be exempted
    else if (SCOPED_RULES.includes(e.rule) && !e.scope) f.push({ rule: 'exempt-unscoped', detail: e.rule });
    if (!RULES[e.rule]) continue;
    if (e.scope) { for (const it of e.scope) if (!used.has(`${e.rule}(${it})`)) f.push({ rule: 'exempt-unused', detail: `${e.rule}(${it})` }); }
    else if (!used.has(e.rule)) f.push({ rule: 'exempt-unused', detail: e.rule });
  }
  return { tag, file: relative(ROOT, file), attributes: [...observed], events, eventDetails: eventDetails(body), keyboard, lifecycle: /onCleanup|this\.listen\(|unmount\(/.test(body), reducedMotion: guarded || !animates, exempt, findings: f };
}

/** Scan src/components → [{ tag, file, attributes, events, keyboard, lifecycle, reducedMotion, findings }] sorted by tag. */
export function audit(root = ROOT) {
  const out = new Map();
  for (const file of walk(join(root, 'src/components'))) {
    const s = readFileSync(file, 'utf8');
    // `export function defineX(tag = '…')` (body: up to the next define) and, since 13.0.1, `export const defineX = (tag = '…')
    // … => helper(tag, …)` (body: that helper function, found in the same file)
    const fns = [...s.matchAll(/export function (define\w+)\(tag = '([a-z][a-z0-9]*-[a-z0-9-]+)'/g)];
    const consts = [...s.matchAll(/export const (define\w+)\s*=\s*\(tag = '([a-z][a-z0-9]*-[a-z0-9-]+)'\)[^\n]*?=>\s*(\w+)\(/g)];
    const starts = [...fns, ...consts].map((m) => m.index).sort((a, b) => a - b);
    for (const m of fns) {
      if (out.has(m[2])) continue;
      out.set(m[2], scanElement(m[2], file, s.slice(m.index, starts.find((x) => x > m.index) ?? s.length)));
    }
    for (const m of consts) {
      if (out.has(m[2])) continue;
      const helper = functionSource(s, m[3]);
      const row = scanElement(m[2], file, helper ?? '');
      if (!helper) row.findings.push({ rule: 'audit-source', detail: `${m[1]} → ${m[3]}() not found in ${relative(ROOT, file)}` });
      out.set(m[2], row);
    }
  }
  return [...out.values()].sort((a, b) => a.tag.localeCompare(b.tag));
}

/** The AI manifest's public component tags (USA_AUDIT_EXTRA_MANIFEST_TAG adds tags — used by the tests to simulate a new component). */
export function manifestTags() {
  const extra = (process.env.USA_AUDIT_EXTRA_MANIFEST_TAG || '').split(',').map((x) => x.trim()).filter(Boolean);
  return [...new Set([...buildManifest().components.map((c) => c.tag), ...extra])];
}

/** 13.0.1: the audited tag set must equal the manifest's → { missing: in the manifest, not audited; extra: audited, not in the manifest }. */
export function coverage(rows, tags) {
  const audited = new Set(rows.map((r) => r.tag));
  const listed = new Set(tags);
  return { missing: [...listed].filter((t) => !audited.has(t)).sort(), extra: [...audited].filter((t) => !listed.has(t)).sort() };
}

export function summary(rows) {
  const byRule = Object.fromEntries(Object.keys({ ...RULES, ...META_RULES }).map((r) => [r, 0]));
  for (const r of rows) for (const x of r.findings) byRule[x.rule]++;
  return { components: rows.length, clean: rows.filter((r) => !r.findings.length).length, findings: Object.values(byRule).reduce((a, b) => a + b, 0), exempt: rows.reduce((n, r) => n + r.exempt.length, 0), byRule };
}

export function renderMarkdown(rows, gap = { missing: [], extra: [] }) {
  const s = summary(rows);
  const lines = [
    `# Component contract report`,
    '',
    `Generated by \`node scripts/contract-audit.mjs\` against the rules of [component-contract.md](./component-contract.md). Blocking since 12.0 (\`npm run check:contract\` in CI): zero findings; every exception is documented below with its reason.`,
    '',
    `**${s.components} components · ${s.clean} without findings · ${s.findings} findings · ${s.exempt} documented exemptions.**`,
    '',
    gap.missing.length || gap.extra.length
      ? `**Manifest coverage: ${gap.missing.length} manifest component(s) not audited (${gap.missing.map((t) => `\`<${t}>\``).join(', ') || '—'}), ${gap.extra.length} audited but not in the manifest (${gap.extra.map((t) => `\`<${t}>\``).join(', ') || '—'}).**`
      : `Manifest coverage: the audited tag set equals the AI manifest's public components (${s.components} / ${s.components}); \`check:contract\` fails when they differ.`,
    '',
    '| Rule | Contract part | Findings | What it means |',
    '|---|---|---|---|',
    ...Object.entries({ ...RULES, ...META_RULES }).map(([id, [part, d]]) => `| \`${id}\` | ${part} | ${s.byRule[id]} | ${d} |`),
    '',
    '## Findings by component',
    '',
    '| Component | File | Findings |',
    '|---|---|---|',
    ...rows.filter((r) => r.findings.length).map((r) => `| \`<${r.tag}>\` | \`${r.file}\` | ${r.findings.map((x) => `\`${x.rule}\` ${x.detail.replace(/\|/g, '\\|')}`).join('<br>')} |`),
    '',
    '## Documented exemptions',
    '',
    '| Component | Rule | Reason |',
    '|---|---|---|',
    ...rows.flatMap((r) => r.exempt.map((e) => `| \`<${r.tag}>\` | \`${e.rule}${e.scope ? `(${e.scope.join(', ')})` : ''}\` | ${e.reason.replace(/\|/g, '\\|')} |`)),
    '',
  ];
  return lines.join('\n');
}

export function run(args = []) {
  const rows = audit();
  const gap = coverage(rows, manifestTags());
  const md = renderMarkdown(rows, gap);
  const json = JSON.stringify({ format: 'motionary/contract-report', version: 1, summary: summary(rows), components: rows }, null, 2) + '\n';
  const mdPath = join(ROOT, 'docs/contract-report.md'), jsonPath = join(ROOT, 'docs/contract-report.json');
  if (args.includes('--preview')) {
    // 11.9: what the blocking 12.0 contract check would say today (never fails in 11.x)
    const s = summary(rows);
    for (const r of rows) for (const x of r.findings) console.log(`${r.tag}  ${x.rule}  ${x.detail}`);
    console.log(`\n12.0 preview: ${s.findings} finding(s) would block (${s.exempt} documented exemptions). check:contract blocks on any finding since 12.0.`);
    return 0;
  }
  if (args.includes('--check')) {
    const stale = !existsSync(mdPath) || readFileSync(mdPath, 'utf8') !== md || readFileSync(jsonPath, 'utf8') !== json;
    const s = summary(rows);
    for (const r of rows) for (const x of r.findings) console.log(`❌ <${r.tag}> ${x.rule}: ${x.detail} (${r.file})`);
    // 13.0.1: --check also requires coverage(rows, manifestTags()) to be empty — a new public component that is not audited fails CI
    for (const t of gap.missing) console.log(`❌ <${t}> is in the manifest but not audited — make its define function visible to scripts/contract-audit.mjs`);
    for (const t of gap.extra) console.log(`❌ <${t}> is audited but not in the manifest — add a gallery card or check gen-manifest.mjs`);
    const gaps = gap.missing.length + gap.extra.length;
    if (stale) console.log('❌ docs/contract-report.* is stale — run node scripts/contract-audit.mjs');
    if (!stale && !s.findings && !gaps) console.log(`✅ component contract — ${s.components} components (manifest tag set matches), 0 findings, ${s.exempt} documented exemptions`);
    if (gaps) return 1;
    return stale || s.findings ? 1 : 0;
  }
  writeFileSync(mdPath, md);
  writeFileSync(jsonPath, json);
  const s = summary(rows);
  console.log(`contract audit: ${s.components} components, ${s.clean} clean, ${s.findings} findings ${JSON.stringify(s.byRule)}${gap.missing.length + gap.extra.length ? ` — manifest gap: missing ${gap.missing.join(' ') || '—'}, extra ${gap.extra.join(' ') || '—'}` : ' — manifest tag set matches'}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) process.exitCode = run(process.argv.slice(2));
