/**
 * Visual playground (v3.7): no build step, dogfoods ../dist/components.js
 * (CDN fallback). State lives in the URL hash so compositions can be shared.
 */
import { PLAYGROUND_EFFECTS, PLAYGROUND_CONTENT, PLAYGROUND_TABS, PG_STRINGS, DEFAULT_STATE, DEFAULT_TRACKS, TRACK_PRESETS, TRACK_LIMITS, findEffect, newTrack, normalizeTracks, tracksDuration, trackBar, dragTrack, timelineMarkup, listPresets, savePreset, loadPreset, deletePreset, presetToJSON, presetFromJSON, newLayer, composeMarkup, playgroundSnippets, encodeState, decodeState } from './playground-core.js';
import { highlight } from './codegen.js';

const LOCAL = new URL('../dist/', import.meta.url).href;
const CDN = 'https://unpkg.com/use-scroll-animate@6/dist/';
const $ = (s) => document.querySelector(s);
let lang = document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
let tab = 'html';
let state = (location.hash.length > 1 && decodeState(location.hash.slice(1))) || structuredClone(DEFAULT_STATE);
if (!state.tracks) state.tracks = structuredClone(DEFAULT_TRACKS);
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

// --- 4.6 keyframe track editor ---
function renderTracks() {
  const total = Math.max(tracksDuration(state.tracks), 1000);
  $('#pg-ruler').replaceChildren(...[0, 0.25, 0.5, 0.75, 1].map((f) => h('span', { style: `left:${f * 100}%`, text: `${Math.round(total * f)}ms` })));
  $('#pg-tracks').replaceChildren(
    ...state.tracks.map((tr, i) => {
      const set = (k) => (e) => {
        state.tracks[i] = newTrack(k === 'preset' ? e.target.value : tr.preset, k === 'start' ? e.target.value : tr.start, k === 'duration' ? e.target.value : tr.duration, k === 'label' ? e.target.value : tr.label);
        renderTracks();
        update();
      };
      const bar = trackBar(tr, total);
      const el = h('span', { class: 'pg-bar', tabindex: '0', role: 'slider', 'aria-label': `${tr.label || tr.preset} ${t('start')}`, 'aria-valuemin': TRACK_LIMITS.start[0], 'aria-valuemax': TRACK_LIMITS.start[1], 'aria-valuenow': tr.start, style: `left:${bar.left}%;width:${bar.width}%`, text: tr.preset }, [h('i', { 'data-resize': '' })]);
      el.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 50 : e.key === 'ArrowLeft' ? -50 : 0;
        if (!d) return;
        e.preventDefault();
        state.tracks[i] = dragTrack(tr, e.shiftKey ? 'resize' : 'move', d);
        renderTracks();
        update();
        $('#pg-tracks').children[i]?.querySelector('.pg-bar')?.focus();
      });
      el.addEventListener('pointerdown', (e) => {
        const lane = el.parentElement.getBoundingClientRect();
        const mode = e.target.hasAttribute('data-resize') ? 'resize' : 'move';
        const x0 = e.clientX;
        const orig = { ...tr };
        el.setPointerCapture(e.pointerId);
        const mv = (ev) => {
          const next = dragTrack(orig, mode, ((ev.clientX - x0) / lane.width) * total);
          state.tracks[i] = next;
          const b = trackBar(next, total);
          el.style.left = `${b.left}%`;
          el.style.width = `${b.width}%`;
        };
        const up = () => {
          el.removeEventListener('pointermove', mv);
          renderTracks();
          update();
        };
        el.addEventListener('pointermove', mv);
        el.addEventListener('pointerup', up, { once: true });
      });
      return h('li', { class: 'pg-track' }, [
        h('div', { class: 'pg-track-ctl' }, [
          h('select', { 'aria-label': 'preset', onchange: set('preset') }, TRACK_PRESETS.map((p) => h('option', { value: p, text: p, selected: p === tr.preset }))),
          h('input', { type: 'text', 'aria-label': t('label'), value: tr.label, placeholder: t('label'), onchange: set('label') }),
          h('input', { type: 'number', 'aria-label': t('start'), min: TRACK_LIMITS.start[0], max: TRACK_LIMITS.start[1], step: 50, value: tr.start, onchange: set('start') }),
          h('input', { type: 'number', 'aria-label': t('duration'), min: TRACK_LIMITS.duration[0], max: TRACK_LIMITS.duration[1], step: 50, value: tr.duration, onchange: set('duration') }),
          h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('remove'), text: '×', onclick: () => (state.tracks.splice(i, 1), renderTracks(), update()) }),
        ]),
        h('div', { class: 'pg-lane' }, [el]),
      ]);
    })
  );
}

function playTimeline() {
  const stage = $('#pg-tl-stage');
  stage.innerHTML = timelineMarkup(state.tracks, { trigger: 'manual' });
  requestAnimationFrame(() => stage.querySelector('usa-timeline')?.play?.());
}

function renderPresets(selected) {
  const all = listPresets();
  $('#pg-preset-list').replaceChildren(h('option', { value: '', text: '—' }), ...Object.keys(all).map((n) => h('option', { value: n, text: n, selected: n === selected })));
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

let copy = () => {};
async function boot() {
  i18n();
  renderLayers();
  renderTracks();
  renderPresets();
  update();
  $('#pg-add-track').addEventListener('click', () => {
    state.tracks.push(newTrack('fade-up', tracksDuration(state.tracks), 500, `Step ${state.tracks.length + 1}`));
    renderTracks();
    update();
  });
  $('#pg-play-tl').addEventListener('click', playTimeline);
  $('#pg-preset-save').addEventListener('click', () => {
    const name = $('#pg-preset-name').value.trim() || `Preset ${Object.keys(listPresets()).length + 1}`;
    savePreset(name, state);
    renderPresets(name);
  });
  $('#pg-preset-list').addEventListener('change', (e) => {
    const s2 = e.target.value && loadPreset(e.target.value);
    if (!s2) return;
    state = { ...s2, tracks: s2.tracks || structuredClone(DEFAULT_TRACKS) };
    $('#pg-preset-name').value = e.target.value;
    renderLayers();
    renderTracks();
    update();
  });
  $('#pg-preset-del').addEventListener('click', () => {
    const n = $('#pg-preset-list').value;
    if (n) deletePreset(n);
    renderPresets();
  });
  $('#pg-preset-json').addEventListener('click', () => copy($('#pg-preset-json'), presetToJSON($('#pg-preset-name').value || 'preset', state), 'copied', 'exportJson'));
  $('#pg-preset-file').addEventListener('change', async (e) => {
    const f = e.target.files?.[0];
    const p = f && presetFromJSON(await f.text());
    if (!p) return;
    savePreset(p.name, p.state);
    state = { ...p.state, tracks: p.state.tracks || structuredClone(DEFAULT_TRACKS) };
    renderPresets(p.name);
    renderLayers();
    renderTracks();
    update();
  });
  $('#pg-add').addEventListener('click', () => {
    state.layers.push(newLayer($('#pg-effect').value));
    renderLayers();
    update();
  });
  $('#pg-content').addEventListener('change', (e) => ((state.content = e.target.value), update()));
  $('#pg-replay').addEventListener('click', update);
  // 4.0.1: clipboard can be denied (insecure context, permissions) — never throw
  copy = async (btn, text, done, idle) => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      /* denied */
    }
    btn.textContent = ok ? t(done) : t('copyFail');
    setTimeout(() => (btn.textContent = t(idle)), 1200);
  };
  $('#pg-copy').addEventListener('click', () => copy($('#pg-copy'), playgroundSnippets(state)[tab], 'copied', 'copy'));
  $('#pg-share').addEventListener('click', () => copy($('#pg-share'), location.href, 'copied', 'share'));
  $('#pg-lang').addEventListener('click', () => {
    lang = lang === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('usa-showcase:lang', lang); } catch {}
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    i18n();
    renderLayers();
    renderTracks();
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
