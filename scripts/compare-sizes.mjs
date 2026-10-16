#!/usr/bin/env node
// compare-sizes.mjs — measures the gzip size of Motionary and the libraries compared in docs/compare/*.md.
// Usage: node scripts/compare-sizes.mjs [--motionary <version>] [--write]
// Installs exact published versions into a temp dir (needs network), then
//  - gzips prebuilt browser files as shipped (AOS js + css, Motionary UMD), and
//  - bundles small ESM entry points with this repo's rollup + node-resolve + terser (tree-shaken, minified),
// all with gzip level 9. Numbers are bytes. With --write the result goes to docs/compare/sizes.json.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const MOTIONARY = arg('--motionary', JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version);
const VERSIONS = { aos: '2.3.4', gsap: '3.15.0', lenis: '1.3.27', motion: '14.3.0', motionary: MOTIONARY };

const dir = mkdtempSync(join(tmpdir(), 'cmp-'));
writeFileSync(join(dir, 'package.json'), JSON.stringify({ private: true, dependencies: VERSIONS }));
execFileSync('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts', '--loglevel=error'], { cwd: dir, stdio: 'inherit' });

const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const file = (p) => { const b = readFileSync(join(dir, 'node_modules', p)); return { raw: b.length, gzip: gz(b) }; };

const imp = (p) => import(pathToFileURL(join(ROOT, 'node_modules', p)).href);
const { rollup } = await imp('rollup/dist/es/rollup.js');
const terser = (await imp('@rollup/plugin-terser/dist/es/index.js')).default;
const resolve = (await imp('@rollup/plugin-node-resolve/dist/es/index.js')).default;
async function bundle(src) {
  const b = await rollup({
    input: 'v', onwarn: () => {},
    plugins: [{ name: 'v', resolveId: (i) => (i === 'v' ? i : null), load: (i) => (i === 'v' ? src : null) },
      resolve({ browser: true, rootDir: dir, modulePaths: [join(dir, 'node_modules')] }), terser()],
  });
  const { output } = await b.generate({ format: 'es', inlineDynamicImports: true });
  const c = Buffer.from(output[0].code);
  return { raw: c.length, gzip: gz(c) };
}
const at = (p) => join(dir, 'node_modules', p);
const rows = [];
const add = (library, what, how, m) => { rows.push({ library, version: VERSIONS[library], what, how, ...m }); };

{ const js = file('aos/dist/aos.js'), css = file('aos/dist/aos.css');
  add('aos', 'aos.js + aos.css', 'prebuilt files as shipped', { raw: js.raw + css.raw, gzip: js.gzip + css.gzip, parts: { 'aos.js': js, 'aos.css': css } }); }
add('gsap', 'gsap + ScrollTrigger', 'rollup + terser, ESM',
  await bundle(`import gsap from '${at('gsap/index.js')}'; import { ScrollTrigger } from '${at('gsap/ScrollTrigger.js')}'; gsap.registerPlugin(ScrollTrigger); window.x=[gsap,ScrollTrigger];`));
add('lenis', 'Lenis (smooth scroll only)', 'rollup + terser, ESM', await bundle(`import Lenis from 'lenis'; window.x=new Lenis();`));
add('motion', '{ animate, scroll, inView }', 'rollup + terser, ESM', await bundle(`import { animate, scroll, inView } from 'motion'; window.x=[animate,scroll,inView];`));
add('motionary', 'dist/index.umd.js (scroll reveal, 33 presets)', 'prebuilt file as shipped', file('motionary/dist/index.umd.js'));
add('motionary', "default import from 'motionary'", 'rollup + terser, ESM', await bundle(`import ScrollAnimate from 'motionary'; window.x=ScrollAnimate;`));
add('motionary', "smoothScroll from 'motionary/runtime/smooth'", 'rollup + terser, ESM', await bundle(`import { smoothScroll } from 'motionary/runtime/smooth'; window.x=smoothScroll();`));

const out = { measured: new Date().toISOString().slice(0, 10), gzipLevel: 9, node: process.version, rows };
for (const r of rows) console.log(`${r.library}@${r.version}\t${r.what}\tgzip=${r.gzip}\traw=${r.raw}`);
if (process.argv.includes('--write')) {
  mkdirSync(join(ROOT, 'docs/compare'), { recursive: true });
  writeFileSync(join(ROOT, 'docs/compare/sizes.json'), JSON.stringify(out, null, 2) + '\n');
  console.log('wrote docs/compare/sizes.json');
}
