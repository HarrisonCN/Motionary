import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { anims, finishAll, installComponentMocks, mount } from './components-setup';
import { defineCommandPalette, type UsaCommandPaletteElement } from '../src/components/widgets/command-palette';

function palette() {
  const opener = mount<HTMLButtonElement>('<button>Commands</button>');
  opener.focus();
  const el = mount<UsaCommandPaletteElement>('<usa-command-palette hotkey="none"></usa-command-palette>');
  el.setCommands(Array.from({ length: 10 }, (_, i) => ({ id: String(i), label: '命令 ' + i })));
  el.show();
  const input = el.querySelector('input')!;
  const key = (name: string, init: KeyboardEventInit = {}) =>
    input.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }));
  return { el, input, key, opener };
}

beforeEach(() => { installComponentMocks(); defineCommandPalette(); });
afterEach(async () => { document.body.replaceChildren(); await finishAll(); });

describe('command palette interactions', () => {
  it('leaves navigation and confirmation to the input method while composing', () => {
    const { el, key } = palette();
    const run = vi.fn();
    el.addEventListener('usa:run', run);
    expect(key('ArrowDown', { isComposing: true })).toBe(true);
    expect(key('Enter', { keyCode: 229 })).toBe(true);
    expect(key('Enter', { isComposing: true })).toBe(true);
    expect(run).not.toHaveBeenCalled();
    key('Enter');
    expect(run.mock.calls[0][0].detail.id).toBe('0');
  });

  it('pages through the visible results, clamps at either end and keeps focus in the query', () => {
    const { el, input, key } = palette();
    const list = el.querySelector('[role=listbox]')!;
    Object.defineProperty(list, 'clientHeight', { value: 81 });
    el.querySelectorAll('[role=option]').forEach((row, i) => {
      Object.defineProperty(row, 'offsetHeight', { value: 25 });
      Object.defineProperty(row, 'offsetTop', { value: i * 25 });
    });
    const selected = () => el.querySelector('[aria-selected=true]')!.getAttribute('data-i');
    expect(key('PageDown')).toBe(false);
    expect(selected()).toBe('3');
    for (let i = 0; i < 4; i++) key('PageDown');
    expect(selected()).toBe('9');
    key('PageUp');
    expect(selected()).toBe('6');
    for (let i = 0; i < 3; i++) key('PageUp');
    expect(selected()).toBe('0');
    expect(document.activeElement).toBe(input);
  });

  it('can reverse a pending close and commits a later close only once', async () => {
    const { el, input, key, opener } = palette();
    const closed = vi.fn(), run = vi.fn();
    el.addEventListener('usa:close', closed);
    el.addEventListener('usa:run', run);
    el.close();
    el.show();
    await finishAll();
    expect(el.opened).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(closed).not.toHaveBeenCalled();
    key('Enter');
    key('Enter');
    el.close();
    await finishAll();
    expect(run).toHaveBeenCalledTimes(1);
    expect(closed).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(opener);
  });

  it('discards a pending close on reconnect without stealing focus or emitting an old event', async () => {
    const { el } = palette();
    const closed = vi.fn();
    el.addEventListener('usa:close', closed);
    el.close();
    const exit = anims.at(-1)!;
    el.remove();
    document.body.append(el);
    el.show();
    await finishAll();
    expect(exit.cancelled).toBe(true);
    expect(closed).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(el.querySelector('input'));
  });
});
