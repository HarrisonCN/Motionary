/**
 * 6.2+: Store entries for the 6.x widgets and effect packs, generated from
 * the component gallery cards (showcase/catalog/widgets.js) so both stay in
 * sync. Pure data. Each entry carries ready-made snippets for every Store tab.
 */
import { components as SIX } from './catalog/widgets.js';
import { componentSnippets } from './components-catalog.js';

export const COMPONENT_CATEGORY = { id: 'components', en: 'Components 6.x', zh: '组件 6.x' };

const GLYPHS = { carousel: '🎠', 'tab-bar': '⇆', disclosure: '▾', stories: '◔', 'fx-gpu': '🔥', 'fx-nature': '🌸', 'fx-splash': '💧', 'toast-stack': '🔔', modal: '🗔', sheet: '⇥', menu: '☰', 'fx-text': '🅰', 'fx-text-loop': '〰', 'fx-text-trail': '✍', 'progress-ring': '◔', odometer: '🔢', 'skeleton-reveal': '▤', 'star-rating': '★', 'fx-light': '💡', 'fx-materials': '🪙', 'fx-god-rays': '🌅', milestones: '⟟', 'masonry-flow': '▦', compare: '◧', 'cube-gallery': '🧊', 'fx-depth': '🧩', 'fx-depth-flip': '🂠', 'fx-origami': '🗞', dock: '⌂', 'nav-morph': '⎯', 'menu-toggle': '≡', tip: '💬', 'fx-morph': '✳', 'fx-blob': '🫧', 'fx-noise': '░', 'stepper': '①', 'pagination': '⋯', 'segmented': '▭', 'switch': '⏻', 'fx-ripple-wipe': '🌊', 'fx-shatter': '💥', 'fx-curl': '📖', 'kanban': '🗂', 'swipe-deck': '🃏', 'weather-card': '⛅', 'pull-cord': '💡', 'fx-weather': '🌧', 'fx-storm': '⛈', 'fx-sky': '🌌', 'fx-cloth': '🧣', 'fx-jelly': '🍮', 'fx-pinball': '🎯', 'date-picker': '📅', 'color-picker': '🎨', 'file-drop': '📥', 'keyframe-editor': '🎞', 'fx-focus': '◌', 'fx-success': '✅', 'music-player': '🎵', 'volume-knob': '🎛', 'equalizer': '🎚', 'lyrics': '🎤', 'fx-scope': '〰', 'fx-spectrum': '📊', 'fx-vinyl': '💿' };

const svelte = (esm, html) => `<script>\n  ${esm.split('\n/*')[0].trim().replace(/\n/g, '\n  ')}\n</script>\n\n${html}`;

export const COMPONENT_ITEMS = SIX.map((c) => {
  const s = componentSnippets(c);
  const html = c.usage;
  return {
    id: `ui-${c.id}`,
    kind: 'component',
    recipe: 'reveal',
    preset: 'zoom-in',
    category: 'components',
    gallery: c.id,
    since: c.since,
    glyph: GLYPHS[c.id] || '✦',
    title: c.title,
    desc: c.desc,
    tags: [c.tag === 'usa-fx' ? `effect pack ${c.since}` : `<${c.tag}>`, ...c.tags.slice(0, 3)],
    snippets: { vanilla: s.esm, react: s.react, vue: s.vue, svelte: svelte(s.esm, html), solid: s.react.replace("export function Demo", "export default function Demo"), element: s.html, cdn: s.html },
  };
});
