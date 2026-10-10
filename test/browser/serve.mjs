#!/usr/bin/env node
// 13.1.0: static server for the Playwright browser suite (test/browser). Serves the repository root (dist/, showcase/)
// and /__fixture.html — an empty page with an import map that resolves every `motionary/*` subpath the way
// package.json `exports` names it, so a spec can run a component's manifest `esm` snippet as written.
//   node test/browser/serve.mjs [port]      (default 4173; PORT env works too)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { exportsToMap } from '../../showcase/runnable.js';

const ROOT = process.cwd();
const PORT = Number(process.argv[2] || process.env.PORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.cjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm' };

export function fixtureHtml() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const imports = Object.fromEntries(Object.entries(exportsToMap(pkg.exports)).map(([k, v]) => [k, '/dist/' + v]));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>motionary browser fixture</title>
<script type="importmap">${JSON.stringify({ imports })}</script>
<style>body{margin:0;font:16px system-ui,sans-serif}#stage{min-height:600px;padding:16px}</style>
</head><body><main id="stage"></main></body></html>`;
}

// a small opaque PNG for examples that point at photos (before.jpg, photo.jpg …): same-origin, so WebGL may upload it
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAABlklEQVR4nA3L0QBAIQxA0RCGEMIQhjCEEIYwhBBC2McFCCGEEEJ47/yf1hrS6A1tWMMboxGNbMzGalRjN07jNl6jNUGELqhgggtDCCGFKSyhhC0c4QpP/tCRTu9oxzreGZ3oZGd2Vqc6u3M6t/P6HxRRuqKKKa4MJZRUprKUUrZylKs8/YMhRjfUMMONYYSRxjSWUcY2jnGNZ39wxOmOOua4M5xw0pnOcsrZznGu8/wPAxn0gQ5s4IMxiEEO5mANarAHZ3AHb/whkKAHGljgwQgiyGAGK6hgBye4wYs/JJL0RBNLPBlJJJnMZCWV7OQkN3n5h4lM+kQnNvHJmMQkJ3OyJjXZkzO5kzf/sJBFX+jCFr4Yi1jkYi7WohZ7cRZ38dYfCil6oYUVXowiiixmsYoqdnGKW7z6w0Y2faMb2/hmbGKTm7lZm9rszdnczdt/OMihH/RgBz+MQxzyMA/rUId9OId7eOcPF7n0i17s4pdxiUte5mVd6rIv53Iv7/7hIY/+0Ic9/DEe8cjHfKxHPfbjPO7jPT74o6QQdaP0PQAAAABJRU5ErkJggg==', 'base64');

const server = createServer((req, res) => {
  let path;
  try { path = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); res.end(); return; }
  if (path === '/__img.png') { res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'no-store' }); res.end(PNG); return; }
  if (path === '/__fixture.html') { res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' }); res.end(fixtureHtml()); return; }
  const f = join(ROOT, normalize(path).replace(/^([/\\])+/, ''));
  if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store', 'access-control-allow-origin': '*' });
  res.end(readFileSync(f));
});
server.listen(PORT, '127.0.0.1', () => console.log(`motionary browser fixture on http://127.0.0.1:${PORT}/__fixture.html`));
