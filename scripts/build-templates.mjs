#!/usr/bin/env node
// 14.8: the starter Motion Studio templates shipped in the package (templates/*.motionary-template.json + index.json).
// Built from the source definitions below with the local build (dist/components/studio-templates.js), deterministic:
// `node scripts/build-templates.mjs` rewrites them, `--check` fails when a committed file differs.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = await import(pathToFileURL(join(ROOT, 'dist/components/studio-templates.js')).href);
const E = await import(pathToFileURL(join(ROOT, 'dist/components/timeline-editor.js')).href);
const enc = (s) => new TextEncoder().encode(s);
const DOTS = enc('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="1.5" fill="#94a3b8"/></svg>\n');

const DEFS = [
  {
    manifest: { id: 'fade-up-hero', name: 'Fade-up hero', version: '1.0.0', license: 'MIT', author: 'Motionary', description: 'A hero title and subtitle fade up over a dotted background that eases in.', requires: ['motionary/studio'], preview: { time: 300 } },
    assets: { 'img/dots.svg': DOTS },
    doc: E.createTimelineDoc({ name: 'Fade-up hero', seed: 1, layers: [
      { id: 'hero', type: 'group', name: 'Hero' },
      { id: 'bg', type: 'track', parent: 'hero', target: '#hero-bg', keyframes: [
        { id: 'bg0', time: 0, props: { opacity: 0, 'background-image': 'url("img/dots.svg")' }, easing: 'ease-out' },
        { id: 'bg1', time: 600, props: { opacity: 1 } },
      ] },
      { id: 'title', type: 'track', parent: 'hero', target: '#hero-title', keyframes: [
        { id: 't0', time: 0, props: { opacity: 0, transform: 'translateY(24px)' }, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
        { id: 't1', time: 500, props: { opacity: 1, transform: 'translateY(0px)' } },
      ] },
      { id: 'sub', type: 'track', parent: 'hero', target: '#hero-sub', keyframes: [
        { id: 's0', time: 0, props: { opacity: 0, transform: 'translateY(16px)' } },
        { id: 's1', time: 150, props: { opacity: 0, transform: 'translateY(16px)' }, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
        { id: 's2', time: 650, props: { opacity: 1, transform: 'translateY(0px)' } },
      ] },
    ] }),
  },
  {
    manifest: { id: 'stagger-cards', name: 'Stagger cards', version: '1.0.0', license: 'MIT', author: 'Motionary', description: 'Three cards rise and scale in one after another.', requires: ['motionary/studio'], preview: { time: 400 } },
    assets: {},
    doc: E.createTimelineDoc({ name: 'Stagger cards', seed: 1, layers: [1, 2, 3].map((n) => ({
      id: `card${n}`, type: 'track', target: `#card-${n}`, keyframes: [
        { id: `c${n}a`, time: 0, props: { opacity: 0, transform: 'translateY(32px) scale(0.96)' } },
        { id: `c${n}b`, time: (n - 1) * 120, props: { opacity: 0, transform: 'translateY(32px) scale(0.96)' }, easing: 'ease-out' },
        { id: `c${n}c`, time: (n - 1) * 120 + 450, props: { opacity: 1, transform: 'translateY(0px) scale(1)' } },
      ],
    })) }),
  },
  {
    manifest: { id: 'badge-pop', name: 'Badge pop', version: '1.0.0', license: 'MIT', author: 'Motionary', description: 'A badge pops in with a small overshoot and its colour settles.', requires: ['motionary/studio'], preview: { time: 250 } },
    assets: {},
    doc: E.createTimelineDoc({ name: 'Badge pop', seed: 1, layers: [
      { id: 'badge', type: 'track', target: '#badge', keyframes: [
        { id: 'b0', time: 0, props: { opacity: 0, transform: 'scale(0.6)', 'background-color': '#f59e0b' }, easing: 'ease-out' },
        { id: 'b1', time: 220, props: { opacity: 1, transform: 'scale(1.08)', 'background-color': '#f97316' }, easing: 'ease-in-out' },
        { id: 'b2', time: 420, props: { opacity: 1, transform: 'scale(1)', 'background-color': '#ef4444' } },
      ] },
    ] }),
  },
];

const out = new Map();
const index = { format: 'motionary-template-index', version: 1, templates: [] };
for (const d of DEFS) {
  const t = T.createTemplate({ doc: d.doc }, { manifest: d.manifest, assets: d.assets });
  const file = `${d.manifest.id}.motionary-template.json`;
  out.set(file, T.serializeTemplate(t));
  index.templates.push({ id: d.manifest.id, file, name: d.manifest.name, version: d.manifest.version, license: d.manifest.license, integrity: t.integrity });
}
out.set('index.json', JSON.stringify(index, null, 2) + '\n');
const dir = join(ROOT, 'templates');
if (process.argv.includes('--check')) {
  const bad = [...out].filter(([f, s]) => !existsSync(join(dir, f)) || readFileSync(join(dir, f), 'utf8') !== s).map(([f]) => f);
  if (bad.length) { console.error(`templates out of date: ${bad.join(', ')} — run node scripts/build-templates.mjs`); process.exit(1); }
  console.log(`templates ok (${DEFS.length})`);
} else {
  mkdirSync(dir, { recursive: true });
  for (const [f, s] of out) writeFileSync(join(dir, f), s);
  console.log(`wrote ${out.size} files to templates/`);
}
