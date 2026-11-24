import { defineElement, queryAttr, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { rovingIndex } from './kit-12';
import css from './ui-kit-13.css?raw';

/** The built-in set: [category id, label, symbol, "emoji name|emoji name|…"]. */
const SET: [string, string, string, string][] = [
  ['smileys', 'Smileys', '😀', '😀 grinning|😄 smile|😂 joy laugh|🙂 slight smile|😉 wink|😍 heart eyes|🤩 star struck|😎 cool sunglasses|🤔 thinking|😴 sleeping|😭 crying|😡 angry|🥳 party|😇 halo angel|🤯 mind blown|🙃 upside down'],
  ['gestures', 'Gestures', '👍', '👍 thumbs up yes|👎 thumbs down no|👏 clap|🙌 raised hands hooray|👋 wave hello|🤝 handshake deal|🙏 pray thanks please|✌️ victory peace|👌 ok|🤞 fingers crossed luck|💪 muscle strong|👀 eyes look'],
  ['hearts', 'Hearts', '❤️', '❤️ red heart love|🧡 orange heart|💛 yellow heart|💚 green heart|💙 blue heart|💜 purple heart|🖤 black heart|🤍 white heart|💖 sparkling heart|💔 broken heart|💯 hundred|✨ sparkles'],
  ['nature', 'Nature', '🌿', '🌿 herb leaf|🌸 blossom flower|🌻 sunflower|🌈 rainbow|🔥 fire hot|⭐ star|🌙 moon night|☀️ sun|⚡ lightning|❄️ snowflake cold|🐶 dog|🐱 cat'],
  ['food', 'Food', '🍕', '🍕 pizza|🍔 burger|🍣 sushi|🍜 noodles ramen|🍩 donut|🍰 cake|🍎 apple|🥑 avocado|☕ coffee|🍵 tea|🍺 beer|🍷 wine'],
  ['activity', 'Activity', '🎉', '🎉 party popper celebrate|🎁 gift present|🏆 trophy win|⚽ soccer football|🏀 basketball|🎮 game controller|🎵 music note|🎨 art palette|🚀 rocket launch|✈️ airplane travel|🏖️ beach holiday|🎯 target goal'],
  ['objects', 'Objects', '💡', '💡 bulb idea|📌 pin|📎 paperclip|📅 calendar date|✅ check done|❌ cross no|⚠️ warning|🔒 lock secure|🔑 key|📦 package box|💬 speech chat|🔔 bell notify'],
];

export type EmojiEntry = { emoji: string; name: string; group: string };
/** Every built-in emoji with its keywords and group. */
export const EMOJI: EmojiEntry[] = /*#__PURE__*/ SET.flatMap(([group, , , items]) => items.split('|').map((s) => {
  const [emoji, ...words] = s.split(' ');
  return { emoji, name: words.join(' '), group };
}));

/** Emoji whose keywords contain every word of `query` (case-insensitive); all of them for an empty query. */
export function filterEmoji(query: string, set: readonly EmojiEntry[] = EMOJI): EmojiEntry[] {
  const words = String(query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  return words.length ? set.filter((e) => words.every((w) => e.name.includes(w) || e.emoji === w)) : set.slice();
}

/**
 * An emoji panel: a search field, one tab per group, a "recent" row (kept in local storage when it is available) and a
 * grid of buttons that you walk with the arrow keys. Picking an emoji pops it and, with `for`, inserts it at the caret
 * of that input or textarea.
 *
 * Attributes: `for` (selector of a field to type into), `label` (Emoji), `search-label` (Search emoji),
 * `recent-label` (Recent), `empty-label` (No emoji found), `columns` (6–12; 8), `remember` (local storage key; off when
 * absent).
 * Event `usa:pick` ({ emoji, name }).
 */
export interface UsaEmojiPickerElement extends UsaElement {}

export function defineEmojiPicker(tag = 'usa-emoji-picker'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class EmojiPicker extends Base {
    static get observedAttributes(): string[] { return ['for', 'label', 'search-label', 'recent-label', 'empty-label', 'columns', 'remember']; }
    mount(): void {
      const root = make('div', 'usa-kit usa-emoji');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Emoji'));
      root.style.setProperty('--cols', String(Math.max(6, Math.min(12, Math.round(this.num('columns', 8))))));
      root.toggleAttribute('data-static', this.reduced);
      const id = uniqueId('usa-emoji');
      const search = make('input', 'usa-emoji-search');
      search.type = 'search';
      search.placeholder = this.str('search-label', 'Search emoji');
      search.setAttribute('aria-label', this.str('search-label', 'Search emoji'));
      search.setAttribute('aria-controls', `${id}-g`);
      const tabs = make('div', 'usa-emoji-tabs');
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-label', this.str('label', 'Emoji'));
      const grid = make('div', 'usa-emoji-grid');
      grid.id = `${id}-g`;
      grid.setAttribute('role', 'group');
      const empty = make('p', 'usa-emoji-empty', this.str('empty-label', 'No emoji found'));
      empty.hidden = true;
      const status = make('span', 'usa-kit-sr');
      status.setAttribute('role', 'status');
      root.append(search, tabs, grid, empty, status);
      this.append(root);
      const key = this.str('remember');
      const load = (): string[] => {
        if (!key) return [];
        try { return JSON.parse(localStorage.getItem(key) || '[]').filter((x: unknown) => typeof x === 'string').slice(0, 16); } catch { return []; }
      };
      let recent = load();
      const groups = [...(key ? [['recent', this.str('recent-label', 'Recent'), '🕘']] : []), ...SET.map(([g, l, s]) => [g, l, s])] as [string, string, string][];
      let group = recent.length ? 'recent' : SET[0][0];
      const tabBtns = groups.map(([g, l, s]) => {
        const b = make('button', 'usa-emoji-tab', s);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', l);
        b.title = l;
        b.dataset.g = g;
        tabs.append(b);
        return b;
      });
      let cells: HTMLButtonElement[] = [];
      let focus = 0;
      const render = () => {
        const q = search.value.trim();
        const shown = q ? filterEmoji(q) : group === 'recent'
          ? recent.map((e) => EMOJI.find((x) => x.emoji === e) ?? { emoji: e, name: e, group: 'recent' })
          : EMOJI.filter((e) => e.group === group);
        tabBtns.forEach((b) => { const on = !q && b.dataset.g === group; b.setAttribute('aria-selected', String(on)); b.tabIndex = on || (q && b === tabBtns[0]) ? 0 : -1; });
        grid.setAttribute('aria-label', q ? search.value : groups.find(([g]) => g === group)?.[1] ?? '');
        cells = shown.map((e, i) => {
          const b = make('button', 'usa-emoji-cell', e.emoji);
          b.type = 'button';
          b.setAttribute('aria-label', e.name);
          b.title = e.name;
          b.tabIndex = i === 0 ? 0 : -1;
          b.style.setProperty('--i', String(Math.min(i, 24)));
          return b;
        });
        grid.replaceChildren(...cells);
        focus = 0;
        empty.hidden = !!cells.length;
        status.textContent = q ? (cells.length ? String(cells.length) : this.str('empty-label', 'No emoji found')) : '';
      };
      const cols = () => Math.max(1, Math.round(this.num('columns', 8)));
      const pick = (b: HTMLButtonElement) => {
        const emoji = b.textContent || '';
        const name = b.getAttribute('aria-label') || emoji;
        b.removeAttribute('data-pop');
        void b.offsetWidth;
        b.setAttribute('data-pop', '');
        const target = queryAttr<HTMLInputElement | HTMLTextAreaElement>(this.str('for') || null);
        if (target && 'value' in target) {
          const s = target.selectionStart ?? target.value.length, e = target.selectionEnd ?? s;
          target.value = target.value.slice(0, s) + emoji + target.value.slice(e);
          target.setSelectionRange?.(s + emoji.length, s + emoji.length);
          target.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (key) {
          recent = [emoji, ...recent.filter((x) => x !== emoji)].slice(0, 16);
          try { localStorage.setItem(key, JSON.stringify(recent)); } catch { /* storage blocked */ }
        }
        this.emit('pick', { emoji, name });
      };
      this.listen(grid, 'click', (e: MouseEvent) => {
        const b = (e.target as Element).closest?.('.usa-emoji-cell') as HTMLButtonElement | null;
        if (b) pick(b);
      });
      this.listen(grid, 'keydown', (e: KeyboardEvent) => {
        const i = cells.indexOf(e.target as HTMLButtonElement);
        if (i < 0) return;
        const c = cols();
        const to = e.key === 'ArrowDown' ? Math.min(cells.length - 1, i + c) : e.key === 'ArrowUp' ? Math.max(0, i - c) : rovingIndex(e.key, i, cells.length, getComputedStyle(this).direction === 'rtl');
        if (to < 0 || (e.key.startsWith('Arrow') && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && to === i)) return;
        e.preventDefault();
        cells[focus].tabIndex = -1;
        focus = to;
        cells[to].tabIndex = 0;
        cells[to].focus();
      });
      this.listen(tabs, 'click', (e: MouseEvent) => {
        const b = (e.target as Element).closest?.('.usa-emoji-tab') as HTMLElement | null;
        if (!b) return;
        group = b.dataset.g || group;
        search.value = '';
        render();
      });
      this.listen(tabs, 'keydown', (e: KeyboardEvent) => {
        const i = tabBtns.indexOf(e.target as HTMLButtonElement);
        const to = rovingIndex(e.key, i, tabBtns.length);
        if (i < 0 || to < 0) return;
        e.preventDefault();
        group = tabBtns[to].dataset.g || group;
        search.value = '';
        render();
        tabBtns[to].focus();
      });
      this.listen(search, 'input', render);
      this.listen(search, 'keydown', (e: KeyboardEvent) => { if (e.key === 'ArrowDown' && cells[0]) { e.preventDefault(); cells[0].focus(); } });
      this.listen(root, 'animationend', (e: AnimationEvent) => (e.target as Element).removeAttribute?.('data-pop'));
      render();
      this.onCleanup(() => root.remove());
    }
  }, { id: 'ui-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
