// Motionary export — Figma plugin (12.3). Source of figma-plugin/code.js: `node scripts/gen-figma-plugin.mjs` embeds the component
// catalog (from the AI manifest) where CATALOG is declared and writes code.js. Edit this file, not code.js.
//
// Select layers and run the plugin. It exports:
//   • motion tokens — Figma variables named motion/duration/<name> (number, ms) and motion/easing/<name> (string, a CSS easing),
//     or Motionary's defaults when the file has none — as W3C design tokens (motion.tokens.json) and CSS custom properties;
//   • component snippets — a layer named after a component (`usa-tilt`, `<usa-tilt>`, or plugin data motionary:tag) becomes that
//     element, its component properties become attributes, its prototype interactions a data-motion string — wrapped in a
//     complete HTML page (tokens + every prerequisite script in the right order + the component bundle) you can paste and run.
// The plugin never touches the network (manifest: networkAccess none) and never changes the document.

var MOTIONARY_MAJOR = '/*MAJOR*/';
var CATALOG = /*CATALOG*/ {};
var DEFAULT_TOKENS = /*TOKENS*/ {};

var EASE = { LINEAR: 'linear', EASE_IN: 'ease-in', EASE_OUT: 'ease-out', EASE_IN_AND_OUT: 'ease-in-out', EASE_OUT_BACK: 'cubic-bezier(0.34, 1.56, 0.64, 1)', GENTLE: 'cubic-bezier(0.22, 1, 0.36, 1)' };
var TRIG = { ON_CLICK: 'click', ON_PRESS: 'click', ON_HOVER: 'hover', MOUSE_ENTER: 'hover', AFTER_TIMEOUT: 'load' };
var DIR = { LEFT: 'left', RIGHT: 'right', TOP: 'down', BOTTOM: 'up' };

/** Prototype reactions → a Motionary data-motion string (same mapping as figmaToMotion() in motionary/design). */
function toMotion(reactions) {
  return (reactions || [])
    .map(function (r) {
      var t = TRIG[r.trigger && r.trigger.type];
      var tr = (r.action && r.action.transition) || (r.actions && r.actions[0] && r.actions[0].transition);
      if (!t || !tr) return null;
      var fx = tr.type === 'DISSOLVE' ? 'fade' : tr.type === 'SMART_ANIMATE' ? 'scale' : 'fade-' + (DIR[tr.direction] || 'up');
      var parts = [t + ': ' + fx, Math.round((tr.duration || 0.3) * 1000) + 'ms'];
      if (tr.easing && EASE[tr.easing.type]) parts.push(EASE[tr.easing.type]);
      return parts.join(' ');
    })
    .filter(Boolean)
    .join('; ');
}

/** [{ name: 'motion/duration/fast', type: 'FLOAT', value: 150 }, …] → W3C tokens: Motionary's defaults, overridden / extended by the file's variables. */
function variablesToTokens(vars) {
  var out = JSON.parse(JSON.stringify(DEFAULT_TOKENS)), n = 0;
  (vars || []).forEach(function (v) {
    var p = String(v.name || '').split('/').map(function (s) { return s.trim().toLowerCase().replace(/\s+/g, '-'); });
    if (p[0] !== 'motion' || p.length !== 3) return;
    if (p[1] === 'duration' && typeof v.value === 'number') { out.motion.duration[p[2]] = { $type: 'duration', $value: v.value + 'ms' }; n++; }
    else if (p[1] === 'easing' && typeof v.value === 'string') {
      var m = v.value.match(/^cubic-bezier\(([^)]*)\)$/);
      out.motion.easing[p[2]] = m ? { $type: 'cubicBezier', $value: m[1].split(',').map(Number) } : { $type: 'string', $value: v.value };
      n++;
    }
  });
  out.$extensions = { 'com.motionary': { fromFigmaVariables: n } };
  return out;
}

/** W3C tokens → CSS custom properties (the names motionary components read). */
function tokensToCss(tokens) {
  var m = (tokens && tokens.motion) || {}, L = [':root {'];
  Object.keys(m.duration || {}).forEach(function (k) { L.push('  --usa-duration-' + k + ': ' + m.duration[k].$value + ';'); });
  Object.keys(m.easing || {}).forEach(function (k) {
    var v = m.easing[k].$value;
    L.push('  --usa-easing-' + k + ': ' + (Array.isArray(v) ? 'cubic-bezier(' + v.join(', ') + ')' : v) + ';');
  });
  L.push('}');
  return L.join('\n');
}

var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
var kebab = function (s) { return String(s).replace(/#.*$/, '').trim().replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase(); };

/** One layer → { tag, attrs, motion, text, known }. node: { name, characters, reactions, componentProperties, pluginTag, children }. */
function nodeToElement(node) {
  var m = String(node.pluginTag || node.name || '').match(/usa-[a-z0-9-]+/i);
  var tag = m ? m[0].toLowerCase() : null;
  var info = tag ? CATALOG[tag] : null;
  var attrs = [];
  var props = node.componentProperties || {};
  Object.keys(props).forEach(function (k) {
    var name = kebab(k), v = props[k] && 'value' in props[k] ? props[k].value : props[k];
    if (info && info.a.indexOf(name) < 0) return; // only attributes the component has
    if (v === true) attrs.push(name);
    else if (v !== false && v != null && v !== '') attrs.push(name + '="' + esc(v) + '"');
  });
  var text = node.characters || (node.children || []).map(function (c) { return c.characters || ''; }).filter(Boolean).join(' ');
  return { tag: tag, known: !!info, attrs: attrs, motion: toMotion(node.reactions), text: text, name: node.name };
}

/** Elements → a complete, runnable HTML page: tokens, prerequisites (runtime first), the component bundle(s), the markup. */
function buildHtml(elements, tokens) {
  var cdn = function (f) { return (f.indexOf('runtime') === 0 ? 'https://cdn.jsdelivr.net/npm/motionary@' : 'https://unpkg.com/motionary@') + MOTIONARY_MAJOR + '/dist/' + f; };
  var pre = [], bundles = [], seen = {};
  var add = function (list, f) { if (!seen[f]) { seen[f] = 1; list.push(f); } };
  elements.forEach(function (e) {
    var info = e.tag && CATALOG[e.tag];
    if (!info) return;
    if (info.r.length) { add(pre, 'runtime.iife.js'); info.r.forEach(function (r) { if (r !== 'core') add(pre, 'runtime/' + r + '.iife.js'); }); }
    add(bundles, info.b === 'w' ? 'widgets.umd.js' : 'components.umd.js');
  });
  var peers = [];
  elements.forEach(function (e) { var info = e.tag && CATALOG[e.tag]; if (info && info.p) info.p.forEach(function (x) { if (peers.indexOf(x) < 0) peers.push(x); }); });
  var body = elements.map(function (e) {
    var inner = esc(e.text || (e.tag ? '' : e.name || ''));
    var motion = e.motion ? ' data-motion="' + esc(e.motion) + '"' : '';
    if (!e.tag) return '<div' + motion + '>' + inner + '</div>';
    return '<' + e.tag + (e.attrs.length ? ' ' + e.attrs.join(' ') : '') + motion + '>' + inner + '</' + e.tag + '>';
  });
  var L = ['<!doctype html>', '<html lang="en">', '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">', '<title>Motionary export</title>', '<style>', tokensToCss(tokens), '</style>'];
  if (peers.length) L.push('<!-- also needs: ' + peers.join(', ') + ' (official runtime, optional peer) — see the component docs -->');
  if (pre.length) L.push('<!-- prerequisites first: the motionary/runtime core, then its modules -->');
  pre.concat(bundles).forEach(function (f) { L.push('<script src="' + cdn(f) + '"></script>'); });
  if (elements.some(function (e) { return e.motion; })) L.push('<script type="module">import { applyMotion } from \'https://unpkg.com/motionary@' + MOTIONARY_MAJOR + '/dist/components/dsl.js\'; applyMotion();</script>');
  L.push('<body>');
  body.forEach(function (b) { L.push(b); });
  L.push('</body>', '</html>');
  return L.join('\n') + '\n';
}

function exportSelection(nodes, vars) {
  var tokens = variablesToTokens(vars);
  var elements = (nodes || []).map(nodeToElement);
  return {
    tokens: JSON.stringify(tokens, null, 2),
    css: tokensToCss(tokens),
    html: buildHtml(elements, tokens),
    rows: elements.map(function (e) { return { name: e.name, tag: e.tag, known: e.known, motion: e.motion }; }),
  };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { toMotion: toMotion, variablesToTokens: variablesToTokens, tokensToCss: tokensToCss, nodeToElement: nodeToElement, buildHtml: buildHtml, exportSelection: exportSelection, CATALOG: CATALOG, MOTIONARY_MAJOR: MOTIONARY_MAJOR };

if (typeof figma !== 'undefined') {
  figma.showUI(__html__, { width: 420, height: 560 });
  var plain = function (n) {
    var props = {};
    try { if (n.type === 'INSTANCE' && n.componentProperties) props = n.componentProperties; } catch (e) {}
    var tag = '';
    try { tag = n.getPluginData ? n.getPluginData('motionary:tag') : ''; } catch (e) {}
    return { name: n.name, characters: n.type === 'TEXT' ? n.characters : '', reactions: 'reactions' in n ? n.reactions : [], componentProperties: props, pluginTag: tag, children: 'children' in n ? n.children.filter(function (c) { return c.type === 'TEXT'; }).map(function (c) { return { characters: c.characters }; }) : [] };
  };
  var run = function (vars) { figma.ui.postMessage(exportSelection(figma.currentPage.selection.map(plain), vars)); };
  var getVars = figma.variables && figma.variables.getLocalVariablesAsync ? figma.variables.getLocalVariablesAsync() : Promise.resolve([]);
  getVars.then(function (list) {
    run(list.map(function (v) { var mode = Object.keys(v.valuesByMode || {})[0]; return { name: v.name, type: v.resolvedType, value: mode ? v.valuesByMode[mode] : undefined }; }));
  }, function () { run([]); });
  figma.ui.onmessage = function (m) { if (m === 'close') figma.closePlugin(); };
}
