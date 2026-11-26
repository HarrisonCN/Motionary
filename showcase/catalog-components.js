/**
 * 6.2+: Store entries for the 6.x widgets and effect packs, generated from
 * the component gallery cards (showcase/catalog/widgets.js) so both stay in
 * sync. Pure data. Each entry carries ready-made snippets for every Store tab.
 */
import { components as widgets } from './catalog/widgets.js';
import { components as instruments } from './catalog/instruments.js';
// 17.17: the release pages from 17.4 on had a live demo in the gallery but no Store card, so they could not be
// opened into the Store's code tabs. Every one of them is a Store card now, newest release first.
import { components as springs } from './catalog/springs.js';
import { components as damped } from './catalog/damped.js';
import { components as micro } from './catalog/micro.js';
import { components as toolkit } from './catalog/toolkit.js';
import { components as icons } from './catalog/icons.js';
import { components as studio } from './catalog/studio.js';
import { components as parts } from './catalog/parts.js';
import { components as blocks } from './catalog/blocks.js';
import { components as kit } from './catalog/kit.js';
import { components as moments } from './catalog/moments.js';
import { components as tactile } from './catalog/tactile.js';
import { components as forms } from './catalog/forms.js';
import { components as matter } from './catalog/matter.js';
import { components as activity } from './catalog/activity.js';
import { components as luminous } from './catalog/luminous.js';
import { componentSnippets } from './components-catalog.js';
import { prereqFor, requiresLabel, tierFor } from './catalog/prereqs.js';

export const COMPONENT_CATEGORY = { id: 'components', en: 'Components & effects', zh: '组件与动效' };

const GLYPHS = { carousel: '🎠', 'tab-bar': '⇆', disclosure: '▾', stories: '◔', 'fx-gpu': '🔥', 'fx-nature': '🌸', 'fx-splash': '💧', 'toast-stack': '🔔', modal: '🗔', sheet: '⇥', menu: '☰', 'fx-text': '🅰', 'fx-text-loop': '〰', 'fx-text-trail': '✍', 'progress-ring': '◔', odometer: '🔢', 'skeleton-reveal': '▤', 'star-rating': '★', 'fx-light': '💡', 'fx-materials': '🪙', 'fx-god-rays': '🌅', milestones: '⟟', 'masonry-flow': '▦', compare: '◧', 'cube-gallery': '🧊', 'fx-depth': '🧩', 'fx-depth-flip': '🂠', 'fx-origami': '🗞', dock: '⌂', 'nav-morph': '⎯', 'menu-toggle': '≡', tip: '💬', 'fx-morph': '✳', 'fx-blob': '🫧', 'fx-noise': '░', 'stepper': '①', 'pagination': '⋯', 'segmented': '▭', 'switch': '⏻', 'fx-ripple-wipe': '🌊', 'fx-shatter': '💥', 'fx-curl': '📖', 'kanban': '🗂', 'swipe-deck': '🃏', 'weather-card': '⛅', 'pull-cord': '💡', 'fx-weather': '🌧', 'fx-storm': '⛈', 'fx-sky': '🌌', 'fx-cloth': '🧣', 'fx-jelly': '🍮', 'fx-pinball': '🎯', 'date-picker': '📅', 'color-picker': '🎨', 'file-drop': '📥', 'keyframe-editor': '🎞', 'fx-focus': '◌', 'fx-success': '✅', 'music-player': '🎵', 'volume-knob': '🎛', 'equalizer': '🎚', 'lyrics': '🎤', 'fx-scope': '〰', 'fx-spectrum': '📊', 'fx-vinyl': '💿', 'bar-chart': '📊', 'gauge': '⏲', 'sparkline': '📈', 'kpi': '💹', 'fx-bars': '📶', 'fx-line': '〽', 'fx-flow': '🔀', 'add-to-cart': '🛍', 'cart-drawer': '🛒', 'product-gallery': '🖼', 'countdown': '⏳', 'fx-cart': '🛒', 'fx-price': '🏷', 'message-list': '💬', 'reactions': '😀', 'notification-bell': '🔔', 'presence': '🟢', 'fx-chat': '💭', 'fx-react': '❤', 'leaderboard': '🏅', 'xp-bar': '⭐', 'badge-wall': '🏆', 'prize-wheel': '🎡', 'fx-unlock': '🔓', 'fx-loot': '🪙', 'globe': '🌍', 'location-card': '📍', 'fx-route': '🗺', 'fx-pin': '📌', 'field': '⌨', 'otp': '🔢', 'upload-progress': '⏫', 'fx-field': '❗', 'fx-form-in': '📝', 'chat-composer': '💬', 'suggestion-chips': '🏷', 'voice-button': '🎙', 'fx-stream': '✨', 'fx-voice': '〰', 'command-palette': '⌘', 'shortcut': '⌨', 'clock-control': '⏯', 'hydrate': '💧', 'red-envelope': '🧧', 'festival-banner': '🎏', 'fx-fireworks': '🎆', 'fx-seasonal': '❄', 'terminal': '🖥', 'retro-button': '🕹', 'fx-crt': '📺', 'fx-vhs': '📼', 'organic-card': '🫧', 'liquid-nav': '💧', 'fx-vine': '🌿', 'fx-drop': '🌊', 'hud-panel': '🛰', 'radar': '📡', 'fx-hud': '🎯', 'fx-hologram': '🔷', 'sticky-wall': '🗒', 'sketch-chart': '✏', 'fx-paper': '📄', 'fx-sketch': '🎨', 'theme-switcher': '🌓', 'theme-surface': '🪟', 'fx-neon': '💡', 'fx-glass': '🧊', 'gyro-card': '📱', 'gesture-sticker': '🤏', 'fx-gesture-hint': '👆', 'fx-depth-in': '🧱', 'panorama': '🌄', 'spatial-card': '🥽', 'fx-portal': '🌀', 'fx-spatial-float': '🪐', 'code-export': '🧾', 'prop-panel': '🎛', 'motion': '📝', 'plugin-store': '🧩', 'chapter-nav': '📖', 'scene': '🎬', 'fx-dolly': '🎥', 'fx-letterbox': '🎞', 'lottie': '🎞', 'lottie-icon': '💗', 'fx-icon-pop': '✨', 'gen-art': '🖌', 'bg-generator': '🌈', 'fx-halftone': '🔘', 'fx-mesh': '🫧', 'video-card': '📹', 'hero-video': '🎦', 'fx-film': '🎞', 'motion-prefs': '♿', 'pause-all': '⏸', 'fx-safe': '🛡', 'perf-monitor': '📈', 'worker-canvas': '🧵', 'fx-gpu-lift': '🚀', 'motion-spec': '📐', 'native-preview': '📱', 'plugin-card': '🧩', 'install-button': '⬇', 'scroll-scene': '📜', 'motion-inspector': '🔍', 'route-transition': '🔀', 'text-splitter': '✂', 'scroll-ring': '◔', 'parallax-layers': '🏔', 'smooth-scroller': '🧈', 'gl-scene': '🧊', 'gpu-particles': '✨', 'shader-backdrop': '🌌', 'lottie-player': '🎞️', 'rive': '🐦', 'token-editor': '🎛️', 'physics-playground': '🧲', 'motion-prompt': '💬', 'snap-carousel': '🎠', 'gl-skinned': '🦾', 'lottie-text': '🔤', 'dotlottie': '🎛️', 'gl-model': '🗜️', 'mega-menu': '▤', 'nav-flyout': '⌄', 'fullscreen-menu': '⛶', breadcrumbs: '›', 'fx-hover': '👀' };

const svelte = (esm, html) => `<script>\n  ${esm.split('\n/*')[0].trim().replace(/\n/g, '\n  ')}\n</script>\n\n${html}`;

/** The 17.4–17.17 release catalogs, newest first (each is also a tab of the home page Collections). */
export const RELEASE_COMPONENTS = [...damped, ...springs, ...micro, ...toolkit, ...icons, ...studio, ...parts, ...blocks, ...kit, ...moments, ...tactile, ...forms, ...matter, ...activity, ...luminous].filter((c) => c.kind === 'element');

export const COMPONENT_ITEMS = [...widgets, ...instruments, ...RELEASE_COMPONENTS].map((c) => {
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
    icon: GLYPHS[c.id] || '✦', // metadata only — 7.5+: the card thumbnail is the live component (thumb.html)
    title: c.title,
    desc: c.desc,
    tags: [c.tag === 'usa-fx' ? `effect pack ${c.since}` : `<${c.tag}>`, ...c.tags.slice(0, 3)],
    requires: c.requires || [],
    requiresBadge: requiresLabel(c.requires), // 10.1: 'Requires: motionary/runtime/…' badge on the Store card
    tier: c.requires?.length ? tierFor(c.requires) : null, // 11.4: runtime tier badge next to it
    prereq: c.requires?.length ? prereqFor(c) : null, // 10.1: Store detail → Prerequisites
    snippets: { vanilla: s.esm, react: s.react, vue: s.vue, svelte: svelte(s.esm, html), solid: s.react.replace("export function Demo", "export default function Demo"), element: s.html, cdn: s.html },
  };
});
