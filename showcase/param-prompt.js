/**
 * 17.9: "Copy as AI prompt" for one effect with the values currently tuned in the gallery, the playground or the
 * code runner. Pure functions (tested in test/moments-tactile-17-9.test.ts). The text is our own wording; the settings
 * and the code come from the page the user is on, so an assistant reproduces exactly what they see.
 */
import { promptRules, toMo } from './select-tray.js';

const STR = {
  en: {
    intro: 'Recreate this animation with Motionary (npm i motionary — zero dependencies, accessible by default).',
    effect: 'Effect',
    settings: 'Keep these settings exactly as tuned',
    code: 'Starting code',
    goal: 'What I want',
    c: ': ',
  },
  zh: {
    intro: '请用 Motionary 复现这个动效（npm i motionary —— 零依赖，默认无障碍）。',
    effect: '效果',
    settings: '请保持这些已调好的参数不变',
    code: '起始代码',
    goal: '我的需求',
    c: '：',
  },
};

const MAX_VALUE = 200;
const MAX_CODE = 6000;

/** One printable `key: value` line, or '' for an empty value. Long values are cut so a prompt stays readable. */
export function formatParam(key, value) {
  if (value === undefined || value === null || value === '') return '';
  const v = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `${key}: ${v.length > MAX_VALUE ? v.slice(0, MAX_VALUE) + '…' : v}`;
}

/**
 * The prompt for one effect.
 * - `name`: the effect's display name; `tag`: its element (usa-* or mo-*), optional.
 * - `params`: the tuned values, in display order (an object or [key, value] pairs).
 * - `code`: the generated snippet for the current settings; `lang`: a fence language for it (html, js, tsx…).
 * - `goal`: an optional line from the user about what they are building.
 */
export function paramPrompt({ name = '', tag = '', params = {}, code = '', fence = 'html', goal = '', lang = 'en' } = {}) {
  const s = STR[lang] || STR.en;
  const out = [s.intro, ''];
  const el = tag ? ` <${toMo(`<${tag}`).slice(1)}>` : '';
  out.push(`${s.effect}${s.c}${String(name).trim() || tag}${el}`.trim());
  const rows = (Array.isArray(params) ? params : Object.entries(params)).map(([k, v]) => formatParam(k, v)).filter(Boolean);
  if (rows.length) out.push('', `${s.settings}${s.c.trim()}`, ...rows.map((r) => '- ' + r));
  const snippet = toMo(String(code || '').trim());
  if (snippet) out.push('', `${s.code}${s.c.trim()}`, '```' + fence, snippet.length > MAX_CODE ? snippet.slice(0, MAX_CODE) + '\n…' : snippet, '```');
  if (String(goal).trim()) out.push('', `${s.goal}${s.c}${String(goal).trim().slice(0, 500)}`);
  out.push('', ...promptRules(lang).map((r) => '- ' + r));
  return out.join('\n');
}

/** Code-tab ids → fence languages. */
export const fenceFor = (tab) => ({ vanilla: 'js', js: 'js', html: 'html', element: 'html', react: 'tsx', jsx: 'tsx', vue: 'vue', svelte: 'svelte', angular: 'ts', solid: 'tsx', css: 'css' })[tab] || 'html';
