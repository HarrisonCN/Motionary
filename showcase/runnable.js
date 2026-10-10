// 12.4: one runnable page per component, built from the AI manifest (dist/manifest.json, on the site /components.json).
// Pure functions (no DOM): used by showcase/run.html (component playground) and the tests.

const MOTIONARY_DIST = /https:\/\/(?:cdn\.jsdelivr\.net\/npm|unpkg\.com)\/motionary@\d+\/dist\//g;

/** Script URLs a page needs for this component, in load order: prerequisites (runtime core → modules, official runtimes) → bundles. */
export function scriptsFor(c) {
  const fromPre = c.prerequisites && c.prerequisites.cdn ? [...c.prerequisites.cdn.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]) : [];
  const list = fromPre.length ? fromPre : [c.cdn];
  if (!list.includes(c.cdn)) list.push(c.cdn);
  return list;
}

/** 'No prerequisites · basic tier' / 'Requires: motionary/runtime/drag-snap · standard tier'. */
export function depsLabel(c) {
  const mods = (c.prerequisites && c.prerequisites.modules) || [];
  return `${mods.length ? 'Requires: ' + mods.join(' + ') : 'No prerequisites'} · ${c.tier || 'basic'} tier`;
}

/** A complete HTML page that runs the component's example. base: replace the Motionary CDN with a local dist/ (for previews). */
export function runnablePage(c, { base, version } = {}) {
  const src = (u) => (base ? u.replace(MOTIONARY_DIST, base) : u);
  const L = [
    '<!doctype html>',
    '<html lang="en">',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${c.title} · Motionary</title>`,
    `<!-- <${c.tag}> · ${depsLabel(c)}${version ? ` · motionary ${version}` : ''} · docs: https://github.com/HarrisonCN/Motionary/blob/main/docs/components/${c.tag}.md -->`,
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:#0b0d12;color:#e8ecf3}</style>',
  ];
  const scripts = scriptsFor(c);
  if (scripts.length > 1) L.push('<!-- prerequisites first, then the component bundle -->');
  for (const u of scripts) L.push(`<script src="${src(u)}"></script>`);
  L.push('<body>', c.example, '</body>', '</html>');
  return L.join('\n') + '\n';
}

/** npm + bundler version (install, import + register in order, markup). */
export function esmSnippet(c) {
  if (c.prerequisites) return `// ${c.prerequisites.install}\n${c.prerequisites.importAndRegister}\n\n/* markup:\n${c.example}\n*/\n`;
  return `// npm i motionary\n${c.esm}\n`;
}
