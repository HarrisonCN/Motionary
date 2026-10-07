/**
 * Visual playground (v3.7): no build step, dogfoods ../dist/components.js
 * (CDN fallback). State lives in the URL hash so compositions can be shared.
 */
import { PLAYGROUND_EFFECTS, PLAYGROUND_CONTENT, PLAYGROUND_TABS, PG_STRINGS, DEFAULT_STATE, findEffect, newLayer, composeMarkup, playgroundSnippets, encodeState, decodeState } from './playground-core.js';
import { highlight } from './codegen.js';

const LOCAL = new URL('../dist/', import.meta.url).href;
const CDN = 'https://unpkg.com/use-scroll-animate@3/dist/';
const $ = (s) => document.querySelector(s);
let lang = document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
let tab = 'html';
let state = (location.hash.length > 1 && decodeState(location.hash.slice(1))) || structuredClone(DEFAULT_STATE);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const t = (k) => PG_STRINGS[lang][k];

function h(tag, attrs = {}, kids = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  [].concat(kids).forEach((c) => c && el.append(c));
  return el;
}

function i18n() {
  document.querySelectorAll('[data-pg]').forEach((el) => (el.textContent = t(el.dataset.pg)));
  $('#pg-lang').textContent = lang === 'zh' ? 'English' : '中文';
  $('#pg-reduced').hidden = !reduced.matches;
  $('#pg-content').replaceChildren(...Object.entries(PLAYGROUND_CONTENT).map(([id, c]) => h('option', { value: id, text: c[lang], selected: id === state.content })));
  $('#pg-effect').replaceChildren(...PLAYGROUND_EFFECTS.map((e) => h('option', { value: e.tag, text: `${e[lang]} <${e.tag}>` })));
}

function control(layer, c, i) {
  const id = `pg-${i}-${c.key}`;
  const set = (v) => {
    layer.attrs[c.key] = v;
    update();
  };
  let input;
  if (c.type === 'select') input = h('select', { id, onchange: (e) => set(e.target.value) }, c.values.map((v) => h('option', { value: v, text: v, selected: String(layer.attrs[c.key]) === String(v) })));
  else if (c.type === 'flag') input = h('input', { id, type: 'checkbox', checked: !!layer.attrs[c.key], onchange: (e) => set(e.target.checked) });
  else if (c.type === 'range') input = h('input', { id, type: 'range', min: c.min, max: c.max, step: c.step, value: layer.attrs[c.key], oninput: (e) => set(Number(e.target.value)) });
  else input = h('input', { id, type: 'text', value: layer.attrs[c.key], onchange: (e) => set(e.target.value) });
  return h('label', { class: 'pg-ctl', for: id }, [h('span', { text: c.key }), input, c.type === 'range' ? h('output', { text: String(layer.attrs[c.key]) }) : null]);
}

function renderLayers() {
  const list = $('#pg-layers');
  if (!state.layers.length) return list.replaceChildren(h('li', { class: 'pg-empty', text: t('empty') }));
  list.replaceChildren(
    ...state.layers.map((layer, i) => {
      const fx = findEffect(layer.tag);
      const move = (d) => () => {
        const j = i + d;
        if (j < 0 || j >= state.layers.length) return;
        [state.layers[i], state.layers[j]] = [state.layers[j], state.layers[i]];
        renderLayers();
        update();
      };
      return h('li', { class: 'pg-layer' }, [
        h('div', { class: 'pg-row' }, [
          h('strong', { text: `${fx[lang]}` }),
          h('code', { text: `<${layer.tag}>` }),
          h('span', { class: 'pg-layer-btns' }, [
            h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('up'), text: '↑', onclick: move(-1) }),
            h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('down'), text: '↓', onclick: move(1) }),
            h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('remove'), text: '×', onclick: () => (state.layers.splice(i, 1), renderLayers(), update()) }),
          ]),
        ]),
        h('div', { class: 'pg-ctls' }, fx.controls.map((c) => control(layer, c, i))),
      ]);
    })
  );
}

function renderCode() {
  const out = playgroundSnippets(state);
  $('#pg-tabs').replaceChildren(
    ...PLAYGROUND_TABS.map((x) => h('button', { type: 'button', role: 'tab', class: 'pg-tab', 'aria-selected': String(x.id === tab), text: x[lang], onclick: () => ((tab = x.id), renderCode()) }))
  );
  $('#pg-out').innerHTML = highlight(out[tab]);
}

function update() {
  $('#pg-stage').innerHTML = composeMarkup(state);
  document.querySelectorAll('.pg-ctl output').forEach((o) => (o.textContent = o.previousElementSibling.value));
  renderCode();
  history.replaceState(null, '', `#${encodeState(state)}`);
}

async function boot() {
  i18n();
  renderLayers();
  update();
  $('#pg-add').addEventListener('click', () => {
    state.layers.push(newLayer($('#pg-effect').value));
    renderLayers();
    update();
  });
  $('#pg-content').addEventListener('change', (e) => ((state.content = e.target.value), update()));
  $('#pg-replay').addEventListener('click', update);
  $('#pg-copy').addEventListener('click', async () => {
    await navigator.clipboard?.writeText(playgroundSnippets(state)[tab]);
    $('#pg-copy').textContent = t('copied');
    setTimeout(() => ($('#pg-copy').textContent = t('copy')), 1200);
  });
  $('#pg-share').addEventListener('click', () => navigator.clipboard?.writeText(location.href));
  $('#pg-lang').addEventListener('click', () => {
    lang = lang === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('usa-showcase:lang', lang); } catch {}
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    i18n();
    renderLayers();
    renderCode();
  });
  reduced.addEventListener?.('change', i18n);
  let lib;
  try {
    lib = await import(LOCAL + 'components.js');
  } catch {
    lib = await import(CDN + 'components.js');
  }
  lib.defineComponents();
}

boot();
