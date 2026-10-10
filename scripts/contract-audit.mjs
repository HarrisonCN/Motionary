// 11.7: component contract audit (report only). Scans every `<usa-*>` element in src/components and checks the six parts
// of the component contract — attributes, events, keyboard, lifecycle, reduced motion, error messages — against the rules
// below, then writes docs/contract-report.md (+ docs/contract-report.json). `--check` exits 1 when the committed report is
// stale. Findings never fail the build in 11.x; 12.0 makes the contract test blocking.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'); // string form: under jsdom (vitest) `URL` is not Node's
const walk = (d) => readdirSync(d).sort().flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') && !p.endsWith('.d.ts') ? [p] : []; });

/** The rules: id → [contract part, description]. */
export const RULES = {
  'attr-unobserved': ['attributes', 'reads an attribute (str/num/flag) that is not in observedAttributes — changing it later has no effect'],
  'event-prefix': ['events', 'dispatches a CustomEvent whose name does not start with `usa:` (use this.emit())'],
  'event-bubbles': ['events', 'dispatches a CustomEvent without bubbles: true (this.emit() bubbles and composes)'],
  'keyboard-click-only': ['keyboard', 'reacts to click / pointer input on the host but has no keyboard handling and no native control inside'],
  'lifecycle-global-listener': ['lifecycle', 'adds a window / document listener directly — not removed on disconnect (use this.listen())'],
  'lifecycle-timer': ['lifecycle', 'starts setInterval without clearing it on disconnect (onCleanup / clearInterval)'],
  'reduced-motion': ['reduced motion', 'animates (el.animate / requestAnimationFrame loop) without checking reduced motion (this.reduced, this.motion(), prefersReducedMotion())'],
  'error-prefix': ['errors', 'throws / logs a message that does not start with `[motionary]`'],
};

function scanElement(tag, file, body) {
  const f = [];
  // 11.8: `// contract-exempt: <rule> — <reason>` inside an element's source skips that rule for it (listed in the report)
  const exempt = [...body.matchAll(/contract-exempt:\s*([\w-]+)\s*(?:—|-)\s*([^\n*]*)/g)].map((m) => ({ rule: m[1], reason: m[2].trim() }));
  const add = (rule, detail) => { if (!exempt.some((e) => e.rule === rule)) f.push({ rule, detail }); };
  const obs = /observedAttributes\(\)[^{]*\{\s*return \[([\s\S]*?)\];/.exec(body);
  const observed = new Set(obs ? [...obs[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : []);
  const spreads = obs && /\.\.\./.test(obs[1]);
  const reads = [...new Set([...body.matchAll(/this\.(?:str|num|flag)\(\s*'([\w-]+)'/g)].map((x) => x[1]))];
  if (!spreads) for (const a of reads) if (!observed.has(a)) add('attr-unobserved', a);
  const events = [...new Set([...body.matchAll(/\.emit\(\s*'([\w:-]+)'/g)].map((x) => 'usa:' + x[1]))];
  for (const m of body.matchAll(/new CustomEvent(?:<[^>]*>)?\(\s*['`]([^'`]+)['`]([^;\n]{0,160})/g)) {
    if (!m[1].startsWith('usa:')) add('event-prefix', m[1]);
    else if (!/bubbles:\s*true/.test(m[2] || '')) add('event-bubbles', m[1]);
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
  return { tag, file: relative(ROOT, file), attributes: [...observed], events, keyboard, lifecycle: /onCleanup|this\.listen\(|unmount\(/.test(body), reducedMotion: guarded || !animates, exempt, findings: f };
}

/** Scan src/components → [{ tag, file, attributes, events, keyboard, lifecycle, reducedMotion, findings }] sorted by tag. */
export function audit(root = ROOT) {
  const out = new Map();
  for (const file of walk(join(root, 'src/components'))) {
    const s = readFileSync(file, 'utf8');
    const hits = [...s.matchAll(/export function (define\w+)\(tag = '([a-z][a-z0-9]*-[a-z0-9-]+)'/g)];
    hits.forEach((m, i) => {
      if (out.has(m[2])) return;
      out.set(m[2], scanElement(m[2], file, s.slice(m.index, hits[i + 1]?.index ?? s.length)));
    });
  }
  return [...out.values()].sort((a, b) => a.tag.localeCompare(b.tag));
}

export function summary(rows) {
  const byRule = Object.fromEntries(Object.keys(RULES).map((r) => [r, 0]));
  for (const r of rows) for (const x of r.findings) byRule[x.rule]++;
  return { components: rows.length, clean: rows.filter((r) => !r.findings.length).length, findings: Object.values(byRule).reduce((a, b) => a + b, 0), exempt: rows.reduce((n, r) => n + r.exempt.length, 0), byRule };
}

export function renderMarkdown(rows) {
  const s = summary(rows);
  const lines = [
    `# Component contract report`,
    '',
    `Generated by \`node scripts/contract-audit.mjs\` against the rules of [component-contract.md](./component-contract.md). Report only in 11.x — 12.0 makes the contract test blocking.`,
    '',
    `**${s.components} components · ${s.clean} without findings · ${s.findings} findings · ${s.exempt} documented exemptions.**`,
    '',
    '| Rule | Contract part | Findings | What it means |',
    '|---|---|---|---|',
    ...Object.entries(RULES).map(([id, [part, d]]) => `| \`${id}\` | ${part} | ${s.byRule[id]} | ${d} |`),
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
    ...rows.flatMap((r) => r.exempt.map((e) => `| \`<${r.tag}>\` | \`${e.rule}\` | ${e.reason.replace(/\|/g, '\\|')} |`)),
    '',
  ];
  return lines.join('\n');
}

export function run(args = []) {
  const rows = audit();
  const md = renderMarkdown(rows);
  const json = JSON.stringify({ format: 'motionary/contract-report', version: 1, summary: summary(rows), components: rows }, null, 2) + '\n';
  const mdPath = join(ROOT, 'docs/contract-report.md'), jsonPath = join(ROOT, 'docs/contract-report.json');
  if (args.includes('--preview')) {
    // 11.9: what the blocking 12.0 contract check would say today (never fails in 11.x)
    const s = summary(rows);
    for (const r of rows) for (const x of r.findings) console.log(`${r.tag}  ${x.rule}  ${x.detail}`);
    console.log(`\n12.0 preview: ${s.findings} finding(s) would block (${s.exempt} documented exemptions). Report only until 12.0.`);
    return 0;
  }
  if (args.includes('--check')) {
    const stale = !existsSync(mdPath) || readFileSync(mdPath, 'utf8') !== md || readFileSync(jsonPath, 'utf8') !== json;
    console.log(stale ? '❌ docs/contract-report.* is stale — run node scripts/contract-audit.mjs' : `✅ contract report up to date (${summary(rows).findings} findings, report only)`);
    return stale ? 1 : 0;
  }
  writeFileSync(mdPath, md);
  writeFileSync(jsonPath, json);
  const s = summary(rows);
  console.log(`contract audit: ${s.components} components, ${s.clean} clean, ${s.findings} findings ${JSON.stringify(s.byRule)}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) process.exitCode = run(process.argv.slice(2));
