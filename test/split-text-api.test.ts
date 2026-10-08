import { describe, it, expect, beforeEach } from 'vitest';
import { installComponentMocks, anims, mount } from './components-setup';
import { splitText, splitTimeline, splitOrder, graphemes, splitWords, defineTextComponents } from '../src/components/text';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
});

describe('splitText() (4.3)', () => {
  it('splits Latin text into words and grapheme chars, keeping emoji whole', () => {
    const el = mount('<h1>Hi there 👩‍👩‍👧!</h1>');
    const s = splitText(el, { by: 'char' });
    expect(s.words.map((w) => w.textContent)).toEqual(['Hi', 'there', '👩‍👩‍👧!']);
    expect(s.chars.map((c) => c.textContent)).toEqual(['H', 'i', 't', 'h', 'e', 'r', 'e', '👩‍👩‍👧', '!']);
    expect(el.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(el.textContent).toContain('Hi there');
  });

  it('segments CJK text into words / characters', () => {
    expect(graphemes('你好世界')).toEqual(['你', '好', '世', '界']);
    const w = splitWords('我爱北京天安门', 'zh');
    expect(w.join('')).toBe('我爱北京天安门');
    expect(w.length).toBeGreaterThan(1);
    const el = mount('<p lang="ja">こんにちは世界</p>');
    const s = splitText(el, { by: ['word', 'char'] });
    expect(s.chars).toHaveLength(7);
    expect(s.words.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps Arabic words whole (shaping) and reports RTL; Hebrew splits per char', () => {
    const ar = mount('<p dir="rtl">مرحبا بالعالم</p>');
    const s = splitText(ar, { by: 'char' });
    expect(s.direction).toBe('rtl');
    expect(s.chars.map((c) => c.textContent)).toEqual(['مرحبا', 'بالعالم']);
    expect(ar.getAttribute('data-split-dir')).toBe('rtl');
    const he = splitText(mount('<p dir="rtl">שלום</p>'), { by: 'char' });
    expect(he.chars).toHaveLength(4);
  });

  it('preserves inline markup and reverts', () => {
    const el = mount('<p>Make it <em>pop</em> now</p>');
    const before = el.innerHTML;
    const s = splitText(el, { by: 'word' });
    expect(s.words.map((w) => w.textContent)).toEqual(['Make', 'it', 'pop', 'now']);
    expect(el.querySelector('em .usa-split-word')!.textContent).toBe('pop');
    s.revert();
    expect(el.innerHTML).toBe(before);
  });

  it('groups words into lines', () => {
    const el = mount('<p>one two three</p>');
    const s = splitText(el, { by: 'line' });
    expect(s.lines).toHaveLength(1); // jsdom: no layout → one line
    expect(s.lines[0].textContent).toBe('one two three');
  });

  it('orders units by choreography', () => {
    expect(splitOrder(5, 'start')).toEqual([0, 1, 2, 3, 4]);
    expect(splitOrder(5, 'end')).toEqual([4, 3, 2, 1, 0]);
    expect(splitOrder(5, 'center')).toEqual([2, 1, 0, 1, 2]);
    expect(splitOrder(5, 'edges')).toEqual([0, 1, 2, 1, 0]);
    expect(splitOrder(6, 'random', 7).slice().sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('splitTimeline() builds one timeline step per unit', () => {
    const el = mount('<h2>abc</h2>');
    const { split, timeline } = splitTimeline(el, { by: 'char', stagger: 50, duration: 200, from: 'end' });
    expect(split.chars).toHaveLength(3);
    expect(timeline.duration).toBe(2 * 50 + 200);
    timeline.seek(timeline.duration);
    expect(anims.length).toBeGreaterThanOrEqual(3);
  });

  it('<usa-split-text> uses the segmenter, keeps Arabic words, supports from=', () => {
    defineTextComponents();
    const el = mount<any>('<usa-split-text from="end">abc</usa-split-text>');
    const i = el.units.map((u: HTMLElement) => u.style.getPropertyValue('--i'));
    expect(i).toEqual(['2', '1', '0']);
    const ar = mount<any>('<usa-split-text>مرحبا بالعالم</usa-split-text>');
    expect(ar.units).toHaveLength(2);
    const ln = mount<any>('<usa-split-text by="lines">one two</usa-split-text>');
    expect(ln.units.every((u: HTMLElement) => u.style.getPropertyValue('--i') === '0')).toBe(true);
  });
});
